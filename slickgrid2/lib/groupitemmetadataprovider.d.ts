import { GroupFormatter, GroupTotalsFormatter } from './formatters';
import { SlickGrid } from './grid';
export interface Options {
    groupCssClass: string;
    groupTitleCssClass: string;
    totalsCssClass: string;
    groupFocusable: boolean;
    totalsFocusable: boolean;
    toggleCssClass: string;
    toggleExpandedCssClass: string;
    toggleCollapsedCssClass: string;
    enableExpandCollapse: boolean;
    groupFormatter: GroupFormatter;
    totalsFormatter: GroupTotalsFormatter;
}
/**
 * Provides item metadata for group (Slick.Group) and totals (Slick.Totals) rows produced by the DataView.
 * This metadata overrides the default behavior and formatting of those rows so that they appear and function
 * correctly when processed by the grid.
 *
 * This class also acts as a grid plugin providing event handlers to expand & collapse groups.
 * If 'grid.registerPlugin(...)' is not called, expand & collapse will not work.
 */
export declare class GroupItemMetadataProvider {
    private grid;
    private options;
    constructor(options?: Partial<Options>);
    readonly defaultGroupCellFormatter: GroupFormatter;
    readonly defaultTotalsCellFormatter: GroupTotalsFormatter;
    init(grid: SlickGrid): void;
    DEFAULT_OPTIONS: Options;
    destroy(): void;
    private handleGridClick(e, args);
    private _handleGridClick;
    private handleGridKeyDown(e, args);
    private _handleGridKeyDown;
    getGroupRowMetadata(item: any): {
        selectable: boolean;
        focusable: boolean;
        cssClasses: string;
        columns: {
            0: {
                colspan: string;
                formatter: GroupFormatter;
                editor: null;
            };
        };
    };
    getTotalsRowMetadata(item: any): {
        selectable: boolean;
        focusable: boolean;
        cssClasses: string;
        formatter: GroupTotalsFormatter;
        editor: null;
    };
}
