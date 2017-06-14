import { Aggregator } from './aggregators'
import { Event, EventData, Group, GroupTotals } from './core'
import { Formatter } from './formatters'
import { Column } from './grid'
import { GroupItemMetadataProvider } from './groupitemmetadataprovider'

export interface GroupingInfo {
  aggregateChildGroups?: boolean
  aggregateCollapsed?: boolean
  aggregateEmpty?: boolean
  aggregators: Aggregator[]
  collapsed?: boolean
  comparer<T>(a: T, b: T): number
  compiledAccumulators: Function[] // TODO
  displayTotalsRow: boolean
  formatter(group: Group): string
  getter: string | ((row: Item) => any)
  getterIsAFn: boolean
  lazyTotalsCalculation: boolean
  predefinedValues: any[]
}

export interface GroupRowMetadata {
  columns?: { [columnId: number]: Partial<Column> }
  cssClasses: string
  focusable: boolean
  formatter: Formatter
  selectable: boolean
}

export interface Item {
  id: number
  [key: string]: any
}

export interface PagingInfo {
  pageSize: number
  pageNum: number
  totalRows: number
  totalPages: number
}

export interface RefreshHints {
  ignoreDiffsAfter?: number
  ignoreDiffsBefore?: number
  isFilterExpanding?: boolean
  isFilterNarrowing?: boolean
  isFilterUnchanged?: boolean
}

export interface Options {
  groupItemMetadataProvider?: GroupItemMetadataProvider
  inlineFilters?: boolean
}

export type FilterFn = (
  item: { [a: string]: any },
  args: { [a: string]: (value: any) => boolean }
) => boolean

/***
 * A sample Model implementation.
 * Provides a filtered view of the underlying data.
 *
 * Relies on the data item having an "id" property uniquely identifying it.
 */
export class DataView {

  private defaults = {
    groupItemMetadataProvider: undefined,
    inlineFilters: false
  }

  // private
  private idProperty = 'id'  // property holding a unique row id
  private items: Item[] = [] // data by index
  private rows: (Item | Group)[] = [] // data by row
  private idxById: { [rowId: number]: number } = {}       // indexes by id
  private rowsById: { [rowId: number]: number } = {}    // row indices by id; lazy-calculated
  private filter: FilterFn | null = null      // filter function
  private updated: {[rowId: number]: boolean} | null = null     // updated item ids
  private suspend = false    // suspends the recalculation
  private sortAsc = true
  private fastSortField
  private sortComparer
  private refreshHints: RefreshHints = {}
  private prevRefreshHints: RefreshHints = {}
  private filterArgs
  private filteredItems: Item[] = []
  private previousFilteredItems: any[] = []
  private compiledFilter
  private compiledFilterWithCaching
  private filterCache = []
  private triggerFilteredItemsChanged: boolean = false

  // grouping
  private groupingInfoDefaults = {
    getter: null,
    formatter: null,
    comparer: (a: Group, b: Group) => a.value - b.value,
    predefinedValues: [],
    aggregators: [],
    aggregateEmpty: false,
    aggregateCollapsed: false,
    aggregateChildGroups: false,
    collapsed: false,
    displayTotalsRow: true,
    lazyTotalsCalculation: false
  }
  private groupingInfos: GroupingInfo[] = []
  private groups: Group[] = []
  private toggledGroupsByLevel: {[groupingKey: string]: boolean}[] = []
  private groupingDelimiter = ':|:'

  private pagesize = 0
  private pagenum = 0
  private totalRows = 0

  // events
  onGroupsChanged = new Event<{ groups: Group[] }>()
  onRowCountChanged = new Event<{ previous: number, current: number }>()
  onRowsChanged = new Event<{ rows: any[] }>()
  onSetItems = new Event<{ items: any[] }>()
  onFilteredItemsChanged = new Event<{ filteredItems: Item[], previousFilteredItems: Item[] }>()
  onPagingInfoChanged = new Event<PagingInfo>()

  constructor(private options: Options = {}) {
    this.setOptions(options)
  }

  beginUpdate(): void {
    this.suspend = true
  }

  endUpdate(): void {
    this.suspend = false
    this.refresh()
  }

  setRefreshHints(hints: RefreshHints): void {
    this.refreshHints = hints
  }

  setFilterArgs(args) {
    this.filterArgs = args
  }

