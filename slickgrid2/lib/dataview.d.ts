import { Aggregator } from './aggregators';
import { Column } from './Column';
import { Event, Group, GroupTotals } from './core';
import { Formatter } from './formatters';
import { GroupItemMetadataProvider } from './groupitemmetadataprovider';
export interface GroupingInfo {
    aggregateChildGroups?: boolean;
    aggregateCollapsed?: boolean;
    aggregateEmpty?: boolean;
    aggregators: Aggregator[];
    collapsed?: boolean;
    comparer<T>(a: T, b: T): number;
    compiledAccumulators: Function[];
    displayTotalsRow: boolean;
    formatter(group: Group): string;
    getter: string | ((row: Item) => any);
    getterIsAFn: boolean;
    lazyTotalsCalculation: boolean;
    predefinedValues: any[];
}
export interface GroupRowMetadata {
    columns?: {
        [columnId: number]: Partial<Column>;
    };
    cssClasses: string;
    focusable: boolean;
    formatter: Formatter;
    selectable: boolean;
}
export interface Item {
    id: number;
    [key: string]: any;
}
export interface PagingInfo {
    pageSize: number;
    pageNum: number;
    totalRows: number;
    totalPages: number;
}
export interface RefreshHints {
    ignoreDiffsAfter?: number;
    ignoreDiffsBefore?: number;
    isFilterExpanding?: boolean;
    isFilterNarrowing?: boolean;
    isFilterUnchanged?: boolean;
}
export interface Options {
    groupItemMetadataProvider?: GroupItemMetadataProvider;
    inlineFilters?: boolean;
    items?: Item[];
}
export declare type FilterFn = (item: {
    [a: string]: any;
}, args: {
    [a: string]: (value: any) => boolean;
}) => boolean;
/***
 * A sample Model implementation.
 * Provides a filtered view of the underlying data.
 *
 * Relies on the data item having an "id" property uniquely identifying it.
 */
export declare class DataView {
    private options;
    private defaults;
    private idProperty;
    private items;
    private rows;
    private idxById;
    private rowsById;
    private filter;
    private updated;
    private suspend;
    private sortAsc;
    private sortComparer;
    private refreshHints;
    private prevRefreshHints;
    private filterArgs;
    private filteredItems;
    private previousFilteredItems;
    private compiledFilter;
    private compiledFilterWithCaching;
    private filterCache;
    private triggerFilteredItemsChanged;
    private groupingInfoDefaults;
    private groupingInfos;
    private groups;
    private toggledGroupsByLevel;
    private groupingDelimiter;
    private pagesize;
    private pagenum;
    private totalRows;
    onGroupsChanged: Event<{
        groups: Group[];
    }>;
    onRowCountChanged: Event<{
        previous: number;
        current: number;
    }>;
    onRowsChanged: Event<{
        rows: any[];
    }>;
    onSetItems: Event<{
        items: any[];
    }>;
    onFilteredItemsChanged: Event<{
        filteredItems: Item[];
        previousFilteredItems: Item[];
    }>;
    onPagingInfoChanged: Event<PagingInfo>;
    constructor(options?: Options);
    beginUpdate(): void;
    endUpdate(): void;
    setRefreshHints(hints: RefreshHints): void;
    setFilterArgs(args: any): void;
    private updateIdxById(startingIndex?);
    private ensureIdUniqueness();
    getItems(): Item[];
    setItems(data: Item[], objectIdProperty?: string): void;
    getPagingInfo(): PagingInfo;
    sort(comparer: any, ascending: boolean): void;
    reSort(): void;
    setFilter(filterFn: FilterFn): void;
    getGrouping(): GroupingInfo[];
    getToggleGroupsByLevel(): {
        [groupingKey: string]: boolean;
    }[];
    setGrouping(groupingInfo: Partial<GroupingInfo> | Partial<GroupingInfo>[]): void;
    /**
     * @deprecated Please use {@link setGrouping}.
     */
    groupBy(valueGetter?: string | ((row: Item) => any), valueFormatter?: (group: Group) => string, sortComparer?: <T>(a: T, b: T) => number): void;
    /**
     * @deprecated Please use {@link setGrouping}.
     */
    setAggregators(groupAggregators: Aggregator[], includeCollapsed: boolean): void;
    getItemByIdx(i: number): Item | Group;
    getIdxById(id: number): number;
    private ensureRowsByIdCache();
    getRowById(id: number): number;
    getItemById(id: number): Item | Group;
    mapIdsToRows(idArray: number[]): number[];
    mapRowsToIds(rowArray: number[]): number[];
    updateItem(id: number, item: Item): void;
    getLength(): number;
    getFlattenedGroups(groups: Group[], options?: {
        excludeHiddenGroups: boolean;
    }): Group[];
    getLengthWithoutGroupHeaders(): number;
    static isGroupRow(item: Group | Item): item is Group;
    static isTotals(item: any): item is GroupTotals;
    getItem(rowIndex: number): Item | Group;
    getItemMetadata(rowIndex: number | null): any;
    private expandCollapseAllGroups(level?, collapse?);
    /**
     * If not specified, applies to all levels.
     */
    collapseAllGroups(level?: number): void;
    /**
     * Optional level to expand.  If not specified, applies to all levels.
     */
    expandAllGroups(level?: number): void;
    private expandCollapseGroup(level, groupingKey, collapse);
    /**
     * @param varArgs Either a Slick.Group's "groupingKey" property, or a
     *     variable argument list of grouping values denoting a unique path to the row.  For
     *     example, calling collapseGroup('high', '10%') will collapse the '10%' subgroup of
     *     the 'high' group.
     */
    collapseGroup(...groupingKeys: string[]): void;
    /**
     * @param varArgs Either a Slick.Group's "groupingKey" property, or a
     *     variable argument list of grouping values denoting a unique path to the row.  For
     *     example, calling expandGroup('high', '10%') will expand the '10%' subgroup of
     *     the 'high' group.
     */
    expandGroup(...groupingKeys: string[]): void;
    getGroups(): Group[];
    private extractGroups(rows, parentGroup?);
    private sortGroups(groups, parentGroup?);
    private calculateTotals(totals);
    private addGroupTotals(group);
    private addTotals(groups, level?);
    private flattenGroupedRows(groups, level?);
    private getFunctionInfo(fn);
    private compileAccumulatorLoop(aggregator);
    private compileFilter();
    private compileFilterWithCaching();
    private uncompiledFilter(items, args);
    private uncompiledFilterWithCaching(items, args, cache);
    private getFilteredAndPagedItems(items);
    private getRowDiffs(rows, newRows);
    private recalc(_items);
    refresh(): void;
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
    syncGridSelection(grid: any, preserveHidden: any, preserveHiddenOnSelectionChange: any): Event<{}>;
    syncGridCellCssStyles(grid: any, key: any): void;
    getFilteredItems(): Item[];
    setOptions(opts: Options): Options;
}
