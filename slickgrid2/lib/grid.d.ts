import { EditController, EditorLock, Event, EventData, Group, GroupTotals, Range } from './core';
import { DataView, Item } from './dataview';
import { Editor, EditorValidationObject } from './editors';
import { Formatter } from './formatters';
import { SlickPlugin } from './plugins';
export interface Column {
    asyncPostRender?: AsyncPostRenderer;
    cannotTriggerInsert?: boolean;
    cssClass?: string;
    colspan?: number | '*';
    defaultSortAsc?: boolean;
    editor?: Editor;
    field: number | string;
    focusable?: boolean;
    formatter?: Formatter;
    groupTotalsFormatter?(item: GroupTotals, columnDef: Column): string;
    headerCssClass?: string;
    id: number | string;
    isHidden?: boolean;
    json?: any;
    key?: string;
    manuallySized?: boolean;
    maxWidth?: number;
    minWidth?: number;
    name?: string;
    previousWidth?: number;
    resizable?: boolean;
    rerenderOnResize?: boolean;
    showHidden?: boolean;
    selectable?: boolean;
    sortable?: boolean;
    toolTip?: string;
    validator?: Validator;
    width?: number;
}
export interface Validator {
    (value: any): EditorValidationObject;
}
export interface AsyncPostRenderer {
    (cellNode: HTMLDivElement, row: number, dataRow: Item, column: Column, grid: SlickGrid): void;
}
export declare type SubHeaderRenderer = (column: Column) => JQuery;
export declare const COLUMNS_TO_LEFT: COLUMNS_TO_LEFT;
export declare const COLUMNS_TO_RIGHT: COLUMNS_TO_RIGHT;
export declare type COLUMNS_TO_LEFT = -1;
export declare type COLUMNS_TO_RIGHT = 1;
export interface SelectionModel {
    destroy(): void;
    getFullySelectedRowIndices(): number[];
    getLastKeydown(): KeyboardEvent | undefined;
    getSelectedCols(): number[];
    getSelectedColNodes(): JQuery;
    handleGridKeydown(e: KeyboardEvent, args: {
        cell: number;
        row: number;
        grid: SlickGrid;
    }): void;
    init(grid: SlickGrid): void;
    rangesToRowIndices(ranges: Range[]): number[];
    rangesToRowObjects(ranges: Range[]): (Group | Item)[];
    refresh(): void;
    refreshSelection(): void;
    rowIndicesToRanges(rows: number[], excludeGutter: boolean): Range[];
    rows: (Group | Item)[];
    selectCell(row: number, cell: number): this;
    selectRow(row: number): this;
    selectFirstSelectable(colIdx?: number): void;
    setSelectedCols(cols: number[]): number[];
    setSelectedRanges(newRanges: Range[], force?: boolean): void;
    onSelectedRangesChanged: Event<Range[]>;
}
export interface EditCommand {
    cell: number | null;
    editor: Editor;
    execute(): void;
    prevSerializedValue: any;
    row: number | null;
    serializedValue: any;
    undo(): void;
}
export interface Options {
    absoluteColumnMinWidth: number;
    addNewRowCssClass: string;
    addRowIndexToClassName: boolean;
    appendSubheadersToContainer: boolean;
    asyncEditorLoading: boolean;
    asyncEditorLoadDelay: number;
    asyncPostRenderDelay: number;
    autoEdit: boolean;
    autoHeight: boolean;
    cellFlashingCssClass: string;
    columnHeaderRenderer: (column: Column) => JQuery;
    dataItemColumnValueExtractor: void;
    defaultColumnWidth: number;
    defaultFormatter: Formatter;
    editCommandHandler?(item: Item | Group, column: Column, editCommand: EditCommand): any;
    editable: boolean;
    editorFactory?: {
        getEditor: (column: Column) => Editor;
    };
    editorLock: EditorLock;
    enableAddRow: boolean;
    enableAsyncPostRender: boolean;
    enableCellNavigation: boolean;
    enableColumnResize: boolean;
    enableTextSelectionOnCells: boolean;
    forceFitColumns: boolean;
    forceSyncScrolling: boolean;
    formatterFactory?: {
        getFormatter: (column: Column) => Formatter;
    };
    fullWidthRows: boolean;
    leaveSpaceForNewRows: boolean;
    maxSupportedCssHeight?: number;
    multiColumnSort: boolean;
    multiSelect: boolean;
    pinnedColumn?: number;
    resizeOnlyDraggedColumn: boolean;
    rowHeight?: number;
    selectedCellCssClass: string;
    scrollbarSize?: {
        height: number;
        width: number;
    };
    showScrollbarsOnHover: boolean;
    showSubHeaders: boolean;
    skipPaging: boolean;
    subHeaderRenderers: SubHeaderRenderer[];
    syncColumnCellResize: boolean;
    useAntiscroll: boolean;
}
export interface SortColumn {
    columnId: number;
    sortAsc: boolean;
}
export interface EventArgs {
    column: Column;
    grid: SlickGrid;
    node: HTMLDivElement;
}
export declare class SlickGrid {
    private container;
    private data;
    private columns;
    onScroll: Event<{}>;
    onSort: Event<{}>;
    onHeaderMouseEnter: Event<{}>;
    onHeaderMouseLeave: Event<{}>;
    onHeaderContextMenu: Event<{}>;
    onSubHeaderContextMenu: Event<{}>;
    onHeaderClick: Event<{}>;
    onHeaderCellRendered: Event<EventData>;
    onHeaderColumnDragStart: Event<{}>;
    onHeaderColumnDrag: Event<{}>;
    onHeaderColumnDragEnd: Event<{}>;
    onHeadersCreated: Event<void>;
    onBeforeHeaderCellDestroy: Event<{}>;
    onSubHeaderCellRendered: Event<{
        node: JQuery;
        column: number;
        subHeader: number;
    }>;
    onBeforeSubHeaderCellDestroy: Event<EventData>;
    onMouseEnter: Event<{}>;
    onMouseLeave: Event<{}>;
    onClick: Event<{
        cell: number;
        row: number;
    }>;
    onDblClick: Event<{}>;
    onContextMenu: Event<{}>;
    onBeforeKeyDown: Event<{}>;
    onKeyDown: Event<{}>;
    onAddNewRow: Event<{}>;
    onValidationError: Event<{}>;
    onViewportChanged: Event<void>;
    onRender: Event<void>;
    onInvalidate: Event<{}>;
    onColumnsReordered: Event<{}>;
    onColumnsResized: Event<void>;
    onColumnsChanged: Event<void>;
    onCellChange: Event<{
        cell: number;
        item: Item;
        row: number;
    }>;
    onBeforeEditCell: Event<{}>;
    onBeforeCellEditorDestroy: Event<{}>;
    onBeforeDestroy: Event<{}>;
    onActiveCellChanged: Event<{}>;
    onActiveCellPositionChanged: Event<{}>;
    onActiveRowChanged: Event<{
        row: Item | Group;
    }>;
    onDragInit: Event<{}>;
    onDragStart: Event<{}>;
    onDrag: Event<{}>;
    onDragEnd: Event<{}>;
    onSelectedRowsChanged: Event<{}>;
    onCellCssStylesChanged: Event<{}>;
    static COLUMNS_TO_LEFT: -1;
    static COLUMNS_TO_RIGHT: 1;
    private defaults;
    private columnDefaults;
    private th;
    private h;
    private ph;
    private n;
    private cj;
    private page;
    private offset;
    private vScrollDir;
    private initialized;
    private $container;
    private objectName;
    private uid;
    private isPinned;
    private $focusSink;
    private $focusSink2;
    private options;
    private state;
    private $style;
    private $boundAncestors;
    private stylesheet;
    private columnCssRulesL;
    private columnCssRulesR;
    private viewportHasHScroll;
    private viewportHasVScroll;
    private tabbingDirection;
    private activePosX;
    private activeRow;
    private activeCell;
    private activeCellNode;
    private currentEditor;
    private serializedEditorValue;
    private editController;
    private rowsCache;
    private renderedRows;
    private numVisibleRows;
    private prevScrollTop;
    private scrollTop;
    private lastRenderedScrollTop;
    private lastRenderedScrollLeft;
    private prevScrollLeft;
    private scrollLeft;
    private selectionModel;
    private selectedRows;
    private plugins;
    private cellCssClasses;
    private columnIdxById;
    private sortColumns;
    private columnPosLeft;
    private columnPosRight;
    private h_editorLoader;
    private h_render;
    private h_postrender;
    private postProcessedRows;
    private postProcessToRow;
    private postProcessFromRow;
    private counter_rows_rendered;
    private counter_rows_removed;
    private $activeCanvasNode;
    /** The scrolling region */
    private topViewport;
    /** The full size of content (both off and on screen) */
    private topCanvas;
    /** The column headers */
    private header;
    /** Optional rows of cells below the column headers */
    private subHeaders;
    /**
     * Content viewports are wrapped with elements that have the same dimensions
     * as the viewports themselves. This is in service of the antiscroll plugin.
     */
    private contentViewportWrap;
    /** The scrolling region for the grid rows */
    private contentViewport;
    /** Full size of row content, both width and height */
    private contentCanvas;
    constructor(container: Element | JQuery | string, data: DataView, columns: Column[], options?: Partial<Options>);
    registerPlugin(plugin: SlickPlugin): void;
    unregisterPlugin(plugin: any): void;
    private _handleSelectedRangesChanged;
    setSelectionModel(model: SelectionModel): void;
    getSelectionModel(): SelectionModel;
    getCanvasNode(): JQuery;
    getTopCanvasNode(): JQuery;
    private measureScrollbar();
    private calculateCanvasWidth();
    private updateCanvasWidth(forceColumnWidthsUpdate?);
    private disableSelection($target?);
    private getMaxSupportedCssHeight();
    private bindAncestorScrollEvents();
    updateColumnHeaders(): void;
    private unbindAncestorScrollEvents();
    updateColumnHeader(columnId: number | string, title?: string, toolTip?: string): void;
    private injectSubheaders(appendSubheadersToContainer?);
    updateSubHeaders(columnId: number | string, rowIndex?: number): void;
    getHeaderRow(): JQuery;
    getHeaderRowColumn(columnId: number | string): JQuery;
    createColumnHeaders(): void;
    private columnHeaderRenderer(column);
    private setupColumnSort();
    private setupColumnResize();
    private getVBoxDelta($el);
    private updatePinnedState();
    private disableAntiscroll($element);
    private enableAntiscroll($element);
    private updateAntiscroll();
    private debouncedUpdateAntiscroll;
    private setScroller();
    private setOverflow();
    private measureCssSizes();
    private createCssRules();
    private getColumnCssRules(idx);
    private removeCssRules();
    destroy(): void;
    getId(): string;
    private trigger<T>(this, evt, args?, e?);
    getEditorLock(): EditorLock;
    getEditController(): EditController;
    getColumnIndex(id: number | string): number;
    getColumnNodeById(id: number | string): JQuery;
    getHeaderEl(): JQuery;
    getHeaderEls(idx?: number): JQuery;
    getColumnIndexFromEvent(evt: MouseEvent): number | null;
    getColumnFromEvent(evt: MouseEvent): Column | null;
    autosizeColumns(): void;
    private applyColumnHeaderWidths();
    private applyColumnWidths();
    setSortColumn(columnId: number, sortAsc: boolean): void;
    setSortColumns(cols: SortColumn[]): void;
    getSortColumns(): SortColumn[];
    private handleSelectedRangesChanged(e, ranges);
    getColumns(): Column[];
    getColumnByKey(key: string): Column | undefined;
    isAdjacent(array: number[]): boolean;
    private updateColumnCaches();
    private enforceWidthLimits(cols);
    /**
     * Efficient change detection
     */
    private didColumnsChange(before, after);
    /**
     * Set or re-set the columns in the grid
     * opts.skipResizeCanvas let's you skip that step. Boosts performance if you don't need it because you're planning to to manually call resizeCanvas.
     */
    setColumns(columns: Column[], opts?: {
        forceUpdate?: boolean;
        skipResizeCanvas?: boolean;
    }): void;
    updateColumnWidths(columns: Column[]): void;
    getOptions(): Partial<Options>;
    setOptions(args: Partial<Options>): void;
    private validateAndEnforceOptions();
    setData(newData: DataView, scrollToTop?: boolean): void;
    getData(): DataView;
    getDataLength(): number;
    private getDataLengthIncludingAddNew();
    getDataItem(rowIndex: number): Group | Item;
    setSubHeadersVisibility(visible: boolean): void;
    getContainerNode(): HTMLDivElement;
    private getRowTop(row);
    private getRowFromPosition(y);
    private scrollTo(y);
    private getFormatter(rowIndex, column);
    private getEditor(rowIndex, cell);
    private getDataItemValueForColumn(item, columnDef);
    private appendRowHtml(markupArrayL, markupArrayR, row, range, dataLength);
    private appendCellHtml(markupArray, row, cell, colspan, item);
    private cleanupRows(rangeToKeep);
    invalidate(): void;
    invalidateSafe(): void;
    invalidateAllRows(): void;
    private removeRowFromCache(rowIndex);
    invalidateRows(rowIndeces?: number[]): void;
    invalidateRow(rowIndex: number): void;
    updateCell(rowIndex: number, cell: number): void;
    updateRow(rowIndex: number): void;
    private calculateHeights();
    private calculateViewportWidth(width?);
    resizeCanvas(): void;
    updateRowCount(): void;
    getViewport(viewportTop?: number, viewportLeft?: number): {
        bottom: number;
        leftPx: number;
        rightPx: number;
        top: number;
    };
    getRenderedRange(viewportTop?: number, viewportLeft?: number): {
        bottom: number;
        leftPx: number;
        rightPx: number;
        top: number;
    };
    private ensureCellNodesInRowsCache(rowIndex);
    private cleanUpCells(range, rowIndex);
    private cleanUpAndRenderCells(range);
    private renderRows(range);
    private startPostProcessing();
    private invalidatePostProcessingResults(row);
    private updateRowPositions();
    render(): void;
    private onHeaderMouseWheel(evt);
    private scroll();
    private handleScroll(top?);
    private reallyHandleScroll(isMouseWheel);
    private asyncPostProcessRows();
    private updateCellCssStylesOnRenderedRows(addedHash, removedHash);
    addCellCssStyles(key: any, hash: any): void;
    removeCellCssStyles(key: any): void;
    setCellCssStyles(key: any, hash: any): void;
    getCellCssStyles(key: any): {
        [row: number]: {
            [columnId: string]: string;
        };
    };
    flashCell(row: any, cell: any, speed: any): void;
    private handleDragInit(e, dd);
    private handleDragStart(e, dd);
    private handleDrag(e, dd);
    private handleDragEnd(e, dd);
    private handleKeyDown(e);
    private handleClick(e);
    private handleContextMenu(e);
    private handleDblClick(e);
    private handleHeaderMouseEnter(e);
    private handleHeaderMouseLeave(e);
    private handleHeaderContextMenu(e);
    private handleSubHeaderContextMenu(e);
    private handleHeaderClick(e);
    private handleMouseEnter(e);
    private handleMouseLeave(e);
    private cellExists(row, cell);
    getCellFromPoint(x: any, y: any): {
        row: number;
        cell: number;
    };
    private getCellFromNode(cellNode);
    private getRowFromNode(node);
    getCellFromEvent(e: any): {
        row: number;
        cell: number;
    } | null;
    getCellNodeBox(row: any, cell: any): {
        top: number;
        left: number;
        bottom: number;
        right: number;
    } | null;
    resetActiveCell(): void;
    focus(): void;
    private getPinnedColumnsWidth();
    private getFirstFocusableColumnIndex();
    scrollCellIntoView(row: any, cell: any, doPaging: any): void;
    private setActiveCellInternal(newCell, opt_editMode?);
    private clearTextSelection();
    private isCellPotentiallyEditable(row, cell);
    private makeActiveCellNormal();
    editActiveCell(editor?: Editor): void;
    private commitEditAndSetFocus();
    private cancelEditAndSetFocus();
    private absBox(elem);
    getActiveCellPosition(): {
        top: any;
        left: any;
        bottom: number;
        right: number;
        width: number;
        height: number;
        visible: boolean;
    };
    getGridPosition(): {
        top: any;
        left: any;
        bottom: number;
        right: number;
        width: number;
        height: number;
        visible: boolean;
    };
    private handleActiveCellPositionChange();
    getCellEditor(): Editor | null;
    getActiveCell(): {
        row: number | null;
        cell: number | null;
    } | null;
    getActiveCellNode(): HTMLDivElement | null;
    scrollRowIntoView(rowIndex: number, doPaging: boolean): void;
    scrollRowToTop(row: any): void;
    private scrollPage(dir);
    navigatePageDown(): void;
    navigatePageUp(): void;
    private getColspan(rowIndex, cell);
    private findFirstFocusableCell(rowIndex);
    private findLastFocusableCell(rowIndex);
    private gotoRight(row, cell, posX);
    private gotoLeft(row, cell, posX);
    private gotoDown(row, cell, posX);
    private gotoUp(row, cell, posX);
    private gotoNext(row, cell, posX);
    private gotoPrev(row, cell, posX);
    navigateRight(): boolean;
    navigateLeft(): boolean;
    navigateDown(): boolean;
    navigateUp(): boolean;
    navigateNext(): boolean;
    navigatePrev(): boolean;
    private navigate(dir);
    getCellNode(rowIndex: number | null, cell: number | null): HTMLDivElement | null;
    setActiveCell(rowIndex: number, columnIndex: number, settings?: {
        scrollIntoView?: boolean;
    }): void;
    canCellBeActive(rowIndex: number | null, columnIndex: number | null): boolean;
    crossesPinnedArea(indices: number[]): boolean;
    canCellBeSelected(rowIndex: number, columnIndex: number): boolean;
    gotoCell(rowIndex: number, columnIndex: number, forceEdit: boolean): void;
    private commitCurrentEdit();
    private cancelCurrentEdit();
    private rowsToRanges(rows);
    getSelectedRows(): number[];
    setSelectedRows(rows: number[]): void;
    isGroupNode(row: number, cell: number): boolean;
    private getHiddenCssClass(index);
    private getColumnVisibleWidth(column);
    refreshColumns(): void;
    hideColumn(column: Column): void;
    unhideColumn(column: Column): void;
    private iterateColumnsInDirection<T>(column, columnDirection, fn);
    showAdjacentHiddenColumns(column: Column, columnDirection: 1 | -1): void;
    getNextVisibleColumn(column: Column, columnDirection: 1 | -1): Column | undefined;
    isColumnHidden(column: Column): boolean;
    isColumnInvisible(column: Column): boolean;
    isColumnVisible(column: Column): boolean;
    isHiddenColumnVisible(column: Column): boolean;
    isAnyColumnHidden(): boolean;
    private isAnyColumnInvisible();
    toggleHiddenColumns(): void;
    getColumnsFromIndices(indices: number[]): Column[];
    withTransaction(fn: () => any): void;
}