  private updateIdxById(startingIndex?: number): void {
    startingIndex = startingIndex || 0
    var id
    for (var i = startingIndex, l = this.items.length; i < l; i++) {
      id = this.items[i][this.idProperty]
      if (id === undefined) {
        throw 'Each data element must implement a unique \'id\' property, it can\'t be undefined.'
      }
      this.idxById[id] = i
    }
  }

  private ensureIdUniqueness(): void {
    var id
    for (var i = 0, l = this.items.length; i < l; i++) {
      id = this.items[i][this.idProperty]
      if (id === undefined || this.idxById[id] !== i) {
        throw 'Each data element must implement a unique \'id\' property. `' + id + '` is not unique.'
      }
    }
  }

  getItems(): Item[] {
    return this.items
  }

  setItems(data: Item[], objectIdProperty?: string): void {
    if (objectIdProperty !== undefined) {
      this.idProperty = objectIdProperty
    }
    this.items = this.filteredItems = data
    this.idxById = {}
    this.updateIdxById()
    this.ensureIdUniqueness()
    this.triggerFilteredItemsChanged = true
    this.refresh()
    this.onSetItems.notify({ items: this.items }, null, self)
  }

  getPagingInfo(): PagingInfo {
    var totalPages = this.pagesize ? Math.max(1, Math.ceil(this.totalRows / this.pagesize)) : 1
    return {pageSize: this.pagesize, pageNum: this.pagenum, totalRows: this.totalRows, totalPages}
  }

  sort(comparer, ascending: boolean): void {
    this.sortAsc = ascending
    this.sortComparer = comparer
    this.fastSortField = null
    if (ascending === false) {
      this.items.reverse()
    }
    this.items.sort(comparer)
    if (ascending === false) {
      this.items.reverse()
    }
    this.idxById = {}
    this.updateIdxById()
    this.refresh()
  }

  /***
   * Provides a workaround for the extremely slow sorting in IE.
   * Does a [lexicographic] sort on a give column by temporarily overriding Object.prototype.toString
   * to return the value of that field and then doing a native Array.sort().
   */
  fastSort(field, ascending: boolean): void {
    this.sortAsc = ascending
    this.fastSortField = field
    this.sortComparer = null
    var oldToString = Object.prototype.toString
    Object.prototype.toString = (typeof field === 'function') ? field : function () {
      return this[field]
    }
    // an extra reversal for descending sort keeps the sort stable
    // (assuming a stable native sort implementation, which isn't true in some cases)
    if (ascending === false) {
      this.items.reverse()
    }
    this.items.sort()
    Object.prototype.toString = oldToString
    if (ascending === false) {
      this.items.reverse()
    }
    this.idxById = {}
    this.updateIdxById()
    this.refresh()
  }

  reSort(): void {
    if (this.sortComparer) {
      this.sort(this.sortComparer, this.sortAsc)
    } else if (this.fastSortField) {
      this.fastSort(this.fastSortField, this.sortAsc)
    }
  }

  setFilter(filterFn: FilterFn): void {
    this.filter = filterFn
    if (this.options.inlineFilters) {
      this.compiledFilter = this.compileFilter()
      this.compiledFilterWithCaching = this.compileFilterWithCaching()
    }
    this.triggerFilteredItemsChanged = true
    this.refresh()
  }

  getGrouping(): GroupingInfo[] {
    return this.groupingInfos
  }

  getToggleGroupsByLevel(): { [groupingKey: string]: boolean }[] {
    return this.toggledGroupsByLevel
  }

  setGrouping(groupingInfo: Partial<GroupingInfo> | Partial<GroupingInfo>[]): void {
    if (!this.options.groupItemMetadataProvider) {
      this.options.groupItemMetadataProvider = new GroupItemMetadataProvider()
    }

    this.groups = []
    this.toggledGroupsByLevel = []
    groupingInfo = groupingInfo || []
    this.groupingInfos = ((groupingInfo instanceof Array) ? groupingInfo : [groupingInfo]) as GroupingInfo[]

    for (var i = 0; i < this.groupingInfos.length; i++) {
      var gi = this.groupingInfos[i] = $.extend(true, {}, this.groupingInfoDefaults, this.groupingInfos[i])
      gi.getterIsAFn = typeof gi.getter === 'function'

      // pre-compile accumulator loops
      gi.compiledAccumulators = []
      var idx = gi.aggregators.length
      while (idx--) {
        gi.compiledAccumulators[idx] = this.compileAccumulatorLoop(gi.aggregators[idx])
      }

      this.toggledGroupsByLevel[i] = {}
    }

    this.triggerFilteredItemsChanged = true
    this.refresh()
  }

