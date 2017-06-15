"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("./core");
var groupitemmetadataprovider_1 = require("./groupitemmetadataprovider");
/***
 * A sample Model implementation.
 * Provides a filtered view of the underlying data.
 *
 * Relies on the data item having an "id" property uniquely identifying it.
 */
var DataView = (function () {
    function DataView(options) {
        if (options === void 0) { options = {}; }
        this.options = options;
        this.defaults = {
            groupItemMetadataProvider: undefined,
            inlineFilters: false
        };
        // private
        this.idProperty = 'id'; // property holding a unique row id
        this.items = []; // data by index
        this.rows = []; // data by row
        this.idxById = {}; // indexes by id
        this.rowsById = {}; // row indices by id; lazy-calculated
        this.filter = null; // filter function
        this.updated = null; // updated item ids
        this.suspend = false; // suspends the recalculation
        this.sortAsc = true;
        this.refreshHints = {};
        this.prevRefreshHints = {};
        this.filteredItems = [];
        this.previousFilteredItems = [];
        this.filterCache = [];
        this.triggerFilteredItemsChanged = false;
        // grouping
        this.groupingInfoDefaults = {
            getter: null,
            formatter: null,
            comparer: function (a, b) { return a.value - b.value; },
            predefinedValues: [],
            aggregators: [],
            aggregateEmpty: false,
            aggregateCollapsed: false,
            aggregateChildGroups: false,
            collapsed: false,
            displayTotalsRow: true,
            lazyTotalsCalculation: false
        };
        this.groupingInfos = [];
        this.groups = [];
        this.toggledGroupsByLevel = [];
        this.groupingDelimiter = ':|:';
        this.pagesize = 0;
        this.pagenum = 0;
        this.totalRows = 0;
        // events
        this.onGroupsChanged = new core_1.Event();
        this.onRowCountChanged = new core_1.Event();
        this.onRowsChanged = new core_1.Event();
        this.onSetItems = new core_1.Event();
        this.onFilteredItemsChanged = new core_1.Event();
        this.onPagingInfoChanged = new core_1.Event();
        this.setOptions(options);
    }
    DataView.prototype.beginUpdate = function () {
        this.suspend = true;
    };
    DataView.prototype.endUpdate = function () {
        this.suspend = false;
        this.refresh();
    };
    DataView.prototype.setRefreshHints = function (hints) {
        this.refreshHints = hints;
    };
    DataView.prototype.setFilterArgs = function (args) {
        this.filterArgs = args;
    };
    DataView.prototype.updateIdxById = function (startingIndex) {
        startingIndex = startingIndex || 0;
        var id;
        for (var i = startingIndex, l = this.items.length; i < l; i++) {
            id = this.items[i][this.idProperty];
            if (id === undefined) {
                throw 'Each data element must implement a unique \'id\' property, it can\'t be undefined.';
            }
            this.idxById[id] = i;
        }
    };
    DataView.prototype.ensureIdUniqueness = function () {
        var id;
        for (var i = 0, l = this.items.length; i < l; i++) {
            id = this.items[i][this.idProperty];
            if (id === undefined || this.idxById[id] !== i) {
                throw 'Each data element must implement a unique \'id\' property. `' + id + '` is not unique.';
            }
        }
    };
    DataView.prototype.getItems = function () {
        return this.items;
    };
    DataView.prototype.setItems = function (data, objectIdProperty) {
        if (objectIdProperty !== undefined) {
            this.idProperty = objectIdProperty;
        }
        this.items = this.filteredItems = data;
        this.idxById = {};
        this.updateIdxById();
        this.ensureIdUniqueness();
        this.triggerFilteredItemsChanged = true;
        this.refresh();
        this.onSetItems.notify({ items: this.items }, null, self);
    };
    DataView.prototype.getPagingInfo = function () {
        var totalPages = this.pagesize ? Math.max(1, Math.ceil(this.totalRows / this.pagesize)) : 1;
        return { pageSize: this.pagesize, pageNum: this.pagenum, totalRows: this.totalRows, totalPages: totalPages };
    };
    DataView.prototype.sort = function (comparer, ascending) {
        this.sortAsc = ascending;
        this.sortComparer = comparer;
        this.fastSortField = null;
        if (ascending === false) {
            this.items.reverse();
        }
        this.items.sort(comparer);
        if (ascending === false) {
            this.items.reverse();
        }
        this.idxById = {};
        this.updateIdxById();
        this.refresh();
    };
    /***
     * Provides a workaround for the extremely slow sorting in IE.
     * Does a [lexicographic] sort on a give column by temporarily overriding Object.prototype.toString
     * to return the value of that field and then doing a native Array.sort().
     */
    DataView.prototype.fastSort = function (field, ascending) {
        this.sortAsc = ascending;
        this.fastSortField = field;
        this.sortComparer = null;
        var oldToString = Object.prototype.toString;
        Object.prototype.toString = (typeof field === 'function') ? field : function () {
            return this[field];
        };
        // an extra reversal for descending sort keeps the sort stable
        // (assuming a stable native sort implementation, which isn't true in some cases)
        if (ascending === false) {
            this.items.reverse();
        }
        this.items.sort();
        Object.prototype.toString = oldToString;
        if (ascending === false) {
            this.items.reverse();
        }
        this.idxById = {};
        this.updateIdxById();
        this.refresh();
    };
    DataView.prototype.reSort = function () {
        if (this.sortComparer) {
            this.sort(this.sortComparer, this.sortAsc);
        }
        else if (this.fastSortField) {
            this.fastSort(this.fastSortField, this.sortAsc);
        }
    };
    DataView.prototype.setFilter = function (filterFn) {
        this.filter = filterFn;
        if (this.options.inlineFilters) {
            this.compiledFilter = this.compileFilter();
            this.compiledFilterWithCaching = this.compileFilterWithCaching();
        }
        this.triggerFilteredItemsChanged = true;
        this.refresh();
    };
    DataView.prototype.getGrouping = function () {
        return this.groupingInfos;
    };
    DataView.prototype.getToggleGroupsByLevel = function () {
        return this.toggledGroupsByLevel;
    };
    DataView.prototype.setGrouping = function (groupingInfo) {
        if (!this.options.groupItemMetadataProvider) {
            this.options.groupItemMetadataProvider = new groupitemmetadataprovider_1.GroupItemMetadataProvider();
        }
        this.groups = [];
        this.toggledGroupsByLevel = [];
        groupingInfo = groupingInfo || [];
        this.groupingInfos = ((groupingInfo instanceof Array) ? groupingInfo : [groupingInfo]);
        for (var i = 0; i < this.groupingInfos.length; i++) {
            var gi = this.groupingInfos[i] = $.extend(true, {}, this.groupingInfoDefaults, this.groupingInfos[i]);
            gi.getterIsAFn = typeof gi.getter === 'function';
            // pre-compile accumulator loops
            gi.compiledAccumulators = [];
            var idx = gi.aggregators.length;
            while (idx--) {
                gi.compiledAccumulators[idx] = this.compileAccumulatorLoop(gi.aggregators[idx]);
            }
            this.toggledGroupsByLevel[i] = {};
        }
        this.triggerFilteredItemsChanged = true;
        this.refresh();
    };
    /**
     * @deprecated Please use {@link setGrouping}.
     */
    DataView.prototype.groupBy = function (valueGetter, valueFormatter, sortComparer) {
        if (valueGetter == null) {
            this.setGrouping([]);
            return;
        }
        this.setGrouping({
            getter: valueGetter,
            formatter: valueFormatter,
            comparer: sortComparer,
            predefinedValues: []
        });
    };
    /**
     * @deprecated Please use {@link setGrouping}.
     */
    DataView.prototype.setAggregators = function (groupAggregators, includeCollapsed) {
        if (!this.groupingInfos.length) {
            throw new Error('At least one grouping must be specified before calling setAggregators().');
        }
        this.groupingInfos[0].aggregators = groupAggregators;
        this.groupingInfos[0].aggregateCollapsed = includeCollapsed;
        this.setGrouping(this.groupingInfos);
    };
    DataView.prototype.getItemByIdx = function (i) {
        return this.items[i];
    };
    DataView.prototype.getIdxById = function (id) {
        return this.idxById[id];
    };
    DataView.prototype.ensureRowsByIdCache = function () {
        if (!Object.keys(this.rowsById).length) {
            this.rowsById = {};
            for (var i = 0, l = this.rows.length; i < l; i++) {
                this.rowsById[this.rows[i][this.idProperty]] = i;
            }
        }
    };
    DataView.prototype.getRowById = function (id) {
        this.ensureRowsByIdCache();
        return this.rowsById[id];
    };
    DataView.prototype.getItemById = function (id) {
        return this.items[this.idxById[id]];
    };
    DataView.prototype.mapIdsToRows = function (idArray) {
        var rows = [];
        this.ensureRowsByIdCache();
        for (var i = 0, l = idArray.length; i < l; i++) {
            var row = this.rowsById[idArray[i]];
            if (row != null) {
                rows[rows.length] = row;
            }
        }
        return rows;
    };
    DataView.prototype.mapRowsToIds = function (rowArray) {
        var ids = [];
        for (var i = 0, l = rowArray.length; i < l; i++) {
            if (rowArray[i] < this.rows.length) {
                ids[ids.length] = this.rows[rowArray[i]][this.idProperty];
            }
        }
        return ids;
    };
    DataView.prototype.updateItem = function (id, item) {
        if (this.idxById[id] === undefined || id !== item[this.idProperty]) {
            throw 'Invalid or non-matching id';
        }
        this.items[this.idxById[id]] = item;
        if (!this.updated) {
            this.updated = {};
        }
        this.updated[id] = true;
        this.triggerFilteredItemsChanged = true;
        this.refresh();
    };
    DataView.prototype.getLength = function () {
        return this.rows.length;
    };
    DataView.prototype.getFlattenedGroups = function (groups, options) {
        var _this = this;
        if (options === void 0) { options = { excludeHiddenGroups: false }; }
        var flattenedGroups = [].concat(groups);
        groups.forEach(function (group) {
            if (!group.groups)
                return;
            if (options.excludeHiddenGroups && group.collapsed)
                return;
            flattenedGroups = flattenedGroups.concat(_this.getFlattenedGroups(group.groups, options));
        });
        return flattenedGroups;
    };
    DataView.prototype.getLengthWithoutGroupHeaders = function () {
        return this.rows.length - this.getFlattenedGroups(this.groups, { excludeHiddenGroups: true }).length;
    };
    DataView.isGroupRow = function (item) {
        return '__group' in item;
    };
    DataView.isTotals = function (item) {
        return '__groupTotals' in item;
    };
    DataView.prototype.getItem = function (rowIndex) {
        var item = this.rows[rowIndex];
        // if this is a group row, make sure totals are calculated and update the title
        if (item && DataView.isGroupRow(item) && item.totals && !item.totals.initialized) {
            var gi = this.groupingInfos[item.level];
            if (!gi.displayTotalsRow) {
                this.calculateTotals(item.totals);
                item.title = gi.formatter ? gi.formatter(item) : item.value;
            }
        }
        else if (item && DataView.isTotals(item) && !item.initialized) {
            // if this is a totals row, make sure it's calculated
            this.calculateTotals(item);
        }
        return item;
    };
    DataView.prototype.getItemMetadata = function (rowIndex) {
        if (rowIndex === null) {
            return null;
        }
        var item = this.rows[rowIndex];
        if (item === undefined) {
            return null;
        }
        // overrides for grouping rows
        if (DataView.isGroupRow(item)) {
            return this.options.groupItemMetadataProvider.getGroupRowMetadata(item);
        }
        // overrides for totals rows
        if (DataView.isTotals(item)) {
            return this.options.groupItemMetadataProvider.getTotalsRowMetadata(item);
        }
        return null;
    };
    DataView.prototype.expandCollapseAllGroups = function (level, collapse) {
        if (collapse === void 0) { collapse = false; }
        if (level == null) {
            for (var i = 0; i < this.groupingInfos.length; i++) {
                this.toggledGroupsByLevel[i] = {};
                this.groupingInfos[i].collapsed = collapse;
            }
        }
        else {
            this.toggledGroupsByLevel[level] = {};
            this.groupingInfos[level].collapsed = collapse;
        }
        this.refresh();
    };
    /**
     * If not specified, applies to all levels.
     */
    DataView.prototype.collapseAllGroups = function (level) {
        this.expandCollapseAllGroups(level, true);
    };
    /**
     * Optional level to expand.  If not specified, applies to all levels.
     */
    DataView.prototype.expandAllGroups = function (level) {
        this.expandCollapseAllGroups(level, false);
    };
    DataView.prototype.expandCollapseGroup = function (level, groupingKey, collapse) {
        // tslint:disable-next-line:no-bitwise
        this.toggledGroupsByLevel[level][groupingKey] = Boolean(Number(this.groupingInfos[level].collapsed) ^ Number(collapse));
        this.refresh();
    };
    /**
     * @param varArgs Either a Slick.Group's "groupingKey" property, or a
     *     variable argument list of grouping values denoting a unique path to the row.  For
     *     example, calling collapseGroup('high', '10%') will collapse the '10%' subgroup of
     *     the 'high' group.
     */
    DataView.prototype.collapseGroup = function () {
        var groupingKeys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            groupingKeys[_i] = arguments[_i];
        }
        if (groupingKeys.length === 1 && groupingKeys[0].indexOf(this.groupingDelimiter) !== -1) {
            this.expandCollapseGroup(groupingKeys[0].split(this.groupingDelimiter).length - 1, groupingKeys[0], true);
        }
        else {
            this.expandCollapseGroup(groupingKeys.length - 1, groupingKeys.join(this.groupingDelimiter), true);
        }
    };
    /**
     * @param varArgs Either a Slick.Group's "groupingKey" property, or a
     *     variable argument list of grouping values denoting a unique path to the row.  For
     *     example, calling expandGroup('high', '10%') will expand the '10%' subgroup of
     *     the 'high' group.
     */
    DataView.prototype.expandGroup = function () {
        var groupingKeys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            groupingKeys[_i] = arguments[_i];
        }
        if (groupingKeys.length === 1 && groupingKeys[0].indexOf(this.groupingDelimiter) !== -1) {
            this.expandCollapseGroup(groupingKeys[0].split(this.groupingDelimiter).length - 1, groupingKeys[0], false);
        }
        else {
            this.expandCollapseGroup(groupingKeys.length - 1, groupingKeys.join(this.groupingDelimiter), false);
        }
    };
    DataView.prototype.getGroups = function () {
        return this.groups;
    };
    DataView.prototype.extractGroups = function (rows, parentGroup) {
        var group;
        var val;
        var groups = [];
        var groupsByVal = {};
        var r;
        var level = parentGroup ? parentGroup.level + 1 : 0;
        var gi = this.groupingInfos[level];
        for (var i = 0, l = gi.predefinedValues.length; i < l; i++) {
            val = gi.predefinedValues[i];
            group = groupsByVal[val];
            if (!group) {
                group = new core_1.Group();
                group.value = val;
                group.level = level;
                group.groupingKey = (parentGroup ? parentGroup.groupingKey + this.groupingDelimiter : '') + val;
                groups[groups.length] = group;
                groupsByVal[val] = group;
            }
        }
        for (var i_1 = 0, l_1 = rows.length; i_1 < l_1; i_1++) {
            r = rows[i_1];
            val = gi.getterIsAFn ? gi.getter(r) : r[gi.getter]; // TODO: avoid asserts
            group = groupsByVal[val];
            if (!group) {
                group = new core_1.Group();
                group.value = val;
                group.level = level;
                group.groupingKey = (parentGroup ? parentGroup.groupingKey + this.groupingDelimiter : '') + val;
                groups[groups.length] = group;
                groupsByVal[val] = group;
            }
            group.rows[group.count++] = r;
        }
        if (level < this.groupingInfos.length - 1) {
            for (var i_2 = 0; i_2 < groups.length; i_2++) {
                group = groups[i_2];
                group.groups = this.extractGroups(group.rows, group);
            }
        }
        return groups;
    };
    DataView.prototype.sortGroups = function (groups, parentGroup) {
        for (var i = 0; i < groups.length; i++) {
            var group = groups[i];
            if (group.groups) {
                this.sortGroups(group.groups, group);
            }
        }
        var level = parentGroup ? parentGroup.level + 1 : 0;
        groups.sort(this.groupingInfos[level].comparer);
    };
    DataView.prototype.calculateTotals = function (totals) {
        var group = totals.group;
        var gi = this.groupingInfos[group.level];
        var isLeafLevel = (group.level === this.groupingInfos.length);
        var agg;
        var idx = gi.aggregators.length;
        if (!isLeafLevel && gi.aggregateChildGroups) {
            // make sure all the subgroups are calculated
            var i = group.groups.length;
            while (i--) {
                if (!group.groups[i].initialized) {
                    this.calculateTotals(group.groups[i]);
                }
            }
        }
        while (idx--) {
            agg = gi.aggregators[idx];
            agg.init();
            if (!isLeafLevel && gi.aggregateChildGroups) {
                gi.compiledAccumulators[idx].call(agg, group.groups);
            }
            else {
                gi.compiledAccumulators[idx].call(agg, group.rows);
            }
            agg.storeResult(totals);
        }
        totals.initialized = true;
    };
    DataView.prototype.addGroupTotals = function (group) {
        var gi = this.groupingInfos[group.level];
        var totals = new core_1.GroupTotals();
        totals.group = group;
        group.totals = totals;
        if (!gi.lazyTotalsCalculation) {
            this.calculateTotals(totals);
        }
    };
    DataView.prototype.addTotals = function (groups, level) {
        if (level === void 0) { level = 0; }
        var gi = this.groupingInfos[level];
        var groupCollapsed = gi.collapsed;
        var toggledGroups = this.toggledGroupsByLevel[level];
        var idx = groups.length;
        var g;
        while (idx--) {
            g = groups[idx];
            if (g.collapsed && !gi.aggregateCollapsed) {
                continue;
            }
            // Do a depth-first aggregation so that parent group aggregators can access subgroup totals.
            if (g.groups) {
                this.addTotals(g.groups, level + 1);
            }
            if (gi.aggregators.length && (gi.aggregateEmpty || g.rows.length || (g.groups && g.groups.length))) {
                this.addGroupTotals(g);
            }
            g.collapsed = Boolean(Number(groupCollapsed) ^ Number(toggledGroups[g.groupingKey]));
            g.title = gi.formatter ? gi.formatter(g) : g.value;
        }
    };
    DataView.prototype.flattenGroupedRows = function (groups, level) {
        if (level === void 0) { level = 0; }
        var gi = this.groupingInfos[level];
        var groupedRows = [];
        var rows;
        var gl = 0;
        var g;
        for (var i = 0, l = groups.length; i < l; i++) {
            g = groups[i];
            groupedRows[gl++] = g;
            if (!g.collapsed) {
                rows = g.groups ? this.flattenGroupedRows(g.groups, level + 1) : g.rows;
                for (var j = 0, jj = rows.length; j < jj; j++) {
                    groupedRows[gl++] = rows[j];
                }
            }
            if (g.totals && gi.displayTotalsRow && (!g.collapsed || gi.aggregateCollapsed)) {
                groupedRows[gl++] = g.totals;
            }
        }
        return groupedRows;
    };
    DataView.prototype.getFunctionInfo = function (fn) {
        var fnRegex = /^function[^(]*\(([^)]*)\)\s*{([\s\S]*)}$/;
        var matches = fn.toString().match(fnRegex);
        return {
            params: matches[1].split(','),
            body: matches[2]
        };
    };
    DataView.prototype.compileAccumulatorLoop = function (aggregator) {
        var accumulatorInfo = this.getFunctionInfo(aggregator.accumulate);
        var compiledAccumulatorLoop = new Function('_items', 'for (var ' + accumulatorInfo.params[0] + ', _i=0, _il=_items.length; _i<_il; _i++) {' +
            accumulatorInfo.params[0] + ' = _items[_i]; ' +
            accumulatorInfo.body +
            '}');
        return compiledAccumulatorLoop;
    };
    DataView.prototype.compileFilter = function () {
        var filterInfo = this.getFunctionInfo(this.filter);
        var filterBody = filterInfo.body
            .replace(/return false\s*([;}]|$)/gi, '{ continue _coreloop; }$1')
            .replace(/return true\s*([;}]|$)/gi, '{ _retval[_idx++] = $item$; continue _coreloop; }$1')
            .replace(/return ([^;}]+?)\s*([;}]|$)/gi, '{ if ($1) { _retval[_idx++] = $item$; }; continue _coreloop; }$2');
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
        ].join('');
        tpl = tpl.replace(/\$filter\$/gi, filterBody);
        tpl = tpl.replace(/\$item\$/gi, filterInfo.params[0]);
        tpl = tpl.replace(/\$args\$/gi, filterInfo.params[1]);
        var fn = new Function('_items,_args', tpl);
        fn['displayName'] = fn['name'] = 'compiledFilter';
        return fn;
    };
    DataView.prototype.compileFilterWithCaching = function () {
        var filterInfo = this.getFunctionInfo(this.filter);
        var filterBody = filterInfo.body
            .replace(/return false\s*([;}]|$)/gi, '{ continue _coreloop; }$1')
            .replace(/return true\s*([;}]|$)/gi, '{ _cache[_i] = true;_retval[_idx++] = $item$; continue _coreloop; }$1')
            .replace(/return ([^;}]+?)\s*([;}]|$)/gi, '{ if ((_cache[_i] = $1)) { _retval[_idx++] = $item$; }; continue _coreloop; }$2');
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
        ].join('');
        tpl = tpl.replace(/\$filter\$/gi, filterBody);
        tpl = tpl.replace(/\$item\$/gi, filterInfo.params[0]);
        tpl = tpl.replace(/\$args\$/gi, filterInfo.params[1]);
        var fn = new Function('_items,_args,_cache', tpl);
        fn['displayName'] = fn['name'] = 'compiledFilterWithCaching';
        return fn;
    };
    DataView.prototype.uncompiledFilter = function (items, args) {
        var retval = [];
        var idx = 0;
        for (var i = 0, ii = items.length; i < ii; i++) {
            if (this.filter(items[i], args)) {
                retval[idx++] = items[i];
            }
        }
        return retval;
    };
    DataView.prototype.uncompiledFilterWithCaching = function (items, args, cache) {
        var retval = [];
        var idx = 0;
        var item;
        for (var i = 0, ii = items.length; i < ii; i++) {
            item = items[i];
            if (cache[i]) {
                retval[idx++] = item;
            }
            else if (this.filter(item, args)) {
                retval[idx++] = item;
                cache[i] = true;
            }
        }
        return retval;
    };
    DataView.prototype.getFilteredAndPagedItems = function (items) {
        if (this.filter) {
            var batchFilter = this.options.inlineFilters ? this.compiledFilter.bind(this) : this.uncompiledFilter.bind(this);
            var batchFilterWithCaching = this.options.inlineFilters ? this.compiledFilterWithCaching.bind(this) : this.uncompiledFilterWithCaching.bind(this);
            if (this.refreshHints.isFilterNarrowing) {
                this.filteredItems = batchFilter(this.filteredItems, this.filterArgs);
            }
            else if (this.refreshHints.isFilterExpanding) {
                this.filteredItems = batchFilterWithCaching(items, this.filterArgs, this.filterCache);
            }
            else if (!this.refreshHints.isFilterUnchanged) {
                this.filteredItems = batchFilter(items, this.filterArgs);
            }
        }
        else {
            // special case:  if not filtering and not paging, the resulting
            // rows collection needs to be a copy so that changes due to sort
            // can be caught
            this.filteredItems = this.pagesize ? items : items.concat();
        }
        // get the current page
        var paged;
        if (this.pagesize) {
            if (this.filteredItems.length < this.pagenum * this.pagesize) {
                this.pagenum = Math.floor(this.filteredItems.length / this.pagesize);
            }
            paged = this.filteredItems.slice(this.pagesize * this.pagenum, this.pagesize * this.pagenum + this.pagesize);
        }
        else {
            paged = this.filteredItems;
        }
        return {
            totalRows: this.filteredItems.length,
            rows: paged
        };
    };
    DataView.prototype.getRowDiffs = function (rows, newRows) {
        var item;
        var r;
        var eitherIsNonData;
        var diff = [];
        var from = 0;
        var to = newRows.length;
        if (this.refreshHints && this.refreshHints.ignoreDiffsBefore) {
            from = Math.max(0, Math.min(newRows.length, this.refreshHints.ignoreDiffsBefore));
        }
        if (this.refreshHints && this.refreshHints.ignoreDiffsAfter) {
            to = Math.min(newRows.length, Math.max(0, this.refreshHints.ignoreDiffsAfter));
        }
        for (var i = from, rl = rows.length; i < to; i++) {
            if (i >= rl) {
                diff[diff.length] = i;
            }
            else {
                item = newRows[i];
                r = rows[i];
                if ((this.groupingInfos.length && (eitherIsNonData = (item.__nonDataRow) || (r.__nonDataRow)) &&
                    item.__group !== r.__group ||
                    item.__group && !item.equals(r))
                    || (eitherIsNonData &&
                        // no good way to compare totals since they are arbitrary DTOs
                        // deep object comparison is pretty expensive
                        // always considering them 'dirty' seems easier for the time being
                        (item.__groupTotals || r.__groupTotals))
                    || item[this.idProperty] !== r[this.idProperty]
                    || (this.updated && this.updated[item[this.idProperty]])) {
                    diff[diff.length] = i;
                }
            }
        }
        return diff;
    };
    DataView.prototype.recalc = function (_items) {
        this.rowsById = {};
        if (this.refreshHints.isFilterNarrowing !== this.prevRefreshHints.isFilterNarrowing ||
            this.refreshHints.isFilterExpanding !== this.prevRefreshHints.isFilterExpanding) {
            this.filterCache = [];
        }
        var filteredItems = this.getFilteredAndPagedItems(_items);
        this.totalRows = filteredItems.totalRows;
        var newRows = filteredItems.rows;
        this.groups = [];
        if (this.groupingInfos.length) {
            this.groups = this.extractGroups(newRows);
            if (this.groups.length) {
                this.addTotals(this.groups);
                this.onGroupsChanged.notify({ groups: this.groups }, null, self);
                this.sortGroups(this.groups);
                newRows = this.flattenGroupedRows(this.groups);
            }
        }
        var diff = this.getRowDiffs(this.rows, newRows);
        this.rows = newRows;
        return diff;
    };
    DataView.prototype.refresh = function () {
        if (this.suspend)
            return;
        var countBefore = this.rows.length;
        var totalRowsBefore = this.totalRows;
        var diff = this.recalc(this.items); // pass as direct refs to avoid closure perf hit
        // if the current page is no longer valid, go to last page and recalc
        // we suffer a performance penalty here, but the main loop (recalc) remains highly optimized
        if (this.pagesize && this.totalRows < this.pagenum * this.pagesize) {
            this.pagenum = Math.max(0, Math.ceil(this.totalRows / this.pagesize) - 1);
            diff = this.recalc(this.items);
        }
        this.updated = null;
        this.prevRefreshHints = this.refreshHints;
        this.refreshHints = {};
        if (totalRowsBefore !== this.totalRows) {
            this.onPagingInfoChanged.notify(this.getPagingInfo(), null, self);
        }
        if (countBefore !== this.rows.length) {
            this.onRowCountChanged.notify({ previous: countBefore, current: this.rows.length }, null, self);
            this.onRowsChanged.notify({ rows: diff }, null, self);
        }
        if (this.triggerFilteredItemsChanged) {
            this.onFilteredItemsChanged.notify({ filteredItems: this.filteredItems, previousFilteredItems: this.previousFilteredItems }, null, self);
            this.previousFilteredItems = this.filteredItems;
            this.triggerFilteredItemsChanged = false;
        }
    };
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
    DataView.prototype.syncGridSelection = function (grid, preserveHidden, preserveHiddenOnSelectionChange) {
        var _this = this;
        var inHandler;
        var selectedRowIds = this.mapRowsToIds(grid.getSelectedRows());
        var onSelectedRowIdsChanged = new core_1.Event();
        var setSelectedRowIds = function (rowIds) {
            if (selectedRowIds.join(',') === rowIds.join(',')) {
                return;
            }
            selectedRowIds = rowIds;
            onSelectedRowIdsChanged.notify({
                grid: grid,
                ids: selectedRowIds
            }, new core_1.EventData(), _this);
        };
        var update = function () {
            if (selectedRowIds.length > 0) {
                inHandler = true;
                var selectedRows = _this.mapIdsToRows(selectedRowIds);
                if (!preserveHidden) {
                    setSelectedRowIds(_this.mapRowsToIds(selectedRows));
                }
                grid.setSelectedRows(selectedRows);
                inHandler = false;
            }
        };
        grid.onSelectedRowsChanged.subscribe(function (e, args) {
            if (inHandler) {
                return;
            }
            var newSelectedRowIds = _this.mapRowsToIds(grid.getSelectedRows());
            if (!preserveHiddenOnSelectionChange || !grid.getOptions().multiSelect) {
                setSelectedRowIds(newSelectedRowIds);
            }
            else {
                // keep the ones that are hidden
                var existing = $.grep(selectedRowIds, function (id) { return _this.getRowById(id) === undefined; });
                // add the newly selected ones
                setSelectedRowIds(existing.concat(newSelectedRowIds));
            }
        });
        this.onRowsChanged.subscribe(update);
        this.onRowCountChanged.subscribe(update);
        return onSelectedRowIdsChanged;
    };
    DataView.prototype.syncGridCellCssStyles = function (grid, key) {
        var _this = this;
        var hashById;
        var inHandler;
        var storeCellCssStyles = function (hash) {
            hashById = {};
            for (var row in hash) {
                var id = _this.rows[row][_this.idProperty];
                hashById[id] = hash[row];
            }
        };
        var update = function () {
            if (hashById) {
                inHandler = true;
                _this.ensureRowsByIdCache();
                var newHash = {};
                for (var id in hashById) {
                    var row = _this.rowsById[id];
                    if (row !== undefined) {
                        newHash[row] = hashById[id];
                    }
                }
                grid.setCellCssStyles(key, newHash);
                inHandler = false;
            }
        };
        // since this method can be called after the cell styles have been set,
        // get the existing ones right away
        storeCellCssStyles(grid.getCellCssStyles(key));
        grid.onCellCssStylesChanged.subscribe(function (e, args) {
            if (inHandler) {
                return;
            }
            if (key !== args.key) {
                return;
            }
            if (args.hash) {
                storeCellCssStyles(args.hash);
            }
        });
        this.onRowsChanged.subscribe(update);
        this.onRowCountChanged.subscribe(update);
    };
    DataView.prototype.getFilteredItems = function () {
        return this.filteredItems;
    };
    DataView.prototype.setOptions = function (opts) {
        return this.options = $.extend(true, {}, this.defaults, this.options, opts);
    };
    return DataView;
}());
exports.DataView = DataView;
