import { Group } from './core';
var SPACE = 32;
/**
 * Provides item metadata for group (Slick.Group) and totals (Slick.Totals) rows produced by the DataView.
 * This metadata overrides the default behavior and formatting of those rows so that they appear and function
 * correctly when processed by the grid.
 *
 * This class also acts as a grid plugin providing event handlers to expand & collapse groups.
 * If 'grid.registerPlugin(...)' is not called, expand & collapse will not work.
 */
var GroupItemMetadataProvider = (function () {
    function GroupItemMetadataProvider(options) {
        var _this = this;
        this.defaultGroupCellFormatter = function (row, cell, value, columnDef, item) {
            if (!_this.options.enableExpandCollapse) {
                return item.title || '';
            }
            var indentation = item.level * 15 + 'px';
            return '<span class="' + _this.options.toggleCssClass + ' ' +
                (item.collapsed ? _this.options.toggleCollapsedCssClass : _this.options.toggleExpandedCssClass) +
                '" style="margin-left:' + indentation + '">' +
                '</span>' +
                '<span class="' + _this.options.groupTitleCssClass + '" level="' + item.level + '">' +
                item.title +
                '</span>';
        };
        this.defaultTotalsCellFormatter = function (row, cell, value, columnDef, item) {
            return (columnDef.groupTotalsFormatter && columnDef.groupTotalsFormatter(item, columnDef)) || '';
        };
        this.DEFAULT_OPTIONS = {
            groupCssClass: 'slick-group',
            groupTitleCssClass: 'slick-group-title',
            totalsCssClass: 'slick-group-totals',
            groupFocusable: true,
            totalsFocusable: false,
            toggleCssClass: 'slick-group-toggle',
            toggleExpandedCssClass: 'expanded',
            toggleCollapsedCssClass: 'collapsed',
            enableExpandCollapse: true,
            groupFormatter: this.defaultGroupCellFormatter,
            totalsFormatter: this.defaultTotalsCellFormatter
        };
        this._handleGridClick = this.handleGridClick.bind(this);
        this._handleGridKeyDown = this.handleGridKeyDown.bind(this);
        this.options = $.extend(true, {}, this.DEFAULT_OPTIONS, options);
    }
    GroupItemMetadataProvider.prototype.init = function (grid) {
        this.grid = grid;
        this.grid.onClick.subscribe(this._handleGridClick);
        this.grid.onKeyDown.subscribe(this._handleGridKeyDown);
    };
    GroupItemMetadataProvider.prototype.destroy = function () {
        if (this.grid) {
            this.grid.onClick.unsubscribe(this._handleGridClick);
            this.grid.onKeyDown.unsubscribe(this._handleGridKeyDown);
        }
    };
    GroupItemMetadataProvider.prototype.handleGridClick = function (e, args) {
        var item = this.grid.getDataItem(args.row);
        if (item && item instanceof Group && $(e.target).hasClass(this.options.toggleCssClass)) {
            var range = this.grid.getRenderedRange();
            this.grid.getData().setRefreshHints({
                ignoreDiffsBefore: range.top,
                ignoreDiffsAfter: range.bottom
            });
            if (item.collapsed) {
                this.grid.getData().expandGroup(item.groupingKey);
            }
            else {
                this.grid.getData().collapseGroup(item.groupingKey);
            }
            e.stopImmediatePropagation();
            e.preventDefault();
        }
    };
    // TODO:  add -/+ handling
    GroupItemMetadataProvider.prototype.handleGridKeyDown = function (e, args) {
        if (this.options.enableExpandCollapse && (e.which === SPACE)) {
            var activeCell = this.grid.getActiveCell();
            if (activeCell) {
                var item = this.grid.getDataItem(activeCell.row);
                if (item && item instanceof Group) {
                    var range = this.grid.getRenderedRange();
                    this.grid.getData().setRefreshHints({
                        ignoreDiffsBefore: range.top,
                        ignoreDiffsAfter: range.bottom
                    });
                    if (item.collapsed) {
                        this.grid.getData().expandGroup(item.groupingKey);
                    }
                    else {
                        this.grid.getData().collapseGroup(item.groupingKey);
                    }
                    e.stopImmediatePropagation();
                    e.preventDefault();
                }
            }
        }
    };
    GroupItemMetadataProvider.prototype.getGroupRowMetadata = function (item) {
        return {
            selectable: false,
            focusable: this.options.groupFocusable,
            cssClasses: this.options.groupCssClass,
            columns: {
                0: {
                    colspan: '*',
                    formatter: this.options.groupFormatter,
                    editor: null
                }
            }
        };
    };
    GroupItemMetadataProvider.prototype.getTotalsRowMetadata = function (item) {
        return {
            selectable: false,
            focusable: this.options.totalsFocusable,
            cssClasses: this.options.totalsCssClass,
            formatter: this.options.totalsFormatter,
            editor: null
        };
    };
    return GroupItemMetadataProvider;
}());
export { GroupItemMetadataProvider };