  /**
   * @deprecated Please use {@link setGrouping}.
   */
  groupBy(
    valueGetter?: string | ((row: Item) => any),
    valueFormatter?: (group: Group) => string,
    sortComparer?: <T>(a: T, b: T) => number
  ): void {
    if (valueGetter == null) {
      this.setGrouping([])
      return
    }

    this.setGrouping({
      getter: valueGetter,
      formatter: valueFormatter,
      comparer: sortComparer,
      predefinedValues: []
    })
  }

  /**
   * @deprecated Please use {@link setGrouping}.
   */
  setAggregators(groupAggregators: Aggregator[], includeCollapsed: boolean): void {
    if (!this.groupingInfos.length) {
      throw new Error('At least one grouping must be specified before calling setAggregators().')
    }

    this.groupingInfos[0].aggregators = groupAggregators
    this.groupingInfos[0].aggregateCollapsed = includeCollapsed

    this.setGrouping(this.groupingInfos)
  }

  getItemByIdx(i: number): Item | Group {
    return this.items[i]
  }

  getIdxById(id: number): number {
    return this.idxById[id]
  }

  private ensureRowsByIdCache(): void {
    if (!Object.keys(this.rowsById).length) {
      this.rowsById = {}
      for (var i = 0, l = this.rows.length; i < l; i++) {
        this.rowsById[this.rows[i][this.idProperty]] = i
      }
    }
  }

  getRowById(id: number): number {
    this.ensureRowsByIdCache()
    return this.rowsById[id]
  }

  getItemById(id: number): Item | Group {
    return this.items[this.idxById[id]]
  }

  mapIdsToRows(idArray: number[]): number[] {
    var rows: any[] = []
    this.ensureRowsByIdCache()
    for (var i = 0, l = idArray.length; i < l; i++) {
      var row = this.rowsById[idArray[i]]
      if (row != null) {
        rows[rows.length] = row
      }
    }
    return rows
  }

  mapRowsToIds(rowArray: number[]): number[] {
    var ids: number[] = []
    for (var i = 0, l = rowArray.length; i < l; i++) {
      if (rowArray[i] < this.rows.length) {
        ids[ids.length] = this.rows[rowArray[i]][this.idProperty]
      }
    }
    return ids
  }

  updateItem(id: number, item: Item): void {
    if (this.idxById[id] === undefined || id !== item[this.idProperty]) {
      throw 'Invalid or non-matching id'
    }
    this.items[this.idxById[id]] = item
    if (!this.updated) {
      this.updated = {}
    }
    this.updated[id] = true
    this.triggerFilteredItemsChanged = true
    this.refresh()
  }

  getLength(): number {
    return this.rows.length
  }

  getFlattenedGroups(
    groups: Group[],
    options: { excludeHiddenGroups: boolean } = { excludeHiddenGroups: false }
  ): Group[] {
    var flattenedGroups = ([] as Group[]).concat(groups)
    groups.forEach(group => {
      if (!group.groups) return
      if (options.excludeHiddenGroups && group.collapsed) return
      flattenedGroups = flattenedGroups.concat(this.getFlattenedGroups(group.groups, options))
    })
    return flattenedGroups
  }

  getLengthWithoutGroupHeaders(): number {
    return this.rows.length - this.getFlattenedGroups(this.groups, { excludeHiddenGroups: true }).length
  }

  static isGroupRow(item: Group | Item): item is Group {
    return '__group' in item
  }

  static isTotals(item: any): item is GroupTotals {
    return '__groupTotals' in item
  }

  getItem(rowIndex: number): Item | Group {
    var item = this.rows[rowIndex]

    // if this is a group row, make sure totals are calculated and update the title
    if (item && DataView.isGroupRow(item) && item.totals && !item.totals.initialized) {
      var gi = this.groupingInfos[item.level]
      if (!gi.displayTotalsRow) {
        this.calculateTotals(item.totals)
        item.title = gi.formatter ? gi.formatter(item) : item.value
      }
    } else if (item && DataView.isTotals(item) && !item.initialized) {
      // if this is a totals row, make sure it's calculated
      this.calculateTotals(item)
    }

    return item
  }

  getItemMetadata(rowIndex: number | null): any {

    if (rowIndex === null) {
      return null
    }

    var item = this.rows[rowIndex]
    if (item === undefined) {
      return null
    }

    // overrides for grouping rows
    if (DataView.isGroupRow(item)) {
      return this.options.groupItemMetadataProvider!.getGroupRowMetadata(item)
    }

    // overrides for totals rows
    if (DataView.isTotals(item)) {
      return this.options.groupItemMetadataProvider!.getTotalsRowMetadata(item)
    }

    return null
  }

  private expandCollapseAllGroups(level?: number, collapse = false): void {
    if (level == null) {
      for (var i = 0; i < this.groupingInfos.length; i++) {
        this.toggledGroupsByLevel[i] = {}
        this.groupingInfos[i].collapsed = collapse
      }
    } else {
      this.toggledGroupsByLevel[level] = {}
      this.groupingInfos[level].collapsed = collapse
    }
    this.refresh()
  }

  /**
   * If not specified, applies to all levels.
   */
  collapseAllGroups(level?: number): void {
    this.expandCollapseAllGroups(level, true)
  }

  /**
   * Optional level to expand.  If not specified, applies to all levels.
   */
  expandAllGroups(level?: number): void {
    this.expandCollapseAllGroups(level, false)
  }

  private expandCollapseGroup(level: number, groupingKey: string, collapse: boolean): void {
    // tslint:disable-next-line:no-bitwise
    this.toggledGroupsByLevel[level][groupingKey] = Boolean(Number(this.groupingInfos[level].collapsed!) ^ Number(collapse))
    this.refresh()
  }

  /**
   * @param varArgs Either a Slick.Group's "groupingKey" property, or a
   *     variable argument list of grouping values denoting a unique path to the row.  For
   *     example, calling collapseGroup('high', '10%') will collapse the '10%' subgroup of
   *     the 'high' group.
   */
  collapseGroup(...groupingKeys: string[]): void {
    if (groupingKeys.length === 1 && groupingKeys[0].indexOf(this.groupingDelimiter) !== -1) {
      this.expandCollapseGroup(groupingKeys[0].split(this.groupingDelimiter).length - 1, groupingKeys[0], true)
    } else {
      this.expandCollapseGroup(groupingKeys.length - 1, groupingKeys.join(this.groupingDelimiter), true)
    }
  }

  /**
   * @param varArgs Either a Slick.Group's "groupingKey" property, or a
   *     variable argument list of grouping values denoting a unique path to the row.  For
   *     example, calling expandGroup('high', '10%') will expand the '10%' subgroup of
   *     the 'high' group.
   */
  expandGroup(...groupingKeys: string[]): void {
    if (groupingKeys.length === 1 && groupingKeys[0].indexOf(this.groupingDelimiter) !== -1) {
      this.expandCollapseGroup(groupingKeys[0].split(this.groupingDelimiter).length - 1, groupingKeys[0], false)
    } else {
      this.expandCollapseGroup(groupingKeys.length - 1, groupingKeys.join(this.groupingDelimiter), false)
    }
  }

  getGroups(): Group[] {
    return this.groups
  }

  private extractGroups(rows: Item[], parentGroup?: Group) {
    var group
    var val
    var groups: any[] = []
    var groupsByVal = {}
    var r
    var level = parentGroup ? parentGroup.level + 1 : 0
    var gi = this.groupingInfos[level]

    for (var i = 0, l = gi.predefinedValues.length; i < l; i++) {
      val = gi.predefinedValues[i]
      group = groupsByVal[val]
      if (!group) {
        group = new Group()
        group.value = val
        group.level = level
        group.groupingKey = (parentGroup ? parentGroup.groupingKey + this.groupingDelimiter : '') + val
        groups[groups.length] = group
        groupsByVal[val] = group
      }
    }

    for (let i = 0, l = rows.length; i < l; i++) {
      r = rows[i]
      val = gi.getterIsAFn ? (gi.getter as (row: Item) => any)(r) : r[gi.getter as string] // TODO: avoid asserts
      group = groupsByVal[val]
      if (!group) {
        group = new Group()
        group.value = val
        group.level = level
        group.groupingKey = (parentGroup ? parentGroup.groupingKey + this.groupingDelimiter : '') + val
        groups[groups.length] = group
        groupsByVal[val] = group
      }

      group.rows[group.count++] = r
    }

    if (level < this.groupingInfos.length - 1) {
      for (let i = 0; i < groups.length; i++) {
        group = groups[i]
        group.groups = this.extractGroups(group.rows, group)
      }
    }

    return groups
  }

  private sortGroups(groups: Group[], parentGroup?: Group): void {
    for (var i = 0; i < groups.length; i++) {
      var group = groups[i]
      if (group.groups) {
        this.sortGroups(group.groups, group)
      }
    }

    var level = parentGroup ? parentGroup.level + 1 : 0
    groups.sort(this.groupingInfos[level].comparer)
  }

  private calculateTotals(totals: GroupTotals): void {
    var group = totals.group
    var gi = this.groupingInfos[group!.level]
    var isLeafLevel = (group!.level === this.groupingInfos.length)
    let agg
    let idx = gi.aggregators.length

    if (!isLeafLevel && gi.aggregateChildGroups) {
      // make sure all the subgroups are calculated
      var i = group!.groups!.length
      while (i--) {
        if (!group!.groups![i].initialized) {
          this.calculateTotals(group!.groups![i] as any)
        }
      }
    }

    while (idx--) {
      agg = gi.aggregators[idx]
      agg.init()
      if (!isLeafLevel && gi.aggregateChildGroups) {
        gi.compiledAccumulators[idx].call(agg, group!.groups)
      } else {
        gi.compiledAccumulators[idx].call(agg, group!.rows)
      }
      agg.storeResult(totals)
    }
    totals.initialized = true
  }

  private addGroupTotals(group: Group): void {
    var gi = this.groupingInfos[group.level]
    var totals = new GroupTotals()
    totals.group = group
    group.totals = totals
    if (!gi.lazyTotalsCalculation) {
      this.calculateTotals(totals)
    }
  }

  private addTotals(groups: Group[], level: number = 0): void {
    var gi = this.groupingInfos[level]
    var groupCollapsed = gi.collapsed
    var toggledGroups = this.toggledGroupsByLevel[level]
    var idx = groups.length

    let g
    while (idx--) {
      g = groups[idx]

      if (g.collapsed && !gi.aggregateCollapsed) {
        continue
      }

      // Do a depth-first aggregation so that parent group aggregators can access subgroup totals.
      if (g.groups) {
        this.addTotals(g.groups, level + 1)
      }

      if (gi.aggregators.length && (
          gi.aggregateEmpty || g.rows.length || (g.groups && g.groups.length))) {
        this.addGroupTotals(g)
      }

      g.collapsed = Boolean(Number(groupCollapsed!) ^ Number(toggledGroups[g.groupingKey]))
      g.title = gi.formatter ? gi.formatter(g) : g.value
    }
  }

  private flattenGroupedRows(groups: Group[], level: number = 0) {
    var gi = this.groupingInfos[level]
    let groupedRows: any[] = []
    let rows
    let gl = 0
    let g
    for (var i = 0, l = groups.length; i < l; i++) {
      g = groups[i]
      groupedRows[gl++] = g

      if (!g.collapsed) {
        rows = g.groups ? this.flattenGroupedRows(g.groups, level + 1) : g.rows
        for (var j = 0, jj = rows.length; j < jj; j++) {
          groupedRows[gl++] = rows[j]
        }
      }

      if (g.totals && gi.displayTotalsRow && (!g.collapsed || gi.aggregateCollapsed)) {
        groupedRows[gl++] = g.totals
      }
    }
    return groupedRows
  }

  private getFunctionInfo(fn: any): { params: string[], body: string } {
    var fnRegex = /^function[^(]*\(([^)]*)\)\s*{([\s\S]*)}$/
    var matches = fn.toString().match(fnRegex)!
    return {
      params: matches[1].split(','),
      body: matches[2]
    }
  }

  private compileAccumulatorLoop(aggregator: Aggregator): Function {
    var accumulatorInfo = this.getFunctionInfo(aggregator.accumulate)
    var compiledAccumulatorLoop = new Function(
        '_items',
        'for (var ' + accumulatorInfo.params[0] + ', _i=0, _il=_items.length; _i<_il; _i++) {' +
            accumulatorInfo.params[0] + ' = _items[_i]; ' +
            accumulatorInfo.body +
        '}'
    )
    return compiledAccumulatorLoop
  }

  private compileFilter() {
    var filterInfo = this.getFunctionInfo(this.filter)

    var filterBody = filterInfo.body
        .replace(/return false\s*([;}]|$)/gi, '{ continue _coreloop; }$1')
        .replace(/return true\s*([;}]|$)/gi, '{ _retval[_idx++] = $item$; continue _coreloop; }$1')
        .replace(/return ([^;}]+?)\s*([;}]|$)/gi,
        '{ if ($1) { _retval[_idx++] = $item$; }; continue _coreloop; }$2')

    // This preserves the function template code after JS compression,
    // so that replace() commands still work as expected.
    var tpl = [
      // "function(_items, _args) { ",
      'var _retval = [], _idx = 0; ',
      'var $item$, $args$ = _args; ',
      '_coreloop: ',
      'for (var _i = 0, _il = _items.length; _i < _il; _i++) { ',
      '$item$ = _items[_i]; ',
      '$filter$; ',
      '} ',
      'return _retval; '
      // "}"
    ].join('')
    tpl = tpl.replace(/\$filter\$/gi, filterBody)
    tpl = tpl.replace(/\$item\$/gi, filterInfo.params[0])
    tpl = tpl.replace(/\$args\$/gi, filterInfo.params[1])

    var fn = new Function('_items,_args', tpl)
    fn['displayName'] = fn['name'] = 'compiledFilter'
    return fn
  }

  private compileFilterWithCaching() {
    var filterInfo = this.getFunctionInfo(this.filter!)

    var filterBody = filterInfo.body
        .replace(/return false\s*([;}]|$)/gi, '{ continue _coreloop; }$1')
        .replace(/return true\s*([;}]|$)/gi, '{ _cache[_i] = true;_retval[_idx++] = $item$; continue _coreloop; }$1')
        .replace(/return ([^;}]+?)\s*([;}]|$)/gi,
        '{ if ((_cache[_i] = $1)) { _retval[_idx++] = $item$; }; continue _coreloop; }$2')

    // This preserves the function template code after JS compression,
    // so that replace() commands still work as expected.
    var tpl = [
      // "function(_items, _args, _cache) { ",
      'var _retval = [], _idx = 0; ',
      'var $item$, $args$ = _args; ',
      '_coreloop: ',
      'for (var _i = 0, _il = _items.length; _i < _il; _i++) { ',
      '$item$ = _items[_i]; ',
      'if (_cache[_i]) { ',
      '_retval[_idx++] = $item$; ',
      'continue _coreloop; ',
      '} ',
      '$filter$; ',
      '} ',
      'return _retval; '
      // "}"
    ].join('')
    tpl = tpl.replace(/\$filter\$/gi, filterBody)
    tpl = tpl.replace(/\$item\$/gi, filterInfo.params[0])
    tpl = tpl.replace(/\$args\$/gi, filterInfo.params[1])

    var fn = new Function('_items,_args,_cache', tpl)
    fn['displayName'] = fn['name'] = 'compiledFilterWithCaching'
    return fn
  }

  private uncompiledFilter(items, args) {
    let retval: any[] = []
    let idx = 0

    for (var i = 0, ii = items.length; i < ii; i++) {
      if (this.filter!(items[i], args)) {
        retval[idx++] = items[i]
      }
    }

    return retval
  }

  private uncompiledFilterWithCaching(items, args, cache) {
    let retval: any[] = []
    let idx = 0
    let item

    for (var i = 0, ii = items.length; i < ii; i++) {
      item = items[i]
      if (cache[i]) {
        retval[idx++] = item
      } else if (this.filter!(item, args)) {
        retval[idx++] = item
        cache[i] = true
      }
    }

    return retval
  }

  private getFilteredAndPagedItems(items: Item[]): { totalRows: number, rows: Item[] } {
    if (this.filter) {
      var batchFilter = this.options.inlineFilters ? this.compiledFilter.bind(this) : this.uncompiledFilter.bind(this)
      var batchFilterWithCaching = this.options.inlineFilters ? this.compiledFilterWithCaching.bind(this) : this.uncompiledFilterWithCaching.bind(this)

      if (this.refreshHints.isFilterNarrowing) {
        this.filteredItems = batchFilter(this.filteredItems, this.filterArgs)
      } else if (this.refreshHints.isFilterExpanding) {
        this.filteredItems = batchFilterWithCaching(items, this.filterArgs, this.filterCache)
      } else if (!this.refreshHints.isFilterUnchanged) {
        this.filteredItems = batchFilter(items, this.filterArgs)
      }
    } else {
      // special case:  if not filtering and not paging, the resulting
      // rows collection needs to be a copy so that changes due to sort
      // can be caught
      this.filteredItems = this.pagesize ? items : items.concat()
    }

    // get the current page
    var paged: Item[]
    if (this.pagesize) {
      if (this.filteredItems.length < this.pagenum * this.pagesize) {
        this.pagenum = Math.floor(this.filteredItems.length / this.pagesize)
      }
      paged = this.filteredItems.slice(this.pagesize * this.pagenum, this.pagesize * this.pagenum + this.pagesize)
    } else {
      paged = this.filteredItems
    }

    return {
      totalRows: this.filteredItems.length,
      rows: paged
    }
  }

  private getRowDiffs(rows: (Group | Item)[], newRows: (Group | Item)[]) {
    let item
    let r
    let eitherIsNonData
    let diff: number[] = []
    let from = 0
    let to = newRows.length

    if (this.refreshHints && this.refreshHints.ignoreDiffsBefore) {
      from = Math.max(0,
          Math.min(newRows.length, this.refreshHints.ignoreDiffsBefore))
    }

    if (this.refreshHints && this.refreshHints.ignoreDiffsAfter) {
      to = Math.min(newRows.length,
          Math.max(0, this.refreshHints.ignoreDiffsAfter))
    }

    for (var i = from, rl = rows.length; i < to; i++) {
      if (i >= rl) {
        diff[diff.length] = i
      } else {
        item = newRows[i]
        r = rows[i]

        if ((this.groupingInfos.length && (eitherIsNonData = (item.__nonDataRow) || (r.__nonDataRow)) &&
            item.__group !== r.__group ||
            item.__group && !item.equals(r))
            || (eitherIsNonData &&
            // no good way to compare totals since they are arbitrary DTOs
            // deep object comparison is pretty expensive
            // always considering them 'dirty' seems easier for the time being
            (item.__groupTotals || r.__groupTotals))
            || item[this.idProperty] !== r[this.idProperty]
            || (this.updated && this.updated[item[this.idProperty]])
            ) {
          diff[diff.length] = i
        }
      }
    }
    return diff
  }

  private recalc(_items) {
    this.rowsById = {}

    if (this.refreshHints.isFilterNarrowing !== this.prevRefreshHints.isFilterNarrowing ||
        this.refreshHints.isFilterExpanding !== this.prevRefreshHints.isFilterExpanding) {
      this.filterCache = []
    }

    var filteredItems = this.getFilteredAndPagedItems(_items)
    this.totalRows = filteredItems.totalRows
    var newRows = filteredItems.rows

    this.groups = []
    if (this.groupingInfos.length) {
      this.groups = this.extractGroups(newRows)

      if (this.groups.length) {
        this.addTotals(this.groups)
        this.onGroupsChanged.notify({groups: this.groups}, null, self)
        this.sortGroups(this.groups)
        newRows = this.flattenGroupedRows(this.groups)
      }
    }

    var diff = this.getRowDiffs(this.rows, newRows)

    this.rows = newRows

    return diff
  }

  refresh(): void {
    if (this.suspend) return

    var countBefore = this.rows.length
    var totalRowsBefore = this.totalRows

    var diff = this.recalc(this.items) // pass as direct refs to avoid closure perf hit

    // if the current page is no longer valid, go to last page and recalc
    // we suffer a performance penalty here, but the main loop (recalc) remains highly optimized
    if (this.pagesize && this.totalRows < this.pagenum * this.pagesize) {
      this.pagenum = Math.max(0, Math.ceil(this.totalRows / this.pagesize) - 1)
      diff = this.recalc(this.items)
    }

    this.updated = null
    this.prevRefreshHints = this.refreshHints
    this.refreshHints = {}

    if (totalRowsBefore !== this.totalRows) {
      this.onPagingInfoChanged.notify(this.getPagingInfo(), null, self)
    }
    if (countBefore !== this.rows.length) {
      this.onRowCountChanged.notify({previous: countBefore, current: this.rows.length}, null, self)
      this.onRowsChanged.notify({rows: diff}, null, self)
    }
    if (this.triggerFilteredItemsChanged) {
      this.onFilteredItemsChanged.notify({filteredItems: this.filteredItems, previousFilteredItems: this.previousFilteredItems}, null, self)
      this.previousFilteredItems = this.filteredItems
      this.triggerFilteredItemsChanged = false
    }
  }

  /***
   * Wires the grid and the DataView together to keep row selection tied to item ids.
   * This is useful since, without it, the grid only knows about rows, so if the items
   * move around, the same rows stay selected instead of the selection moving along
   * with the items.
   *
   * NOTE:  This doesn't work with cell selection model.
   *
   * @param grid {Slick.Grid} The grid to sync selection with.
   * @param preserveHidden {Boolean} Whether to keep selected items that go out of the
   *     view due to them getting filtered out.
   * @param preserveHiddenOnSelectionChange {Boolean} Whether to keep selected items
   *     that are currently out of the view (see preserveHidden) as selected when selection
   *     changes.
   * @return {Event} An event that notifies when an internal list of selected row ids
   *     changes.  This is useful since, in combination with the above two options, it allows
   *     access to the full list selected row ids, and not just the ones visible to the grid.
   * @method syncGridSelection
   */
  syncGridSelection(grid, preserveHidden, preserveHiddenOnSelectionChange) {
    var inHandler
    var selectedRowIds = this.mapRowsToIds(grid.getSelectedRows())
    var onSelectedRowIdsChanged = new Event()

    const setSelectedRowIds = (rowIds: number[]) => {
      if (selectedRowIds.join(',') === rowIds.join(',')) {
        return
      }

      selectedRowIds = rowIds

      onSelectedRowIdsChanged.notify({
        grid: grid,
        ids: selectedRowIds
      }, new EventData(), this)
    }

    const update = () => {
      if (selectedRowIds.length > 0) {
        inHandler = true
        var selectedRows = this.mapIdsToRows(selectedRowIds)
        if (!preserveHidden) {
          setSelectedRowIds(this.mapRowsToIds(selectedRows))
        }
        grid.setSelectedRows(selectedRows)
        inHandler = false
      }
    }

    grid.onSelectedRowsChanged.subscribe((e, args) => {
      if (inHandler) { return }
      var newSelectedRowIds = this.mapRowsToIds(grid.getSelectedRows())
      if (!preserveHiddenOnSelectionChange || !grid.getOptions().multiSelect) {
        setSelectedRowIds(newSelectedRowIds)
      } else {
        // keep the ones that are hidden
        var existing = $.grep(selectedRowIds, id => this.getRowById(id!) === undefined)
        // add the newly selected ones
        setSelectedRowIds(existing.concat(newSelectedRowIds))
      }
    })

    this.onRowsChanged.subscribe(update)

    this.onRowCountChanged.subscribe(update)

    return onSelectedRowIdsChanged
  }

  syncGridCellCssStyles(grid, key): void {
    var hashById
    var inHandler

    const storeCellCssStyles = hash => {
      hashById = {}
      for (var row in hash) {
        var id = this.rows[row][this.idProperty]
        hashById[id] = hash[row]
      }
    }

    const update = () => {
      if (hashById) {
        inHandler = true
        this.ensureRowsByIdCache()
        var newHash = {}
        for (var id in hashById) {
          var row = this.rowsById[id]
          if (row !== undefined) {
            newHash[row] = hashById[id]
          }
        }
        grid.setCellCssStyles(key, newHash)
        inHandler = false
      }
    }

    // since this method can be called after the cell styles have been set,
    // get the existing ones right away
    storeCellCssStyles(grid.getCellCssStyles(key))

    grid.onCellCssStylesChanged.subscribe((e, args) => {
      if (inHandler) { return }
      if (key !== args.key) { return }
      if (args.hash) {
        storeCellCssStyles(args.hash)
      }
    })

    this.onRowsChanged.subscribe(update)

    this.onRowCountChanged.subscribe(update)
  }

  getFilteredItems(): Item[] {
    return this.filteredItems
  }

  setOptions (opts: Options): Options {
    return this.options = $.extend(true, {}, this.defaults, this.options, opts)
  }
}
