(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('lodash')) :
	typeof define === 'function' && define.amd ? define(['exports', 'lodash'], factory) :
	(factory((global.slickgrid2 = global.slickgrid2 || {}),global._));
}(this, (function (exports,lodash) { 'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var Aggregator = (function () {
    function Aggregator(field) {
        this.field = field;
    }
    return Aggregator;
}());

var AvgAggregator = (function (_super) {
    __extends(AvgAggregator, _super);
    function AvgAggregator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AvgAggregator.prototype.init = function () {
        this.count = 0;
        this.nonNullCount = 0;
        this.sum = 0;
    };
    AvgAggregator.prototype.accumulate = function (item) {
        var val = item[this.field];
        this.count++;
        if (val != null && val !== '' && !isNaN(val)) {
            this.nonNullCount++;
            this.sum += parseFloat(val);
        }
    };
    AvgAggregator.prototype.storeResult = function (groupTotals) {
        if (!groupTotals['avg']) {
            groupTotals['avg'] = {};
        }
        if (this.nonNullCount !== 0) {
            groupTotals['avg'][this.field] = this.sum / this.nonNullCount;
        }
    };
    return AvgAggregator;
}(Aggregator));

var MaxAggregator = (function (_super) {
    __extends(MaxAggregator, _super);
    function MaxAggregator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MaxAggregator.prototype.init = function () {
        this.max = null;
    };
    MaxAggregator.prototype.accumulate = function (item) {
        var val = item[this.field];
        if (val != null && val !== '' && !isNaN(val)) {
            if (this.max == null || val > this.max) {
                this.max = val;
            }
        }
    };
    MaxAggregator.prototype.storeResult = function (groupTotals) {
        if (!groupTotals['max']) {
            groupTotals['max'] = {};
        }
        groupTotals['max'][this.field] = this.max;
    };
    return MaxAggregator;
}(Aggregator));

var MinAggregator = (function (_super) {
    __extends(MinAggregator, _super);
    function MinAggregator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MinAggregator.prototype.init = function () {
        this.min = null;
    };
    MinAggregator.prototype.accumulate = function (item) {
        var val = item[this.field];
        if (val != null && val !== '' && !isNaN(val)) {
            if (this.min == null || val < this.min) {
                this.min = val;
            }
        }
    };
    MinAggregator.prototype.storeResult = function (groupTotals) {
        if (!groupTotals['min']) {
            groupTotals['min'] = {};
        }
        groupTotals['min'][this.field] = this.min;
    };
    return MinAggregator;
}(Aggregator));

var SumAggregator = (function (_super) {
    __extends(SumAggregator, _super);
    function SumAggregator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SumAggregator.prototype.init = function () {
        this.sum = 0;
    };
    SumAggregator.prototype.accumulate = function (item) {
        var val = item[this.field];
        if (val != null && val !== '' && !isNaN(val)) {
            this.sum += parseFloat(val);
        }
    };
    SumAggregator.prototype.storeResult = function (groupTotals) {
        if (!groupTotals['sum']) {
            groupTotals['sum'] = {};
        }
        groupTotals['sum'][this.field] = this.sum;
    };
    return SumAggregator;
}(Aggregator));

/**
 * An event object for passing data to event handlers and letting them control propagation.
 *
 * This is pretty much identical to how W3C and jQuery implement events.
 */
var EventData = (function () {
    function EventData() {
        this.state = {
            isPropagationStopped: false,
            isImmediatePropagationStopped: false
        };
    }
    /**
     * Stops event from propagating up the DOM tree.
     */
    EventData.prototype.stopPropagation = function () {
        this.state.isPropagationStopped = true;
    };
    /**
     * Returns whether stopPropagation was called on this event object.
     */
    EventData.prototype.isPropagationStopped = function () {
        return this.state.isPropagationStopped;
    };
    /**
     * Prevents the rest of the handlers from being executed.
     */
    EventData.prototype.stopImmediatePropagation = function () {
        this.state.isImmediatePropagationStopped = true;
    };
    /**
     * Returns whether stopImmediatePropagation was called on this event object.
     */
    EventData.prototype.isImmediatePropagationStopped = function () {
        return this.state.isImmediatePropagationStopped;
    };
    return EventData;
}());
/**
 * A simple publisher-subscriber implementation.
 */
var Event = (function () {
    function Event() {
        this.handlers = [];
    }
    /**
     * Adds an event handler to be called when the event is fired.
     *
     * Event handler will receive two arguments - an `EventData` and the `data`
     * object the event was fired with.
     */
    Event.prototype.subscribe = function (fn) {
        this.handlers.push(fn);
    };
    /**
     * Removes an event handler added with `subscribe(fn)`.
     */
    Event.prototype.unsubscribe = function (fn) {
        for (var i = this.handlers.length - 1; i >= 0; i--) {
            if (this.handlers[i] === fn) {
                this.handlers.splice(i, 1);
            }
        }
    };
    /**
     * Fires an event notifying all subscribers.
     */
    Event.prototype.notify = function (args, e, scope) {
        if (scope === void 0) { scope = this; }
        if (!e) {
            e = new EventData;
        }
        var returnValue;
        for (var i = 0; i < this.handlers.length && !(e.isPropagationStopped() || e.isImmediatePropagationStopped()); i++) {
            returnValue = this.handlers[i].call(scope, e, args);
        }
        return returnValue;
    };
    return Event;
}());
var EventHandler = (function () {
    function EventHandler() {
        this.handlers = [];
    }
    EventHandler.prototype.subscribe = function (event, handler) {
        this.handlers.push({
            event: event,
            handler: handler
        });
        event.subscribe(handler);
        return this; // allow chaining
    };
    EventHandler.prototype.unsubscribe = function (event, handler) {
        var i = this.handlers.length;
        while (i--) {
            if (this.handlers[i].event === event &&
                this.handlers[i].handler === handler) {
                this.handlers.splice(i, 1);
                event.unsubscribe(handler);
                return;
            }
        }
        return this; // allow chaining
    };
    EventHandler.prototype.unsubscribeAll = function () {
        var i = this.handlers.length;
        while (i--) {
            this.handlers[i].event.unsubscribe(this.handlers[i].handler);
        }
        this.handlers = [];
        return this; // allow chaining
    };
    return EventHandler;
}());
/**
 * A structure containing a range of cells.
 */
var Range = (function () {
    function Range(fromRow, fromCell, toRow, toCell) {
        if (toRow === void 0) { toRow = fromRow; }
        if (toCell === void 0) { toCell = fromCell; }
        this.fromRow = Math.min(fromRow, toRow);
        this.fromCell = Math.min(fromCell, toCell);
        this.toRow = Math.max(fromRow, toRow);
        this.toCell = Math.max(fromCell, toCell);
    }
    /**
     * Returns whether a range represents a single row.
     */
    Range.prototype.isSingleRow = function () {
        return this.fromRow === this.toRow;
    };
    /**
     * Returns whether a range represents a single cell.
     */
    Range.prototype.isSingleCell = function () {
        return this.fromRow === this.toRow && this.fromCell === this.toCell;
    };
    /**
     * Returns whether a range contains a given cell.
     */
    Range.prototype.contains = function (row, cell) {
        return row >= this.fromRow && row <= this.toRow &&
            cell >= this.fromCell && cell <= this.toCell;
    };
    /**
     * Returns a readable representation of a range.
     */
    Range.prototype.toString = function () {
        if (this.isSingleCell()) {
            return '(' + this.fromRow + ':' + this.fromCell + ')';
        }
        else {
            return '(' + this.fromRow + ':' + this.fromCell + ' - ' + this.toRow + ':' + this.toCell + ')';
        }
    };
    return Range;
}());
/**
 * A base class that all special / non-data rows (like Group and GroupTotals) derive from.
 */
var NonDataItem = (function () {
    function NonDataItem() {
        this.__nonDataRow = true;
    }
    return NonDataItem;
}());
/**
 * Information about a group of rows.
 */
var Group = (function (_super) {
    __extends(Group, _super);
    function Group() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.__group = true;
        _this.initialized = false;
        _this.statResult = undefined;
        /**
         * Grouping level, starting with 0.
         */
        _this.level = 0;
        /**
         * Number of rows in the group.
         */
        _this.count = 0;
        /**
         * Grouping value.
         */
        _this.value = null;
        /**
         * Formatted display value of the group.
         */
        _this.title = null;
        /**
         * Whether a group is collapsed.
         */
        _this.collapsed = false;
        /**
         * GroupTotals, if any.
         */
        _this.totals = null;
        /**
         * Rows that are part of the group.
         * @property rows
         * @type {Array}
         */
        _this.rows = [];
        /**
         * Sub-groups that are part of the group.
         */
        _this.groups = null;
        return _this;
    }
    /**
     * Compares two Group instances.
     */
    Group.prototype.equals = function (group) {
        return this.value === group.value &&
            this.count === group.count &&
            this.collapsed === group.collapsed &&
            this.title === group.title;
    };
    return Group;
}(NonDataItem));
/**
 * Information about group totals.
 * An instance of GroupTotals will be created for each totals row and passed to the aggregators
 * so that they can store arbitrary data in it.  That data can later be accessed by group totals
 * formatters during the display.
 */
var GroupTotals = (function (_super) {
    __extends(GroupTotals, _super);
    function GroupTotals() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.__groupTotals = true;
        /**
         * Parent Group.
         */
        _this.group = null;
        /**
         * Whether the totals have been fully initialized / calculated.
         * Will be set to false for lazy-calculated group totals.
         */
        _this.initialized = false;
        return _this;
    }
    return GroupTotals;
}(NonDataItem));
/**
 * A locking helper to track the active edit controller and ensure that only a single controller
 * can be active at a time.  This prevents a whole class of state and validation synchronization
 * issues.  An edit controller (such as SlickGrid) can query if an active edit is in progress
 * and attempt a commit or cancel before proceeding.
 */
var EditorLock = (function () {
    function EditorLock() {
        this.activeEditController = null;
    }
    /**
     * Returns true if a specified edit controller is active (has the edit lock).
     * If the parameter is not specified, returns true if any edit controller is active.
     */
    EditorLock.prototype.isActive = function (editController) {
        return (editController ? this.activeEditController === editController : this.activeEditController !== null);
    };
    /**
     * Sets the specified edit controller as the active edit controller (acquire edit lock).
     * If another edit controller is already active, and exception will be thrown.
     */
    EditorLock.prototype.activate = function (editController) {
        if (editController === this.activeEditController) {
            return;
        }
        if (this.activeEditController !== null) {
            throw 'SlickGrid.EditorLock.activate: an editController is still active, can\'t activate another editController';
        }
        if (!editController.commitCurrentEdit) {
            throw 'SlickGrid.EditorLock.activate: editController must implement .commitCurrentEdit()';
        }
        if (!editController.cancelCurrentEdit) {
            throw 'SlickGrid.EditorLock.activate: editController must implement .cancelCurrentEdit()';
        }
        this.activeEditController = editController;
    };
    /**
     * Unsets the specified edit controller as the active edit controller (release edit lock).
     * If the specified edit controller is not the active one, an exception will be thrown.
     */
    EditorLock.prototype.deactivate = function (editController) {
        if (this.activeEditController !== editController) {
            throw 'SlickGrid.EditorLock.deactivate: specified editController is not the currently active one';
        }
        this.activeEditController = null;
    };
    /**
     * Attempts to commit the current edit by calling "commitCurrentEdit" method on the active edit
     * controller and returns whether the commit attempt was successful (commit may fail due to validation
     * errors, etc.).  Edit controller's "commitCurrentEdit" must return true if the commit has succeeded
     * and false otherwise.  If no edit controller is active, returns true.
     */
    EditorLock.prototype.commitCurrentEdit = function () {
        return (this.activeEditController ? this.activeEditController.commitCurrentEdit() : true);
    };
    /**
     * Attempts to cancel the current edit by calling "cancelCurrentEdit" method on the active edit
     * controller and returns whether the edit was successfully cancelled.  If no edit controller is
     * active, returns true.
     */
    EditorLock.prototype.cancelCurrentEdit = function () {
        return (this.activeEditController ? this.activeEditController.cancelCurrentEdit() : true);
    };
    return EditorLock;
}());
/**
 * A global singleton editor lock.
 */
var GlobalEditorLock = new EditorLock();

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
            var range$$1 = this.grid.getRenderedRange();
            this.grid.getData().setRefreshHints({
                ignoreDiffsBefore: range$$1.top,
                ignoreDiffsAfter: range$$1.bottom
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
                    var range$$1 = this.grid.getRenderedRange();
                    this.grid.getData().setRefreshHints({
                        ignoreDiffsBefore: range$$1.top,
                        ignoreDiffsAfter: range$$1.bottom
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
        this.onGroupsChanged = new Event();
        this.onRowCountChanged = new Event();
        this.onRowsChanged = new Event();
        this.onSetItems = new Event();
        this.onFilteredItemsChanged = new Event();
        this.onPagingInfoChanged = new Event();
        this.setOptions(options);
        // TODOCK: this is probably not the best way, but it'll do for now
        if (options.items != null)
            this.setItems(options.items);
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
    DataView.prototype.reSort = function () {
        if (this.sortComparer) {
            this.sort(this.sortComparer, this.sortAsc);
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
            this.options.groupItemMetadataProvider = new GroupItemMetadataProvider();
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
            throw new Error('Invalid or non-matching id');
        }
        this.items[this.idxById[id]] = item;
        if (this.updated == null)
            this.updated = {};
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
                group = new Group();
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
                group = new Group();
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
        var totals = new GroupTotals();
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
        var onSelectedRowIdsChanged = new Event();
        var setSelectedRowIds = function (rowIds) {
            if (selectedRowIds.join(',') === rowIds.join(',')) {
                return;
            }
            selectedRowIds = rowIds;
            onSelectedRowIdsChanged.notify({
                grid: grid,
                ids: selectedRowIds
            }, new EventData(), _this);
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

var Editor = (function () {
    function Editor(args) {
        this.args = args;
        this.init();
    }
    return Editor;
}());

var KEYCODES;
(function (KEYCODES) {
    KEYCODES[KEYCODES["DOWN"] = 40] = "DOWN";
    KEYCODES[KEYCODES["ESCAPE"] = 27] = "ESCAPE";
    KEYCODES[KEYCODES["F2"] = 113] = "F2";
    KEYCODES[KEYCODES["LEFT"] = 37] = "LEFT";
    KEYCODES[KEYCODES["ENTER"] = 13] = "ENTER";
    KEYCODES[KEYCODES["PAGE_UP"] = 33] = "PAGE_UP";
    KEYCODES[KEYCODES["PAGE_DOWN"] = 34] = "PAGE_DOWN";
    KEYCODES[KEYCODES["RIGHT"] = 39] = "RIGHT";
    KEYCODES[KEYCODES["UP"] = 38] = "UP";
    KEYCODES[KEYCODES["SPACE"] = 32] = "SPACE";
    KEYCODES[KEYCODES["TAB"] = 9] = "TAB";
})(KEYCODES || (KEYCODES = {}));
// useful reference is https://css-tricks.com/snippets/javascript/javascript-keycodes/
var ALPHANUMERIC_KEYCODES = lodash.range(48, 91);
var KEYPAD_KEYCODES = lodash.range(96, 112);
var SYMBOL_KEYCODES = lodash.range(186, 223);
var TYPABLE_KEYCODES = [
    KEYCODES.SPACE
].concat(ALPHANUMERIC_KEYCODES, KEYPAD_KEYCODES, SYMBOL_KEYCODES);

var TextEditor = (function (_super) {
    __extends(TextEditor, _super);
    function TextEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TextEditor.prototype.init = function () {
        this.$input = $('<input type="text" class="editor-text" />')
            .appendTo(this.args.container)
            .on('keydown', function (e) {
            if (e.keyCode === KEYCODES.LEFT || e.keyCode === KEYCODES.RIGHT) {
                e.stopImmediatePropagation();
            }
        })
            .focus()
            .select();
    };
    TextEditor.prototype.destroy = function () {
        this.$input.remove();
    };
    TextEditor.prototype.focus = function () {
        this.$input.focus();
    };
    TextEditor.prototype.getValue = function () {
        return this.$input.val();
    };
    TextEditor.prototype.setValue = function (val) {
        this.$input.val(val);
    };
    TextEditor.prototype.loadValue = function (item) {
        this.defaultValue = item[this.args.column.field] || '';
        this.$input.val(this.defaultValue);
        this.$input[0].defaultValue = this.defaultValue;
        this.$input.select();
    };
    TextEditor.prototype.serializeValue = function () {
        return this.$input.val();
    };
    TextEditor.prototype.applyValue = function (item, state) {
        item[this.args.column.field] = state;
    };
    TextEditor.prototype.isValueChanged = function () {
        return (!(this.$input.val() === '' && this.defaultValue == null)) && (this.$input.val() !== this.defaultValue);
    };
    TextEditor.prototype.validate = function () {
        if (this.args.column.validator) {
            var validationResults = this.args.column.validator(this.$input.val());
            if (!validationResults.valid) {
                return validationResults;
            }
        }
        return {
            valid: true,
            msg: null
        };
    };
    return TextEditor;
}(Editor));

var defaultFormatter = function (row, cell, value, columnDef, dataContext) {
    if (value == null) {
        return '';
    }
    else {
        return (value + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
};

// shared across all grids on the page
var scrollbarDimensions;
var maxSupportedCssHeight; // browser's breaking point
var COLUMNS_TO_LEFT = -1;
var COLUMNS_TO_RIGHT = 1;
var SlickGrid = (function () {
    // Renaming Objects / Variables
    // yep, an array objectk instance with properties. yay @js!
    // $viewport          > contentViewport.el
    // $canvas            > contentCanvas.el
    // canvasWidth        > contentCanvas.width
    // canvasWidthL       > contentCanvas[0].width
    // canvasWidthR       > contentCanvas[1].width
    // headersWidth       > header.width
    // headersWidthL      > header[0].width
    // headersWidthR      > header[1].width
    // all.viewportWidth  > contentViewport.width
    // c.viewportHeight   > contentViewport.height
    // c.paneHeight       > DEPRECIATED. difference from contentViewport.height?
    //////////////////////////////////////////////////////////////////////////////////////////////
    // Initialization
    function SlickGrid(container, data, columns, options) {
        var _this = this;
        this.container = container;
        this.data = data;
        this.columns = columns;
        // Events
        this.onScroll = new Event();
        this.onSort = new Event();
        this.onHeaderMouseEnter = new Event();
        this.onHeaderMouseLeave = new Event();
        this.onHeaderContextMenu = new Event();
        this.onSubHeaderContextMenu = new Event();
        this.onHeaderClick = new Event();
        this.onHeaderCellRendered = new Event();
        this.onHeaderColumnDragStart = new Event();
        this.onHeaderColumnDrag = new Event();
        this.onHeaderColumnDragEnd = new Event();
        this.onHeadersCreated = new Event(); // Throws once after all headers and subheaders are created (or re-created)
        this.onBeforeHeaderCellDestroy = new Event();
        this.onSubHeaderCellRendered = new Event();
        this.onBeforeSubHeaderCellDestroy = new Event();
        this.onMouseEnter = new Event();
        this.onMouseLeave = new Event();
        this.onClick = new Event();
        this.onDblClick = new Event();
        this.onContextMenu = new Event();
        this.onBeforeKeyDown = new Event();
        this.onKeyDown = new Event();
        this.onAddNewRow = new Event();
        this.onValidationError = new Event();
        this.onViewportChanged = new Event();
        this.onRender = new Event();
        this.onInvalidate = new Event();
        this.onColumnsReordered = new Event();
        this.onColumnsResized = new Event();
        this.onColumnsChanged = new Event();
        this.onCellChange = new Event();
        this.onBeforeEditCell = new Event();
        this.onBeforeCellEditorDestroy = new Event();
        this.onBeforeDestroy = new Event();
        this.onActiveCellChanged = new Event();
        this.onActiveCellPositionChanged = new Event();
        this.onActiveRowChanged = new Event();
        this.onDragInit = new Event();
        this.onDragStart = new Event();
        this.onDrag = new Event();
        this.onDragEnd = new Event();
        this.onSelectedRowsChanged = new Event();
        this.onCellCssStylesChanged = new Event();
        // settings
        this.defaults = {
            rowHeight: 25,
            defaultColumnWidth: 80,
            absoluteColumnMinWidth: 20,
            enableAddRow: false,
            leaveSpaceForNewRows: false,
            editable: true,
            autoEdit: false,
            enableCellNavigation: true,
            enableColumnResize: true,
            asyncEditorLoading: false,
            asyncEditorLoadDelay: 100,
            forceFitColumns: false,
            enableAsyncPostRender: false,
            asyncPostRenderDelay: 50,
            autoHeight: false,
            editorLock: new EditorLock(),
            showSubHeaders: false,
            addRowIndexToClassName: true,
            formatterFactory: undefined,
            editorFactory: undefined,
            selectedCellCssClass: 'selected',
            multiSelect: true,
            enableTextSelectionOnCells: false,
            dataItemColumnValueExtractor: undefined,
            fullWidthRows: false,
            multiColumnSort: false,
            defaultFormatter: defaultFormatter,
            columnHeaderRenderer: this.columnHeaderRenderer,
            subHeaderRenderers: [],
            forceSyncScrolling: false,
            addNewRowCssClass: 'new-row',
            useAntiscroll: false,
            showScrollbarsOnHover: false,
            skipPaging: false,
            appendSubheadersToContainer: false,
            scrollbarSize: undefined,
            maxSupportedCssHeight: undefined,
            resizeOnlyDraggedColumn: true,
            syncColumnCellResize: true
        };
        this.columnDefaults = {
            name: '',
            resizable: true,
            sortable: false,
            minWidth: this.defaults.absoluteColumnMinWidth,
            rerenderOnResize: false,
            headerCssClass: undefined,
            defaultSortAsc: true,
            focusable: true,
            selectable: true
        };
        this.page = 0; // current page
        this.offset = 0; // current page offset
        this.vScrollDir = 1;
        // private
        this.initialized = false;
        this.objectName = 'slickGrid';
        this.uid = this.objectName + '_' + Math.round(1000000 * Math.random());
        this.options = this.defaults;
        // TODO: move all state to this object
        this.state = {
            invalidateSafeCellChangeCallback: null // Function|null
        };
        this.tabbingDirection = 1;
        this.activeCellNode = null;
        this.currentEditor = null;
        this.rowsCache = {};
        this.renderedRows = 0;
        this.prevScrollTop = 0;
        this.scrollTop = 0;
        this.lastRenderedScrollTop = 0;
        this.lastRenderedScrollLeft = 0;
        this.prevScrollLeft = 0;
        this.scrollLeft = 0;
        this.selectedRows = [];
        this.plugins = [];
        this.cellCssClasses = {};
        this.columnIdxById = {};
        this.sortColumns = [];
        this.columnPosLeft = [];
        this.columnPosRight = [];
        // async call handles
        this.h_editorLoader = null;
        this.h_render = null;
        this.h_postrender = null;
        this.postProcessedRows = {};
        this.postProcessToRow = null;
        this.postProcessFromRow = null;
        // perf counters
        this.counter_rows_rendered = 0;
        this.counter_rows_removed = 0;
        /*
          ## Visual Grid Components
      
          To support pinned columns, we slice up the grid regions, and try to be very clear and consistent about the naming.
          All UI region info objects start as an array with a left [0] and right [1] side
          Dom elements are stored at the top level together (still in a left/right pair) because jquery deals with multiple elements nicely. (eg: el.empty(), el.children())
          topViewport.width     // combined width
          topViewport[0].width  // left width
          topViewport.el        // both els
          topViewport.el[0]     // left el
      
              [0]    [1]
              .....................
              .      .            .
              .  TL  .     TR     .
              .      .            .
              .....................
              .      .            .
              .      .            .
              .      .            .
              .  CL  .     CR     .
              .      .            .
              .      .            .
              .      .            .
              .....................
      
          */
        /** The scrolling region */
        this.topViewport = {};
        /** The full size of content (both off and on screen) */
        this.topCanvas = {};
        /** The column headers */
        this.header = {};
        /** Optional rows of cells below the column headers */
        this.subHeaders = {};
        /**
         * Content viewports are wrapped with elements that have the same dimensions
         * as the viewports themselves. This is in service of the antiscroll plugin.
         */
        this.contentViewportWrap = {};
        /** The scrolling region for the grid rows */
        this.contentViewport = {};
        /** Full size of row content, both width and height */
        this.contentCanvas = { widths: [] };
        this.debouncedUpdateAntiscroll = lodash.debounce(function () { return _this.updateAntiscroll(); }, 500);
        this.handleSelectedRangesChanged = function (e, ranges) {
            _this.selectedRows = [];
            var hash = {};
            var maxRow = _this.data.getLength() - 1;
            var maxCell = _this.columns.length - 1;
            for (var i = 0, len = ranges.length; i < len; i++) {
                for (var j = Math.max(0, ranges[i].fromRow), jlen = Math.min(ranges[i].toRow, maxRow); j <= jlen; j++) {
                    if (!hash[j]) {
                        _this.selectedRows.push(j);
                        hash[j] = {};
                    }
                    for (var k = Math.max(0, ranges[i].fromCell), klen = Math.min(ranges[i].toCell, maxCell); k <= klen; k++) {
                        if (_this.canCellBeSelected(j, k)) {
                            hash[j][_this.columns[k].id] = _this.options.selectedCellCssClass;
                        }
                    }
                }
            }
            _this.setCellCssStyles(_this.options.selectedCellCssClass, hash);
            _this.trigger(_this.onSelectedRowsChanged, { rows: _this.getSelectedRows() }, e);
        };
        // calculate these only once and share between grid instances
        maxSupportedCssHeight = maxSupportedCssHeight || this.getMaxSupportedCssHeight();
        scrollbarDimensions = scrollbarDimensions || this.measureScrollbar();
        this.options = $.extend({}, this.defaults, options);
        if (this.options.useAntiscroll && !$.isFunction($.fn.antiscroll)) {
            throw new ReferenceError('The { useAntiscroll: true } option was passed to SlickGrid, but the antiscroll library is not loaded. You can download the library here: https://github.com/bcherny/antiscroll.');
        }
        this.validateAndEnforceOptions();
        this.columnDefaults.width = this.options.defaultColumnWidth;
        this.enforceWidthLimits(columns);
        this.editController = {
            commitCurrentEdit: this.commitCurrentEdit.bind(this),
            cancelCurrentEdit: this.cancelCurrentEdit.bind(this)
        };
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.$container = $(this.container);
        if (this.$container.length < 1) {
            throw new Error("SlickGrid requires a valid container, " + this.container + " does not exist in the DOM.");
        }
        this.$container.empty().addClass(this.objectName + ' ' + this.uid + ' ui-widget');
        // set up a positioning container if needed
        if (!/relative|absolute|fixed/.test(this.$container.css('position'))) {
            this.$container.css('position', 'relative');
        }
        this.$focusSink = $('<div tabIndex=\'0\' hideFocus class=\'focus-sink\'></div>').appendTo(this.$container);
        /* SlickGrid Dom structure:
          .slickGrid
          .viewport.T.L > .canvas.T.L
          .header
          .subHeaders > .subHeader-row * M
          .viewport.T.R > .canvas.T.R
          .header
          .subHeaders > .subHeader-row * M
          .viewport.C.L > .canvas.C.L
          .row * N
          .viewport.C.R > .canvas.C.R
          .row * N
          */
        // ----------------------- Create the elements
        this.topViewport.el = $('<div class=\'viewport T L\' tabIndex=\'0\' hideFocus />' +
            '<div class=\'viewport T R\' tabIndex=\'0\' hideFocus />');
        this.topCanvas.el = $('<div class=\'canvas T L\' />' +
            '<div class=\'canvas T R\' />');
        this.header.el = $('<div class=\'header\' />' +
            '<div class=\'header\' />');
        this.subHeaders.el = $('<div class=\'subHeaders\' />' +
            '<div class=\'subHeaders\' />');
        if (!this.options.showSubHeaders) {
            this.subHeaders.el.hide();
        }
        this.contentViewportWrap.el = $('<div class=\'viewport-wrap C L\' tabIndex=\'0\' hideFocus />' +
            '<div class=\'viewport-wrap C R\' tabIndex=\'0\' hideFocus />');
        this.contentViewport.el = $('<div class=\'viewport C L antiscroll-inner\' tabIndex=\'0\' hideFocus />' +
            '<div class=\'viewport C R antiscroll-inner\' tabIndex=\'0\' hideFocus />');
        this.contentCanvas.el = $('<div class=\'canvas C L\' tabIndex=\'0\' hideFocus />' +
            '<div class=\'canvas C R\' tabIndex=\'0\' hideFocus />');
        // ----------------------- Matryoshka the elements together
        this.topCanvas.el[0].appendChild(this.header.el[0]);
        this.topCanvas.el[1].appendChild(this.header.el[1]);
        this.topViewport.el[0].appendChild(this.topCanvas.el[0]);
        this.topViewport.el[1].appendChild(this.topCanvas.el[1]);
        this.contentViewport.el[0].appendChild(this.contentCanvas.el[0]);
        this.contentViewport.el[1].appendChild(this.contentCanvas.el[1]);
        this.contentViewportWrap.el[0].appendChild(this.contentViewport.el[0]);
        this.contentViewportWrap.el[1].appendChild(this.contentViewport.el[1]);
        this.injectSubheaders(this.options.appendSubheadersToContainer);
        this.$container.append(this.topViewport.el, this.contentViewportWrap.el);
        this.measureCssSizes(); // Wins award for most 's'es in a row.
        // Default the active canvas to the top left
        this.$activeCanvasNode = this.contentCanvas.el.eq(0);
        this.$focusSink2 = this.$focusSink.clone().appendTo(this.$container); // after the grid, in tab index order.
        // Start of original finishInitialization
        this.calculateViewportWidth();
        // for usability reasons, all text selection in SlickGrid is disabled
        // with the exception of input and textarea elements (selection must
        // be enabled there so that editors work as expected); note that
        // selection in grid cells (grid body) is already unavailable in
        // all browsers except IE
        this.disableSelection(this.header.el); // disable all text selection in header (including input and textarea)
        if (!this.options.enableTextSelectionOnCells) {
            // disable text selection in grid cells except in input and textarea elements
            // (this is IE-specific, because selectstart event will only fire in IE)
            this.contentViewport.el.bind('selectstart.ui', function (event) {
                return $(event.target).is('input,textarea');
            });
        }
        this.updateColumnCaches();
        this.createCssRules();
        this.updatePinnedState();
        this.setupColumnSort();
        this.bindAncestorScrollEvents();
        this.$container
            .bind('resize.slickgrid', this.resizeCanvas.bind(this));
        this.contentViewport.el
            .bind('scroll', this.scroll.bind(this));
        this.topViewport.el
            .bind('mousewheel', this.onHeaderMouseWheel.bind(this)); // modern browsers only, not in gecko
        this.header.el
            .bind('contextmenu', this.handleHeaderContextMenu.bind(this))
            .bind('click', this.handleHeaderClick.bind(this))
            .delegate('.slick-header-column', 'mouseenter', this.handleHeaderMouseEnter.bind(this))
            .delegate('.slick-header-column', 'mouseleave', this.handleHeaderMouseLeave.bind(this));
        this.subHeaders.el
            .bind('contextmenu', this.handleSubHeaderContextMenu.bind(this));
        this.$focusSink.add(this.$focusSink2)
            .bind('keydown', this.handleKeyDown.bind(this));
        this.contentCanvas.el
            .bind('keydown', this.handleKeyDown.bind(this))
            .bind('click', this.handleClick.bind(this))
            .bind('dblclick', this.handleDblClick.bind(this))
            .bind('contextmenu', this.handleContextMenu.bind(this))
            .bind('draginit', this.handleDragInit.bind(this))
            .bind('dragstart', { distance: 3 }, this.handleDragStart.bind(this))
            .bind('drag', this.handleDrag.bind(this))
            .bind('dragend', this.handleDragEnd.bind(this))
            .delegate('.cell', 'mouseenter', this.handleMouseEnter.bind(this))
            .delegate('.cell', 'mouseleave', this.handleMouseLeave.bind(this));
    }
    SlickGrid.prototype.registerPlugin = function (plugin) {
        this.plugins.unshift(plugin);
        plugin.init(this);
    };
    SlickGrid.prototype.unregisterPlugin = function (plugin) {
        for (var i = this.plugins.length; i >= 0; i--) {
            if (this.plugins[i] === plugin) {
                if (this.plugins[i].destroy) {
                    this.plugins[i].destroy();
                }
                this.plugins.splice(i, 1);
                break;
            }
        }
    };
    SlickGrid.prototype.setSelectionModel = function (model) {
        if (this.selectionModel) {
            this.selectionModel.onSelectedRangesChanged.unsubscribe(this.handleSelectedRangesChanged);
            if (this.selectionModel.destroy) {
                this.selectionModel.destroy();
            }
        }
        this.selectionModel = model;
        if (this.selectionModel) {
            this.selectionModel.init(this);
            this.selectionModel.onSelectedRangesChanged.subscribe(this.handleSelectedRangesChanged);
        }
    };
    SlickGrid.prototype.getSelectionModel = function () {
        return this.selectionModel;
    };
    SlickGrid.prototype.getCanvasNode = function () {
        return this.contentCanvas.el; // could be one or two elements, depending on whether columns are pinned. Always a jquery element.
    };
    SlickGrid.prototype.getTopCanvasNode = function () {
        return this.topCanvas.el;
    };
    SlickGrid.prototype.measureScrollbar = function () {
        if (this.options.scrollbarSize) {
            return this.options.scrollbarSize;
        }
        var $c = $('<div style=\'position:absolute; top:-10000px; left:-10000px; width:100px; height:100px; overflow:scroll;\'></div>').appendTo('body');
        var dim = {
            width: $c.width() - $c[0].clientWidth,
            height: $c.height() - $c[0].clientHeight
        };
        $c.remove();
        return dim;
    };
    SlickGrid.prototype.calculateCanvasWidth = function () {
        var availableWidth = this.viewportHasVScroll ? this.contentViewport.width - scrollbarDimensions.width : this.contentViewport.width;
        var i = this.columns.length;
        this.contentCanvas.width = this.contentCanvas.widths[0] = this.contentCanvas.widths[1] = 0;
        while (i--) {
            var column = this.columns[i];
            if (column.width == null) {
                console.warn('width shouldn\'t be null/undefined', column);
                continue;
            }
            if (this.isColumnInvisible(column))
                continue;
            if (this.options.pinnedColumn != null && i > this.options.pinnedColumn) {
                this.contentCanvas.widths[1] += column.width;
            }
            else {
                this.contentCanvas.widths[0] += column.width;
            }
        }
        this.contentCanvas.width = this.contentCanvas.widths[0] + this.contentCanvas.widths[1];
        if (this.options.fullWidthRows) {
            var extraRoom = Math.max(0, availableWidth - this.contentCanvas.width);
            this.contentCanvas.width += extraRoom;
            if (this.options.pinnedColumn != null) {
                this.contentCanvas.widths[1] += extraRoom;
            }
            else {
                this.contentCanvas.widths[0] += extraRoom;
            }
        }
    };
    SlickGrid.prototype.updateCanvasWidth = function (forceColumnWidthsUpdate) {
        var oldCanvasWidth = this.contentCanvas.width;
        var oldCanvasWidthL = this.contentCanvas.widths[0];
        var oldCanvasWidthR = this.contentCanvas.widths[1];
        var widthChanged;
        this.calculateCanvasWidth();
        var canvasWidth = this.contentCanvas.width;
        var canvasWidthL = this.contentCanvas.widths[0];
        var canvasWidthR = this.contentCanvas.widths[1];
        widthChanged = canvasWidth !== oldCanvasWidth ||
            canvasWidthL !== oldCanvasWidthL ||
            canvasWidthR !== oldCanvasWidthR;
        if (widthChanged || this.isPinned) {
            //        setHeadersWidth();
            this.topCanvas.el[0].style.width =
                this.contentCanvas.el[0].style.width =
                    canvasWidthL + 'px';
            if (this.isPinned) {
                this.topCanvas.el[1].style.width =
                    this.contentCanvas.el[1].style.width =
                        canvasWidthR + 'px';
                // Set widths on the left side, and width+left offset on the right side
                this.topViewport.el[0].style.width =
                    this.topViewport.el[1].style.left =
                        this.contentViewportWrap.el[0].style.width =
                            this.contentViewportWrap.el[1].style.left =
                                canvasWidthL + 'px';
                this.topViewport.el[1].style.width =
                    this.contentViewportWrap.el[1].style.width =
                        (this.contentViewport.width - canvasWidthL) + 'px';
            }
            else {
                this.topViewport.el[0].style.width =
                    this.contentViewportWrap.el[0].style.width =
                        null;
            }
            if (this.options.appendSubheadersToContainer) {
                this.subHeaders.el.find('.subHeader-row').css('width', canvasWidthL);
            }
            this.viewportHasHScroll = (canvasWidth > this.contentViewport.width - scrollbarDimensions.width);
        }
        if (true || widthChanged || forceColumnWidthsUpdate) {
            this.applyColumnWidths();
        }
    };
    SlickGrid.prototype.disableSelection = function ($target) {
        if ($target && $target.jquery) {
            $target
                .attr('unselectable', 'on')
                .css('MozUserSelect', 'none')
                .bind('selectstart.ui', function () {
                return false;
            }); // from jquery:ui.core.js 1.7.2
        }
    };
    SlickGrid.prototype.getMaxSupportedCssHeight = function () {
        if (this.options.maxSupportedCssHeight) {
            return this.options.maxSupportedCssHeight;
        }
        var supportedHeight = 1000000;
        // FF reports the height back but still renders blank after ~6M px
        var testUpTo = navigator.userAgent.toLowerCase().match(/firefox/) ? 6000000 : 1000000000;
        var div = $('<div style=\'display:none\' />').appendTo(document.body);
        while (true) {
            var test = supportedHeight * 2;
            div.css('height', test);
            if (test > testUpTo || div.height() !== test) {
                break;
            }
            else {
                supportedHeight = test;
            }
        }
        div.remove();
        return supportedHeight;
    };
    // TODO:  this is static.  need to handle page mutation.
    SlickGrid.prototype.bindAncestorScrollEvents = function () {
        var elem = this.contentCanvas.el[0];
        while ((elem = elem.parentNode) !== document.body && elem != null) {
            // bind to scroll containers only
            if (elem === this.contentViewport.el[0] || elem.scrollWidth !== elem.clientWidth || elem.scrollHeight !== elem.clientHeight) {
                var $elem = $(elem);
                if (!this.$boundAncestors) {
                    this.$boundAncestors = $elem;
                }
                else {
                    this.$boundAncestors = this.$boundAncestors.add($elem);
                }
                $elem.bind('scroll.' + this.uid, this.handleActiveCellPositionChange.bind(this));
            }
        }
    };
    SlickGrid.prototype.updateColumnHeaders = function () {
        for (var i = 0; i < this.columns.length; i++) {
            this.updateColumnHeader(this.columns[i].id);
        }
    };
    SlickGrid.prototype.unbindAncestorScrollEvents = function () {
        if (!this.$boundAncestors) {
            return;
        }
        this.$boundAncestors.unbind('scroll.' + this.uid);
        this.$boundAncestors = null;
    };
    SlickGrid.prototype.updateColumnHeader = function (columnId, title, toolTip) {
        if (!this.initialized) {
            return;
        }
        var idx = this.getColumnIndex(columnId);
        if (idx == null) {
            return;
        }
        var columnDef = this.columns[idx];
        var $header = this.header.el.children().eq(idx); // var $header = topCanvas.el.children().eq(idx);
        if ($header) {
            if (title !== undefined) {
                this.columns[idx].name = title;
            }
            if (toolTip !== undefined) {
                this.columns[idx].toolTip = toolTip;
            }
            this.trigger(this.onBeforeHeaderCellDestroy, {
                node: $header[0],
                column: columnDef
            });
            var header = $header
                .attr('title', toolTip || '')
                .removeClass($header.data('headerCssClass'))
                .addClass(columnDef.headerCssClass || '')
                .data('headerCssClass', columnDef.headerCssClass)
                .children().eq(0);
            if (title !== undefined) {
                header.html(title);
            }
            this.trigger(this.onHeaderCellRendered, {
                node: $header[0],
                column: columnDef
            });
        }
    };
    // TODO: support subHeaders.el[1]
    SlickGrid.prototype.injectSubheaders = function (appendSubheadersToContainer) {
        if (appendSubheadersToContainer) {
            this.$container.append(this.subHeaders.el[0]);
        }
        else {
            this.topCanvas.el[0].appendChild(this.subHeaders.el[0]);
            this.topCanvas.el[1].appendChild(this.subHeaders.el[1]);
        }
    };
    // Updates the contents of a single subHeader cell
    // Does not destroy, remove event listeners, update any attached .data(), etc.
    SlickGrid.prototype.updateSubHeaders = function (columnId, rowIndex) {
        if (!this.initialized) {
            return;
        }
        var columnIndex = this.getColumnIndex(columnId);
        if (columnIndex == null) {
            throw new ReferenceError('Slick.Grid#updateSubHeader cannot update subheader because column ' + columnId + ' is not defined on the given grid');
        }
        if (rowIndex == null) {
            rowIndex = 0;
        }
        // Get needed data for this column
        var columnDef = this.columns[columnIndex];
        var newEl = this.options.subHeaderRenderers[rowIndex](columnDef);
        var hiddenClass = this.getHiddenCssClass(columnIndex);
        // Replace only the contents, but copy over any className that the subHeaderRenderer might have added
        this.subHeaders.el
            .map(function (n, a) { return $(a).find('.subHeader-row'); })
            .map(function (n, a) { return a[rowIndex]; })
            .children()
            .eq(columnIndex)
            .html(newEl.html())
            .addClass(newEl[0].className)
            .addClass(hiddenClass || '');
    };
    SlickGrid.prototype.getHeaderRow = function () { return this.subHeaders.el; };
    // Use a columnId to return the related header dom element
    SlickGrid.prototype.getHeaderRowColumn = function (columnId) {
        var idx = this.getColumnIndex(columnId);
        return this.subHeaders.el.children().eq(idx);
    };
    SlickGrid.prototype.createColumnHeaders = function () {
        var _this = this;
        var onMouseEnter = function () { return $(_this).addClass('ui-state-hover'); };
        var onMouseLeave = function () { return $(_this).removeClass('ui-state-hover'); };
        // Broadcast destroy events and empty out any current headers
        this.header.el.children()
            .each(function () {
            var columnDef = $(_this).data('column');
            if (columnDef) {
                _this.trigger(_this.onBeforeHeaderCellDestroy, { node: _this, column: columnDef });
            }
        });
        // Broadcast destroy events and empty out any current subHeaders
        this.subHeaders.el.children()
            .each(function () {
            var columnDef = $(_this).data('column');
            if (columnDef) {
                _this.trigger(_this.onBeforeSubHeaderCellDestroy, { node: _this, column: columnDef });
            }
        });
        this.header.el.empty();
        this.subHeaders.el.empty();
        // generate subheader rows
        for (var i = 0; i < this.options.subHeaderRenderers.length; i++) {
            var l = this.subHeaders.el.eq(0).append($('<div class="subHeader-row">'));
            l.data('subHeader-row-' + i);
            var r = this.subHeaders.el.eq(1).append($('<div class="subHeader-row">'));
            r.data('subHeader-row-' + i);
        }
        // Build new headers based on column data.
        var $headerHolder;
        var $subHeaderHolder;
        var m;
        var oneHeader;
        var _loop_1 = function (i_1) {
            // Select the correct region to draw into based on the column index.
            $headerHolder = this_1.options.pinnedColumn != null && i_1 > this_1.options.pinnedColumn ? this_1.header.el.eq(1) : this_1.header.el.eq(0);
            $subHeaderHolder = this_1.options.pinnedColumn != null && i_1 > this_1.options.pinnedColumn ? this_1.subHeaders.el.eq(1) : this_1.subHeaders.el.eq(0);
            m = this_1.columns[i_1];
            oneHeader = this_1.options.columnHeaderRenderer(m);
            hiddenClass = this_1.getHiddenCssClass(i_1);
            oneHeader
                .addClass('cell l' + i_1 + ' r' + i_1)
                .attr('id', '' + this_1.uid + '_' + m.id)
                .attr('title', m.toolTip || '')
                .data('column', m)
                .addClass(m.headerCssClass || '')
                .data('headerCssClass', m.headerCssClass)
                .addClass(hiddenClass)
                .bind('dragstart', { distance: 3 }, function (e, dd) {
                _this.trigger(_this.onHeaderColumnDragStart, { origEvent: e, dragData: dd, node: _this, columnIndex: _this.getColumnIndexFromEvent(e) });
            })
                .bind('drag', function (e, dd) {
                _this.trigger(_this.onHeaderColumnDrag, { origEvent: e, dragData: dd, node: _this, columnIndex: _this.getColumnIndexFromEvent(e) });
            })
                .bind('dragend', function (e, dd) {
                _this.trigger(_this.onHeaderColumnDragEnd, { origEvent: e, dragData: dd, node: _this, columnIndex: _this.getColumnIndexFromEvent(e) });
            })
                .appendTo($headerHolder);
            if (m.sortable) {
                oneHeader
                    .on('mouseenter', onMouseEnter)
                    .on('mouseleave', onMouseLeave);
            }
            if (m.sortable) {
                oneHeader.addClass('slick-header-sortable');
                oneHeader.append('<span class=\'slick-sort-indicator\' />');
            }
            this_1.trigger(this_1.onHeaderCellRendered, { node: oneHeader[0], column: m });
            this_1.options.subHeaderRenderers.forEach(function (renderer, n) {
                var oneSubHeader = renderer(m);
                oneSubHeader
                    .data('column', m)
                    .addClass('cell l' + i_1 + ' r' + i_1)
                    .addClass(hiddenClass || '')
                    .appendTo($subHeaderHolder.find('.subHeader-row').eq(n));
                _this.trigger(_this.onSubHeaderCellRendered, {
                    node: oneSubHeader[0],
                    column: m,
                    subHeader: n
                });
            });
        };
        var this_1 = this, hiddenClass;
        for (var i_1 = 0; i_1 < this.columns.length; i_1++) {
            _loop_1(i_1);
        }
        this.setSortColumns(this.sortColumns);
        if (this.options.enableColumnResize) {
            this.setupColumnResize();
        }
        this.trigger(this.onHeadersCreated);
    };
    // Given a column object, return a jquery element with HTML for the column
    // Can be overridden by providing a function to options.columnHeaderRenderer
    SlickGrid.prototype.columnHeaderRenderer = function (column) {
        // 50% faster using native API, versus the old jQuery way
        // jQuery's .html() is particularly slow
        //
        // Saves roughly 0.5ms * N in synchronous processing time, where N is the number of columns
        var d = document.createElement('div');
        d.className = 'cell';
        d.innerHTML = '<span class=\'name\'>' + column.name + '</span>';
        if (column.toolTip) {
            d.title = column.toolTip;
        }
        return $(d);
    };
    SlickGrid.prototype.setupColumnSort = function () {
        var _this = this;
        this.topCanvas.el.click(function (e) {
            // temporary workaround for a bug in jQuery 1.7.1 (http://bugs.jquery.com/ticket/11328)
            e.metaKey = e.metaKey || e.ctrlKey;
            if ($(e.target).hasClass('resizer')) {
                return;
            }
            var $col = $(e.target).closest('.cell');
            if (!$col.length) {
                return;
            }
            var column = $col.data('column');
            if (column.sortable) {
                if (!_this.getEditorLock().commitCurrentEdit()) {
                    return;
                }
                var sortOpts = null;
                var i = 0;
                for (; i < _this.sortColumns.length; i++) {
                    if (_this.sortColumns[i].columnId === column.id) {
                        sortOpts = _this.sortColumns[i];
                        sortOpts.sortAsc = !sortOpts.sortAsc;
                        break;
                    }
                }
                if (e.metaKey && _this.options.multiColumnSort) {
                    if (sortOpts) {
                        _this.sortColumns.splice(i, 1);
                    }
                }
                else {
                    if ((!e.shiftKey && !e.metaKey) || !_this.options.multiColumnSort) {
                        _this.sortColumns = [];
                    }
                    if (!sortOpts) {
                        sortOpts = { columnId: column.id, sortAsc: column.defaultSortAsc };
                        _this.sortColumns.push(sortOpts);
                    }
                    else if (_this.sortColumns.length === 0) {
                        _this.sortColumns.push(sortOpts);
                    }
                }
                _this.setSortColumns(_this.sortColumns);
                if (!_this.options.multiColumnSort) {
                    _this.trigger(_this.onSort, {
                        multiColumnSort: false,
                        sortCol: column,
                        sortAsc: sortOpts.sortAsc
                    }, e);
                }
                else {
                    _this.trigger(_this.onSort, {
                        multiColumnSort: true,
                        sortCols: $.map(_this.sortColumns, function (col) {
                            return { sortCol: _this.columns[_this.getColumnIndex(col.columnId)], sortAsc: col.sortAsc };
                        })
                    }, e);
                }
            }
        });
    };
    SlickGrid.prototype.setupColumnResize = function () {
        var _this = this;
        var j;
        var c;
        var pageX;
        var columnElements;
        var minPageX;
        var maxPageX;
        var firstResizable;
        var lastResizable;
        if (!this.columns.length) {
            return;
        }
        columnElements = this.getHeaderEls();
        columnElements.find('.resizer').remove();
        // Get the first and last resizable column
        columnElements.each(function (i, e) {
            if (_this.columns[i].resizable) {
                if (firstResizable === undefined) {
                    firstResizable = i;
                }
                lastResizable = i;
            }
        });
        if (firstResizable === undefined) {
            return;
        }
        // Configure resizing on each column
        columnElements.each(function (i, e) {
            if (i < firstResizable || (_this.options.forceFitColumns && i >= lastResizable)) {
                return;
            }
            $('<div class=\'resizer\' />')
                .appendTo(e)
                .bind('dragstart', function (e) {
                if (!_this.getEditorLock().commitCurrentEdit()) {
                    return false;
                }
                pageX = e.pageX;
                $(e.target).parent().addClass('active');
                // Get the dragged column object and set a flag on it
                var idx = _this.getCellFromNode($(e.target).parent());
                if (idx > -1) {
                    _this.columns[idx].manuallySized = true;
                }
                var shrinkLeewayOnRight = null;
                var stretchLeewayOnRight = null;
                // lock each column's width option to current width
                columnElements.each(function (i, e) {
                    return _this.columns[i].previousWidth = $(e).outerWidth();
                });
                if (_this.options.forceFitColumns) {
                    shrinkLeewayOnRight = 0;
                    stretchLeewayOnRight = 0;
                    // colums on right affect maxPageX/minPageX
                    for (j = i + 1; j < columnElements.length; j++) {
                        c = _this.columns[j];
                        if (c.resizable) {
                            if (stretchLeewayOnRight !== null) {
                                if (c.maxWidth) {
                                    stretchLeewayOnRight += c.maxWidth - c.previousWidth;
                                }
                                else {
                                    stretchLeewayOnRight = null;
                                }
                            }
                            shrinkLeewayOnRight += c.previousWidth - Math.max(c.minWidth || 0, _this.options.absoluteColumnMinWidth);
                        }
                    }
                }
                var shrinkLeewayOnLeft = 0;
                var stretchLeewayOnLeft = 0;
                for (j = 0; j <= i; j++) {
                    // columns on left only affect minPageX
                    c = _this.columns[j];
                    if (c.resizable) {
                        if (stretchLeewayOnLeft !== null) {
                            if (c.maxWidth) {
                                stretchLeewayOnLeft += c.maxWidth - c.previousWidth;
                            }
                            else {
                                stretchLeewayOnLeft = null;
                            }
                        }
                        shrinkLeewayOnLeft += c.previousWidth - Math.max(c.minWidth || 0, _this.options.absoluteColumnMinWidth);
                    }
                }
                if (shrinkLeewayOnRight === null) {
                    shrinkLeewayOnRight = 100000;
                }
                if (shrinkLeewayOnLeft === null) {
                    shrinkLeewayOnLeft = 100000;
                }
                if (stretchLeewayOnRight === null) {
                    stretchLeewayOnRight = 100000;
                }
                if (stretchLeewayOnLeft === null) {
                    stretchLeewayOnLeft = 100000;
                }
                maxPageX = pageX + Math.min(shrinkLeewayOnRight, stretchLeewayOnLeft);
                minPageX = pageX - Math.min(shrinkLeewayOnLeft, stretchLeewayOnRight);
            })
                .bind('drag', function (e) {
                var actualMinWidth;
                var d = Math.min(maxPageX, Math.max(minPageX, e.pageX)) - pageX;
                var x;
                if (d < 0) {
                    x = d;
                    if (_this.options.resizeOnlyDraggedColumn) {
                        _this.columns[i].width = Math.max(_this.columns[i].previousWidth + x, (_this.columns[i].minWidth || 0)); // apply shrinkage to this column only.
                    }
                    else {
                        for (j = i; j >= 0; j--) {
                            c = _this.columns[j];
                            if (c.resizable) {
                                actualMinWidth = Math.max(c.minWidth || 0, _this.options.absoluteColumnMinWidth);
                                if (x && c.previousWidth + x < actualMinWidth) {
                                    x += c.previousWidth - actualMinWidth;
                                    c.width = actualMinWidth;
                                }
                                else {
                                    c.width = c.previousWidth + x;
                                    x = 0;
                                }
                            }
                        }
                    }
                    if (_this.options.forceFitColumns) {
                        x = -d;
                        for (j = i + 1; j < columnElements.length; j++) {
                            c = _this.columns[j];
                            if (c.resizable) {
                                if (x && c.maxWidth && (c.maxWidth - c.previousWidth < x)) {
                                    x -= c.maxWidth - c.previousWidth;
                                    c.width = c.maxWidth;
                                }
                                else {
                                    c.width = c.previousWidth + x;
                                    x = 0;
                                }
                            }
                        }
                    }
                }
                else {
                    x = d;
                    if (_this.options.resizeOnlyDraggedColumn) {
                        _this.columns[i].width = Math.min(_this.columns[i].previousWidth + x, _this.columns[i].maxWidth || maxPageX);
                    }
                    else {
                        for (j = i; j >= 0; j--) {
                            c = _this.columns[j];
                            if (c.resizable) {
                                if (x && c.maxWidth && (c.maxWidth - c.previousWidth < x)) {
                                    x -= c.maxWidth - c.previousWidth;
                                    c.width = c.maxWidth;
                                }
                                else {
                                    c.width = c.previousWidth + x;
                                    x = 0;
                                }
                            }
                        }
                    }
                    if (_this.options.forceFitColumns) {
                        x = -d;
                        for (j = i + 1; j < columnElements.length; j++) {
                            c = _this.columns[j];
                            if (c.resizable) {
                                actualMinWidth = Math.max(c.minWidth || 0, _this.options.absoluteColumnMinWidth);
                                if (x && c.previousWidth + x < actualMinWidth) {
                                    x += c.previousWidth - actualMinWidth;
                                    c.width = actualMinWidth;
                                }
                                else {
                                    c.width = c.previousWidth + x;
                                    x = 0;
                                }
                            }
                        }
                    }
                }
                _this.applyColumnHeaderWidths();
                if (_this.options.syncColumnCellResize) {
                    _this.updateCanvasWidth(true); // If you're resizing one of the columns in the pinned section, we should update the size of that area as you drag
                    _this.applyColumnWidths();
                }
            })
                .bind('dragend', function (e) {
                var newWidth;
                $(e.target).parent().removeClass('active');
                for (j = 0; j < columnElements.length; j++) {
                    c = _this.columns[j];
                    newWidth = $(columnElements[j]).outerWidth();
                    if (c.previousWidth !== newWidth && c.rerenderOnResize) {
                        _this.invalidateAllRows();
                    }
                }
                _this.updateCanvasWidth(true);
                _this.render();
                _this.trigger(_this.onColumnsResized, {});
            });
        });
    };
    // Given an element, return the sum of vertical paddings and borders on that element.
    SlickGrid.prototype.getVBoxDelta = function ($el) {
        var p = ['borderTopWidth', 'borderBottomWidth', 'paddingTop', 'paddingBottom'];
        var delta = 0;
        $.each(p, function (n, val) {
            delta += parseFloat($el.css(val)) || 0;
        });
        return delta;
    };
    // Hide extra panes if they're not needed (eg: the grid is not using pinned columns)
    SlickGrid.prototype.updatePinnedState = function () {
        if (!this.isPinned) {
            this.topViewport.el.eq(1).hide();
            this.contentViewportWrap.el.eq(1).hide();
        }
        else {
            this.topViewport.el.eq(1).show();
            this.contentViewportWrap.el.eq(1).show();
        }
        this.setScroller();
        this.setOverflow();
        this.createColumnHeaders();
        this.updateCanvasWidth();
        this.invalidateAllRows();
        this.resizeCanvas();
    };
    // enable antiscroll for an element
    SlickGrid.prototype.disableAntiscroll = function ($element) {
        $element.removeClass('antiscroll-wrap');
        if ($element.data('antiscroll')) {
            $element.data('antiscroll').destroy();
        }
    };
    SlickGrid.prototype.enableAntiscroll = function ($element) {
        $element
            .addClass('antiscroll-wrap')
            .antiscroll({
            autoShow: this.options.showScrollbarsOnHover
        });
    };
    SlickGrid.prototype.updateAntiscroll = function () {
        if (!this.options.useAntiscroll) {
            return;
        }
        var cl = this.contentViewportWrap.el.filter('.C.L');
        var cr = this.contentViewportWrap.el.filter('.C.R');
        if (this.isPinned) {
            this.enableAntiscroll(cr);
            this.disableAntiscroll(cl);
        }
        else {
            this.enableAntiscroll(cl);
            this.disableAntiscroll(cr);
        }
    };
    // If columns are pinned, scrollers are in the right-side panes, otherwise they're in the left ones
    SlickGrid.prototype.setScroller = function () {
        if (this.options.pinnedColumn == null) {
            this.topViewport.scroller = this.topViewport.el[0];
            this.contentViewport.scroller = this.contentViewport.el[0];
        }
        else {
            this.topViewport.scroller = this.topViewport.el[1];
            this.contentViewport.scroller = this.contentViewport.el[1];
        }
    };
    SlickGrid.prototype.setOverflow = function () {
        if (this.isPinned) {
            this.contentViewport.el.eq(0).addClass('pinned');
        }
        else {
            this.contentViewport.el.eq(0).removeClass('pinned');
        }
    };
    // Measures the computed sizes of important elements
    // With this method, folks can set whatever CSS size they'd like, and the grid's js can figure it out from there
    SlickGrid.prototype.measureCssSizes = function () {
        if (!this.options.rowHeight) {
            var el = void 0;
            var markup = '<div class=\'cell\' style=\'visibility:hidden\'>-</div>';
            el = $('<div class="row">' + markup + '</div>').appendTo(this.contentCanvas.el[0]);
            this.options.rowHeight = el.outerHeight();
            el.remove();
        }
    };
    SlickGrid.prototype.createCssRules = function () {
        this.$style = $('<style type=\'text/css\' rel=\'stylesheet\' />').appendTo($('head'));
        var rules = [];
        for (var i = 0; i < this.columns.length; i++) {
            rules.push('.' + this.uid + ' .l' + i + ' { }');
            rules.push('.' + this.uid + ' .r' + i + ' { }');
        }
        if (this.$style[0].styleSheet) {
            this.$style[0].styleSheet.cssText = rules.join(' ');
        }
        else {
            this.$style[0].appendChild(document.createTextNode(rules.join(' ')));
        }
    };
    SlickGrid.prototype.getColumnCssRules = function (idx) {
        if (!this.stylesheet) {
            var sheets = document.styleSheets;
            for (var i = 0; i < sheets.length; i++) {
                if ((sheets[i].ownerNode) === this.$style[0]) {
                    this.stylesheet = sheets[i];
                    break;
                }
            }
            if (!this.stylesheet) {
                throw new Error('Cannot find stylesheet.');
            }
            // find and cache column CSS rules
            this.columnCssRulesL = [];
            this.columnCssRulesR = [];
            var cssRules = (this.stylesheet.cssRules || this.stylesheet.rules);
            var matches = void 0;
            var columnIdx = void 0;
            for (var i_2 = 0; i_2 < cssRules.length; i_2++) {
                var selector = cssRules[i_2].selectorText;
                if (matches = /\.l\d+/.exec(selector)) {
                    columnIdx = parseInt(matches[0].substr(2, matches[0].length - 2), 10);
                    this.columnCssRulesL[columnIdx] = cssRules[i_2];
                }
                else if (matches = /\.r\d+/.exec(selector)) {
                    columnIdx = parseInt(matches[0].substr(2, matches[0].length - 2), 10);
                    this.columnCssRulesR[columnIdx] = cssRules[i_2];
                }
            }
        }
        return {
            left: this.columnCssRulesL[idx],
            right: this.columnCssRulesR[idx]
        };
    };
    SlickGrid.prototype.removeCssRules = function () {
        this.$style.remove();
        this.stylesheet = null;
    };
    SlickGrid.prototype.destroy = function () {
        this.getEditorLock().cancelCurrentEdit();
        this.trigger(this.onBeforeDestroy, {});
        var i = this.plugins.length;
        while (i--) {
            this.unregisterPlugin(this.plugins[i]);
        }
        this.unbindAncestorScrollEvents();
        this.$container.unbind('.slickgrid');
        this.removeCssRules();
        this.contentCanvas.el.unbind('draginit dragstart dragend drag');
        this.$container.empty()
            .removeClass(this.uid)
            .removeClass(this.objectName);
    };
    //////////////////////////////////////////////////////////////////////////////////////////////
    // General
    // A simple way to expose the uid to consumers, who might care which slickgrid instance they're dealing with.
    SlickGrid.prototype.getId = function () {
        return this.uid;
    };
    SlickGrid.prototype.trigger = function (evt, args, e) {
        e = e || new EventData();
        args = $.extend({}, args, { grid: this });
        return evt.notify(args, e, this);
    };
    SlickGrid.prototype.getEditorLock = function () {
        return this.options.editorLock;
    };
    SlickGrid.prototype.getEditController = function () {
        return this.editController;
    };
    SlickGrid.prototype.getColumnIndex = function (id) {
        return this.columnIdxById[id];
    };
    // returns a jQuery node that matches the given id
    // if the provided id is undefined, returns an empty jQuery object
    SlickGrid.prototype.getColumnNodeById = function (id) {
        var idx = this.getColumnIndex(id);
        if (idx > -1)
            return this.getHeaderEls(idx);
        else
            return $([]);
    };
    // Return the header element(s) that wrap all column headers
    // There is one or two, depending on whether columns are pinned
    SlickGrid.prototype.getHeaderEl = function () {
        return this.header.el;
    };
    // Get all column header cell elements.
    // There should be as many elements as there are columns
    // It doesn't differentiate between pinned and unpinned columns
    // If you provide an index, it returns only that column
    SlickGrid.prototype.getHeaderEls = function (idx) {
        if (idx == null) {
            return this.header.el.children();
        }
        else {
            return this.header.el.children().eq(idx);
        }
    };
    // Given an x and a y coord, return the index of the column
    SlickGrid.prototype.getColumnIndexFromEvent = function (evt) {
        var nearestEl = document.elementFromPoint(evt.clientX, evt.clientY);
        var headerEl = $(nearestEl).closest('.cell');
        if (!headerEl.length) {
            return null;
        }
        return this.getCellFromNode(headerEl[0]);
    };
    SlickGrid.prototype.getColumnFromEvent = function (evt) {
        var index = this.getColumnIndexFromEvent(evt);
        return index === null ? null : this.columns[index];
    };
    SlickGrid.prototype.autosizeColumns = function () {
        var i;
        var widths = [];
        var shrinkLeeway = 0;
        var total = 0;
        var prevTotal;
        var availWidth = this.viewportHasVScroll ? this.contentViewport.width - scrollbarDimensions.width : this.contentViewport.width;
        for (i = 0; i < this.columns.length; i++) {
            var c = this.columns[i];
            widths.push(c.width);
            total += c.width;
            if (c.resizable) {
                shrinkLeeway += c.width - Math.max(c.minWidth || 0, this.options.absoluteColumnMinWidth);
            }
        }
        // shrink
        prevTotal = total;
        while (total > availWidth && shrinkLeeway) {
            var shrinkProportion = (total - availWidth) / shrinkLeeway;
            for (var i_3 = 0; i_3 < this.columns.length && total > availWidth; i_3++) {
                var c = this.columns[i_3];
                var width = widths[i_3];
                if (!c.resizable || width <= c.minWidth || width <= this.options.absoluteColumnMinWidth) {
                    continue;
                }
                var absMinWidth = Math.max(c.minWidth || 0, this.options.absoluteColumnMinWidth);
                var shrinkSize = Math.floor(shrinkProportion * (width - absMinWidth)) || 1;
                shrinkSize = Math.min(shrinkSize, width - absMinWidth);
                total -= shrinkSize;
                shrinkLeeway -= shrinkSize;
                widths[i_3] -= shrinkSize;
            }
            if (prevTotal <= total) {
                break;
            }
            prevTotal = total;
        }
        // grow
        prevTotal = total;
        while (total < availWidth) {
            var growProportion = availWidth / total;
            for (i = 0; i < this.columns.length && total < availWidth; i++) {
                var c = this.columns[i];
                var currentWidth = widths[i];
                var growSize;
                if (!c.resizable || c.maxWidth <= currentWidth) {
                    growSize = 0;
                }
                else {
                    growSize = Math.min(Math.floor(growProportion * currentWidth) - currentWidth, (c.maxWidth - currentWidth) || 1000000) || 1;
                }
                total += growSize;
                widths[i] += growSize;
            }
            if (prevTotal >= total) {
                break;
            }
            prevTotal = total;
        }
        var reRender = false;
        for (i = 0; i < this.columns.length; i++) {
            if (this.columns[i].rerenderOnResize && this.columns[i].width !== widths[i]) {
                reRender = true;
            }
            this.columns[i].width = widths[i];
        }
        this.applyColumnHeaderWidths();
        this.updateCanvasWidth(true);
        if (reRender) {
            this.invalidateAllRows();
            this.render();
        }
    };
    SlickGrid.prototype.applyColumnHeaderWidths = function () {
        if (!this.initialized) {
            return;
        }
        var h;
        for (var i = 0, headers = this.header.el.children(), ii = headers.length; i < ii; i++) {
            h = $(headers[i]);
            var paddingLeft = parseInt(h.css('paddingLeft'), 10);
            var paddingRight = parseInt(h.css('paddingRight'), 10);
            var newWidth = this.columns[i].width - paddingLeft - paddingRight;
            if (h.width() !== newWidth) {
                h.width(newWidth);
            }
        }
        this.updateColumnCaches();
    };
    SlickGrid.prototype.applyColumnWidths = function () {
        var x = 0;
        for (var i = 0; i < this.columns.length; i++) {
            var column = this.columns[i];
            var width = this.getColumnVisibleWidth(column);
            var rule = this.getColumnCssRules(i);
            if (!rule.left)
                return;
            rule.left.style.left = x + 'px';
            var canvasWidth = this.options.pinnedColumn != null && i > this.options.pinnedColumn ? this.contentCanvas.widths[1] : this.contentCanvas.widths[0];
            rule.right.style.right = (canvasWidth - x - width) + 'px';
            // If this column is frozen, reset the css left value since the column starts in a new viewport.
            if (this.options.pinnedColumn === i) {
                x = 0;
            }
            else {
                x += width;
            }
        }
        this.debouncedUpdateAntiscroll();
    };
    SlickGrid.prototype.setSortColumn = function (columnId, sortAsc) {
        this.setSortColumns([{ columnId: columnId, sortAsc: sortAsc }]);
    };
    SlickGrid.prototype.setSortColumns = function (cols) {
        var _this = this;
        this.sortColumns = cols;
        var headerColumnEls = this.getHeaderEls();
        headerColumnEls
            .removeClass('slick-header-column-sorted')
            .find('.slick-sort-indicator')
            .removeClass('slick-sort-indicator-asc slick-sort-indicator-desc');
        $.each(this.sortColumns, function (i, col) {
            if (col.sortAsc == null) {
                col.sortAsc = true;
            }
            var columnIndex = _this.getColumnIndex(col.columnId);
            if (columnIndex != null) {
                headerColumnEls.eq(columnIndex)
                    .addClass('slick-header-column-sorted')
                    .find('.slick-sort-indicator')
                    .addClass(col.sortAsc ? 'slick-sort-indicator-asc' : 'slick-sort-indicator-desc');
            }
        });
    };
    SlickGrid.prototype.getSortColumns = function () {
        return this.sortColumns;
    };
    SlickGrid.prototype.getColumns = function () {
        return this.columns;
    };
    SlickGrid.prototype.getColumnByKey = function (key) {
        var columns = this.getColumns();
        for (var i = 0; i < columns.length; i++) {
            if (columns[i].key === key) {
                return columns[i];
            }
        }
        return undefined;
    };
    SlickGrid.prototype.isAdjacent = function (array) {
        if (!array || array.length === 0)
            return false;
        if (array.length === 1)
            return true;
        array.sort(function (a, b) { return a - b; });
        for (var i = 1; i < array.length; i++) {
            if (array[i] !== (array[i - 1] + 1))
                return false;
        }
        return true;
    };
    SlickGrid.prototype.updateColumnCaches = function () {
        // Pre-calculate cell boundaries.
        this.columnPosLeft = [];
        this.columnPosRight = [];
        var x = 0;
        for (var i = 0, ii = this.columns.length; i < ii; i++) {
            var column = this.columns[i];
            var columnWidth = this.getColumnVisibleWidth(column);
            this.columnPosLeft[i] = x;
            x += columnWidth;
            this.columnPosRight[i] = x;
        }
    };
    // Given a set of columns, make sure `minWidth <= width <= maxWidth`
    SlickGrid.prototype.enforceWidthLimits = function (cols) {
        this.columnIdxById = {};
        for (var i = 0; i < cols.length; i++) {
            var m = cols[i];
            this.columnIdxById[m.id] = i;
            // Changing the object reference can cause problems for external consumers of that object, so we're careful to maintain it using this crazy double extend.
            var tempCol = $.extend({}, this.columnDefaults, m);
            $.extend(m, tempCol);
            if (m.minWidth && m.width < m.minWidth) {
                m.width = m.minWidth;
            }
            else if (m.maxWidth && m.width > m.maxWidth) {
                m.width = m.maxWidth;
            }
        }
    };
    /**
     * Efficient change detection
     */
    SlickGrid.prototype.didColumnsChange = function (before, after) {
        return before.length !== after.length || after.some(function (a, n) {
            var b = before[n];
            return a.asyncPostRender !== b.asyncPostRender
                || a.cssClass !== b.cssClass
                || a.defaultSortAsc !== b.defaultSortAsc
                || a.editor !== b.editor
                || a.field !== b.field
                || a.focusable !== b.focusable
                || a.formatter !== b.formatter
                || a.groupTotalsFormatter !== b.groupTotalsFormatter
                || a.headerCssClass !== b.headerCssClass
                || a.id !== b.id
                || a.isHidden !== b.isHidden
                || a.json !== b.json
                || a.key !== b.key
                || a.manuallySized !== b.manuallySized
                || a.maxWidth !== b.maxWidth
                || a.minWidth !== b.minWidth
                || a.name !== b.name
                || a.rerenderOnResize !== b.rerenderOnResize
                || a.resizable !== b.resizable
                || a.selectable !== b.selectable
                || a.showHidden !== b.showHidden
                || a.sortable !== b.sortable
                || a.toolTip !== b.toolTip
                || a.validator !== b.validator
                || a.width !== b.width;
        });
    };
    /**
     * Set or re-set the columns in the grid
     * opts.skipResizeCanvas let's you skip that step. Boosts performance if you don't need it because you're planning to to manually call resizeCanvas.
     */
    SlickGrid.prototype.setColumns = function (columns, opts) {
        if (opts === void 0) { opts = {}; }
        if (!this.didColumnsChange(this.columns, columns) && !opts.forceUpdate) {
            return;
        }
        this.columns = columns;
        this.enforceWidthLimits(this.columns);
        this.updateColumnCaches();
        if (this.initialized) {
            this.invalidateAllRows();
            this.createColumnHeaders();
            this.removeCssRules();
            this.createCssRules();
            if (!opts.skipResizeCanvas) {
                this.resizeCanvas();
            }
            this.applyColumnWidths();
            this.handleScroll();
            this.trigger(this.onColumnsChanged, opts);
        }
    };
    // Given a column definition object, do all the steps required to react to a change in the widths of any of the columns, and nothing more.
    // TODO: only update when columns changed
    SlickGrid.prototype.updateColumnWidths = function (columns) {
        this.columns = columns;
        this.enforceWidthLimits(this.columns);
        this.applyColumnWidths();
        this.updateColumnCaches();
        this.updateCanvasWidth(true); // Update the grid-canvas width. The `true` tells it to update the width of all the cells even if the canvas hasn't changed size (eg: if there was plenty of room for the cells both before and after the sizing, the canvas doesn't change)
        //      this.trigger(this.onColumnsResized); // TODO: find why this was needed and solve it without an infinite loop
    };
    SlickGrid.prototype.getOptions = function () {
        return this.options;
    };
    SlickGrid.prototype.setOptions = function (args) {
        if (!this.getEditorLock().commitCurrentEdit()) {
            return;
        }
        var pinnedColChanged; // If the pinned column has changed, we need to take some extra steps to render canvii
        this.makeActiveCellNormal();
        if (args.hasOwnProperty('enableAddRow') && this.options.enableAddRow !== args.enableAddRow) {
            this.invalidateRow(this.data.getLength());
        }
        if (args.hasOwnProperty('pinnedColumn') && args.pinnedColumn !== this.options.pinnedColumn) {
            pinnedColChanged = true;
            this.options.pinnedColumn = args.pinnedColumn; // $extend usually works, but not in the case where the new value is undefined. $.extend does not copy over null or undefined values.
        }
        // Do we need to redraw the subheader rows?
        if (args.hasOwnProperty('subHeaderRenderers')) {
            var subHeaderCount = this.subHeaders.el.eq(0).find('.subHeader-row').length;
            if (subHeaderCount !== this.options.subHeaderRenderers.length) {
                this.createColumnHeaders();
                this.calculateHeights();
                this.resizeCanvas();
            }
        }
        if (args.hasOwnProperty('appendSubheadersToContainer')) {
            this.injectSubheaders(args.appendSubheadersToContainer);
        }
        this.options = $.extend(this.options, args);
        this.validateAndEnforceOptions();
        if (this.options.autoHeight) {
            this.contentViewport.el.css('overflow-y', 'hidden');
        }
        else {
            this.contentViewport.el.css('overflow-y', '');
        }
        if (pinnedColChanged) {
            this.updatePinnedState();
        }
        this.render();
        this.debouncedUpdateAntiscroll();
    };
    SlickGrid.prototype.validateAndEnforceOptions = function () {
        if (this.options.autoHeight) {
            this.options.leaveSpaceForNewRows = false;
        }
        if (this.options.pinnedColumn != null) {
            this.isPinned = true;
        }
        else {
            this.isPinned = false;
            this.options.pinnedColumn = undefined; // map null and undefined both to undefined. null does some odd things in numerical comparisons. eg: 20 > null is true (wat!)
        }
    };
    SlickGrid.prototype.setData = function (newData, scrollToTop) {
        this.data = newData;
        this.invalidateAllRows();
        this.updateRowCount();
        if (scrollToTop) {
            this.scrollTo(0);
        }
    };
    SlickGrid.prototype.getData = function () {
        return this.data;
    };
    SlickGrid.prototype.getDataLengthIncludingAddNew = function () {
        return this.data.getLength() + (this.options.enableAddRow ? 1 : 0);
    };
    SlickGrid.prototype.getDataItem = function (rowIndex) {
        if (this.data.getItem) {
            return this.data.getItem(rowIndex);
        }
        else {
            return this.data[rowIndex];
        }
    };
    SlickGrid.prototype.setSubHeadersVisibility = function (visible) {
        if (this.options.showSubHeaders !== visible) {
            this.options.showSubHeaders = visible;
            if (visible) {
                this.subHeaders.el.show();
            }
            else {
                this.subHeaders.el.hide();
            }
        }
        this.resizeCanvas();
    };
    SlickGrid.prototype.getContainerNode = function () {
        return this.$container.get(0);
    };
    //////////////////////////////////////////////////////////////////////////////////////////////
    // Rendering / Scrolling
    SlickGrid.prototype.getRowTop = function (row) {
        return this.options.rowHeight * row - this.offset;
    };
    // Given a Y position, get the row index.
    // The Y position must be relative to the row canvas for an accurate answer.
    SlickGrid.prototype.getRowFromPosition = function (y) {
        return Math.floor((y + this.offset) / this.options.rowHeight);
    };
    SlickGrid.prototype.scrollTo = function (y) {
        y = Math.max(y, 0);
        y = Math.min(y, this.th - this.contentViewport.height + (this.viewportHasHScroll ? scrollbarDimensions.height : 0));
        var oldOffset = this.offset;
        this.page = Math.min(this.n - 1, Math.floor(y / this.ph));
        this.offset = Math.round(this.page * this.cj);
        var newScrollTop = y - this.offset;
        if (this.offset !== oldOffset) {
            var range$$1 = this.getViewport(newScrollTop);
            this.cleanupRows(range$$1);
            this.updateRowPositions();
        }
        if (this.prevScrollTop !== newScrollTop) {
            this.vScrollDir = (this.prevScrollTop + oldOffset < newScrollTop + this.offset) ? 1 : -1;
            this.lastRenderedScrollTop = this.scrollTop = this.prevScrollTop = newScrollTop;
            this.contentViewport.el.scrollTop(newScrollTop); // using jquery's .scrollTop() method handles multiple viewports
            this.trigger(this.onViewportChanged, {});
        }
    };
    SlickGrid.prototype.getFormatter = function (rowIndex, column) {
        var rowMetadata = this.data.getItemMetadata && this.data.getItemMetadata(rowIndex);
        // look up by id, then index
        var columnOverrides = rowMetadata &&
            rowMetadata.columns &&
            (rowMetadata.columns[column.id] || rowMetadata.columns[this.getColumnIndex(column.id)]);
        return (columnOverrides && columnOverrides.formatter) ||
            (rowMetadata && rowMetadata.formatter) ||
            column.formatter ||
            (this.options.formatterFactory && this.options.formatterFactory.getFormatter(column)) ||
            this.options.defaultFormatter;
    };
    SlickGrid.prototype.getEditor = function (rowIndex, cell) {
        var column = this.columns[cell];
        var rowMetadata = this.data.getItemMetadata && this.data.getItemMetadata(rowIndex);
        var columnMetadata = rowMetadata && rowMetadata.columns;
        if (columnMetadata && columnMetadata[column.id] && columnMetadata[column.id].editor !== undefined) {
            return columnMetadata[column.id].editor;
        }
        if (columnMetadata && columnMetadata[cell] && columnMetadata[cell].editor !== undefined) {
            return columnMetadata[cell].editor;
        }
        return column.editor || (this.options.editorFactory && this.options.editorFactory.getEditor(column));
    };
    SlickGrid.prototype.getDataItemValueForColumn = function (item, columnDef) {
        if (this.options.dataItemColumnValueExtractor) {
            return this.options.dataItemColumnValueExtractor(item, columnDef);
        }
        return item[columnDef.field];
    };
    SlickGrid.prototype.appendRowHtml = function (markupArrayL, markupArrayR, row, range$$1, dataLength) {
        var d = this.getDataItem(row);
        var dataLoading = row < dataLength && !d;
        var rowCss = 'row' +
            (this.options.addRowIndexToClassName ? ' row_' + row : '') +
            (dataLoading ? ' loading' : '') +
            (row === this.activeRow ? ' active' : '') +
            (row % 2 === 1 ? ' odd' : ' even');
        var metadata = this.data.getItemMetadata && this.data.getItemMetadata(row);
        if (metadata && metadata.cssClasses) {
            rowCss += ' ' + metadata.cssClasses;
        }
        var rowHtml = '<div class=\'' + rowCss + '\' style=\'top:' + (this.getRowTop(row)) + 'px; height:' + this.options.rowHeight + 'px;line-height:' + this.options.rowHeight + 'px;\'>';
        markupArrayL.push(rowHtml);
        if (this.isPinned) {
            markupArrayR.push(rowHtml);
        }
        var colspan;
        var m;
        for (var i = 0, ii = this.columns.length; i < ii; i++) {
            m = this.columns[i];
            colspan = 1;
            if (metadata && metadata.columns) {
                var columnData = metadata.columns[m.id] || metadata.columns[i];
                colspan = (columnData && columnData.colspan) || 1;
                // Grouping metadata can indicate that columns should autocalculate spanning.
                // In this case, we span whatever pinned region we're in, but not the whole grid.
                if (colspan === '*') {
                    if (this.options.pinnedColumn == null || i > this.options.pinnedColumn) {
                        colspan = ii - i;
                    }
                    else {
                        colspan = this.options.pinnedColumn + 1 - i;
                    }
                }
            }
            // Do not render cells outside of the viewport.
            if (this.columnPosRight[Math.min(ii - 1, i + colspan - 1)] > range$$1.leftPx) {
                if (this.columnPosLeft[i] > range$$1.rightPx) {
                    // All columns to the right are outside the range.
                    break;
                }
                if (this.options.pinnedColumn != null && i > this.options.pinnedColumn) {
                    this.appendCellHtml(markupArrayR, row, i, colspan, d);
                }
                else {
                    this.appendCellHtml(markupArrayL, row, i, colspan, d);
                }
            }
            else if (this.isPinned && this.options.pinnedColumn != null && (i <= this.options.pinnedColumn)) {
                this.appendCellHtml(markupArrayL, row, i, colspan, d);
            }
            if (colspan > 1) {
                i += (colspan - 1);
            }
        }
        markupArrayL.push('</div>');
        if (this.isPinned) {
            markupArrayR.push('</div>');
        }
    };
    SlickGrid.prototype.appendCellHtml = function (markupArray, row, cell, colspan, item) {
        var m = this.columns[cell];
        var cellCss = 'cell l' + cell +
            ' r' + Math.min(this.columns.length - 1, cell + colspan - 1) +
            (m.cssClass ? ' ' + m.cssClass : '');
        var hiddenClass = this.getHiddenCssClass(cell);
        if (hiddenClass) {
            cellCss += ' ' + hiddenClass;
        }
        if (row === this.activeRow && cell === this.activeCell) {
            cellCss += (' active');
        }
        // TODO:  merge them together in the setter
        for (var key in this.cellCssClasses) {
            if (this.cellCssClasses[key][row] && this.cellCssClasses[key][row][m.id]) {
                cellCss += (' ' + this.cellCssClasses[key][row][m.id]);
            }
        }
        markupArray.push('<div class=\'' + cellCss + '\'>');
        // if there is a corresponding row (if not, this is the Add New row or this data hasn't been loaded yet)
        if (item) {
            var value = this.getDataItemValueForColumn(item, m);
            markupArray.push(this.getFormatter(row, m)(row, cell, value, m, item, this));
        }
        markupArray.push('</div>');
        this.rowsCache[row].cellRenderQueue.push(cell);
        this.rowsCache[row].cellColSpans[cell] = colspan;
    };
    SlickGrid.prototype.cleanupRows = function (rangeToKeep) {
        for (var i in this.rowsCache) {
            var ii = parseInt(i, 10);
            if ((ii !== this.activeRow) && (ii < rangeToKeep.top || ii > rangeToKeep.bottom)) {
                this.removeRowFromCache(ii);
            }
        }
    };
    SlickGrid.prototype.invalidate = function () {
        this.updateRowCount();
        this.invalidateAllRows();
        this.render();
        this.trigger(this.onInvalidate);
    };
    // convenience method - like #invalidate, but waits for current
    // edit to complete before invalidating.
    // WARNING: while this API is convenient for invalidating data
    //          without impacting the UX, note that its sometimes-
    //          sync, sometimes-async API releases Zalgo! use with
    //          caution!
    SlickGrid.prototype.invalidateSafe = function () {
        var _this = this;
        if (this.getEditorLock().isActive()) {
            // if an invalidate is already scheduled, there's no need to call it twice
            if (this.state.invalidateSafeCellChangeCallback) {
                return;
            }
            this.state.invalidateSafeCellChangeCallback = function () {
                _this.onCellChange.unsubscribe(_this.state.invalidateSafeCellChangeCallback);
                _this.state.invalidateSafeCellChangeCallback = null;
                _this.invalidateSafe();
            };
            this.onCellChange.subscribe(this.state.invalidateSafeCellChangeCallback);
        }
        else {
            this.invalidate();
        }
    };
    SlickGrid.prototype.invalidateAllRows = function () {
        if (this.currentEditor) {
            this.makeActiveCellNormal();
        }
        for (var row in this.rowsCache) {
            this.removeRowFromCache(Number(row));
        }
    };
    // While scrolling, remove rows from cache and dom if they're off screen
    // There's an exception in here for OSX--if you remove the element that triggered a scroll it interrupts inertial scrolling and feels janky.
    SlickGrid.prototype.removeRowFromCache = function (rowIndex) {
        var cacheEntry = this.rowsCache[rowIndex];
        if (!cacheEntry) {
            return;
        }
        // call jquery's .remove, so we can listen on cleanup events.
        // See https://github.com/mleibman/SlickGrid/issues/354
        cacheEntry.rowNode.remove();
        delete this.rowsCache[rowIndex];
        delete this.postProcessedRows[rowIndex];
        this.renderedRows--;
        this.counter_rows_removed++;
    };
    SlickGrid.prototype.invalidateRows = function (rowIndeces) {
        var i;
        var rl;
        if (!rowIndeces || !rowIndeces.length) {
            return;
        }
        this.vScrollDir = 0;
        for (i = 0, rl = rowIndeces.length; i < rl; i++) {
            if (this.currentEditor && this.activeRow === rowIndeces[i]) {
                this.makeActiveCellNormal();
            }
            if (this.rowsCache[rowIndeces[i]]) {
                this.removeRowFromCache(rowIndeces[i]);
            }
        }
    };
    SlickGrid.prototype.invalidateRow = function (rowIndex) {
        this.invalidateRows([rowIndex]);
    };
    SlickGrid.prototype.updateCell = function (rowIndex, cell) {
        var cellNode = this.getCellNode(rowIndex, cell);
        if (!cellNode) {
            return;
        }
        var m = this.columns[cell];
        var d = this.getDataItem(rowIndex);
        if (this.currentEditor && this.activeRow === rowIndex && this.activeCell === cell) {
            this.currentEditor.loadValue(d);
        }
        else {
            cellNode.innerHTML = d ? this.getFormatter(rowIndex, m)(rowIndex, cell, this.getDataItemValueForColumn(d, m), m, d, this) : '';
            this.invalidatePostProcessingResults(rowIndex);
        }
    };
    SlickGrid.prototype.updateRow = function (rowIndex) {
        var cacheEntry = this.rowsCache[rowIndex];
        if (!cacheEntry) {
            return;
        }
        this.ensureCellNodesInRowsCache(rowIndex);
        var d = this.getDataItem(rowIndex);
        for (var c in cacheEntry.cellNodesByColumnIdx) {
            var columnIdx = Number(c) | 0;
            if (!cacheEntry.cellNodesByColumnIdx.hasOwnProperty(c))
                continue;
            var m = this.columns[columnIdx];
            var node = cacheEntry.cellNodesByColumnIdx[columnIdx];
            if (rowIndex === this.activeRow && columnIdx === this.activeCell && this.currentEditor) {
                this.currentEditor.loadValue(d);
            }
            else if (d) {
                node.innerHTML = this.getFormatter(rowIndex, m)(rowIndex, columnIdx, this.getDataItemValueForColumn(d, m), m, d, this);
            }
            else {
                node.innerHTML = '';
            }
        }
        this.invalidatePostProcessingResults(rowIndex);
    };
    // TODO: calculate the height of the header and subHeader row based on their css size
    SlickGrid.prototype.calculateHeights = function () {
        if (this.options.autoHeight) {
            this.contentViewport.height = this.options.rowHeight
                * this.getDataLengthIncludingAddNew()
                + this.header.el.outerHeight();
        }
        else {
            this.contentViewport.height = parseFloat($.css(this.$container[0], 'height', true))
                - parseFloat($.css(this.$container[0], 'paddingTop', true))
                - parseFloat($.css(this.$container[0], 'paddingBottom', true))
                - parseFloat($.css(this.topViewport.el[0], 'height'))
                - this.getVBoxDelta(this.topViewport.el.eq(0))
                - (this.options.appendSubheadersToContainer ? this.subHeaders.el.height() : 0);
        }
        this.numVisibleRows = Math.ceil(this.contentViewport.height / this.options.rowHeight);
    };
    // If you pass it a width, that width is used as the viewport width. If you do not, it is calculated as normal.
    // This is more performant if the canvas size is changed externally. The width is already known so we can pass it in instead of recalculating.
    SlickGrid.prototype.calculateViewportWidth = function (width) {
        this.contentViewport.width = width || parseFloat($.css(this.$container[0], 'width', true));
    };
    // If you pass resizeOptions.width, the viewport width calculation can be skipped. This saves 15ms or so.
    SlickGrid.prototype.resizeCanvas = function () {
        if (!this.initialized) {
            return;
        }
        // Reset
        this.contentViewport.height = 0;
        this.calculateHeights();
        this.calculateViewportWidth();
        var topOffset = this.topViewport.el.height(); // the top boundary of the center row of things
        this.contentViewportWrap.el.css({ top: topOffset, height: this.contentViewport.height });
        // something is setting the contentViewport's height, and should't be.
        // this causes the viewport to not resize when the window is resized.
        // as a workaround, override the CSS here.
        // TODO: figure out what's setting the height and fix it there instead.
        this.contentViewport.el.css({ top: 0, height: '100%', width: '100%' });
        if (this.options.forceFitColumns) {
            this.autosizeColumns();
        }
        this.updateRowCount();
        // Since the width has changed, force the render() to reevaluate virtually rendered cells.
        this.lastRenderedScrollLeft = -1;
        this.render();
        this.debouncedUpdateAntiscroll();
    };
    SlickGrid.prototype.updateRowCount = function () {
        if (!this.initialized) {
            return;
        }
        var dataLengthIncludingAddNew = this.getDataLengthIncludingAddNew();
        var numberOfRows = dataLengthIncludingAddNew +
            (this.options.leaveSpaceForNewRows ? this.numVisibleRows - 1 : 0);
        var oldViewportHasVScroll = this.viewportHasVScroll;
        // with autoHeight, we do not need to accommodate the vertical scroll bar
        this.viewportHasVScroll = !this.options.autoHeight && (numberOfRows * this.options.rowHeight > this.contentViewport.height);
        this.makeActiveCellNormal();
        // remove the rows that are now outside of the data range
        // this helps avoid redundant calls to .removeRow() when the size of the data decreased by thousands of rows
        var l = dataLengthIncludingAddNew - 1;
        for (var i in this.rowsCache) {
            var ii = Number(i);
            if (ii >= l) {
                this.removeRowFromCache(ii);
            }
        }
        if (this.activeCellNode && this.activeRow > l) {
            this.resetActiveCell();
        }
        var oldH = this.h;
        this.th = Math.max(this.options.rowHeight * numberOfRows, this.contentViewport.height - scrollbarDimensions.height);
        if (this.th < maxSupportedCssHeight) {
            // just one page
            this.h = this.ph = this.th;
            this.n = 1;
            this.cj = 0;
        }
        else {
            // break into pages
            this.h = maxSupportedCssHeight;
            this.ph = this.h / 100;
            this.n = Math.floor(this.th / this.ph);
            this.cj = (this.th - this.h) / (this.n - 1);
        }
        if (this.h !== oldH) {
            this.contentCanvas.el.css('height', this.h);
            this.scrollTop = this.contentViewport.el[0].scrollTop;
        }
        var oldScrollTopInRange = (this.scrollTop + this.offset <= this.th - this.contentViewport.height);
        if (this.th === 0 || this.scrollTop === 0) {
            this.page = this.offset = 0;
        }
        else if (oldScrollTopInRange) {
            // maintain virtual position
            this.scrollTo(this.scrollTop + this.offset);
        }
        else {
            // scroll to bottom
            this.scrollTo(this.th - this.contentViewport.height);
        }
        if (this.h !== oldH && this.options.autoHeight) {
            this.resizeCanvas();
        }
        if (this.options.forceFitColumns && oldViewportHasVScroll !== this.viewportHasVScroll) {
            this.autosizeColumns();
        }
        this.updateCanvasWidth(false);
    };
    SlickGrid.prototype.getViewport = function (viewportTop, viewportLeft) {
        if (viewportTop == null) {
            viewportTop = this.scrollTop;
        }
        if (viewportLeft == null) {
            viewportLeft = this.scrollLeft;
        }
        return {
            top: this.getRowFromPosition(viewportTop),
            bottom: this.getRowFromPosition(viewportTop + this.contentViewport.height) + 1,
            leftPx: viewportLeft,
            rightPx: viewportLeft + this.contentViewport.width
        };
    };
    SlickGrid.prototype.getRenderedRange = function (viewportTop, viewportLeft) {
        var range$$1 = this.getViewport(viewportTop, viewportLeft);
        var buffer = Math.round(this.contentViewport.height / this.options.rowHeight);
        var minBuffer = 3;
        if (this.vScrollDir === -1) {
            range$$1.top -= buffer;
            range$$1.bottom += minBuffer;
        }
        else if (this.vScrollDir === 1) {
            range$$1.top -= minBuffer;
            range$$1.bottom += buffer;
        }
        else {
            range$$1.top -= minBuffer;
            range$$1.bottom += minBuffer;
        }
        range$$1.top = Math.max(0, range$$1.top);
        range$$1.bottom = Math.min(this.getDataLengthIncludingAddNew() - 1, range$$1.bottom);
        range$$1.leftPx -= this.contentViewport.width;
        range$$1.rightPx += this.contentViewport.width;
        range$$1.leftPx = Math.max(0, range$$1.leftPx);
        range$$1.rightPx = Math.min(this.contentCanvas.width, range$$1.rightPx);
        return range$$1;
    };
    /*
      Fills in cellNodesByColumnIdx with dom node references
      -
      rowsCache[idx].rowNode is a jquery element that wraps two raw dom elements.
      When pinned, there are two containers, one left and one right.
      rowsCache[idx].rowNode.children().length // sum of both
      rowsCache[idx].rowNode[0].childNodes.length // left side
      rowsCache[idx].rowNode[1].childNodes.length // right side
      */
    SlickGrid.prototype.ensureCellNodesInRowsCache = function (rowIndex) {
        var cacheEntry = this.rowsCache[rowIndex];
        if (cacheEntry) {
            if (cacheEntry.cellRenderQueue.length) {
                var $lastNode = cacheEntry.rowNode.children().last(); // The last cell in the row
                while (cacheEntry.cellRenderQueue.length) {
                    var columnIdx = cacheEntry.cellRenderQueue.pop();
                    cacheEntry.cellNodesByColumnIdx[columnIdx] = $lastNode[0];
                    $lastNode = $lastNode.prev();
                    // cellRenderQueue is not empty but there is no .prev() element.
                    // We must need to switch to the other pinned row container.
                    if ($lastNode.length === 0) {
                        $lastNode = $(cacheEntry.rowNode[0]).children().last();
                    }
                }
            }
        }
    };
    SlickGrid.prototype.cleanUpCells = function (range$$1, rowIndex) {
        var totalCellsRemoved = 0;
        var cacheEntry = this.rowsCache[rowIndex];
        // Remove cells outside the range.
        var cellsToRemove = [];
        for (var i in cacheEntry.cellNodesByColumnIdx) {
            // I really hate it when people mess with Array.prototype.
            if (!cacheEntry.cellNodesByColumnIdx.hasOwnProperty(i)) {
                continue;
            }
            var ii = Number(i) || 0;
            if (ii <= this.options.pinnedColumn) {
                continue;
            } // never remove cells in a frozen column
            var colspan = cacheEntry.cellColSpans[i];
            if (this.columnPosLeft[i] > range$$1.rightPx || this.columnPosRight[Math.min(this.columns.length - 1, ii + colspan - 1)] < range$$1.leftPx) {
                if (!(rowIndex === this.activeRow && ii === this.activeCell)) {
                    cellsToRemove.push(ii);
                }
            }
        }
        // Remove every cell that isn't in the range,
        // remove the dom element, cellColSpans, cellNodesByColumnIdx, and postProcessedRows entries.
        var cellToRemove;
        var el;
        while ((cellToRemove = cellsToRemove.pop()) != null) {
            el = cacheEntry.cellNodesByColumnIdx[cellToRemove];
            // We used to know the parent, but now there are two possible parents (left or right), so it's easier to go from element to parent to remove:
            // The parent element won't exist if we removed the whole row. eg: we've stopping pinning columns so the whole viewport was removed.
            if (el && el.parentElement) {
                el.parentElement.removeChild(el);
            }
            delete cacheEntry.cellColSpans[cellToRemove];
            delete cacheEntry.cellNodesByColumnIdx[cellToRemove];
            if (this.postProcessedRows[rowIndex]) {
                delete this.postProcessedRows[rowIndex][cellToRemove];
            }
            totalCellsRemoved++;
        }
        return totalCellsRemoved;
    };
    SlickGrid.prototype.cleanUpAndRenderCells = function (range$$1) {
        var cacheEntry;
        var markupArray = [];
        var processedRows = [];
        var cellsAdded;
        var cellsRemoved;
        var totalCellsAdded = 0;
        var colspan;
        for (var row = range$$1.top, btm = range$$1.bottom; row <= btm; row++) {
            cacheEntry = this.rowsCache[row];
            if (!cacheEntry) {
                continue;
            }
            // cellRenderQueue populated in renderRows() needs to be cleared first
            this.ensureCellNodesInRowsCache(row);
            cellsRemoved = this.cleanUpCells(range$$1, row);
            // Render missing cells.
            cellsAdded = 0;
            var metadata = this.data.getItemMetadata && this.data.getItemMetadata(row);
            metadata = metadata && metadata.columns;
            var d = this.getDataItem(row);
            // TODO:  shorten this loop (index? heuristics? binary search?)
            for (var i = 0, ii = this.columns.length; i < ii; i++) {
                // Cells to the right are outside the range.
                if (this.columnPosLeft[i] > range$$1.rightPx) {
                    break;
                }
                // Already rendered.
                if ((colspan = cacheEntry.cellColSpans[i]) != null) {
                    i += (colspan > 1 ? colspan - 1 : 0);
                    continue;
                }
                // Adjust the colspan if needed
                colspan = 1;
                if (metadata) {
                    var columnData = metadata[this.columns[i].id] || metadata[i];
                    colspan = (columnData && columnData.colspan) || 1;
                    if (colspan === '*') {
                        colspan = ii - i;
                    }
                }
                // Cells whose right edge is inside the left range boundary are visible and should be drawn
                if (this.columnPosRight[Math.min(ii - 1, i + colspan - 1)] > range$$1.leftPx) {
                    this.appendCellHtml(markupArray, row, i, colspan, d);
                    cellsAdded++;
                }
                i += (colspan > 1 ? colspan - 1 : 0);
            }
            if (cellsAdded) {
                totalCellsAdded += cellsAdded;
                processedRows.push(row);
            }
        }
        if (!markupArray.length) {
            return;
        }
        // Create a temporary DOM element to hold the markup for every cell. Can be from different rows.
        var x = document.createElement('div');
        x.innerHTML = markupArray.join('');
        var processedRow;
        var $node;
        var side;
        while ((processedRow = processedRows.pop()) != null) {
            cacheEntry = this.rowsCache[processedRow];
            var columnIdx;
            // Starting on the rightmost cell,
            while ((columnIdx = cacheEntry.cellRenderQueue.pop()) != null) {
                $node = $(x).children().last();
                side = this.options.pinnedColumn != null && columnIdx > this.options.pinnedColumn ? 1 : 0;
                $(cacheEntry.rowNode[side]).append($node);
                cacheEntry.cellNodesByColumnIdx[columnIdx] = $node[0];
            }
        }
    };
    SlickGrid.prototype.renderRows = function (range$$1) {
        var markupArrayL = [];
        var markupArrayR = [];
        var rows = [];
        var needToReselectCell = false;
        var dataLength = this.data.getLength();
        for (var i = range$$1.top, ii = range$$1.bottom; i <= ii; i++) {
            if (this.rowsCache[i]) {
                continue;
            }
            this.renderedRows++;
            rows.push(i);
            // Create an entry right away so that appendRowHtml() can
            // start populating it.
            this.rowsCache[i] = {
                rowNode: null,
                // ColSpans of rendered cells (by column idx).
                // Can also be used for checking whether a cell has been rendered.
                cellColSpans: [],
                // Cell nodes (by column idx).  Lazy-populated by ensureCellNodesInRowsCache().
                cellNodesByColumnIdx: [],
                // Column indices of cell nodes that have been rendered, but not yet indexed in
                // cellNodesByColumnIdx.  These are in the same order as cell nodes added at the
                // end of the row.
                cellRenderQueue: []
            };
            this.appendRowHtml(markupArrayL, markupArrayR, i, range$$1, dataLength);
            if (this.activeCellNode && this.activeRow === i) {
                needToReselectCell = true;
            }
            this.counter_rows_rendered++;
        }
        if (!rows.length) {
            return;
        }
        var l = document.createElement('div');
        var r = document.createElement('div');
        l.innerHTML = markupArrayL.join('');
        r.innerHTML = markupArrayR.join('');
        // For each row, add a row node that contains either one or two elements, depending on whether columns are pinned
        for (var i_4 = 0, ii_1 = rows.length; i_4 < ii_1; i_4++) {
            if (this.isPinned) {
                this.rowsCache[rows[i_4]].rowNode = $()
                    .add($(l.firstChild).appendTo(this.contentCanvas.el[0]))
                    .add($(r.firstChild).appendTo(this.contentCanvas.el[1]));
            }
            else {
                this.rowsCache[rows[i_4]].rowNode = $()
                    .add($(l.firstChild).appendTo(this.contentCanvas.el[0]));
            }
        }
        if (needToReselectCell) {
            this.activeCellNode = this.getCellNode(this.activeRow, this.activeCell);
        }
    };
    SlickGrid.prototype.startPostProcessing = function () {
        if (!this.options.enableAsyncPostRender) {
            return;
        }
        if (!this.columns.some(function (column) { return column.asyncPostRender != null; }))
            return;
        clearTimeout(this.h_postrender);
        this.h_postrender = setTimeout(this.asyncPostProcessRows.bind(this), this.options.asyncPostRenderDelay);
    };
    SlickGrid.prototype.invalidatePostProcessingResults = function (row) {
        delete this.postProcessedRows[row];
        this.postProcessFromRow = Math.min(this.postProcessFromRow, row);
        this.postProcessToRow = Math.max(this.postProcessToRow, row);
        this.startPostProcessing();
    };
    SlickGrid.prototype.updateRowPositions = function () {
        for (var row in this.rowsCache) {
            this.rowsCache[row].rowNode.css('top', this.getRowTop(Number(row)) + 'px');
        }
    };
    SlickGrid.prototype.render = function () {
        if (!this.initialized) {
            return;
        }
        var visible = this.getViewport();
        var rendered = this.getRenderedRange();
        // remove rows no longer in the viewport
        this.cleanupRows(rendered);
        // If we change the left scroll, we may need to add/remove cells from already drawn rows.
        if (this.lastRenderedScrollLeft !== this.scrollLeft) {
            this.cleanUpAndRenderCells(rendered);
        }
        // render missing rows
        this.renderRows(rendered);
        this.postProcessFromRow = visible.top;
        this.postProcessToRow = Math.min(this.getDataLengthIncludingAddNew() - 1, visible.bottom);
        this.startPostProcessing();
        this.lastRenderedScrollTop = this.scrollTop;
        this.lastRenderedScrollLeft = this.scrollLeft;
        this.trigger(this.onRender, {});
        this.h_render = null;
    };
    // React to a mousewheel event on a header element, translate them to the grid contents
    // It's OK to always decrement because the browser never lets scrollLeft or Top get set less than 0.
    SlickGrid.prototype.onHeaderMouseWheel = function (evt) {
        this.contentViewport.scroller.scrollLeft -= evt.originalEvent.wheelDeltaX;
        this.contentViewport.scroller.scrollTop -= evt.originalEvent.wheelDeltaY;
    };
    // Handle an actual, browser triggered scroll event
    // Send the scrollTop from the triggering element into `handleScroll`, which can be triggered programatically.
    SlickGrid.prototype.scroll = function () {
        this.handleScroll();
    };
    SlickGrid.prototype.handleScroll = function (top) {
        if (top === void 0) { top = this.contentViewport.scroller.scrollTop; }
        this.scrollTop = top;
        this.scrollLeft = this.contentViewport.scroller.scrollLeft;
        this.reallyHandleScroll(false);
    };
    SlickGrid.prototype.reallyHandleScroll = function (isMouseWheel) {
        var contentScroller = this.contentViewport.scroller;
        // Ceiling the max scroll values
        var maxScrollDistanceY = contentScroller.scrollHeight - contentScroller.clientHeight;
        var maxScrollDistanceX = contentScroller.scrollWidth - contentScroller.clientWidth;
        if (this.scrollTop > maxScrollDistanceY) {
            this.scrollTop = maxScrollDistanceY;
        }
        if (this.scrollLeft > maxScrollDistanceX) {
            this.scrollLeft = maxScrollDistanceX;
        }
        var vScrollDist = Math.abs(this.scrollTop - this.prevScrollTop);
        var hScrollDist = Math.abs(this.scrollLeft - this.prevScrollLeft);
        if (hScrollDist) {
            this.prevScrollLeft = this.scrollLeft;
            contentScroller.scrollLeft = this.scrollLeft;
            this.topViewport.scroller.scrollLeft = this.scrollLeft;
            if (this.options.appendSubheadersToContainer) {
                this.subHeaders.el.scrollLeft(this.scrollLeft);
            }
        }
        if (vScrollDist) {
            this.vScrollDir = this.prevScrollTop < this.scrollTop ? 1 : -1;
            this.prevScrollTop = this.scrollTop;
            if (isMouseWheel) {
                contentScroller.scrollTop = this.scrollTop;
            }
            // Set the scroll position of the paired viewport to match this one
            if (this.isPinned) {
                this.contentViewport.el[0].scrollTop = this.scrollTop;
                this.contentViewport.el[1].scrollTop = this.scrollTop;
            }
            // switch virtual pages if needed
            if (vScrollDist < this.contentViewport.height) {
                this.scrollTo(this.scrollTop + this.offset);
            }
            else {
                var oldOffset = this.offset;
                if (this.h === this.contentViewport.height) {
                    this.page = 0;
                }
                else {
                    this.page = Math.min(this.n - 1, Math.floor(this.scrollTop * ((this.th - this.contentViewport.height) / (this.h - this.contentViewport.height)) * (1 / this.ph)));
                }
                this.offset = Math.round(this.page * this.cj);
                if (oldOffset !== this.offset) {
                    this.invalidateAllRows();
                }
            }
        }
        if (hScrollDist || vScrollDist) {
            if (this.h_render) {
                clearTimeout(this.h_render);
            }
            if (Math.abs(this.lastRenderedScrollTop - this.scrollTop) > 20 ||
                Math.abs(this.lastRenderedScrollLeft - this.scrollLeft) > 20) {
                if (this.options.forceSyncScrolling || (Math.abs(this.lastRenderedScrollTop - this.scrollTop) < this.contentViewport.height &&
                    Math.abs(this.lastRenderedScrollLeft - this.scrollLeft) < this.contentViewport.width)) {
                    this.render();
                }
                else {
                    this.h_render = setTimeout(this.render.bind(this), 50);
                }
                this.trigger(this.onViewportChanged, {});
            }
        }
        this.trigger(this.onScroll, { scrollLeft: this.scrollLeft, scrollTop: this.scrollTop });
    };
    SlickGrid.prototype.asyncPostProcessRows = function () {
        var dataLength = this.data.getLength();
        while (this.postProcessFromRow <= this.postProcessToRow) {
            var row = void 0;
            if (this.vScrollDir >= 0) {
                row = this.postProcessFromRow;
                this.postProcessFromRow = this.postProcessFromRow + 1;
            }
            else {
                row = this.postProcessToRow;
                this.postProcessToRow = this.postProcessToRow - 1;
            }
            var cacheEntry = this.rowsCache[row];
            if (!cacheEntry || row >= dataLength) {
                continue;
            }
            if (!this.postProcessedRows[row]) {
                this.postProcessedRows[row] = {};
            }
            this.ensureCellNodesInRowsCache(row);
            for (var columnName in cacheEntry.cellNodesByColumnIdx) {
                if (!cacheEntry.cellNodesByColumnIdx.hasOwnProperty(columnName)) {
                    continue;
                }
                var columnIdx = Number(columnName) || 0;
                var m = this.columns[columnIdx];
                if (m.asyncPostRender && !this.postProcessedRows[row][columnIdx]) {
                    var node = cacheEntry.cellNodesByColumnIdx[columnIdx];
                    if (node) {
                        try {
                            m.asyncPostRender(node, row, this.getDataItem(row), m, this);
                        }
                        catch (error) {
                            console.error('Error in asyncPostRenderer:', error, [node, row, this.getDataItem(row), m, this]);
                        }
                    }
                    this.postProcessedRows[row][columnIdx] = true;
                }
            }
            this.h_postrender = setTimeout(this.asyncPostProcessRows.bind(this), this.options.asyncPostRenderDelay);
            return;
        }
    };
    SlickGrid.prototype.updateCellCssStylesOnRenderedRows = function (addedHash, removedHash) {
        var node;
        var columnId;
        var addedRowHash;
        var removedRowHash;
        for (var row in this.rowsCache) {
            removedRowHash = removedHash && removedHash[row];
            addedRowHash = addedHash && addedHash[row];
            if (removedRowHash) {
                for (columnId in removedRowHash) {
                    if (!addedRowHash || removedRowHash[columnId] !== addedRowHash[columnId]) {
                        node = this.getCellNode(Number(row), this.getColumnIndex(columnId));
                        if (node) {
                            $(node).removeClass(removedRowHash[columnId]);
                        }
                    }
                }
            }
            if (addedRowHash) {
                for (columnId in addedRowHash) {
                    if (!removedRowHash || removedRowHash[columnId] !== addedRowHash[columnId]) {
                        node = this.getCellNode(Number(row), this.getColumnIndex(columnId));
                        if (node) {
                            $(node).addClass(addedRowHash[columnId]);
                        }
                    }
                }
            }
        }
    };
    SlickGrid.prototype.addCellCssStyles = function (key, hash) {
        if (this.cellCssClasses[key]) {
            throw 'addCellCssStyles: cell CSS hash with key \'' + key + '\' already exists.';
        }
        this.cellCssClasses[key] = hash;
        this.updateCellCssStylesOnRenderedRows(hash, null);
        this.trigger(this.onCellCssStylesChanged, { key: key, hash: hash });
    };
    SlickGrid.prototype.removeCellCssStyles = function (key) {
        if (!this.cellCssClasses[key]) {
            return;
        }
        this.updateCellCssStylesOnRenderedRows(null, this.cellCssClasses[key]);
        delete this.cellCssClasses[key];
        this.trigger(this.onCellCssStylesChanged, { key: key, hash: null });
    };
    SlickGrid.prototype.setCellCssStyles = function (key, hash) {
        var prevHash = this.cellCssClasses[key];
        this.cellCssClasses[key] = hash;
        this.updateCellCssStylesOnRenderedRows(hash, prevHash);
        this.trigger(this.onCellCssStylesChanged, { key: key, hash: hash });
    };
    // (key: String) => Object
    SlickGrid.prototype.getCellCssStyles = function (key) {
        return this.cellCssClasses[key];
    };
    //////////////////////////////////////////////////////////////////////////////////////////////
    // Interactivity
    SlickGrid.prototype.handleDragInit = function (e, dd) {
        var cell = this.getCellFromEvent(e);
        if (!cell || !this.cellExists(cell.row, cell.cell)) {
            return false;
        }
        var retval = this.trigger(this.onDragInit, dd, e);
        if (e.isImmediatePropagationStopped()) {
            return retval;
        }
        // if nobody claims to be handling drag'n'drop by stopping immediate propagation,
        // cancel out of it
        return false;
    };
    SlickGrid.prototype.handleDragStart = function (e, dd) {
        var cell = this.getCellFromEvent(e);
        if (!cell || !this.cellExists(cell.row, cell.cell)) {
            return false;
        }
        var retval = this.trigger(this.onDragStart, dd, e);
        if (e.isImmediatePropagationStopped()) {
            return retval;
        }
        return false;
    };
    SlickGrid.prototype.handleDrag = function (e, dd) {
        return this.trigger(this.onDrag, dd, e);
    };
    SlickGrid.prototype.handleDragEnd = function (e, dd) {
        this.trigger(this.onDragEnd, dd, e);
    };
    SlickGrid.prototype.handleKeyDown = function (e) {
        this.trigger(this.onBeforeKeyDown, { row: this.activeRow, cell: this.activeCell }, e);
        this.trigger(this.onKeyDown, { row: this.activeRow, cell: this.activeCell }, e);
        if (e.isImmediatePropagationStopped() || this.isKeyDownHandled(e)) {
            e.stopPropagation();
            e.preventDefault();
        }
    };
    SlickGrid.prototype.isKeyDownHandled = function (e) {
        var noModifierKeys = !e.shiftKey && !e.altKey && !e.ctrlKey;
        if (noModifierKeys && e.which === KEYCODES.ESCAPE) {
            if (!this.getEditorLock().isActive())
                return false;
            this.cancelEditAndSetFocus();
            return true;
        }
        else if (noModifierKeys && e.which === KEYCODES.PAGE_DOWN) {
            this.scrollPage(1);
            return true;
        }
        else if (noModifierKeys && e.which === KEYCODES.PAGE_UP) {
            this.scrollPage(-1);
            return true;
        }
        else if (noModifierKeys && e.which === KEYCODES.LEFT)
            return this.navigate('left');
        else if (noModifierKeys && e.which === KEYCODES.RIGHT)
            return this.navigate('right');
        else if (noModifierKeys && e.which === KEYCODES.UP)
            return this.navigate('up');
        else if (noModifierKeys && e.which === KEYCODES.DOWN)
            return this.navigate('down');
        else if (noModifierKeys && e.which === KEYCODES.TAB)
            return this.navigate('next');
        else if (e.shiftKey && e.which === KEYCODES.TAB && !e.ctrlKey && !e.altKey)
            return this.navigate('prev');
        else if (noModifierKeys && e.which === KEYCODES.ENTER)
            return this.navigate('down');
        else if (e.shiftKey && e.which === KEYCODES.ENTER && !e.ctrlKey && !e.altKey)
            return this.navigate('up');
        else if (noModifierKeys && e.which === KEYCODES.F2) {
            if (!this.options.editable)
                return true;
            if (this.currentEditor == null) {
                if (this.getEditorLock().commitCurrentEdit())
                    this.editActiveCell();
            }
            else {
                this.commitEditAndSetFocus();
            }
            return true;
        }
        else if (noModifierKeys && TYPABLE_KEYCODES.indexOf(e.which) !== -1) {
            if (this.currentEditor == null && this.getEditorLock().commitCurrentEdit())
                this.editActiveCell();
            return false; // so the event can be propagated to the editor itself
        }
        else {
            return false;
        }
    };
    SlickGrid.prototype.handleClick = function (e) {
        if (!this.currentEditor) {
            // if this click resulted in some cell child node getting focus,
            // don't steal it back - keyboard events will still bubble up
            // IE9+ seems to default DIVs to tabIndex=0 instead of -1, so check for cell clicks directly.
            if (e.target !== document.activeElement || $(e.target).hasClass('cell')) {
                this.focus();
            }
        }
        var cell = this.getCellFromEvent(e);
        if (!cell || (this.currentEditor !== null && this.activeRow === cell.row && this.activeCell === cell.cell)) {
            return;
        }
        this.trigger(this.onClick, { row: cell.row, cell: cell.cell }, e);
        if (e.isImmediatePropagationStopped()) {
            return;
        }
        if ((this.activeCell !== cell.cell || this.activeRow !== cell.row) && this.canCellBeActive(cell.row, cell.cell)) {
            if (!this.getEditorLock().isActive() || this.getEditorLock().commitCurrentEdit()) {
                this.scrollRowIntoView(cell.row, false);
                this.setActiveCellInternal(this.getCellNode(cell.row, cell.cell));
            }
        }
    };
    SlickGrid.prototype.handleContextMenu = function (e) {
        var $cell = $(e.target).closest('.cell', this.contentCanvas.el);
        if ($cell.length === 0) {
            return;
        }
        // are we editing this cell?
        if (this.activeCellNode === $cell[0] && this.currentEditor !== null) {
            return;
        }
        this.trigger(this.onContextMenu, {}, e);
    };
    SlickGrid.prototype.handleDblClick = function (e) {
        var cell = this.getCellFromEvent(e);
        if (!cell || (this.currentEditor !== null && this.activeRow === cell.row && this.activeCell === cell.cell)) {
            return;
        }
        this.trigger(this.onDblClick, { row: cell.row, cell: cell.cell }, e);
        if (e.isImmediatePropagationStopped()) {
            return;
        }
        if (this.options.editable) {
            this.gotoCell(cell.row, cell.cell, true);
        }
    };
    SlickGrid.prototype.handleHeaderMouseEnter = function (e) {
        this.trigger(this.onHeaderMouseEnter, {
            column: $(this).data('column')
        }, e);
    };
    SlickGrid.prototype.handleHeaderMouseLeave = function (e) {
        this.trigger(this.onHeaderMouseLeave, {
            column: $(this).data('column')
        }, e);
    };
    SlickGrid.prototype.handleHeaderContextMenu = function (e) {
        var $header = $(e.target).closest('.cell', '.header');
        var column = $header && $header.data('column');
        this.trigger(this.onHeaderContextMenu, { column: column }, e);
    };
    SlickGrid.prototype.handleSubHeaderContextMenu = function (e) {
        var $subHeader = $(e.target).closest('.cell', '.subHeaders');
        var column = $subHeader && $subHeader.data('column');
        this.trigger(this.onSubHeaderContextMenu, { column: column }, e);
    };
    SlickGrid.prototype.handleHeaderClick = function (e) {
        var $header = $(e.target).closest('.cell', '.header');
        var column = $header && $header.data('column');
        if (column) {
            this.trigger(this.onHeaderClick, { column: column }, e);
        }
    };
    SlickGrid.prototype.handleMouseEnter = function (e) {
        this.trigger(this.onMouseEnter, {}, e);
    };
    SlickGrid.prototype.handleMouseLeave = function (e) {
        this.trigger(this.onMouseLeave, {}, e);
    };
    SlickGrid.prototype.cellExists = function (row, cell) {
        return !(row < 0 || row >= this.data.getLength() || cell < 0 || cell >= this.columns.length);
    };
    SlickGrid.prototype.getCellFromPoint = function (x, y) {
        var row = this.getRowFromPosition(y);
        var cell = 0;
        var w = 0;
        for (var i = 0; i < this.columns.length && w < x; i++) {
            w += this.columns[i].width;
            cell++;
        }
        if (cell < 0) {
            cell = 0;
        }
        return { row: row, cell: cell - 1 };
    };
    // Given a cell element, read column number from .l<columnNumber> CSS class
    SlickGrid.prototype.getCellFromNode = function (cellNode) {
        if (cellNode[0]) {
            cellNode = cellNode[0];
        } // unwrap jquery
        var cls = /l\d+/.exec(cellNode.className);
        if (!cls) {
            throw 'getCellFromNode: cannot get cell - ' + cellNode.className;
        }
        return parseInt(cls[0].substr(1, cls[0].length - 1), 10);
    };
    // Given a dom element for a row, find out which row index it belongs to
    SlickGrid.prototype.getRowFromNode = function (node) {
        for (var idx in this.rowsCache) {
            if (this.rowsCache[idx].rowNode[0] === node ||
                this.rowsCache[idx].rowNode[1] === node) {
                return parseInt(idx, 10);
            }
        }
        return null;
    };
    SlickGrid.prototype.getCellFromEvent = function (e) {
        var $cell = $(e.target).closest('.cell', this.contentCanvas.el);
        if (!$cell.length) {
            return null;
        }
        var row = this.getRowFromNode($cell[0].parentNode);
        var cell = this.getCellFromNode($cell[0]);
        if (row == null || cell == null) {
            return null;
        }
        else {
            return {
                row: row,
                cell: cell
            };
        }
    };
    SlickGrid.prototype.getCellNodeBox = function (row, cell) {
        if (!this.cellExists(row, cell)) {
            return null;
        }
        var y1 = this.getRowTop(row);
        var y2 = y1 + this.options.rowHeight - 1;
        var x1 = 0;
        for (var i = 0; i < cell; i++) {
            x1 += this.columns[i].width;
        }
        var x2 = x1 + this.columns[cell].width;
        return {
            top: y1,
            left: x1,
            bottom: y2,
            right: x2
        };
    };
    //////////////////////////////////////////////////////////////////////////////////////////////
    // Cell switching
    SlickGrid.prototype.resetActiveCell = function () {
        this.setActiveCellInternal(null, false);
    };
    SlickGrid.prototype.focus = function () {
        if (this.tabbingDirection === -1) {
            this.$focusSink[0].focus();
        }
        else {
            this.$focusSink2[0].focus();
        }
    };
    SlickGrid.prototype.getPinnedColumnsWidth = function () {
        if (this.options.pinnedColumn == null)
            return 0;
        var width = 0;
        for (var i = 0; i <= this.options.pinnedColumn; i++) {
            width += this.columnPosRight[i] - this.columnPosLeft[i];
        }
        return width;
    };
    // Returns the index of the first column (counting from the left) that is focusable
    // (Void) => Number
    SlickGrid.prototype.getFirstFocusableColumnIndex = function () {
        var columns = this.getColumns();
        var index = 0;
        while (index < columns.length) {
            if (columns[index].focusable) {
                return index;
            }
            index++;
        }
        return -1;
    };
    SlickGrid.prototype.scrollCellIntoView = function (row, cell, doPaging) {
        this.scrollRowIntoView(row, doPaging);
        // no need to scroll if cell inside pinned area (not perfect solution but practical)
        if (this.options.pinnedColumn != null && cell <= this.options.pinnedColumn)
            return;
        var left = this.columnPosLeft[cell] - this.getPinnedColumnsWidth();
        var right = this.columnPosRight[cell + this.getColspan(row, cell) - 1];
        var scrollRight = this.scrollLeft + this.contentViewport.width;
        if (left < this.scrollLeft) {
            this.contentViewport.el.scrollLeft(left);
            this.handleScroll();
            this.render();
        }
        else if (right > scrollRight) {
            this.contentViewport.el.scrollLeft(this.scrollLeft + this.columnPosRight[cell] - this.columnPosLeft[cell]);
            this.handleScroll();
            this.render();
        }
    };
    SlickGrid.prototype.setActiveCellInternal = function (newCell, opt_editMode) {
        var previousActiveRow = this.activeRow;
        if (this.activeCellNode !== null) {
            this.makeActiveCellNormal();
            $(this.activeCellNode).removeClass('active');
            if (this.rowsCache[this.activeRow]) {
                $(this.rowsCache[this.activeRow].rowNode).removeClass('active');
            }
        }
        var activeCellChanged = (this.activeCellNode !== newCell);
        this.activeCellNode = newCell;
        if (this.activeCellNode != null) {
            this.activeRow = this.getRowFromNode(this.activeCellNode.parentNode);
            this.activeCell = this.activePosX = this.getCellFromNode(this.activeCellNode);
            if (opt_editMode == null) {
                opt_editMode = (this.activeRow === this.data.getLength()) || this.options.autoEdit;
            }
            $(this.activeCellNode).addClass('active');
            $(this.rowsCache[this.activeRow].rowNode).addClass('active');
            if (this.options.editable && opt_editMode && this.isCellPotentiallyEditable(this.activeRow, this.activeCell)) {
                if (this.h_editorLoader) {
                    clearTimeout(this.h_editorLoader);
                }
                if (this.options.asyncEditorLoading) {
                    this.h_editorLoader = setTimeout(this.editActiveCell.bind(this), this.options.asyncEditorLoadDelay);
                }
                else {
                    this.editActiveCell();
                }
            }
        }
        else {
            this.activeRow = this.activeCell = null;
        }
        if (activeCellChanged) {
            this.trigger(this.onActiveCellChanged, this.getActiveCell());
        }
        var activeRowChanged = (this.activeRow !== previousActiveRow);
        if (activeRowChanged) {
            this.trigger(this.onActiveRowChanged, { row: this.getDataItem(this.activeRow) });
        }
    };
    SlickGrid.prototype.clearTextSelection = function () {
        var sel = window.getSelection();
        if (sel && sel.removeAllRanges)
            sel.removeAllRanges();
    };
    SlickGrid.prototype.isCellPotentiallyEditable = function (row, cell) {
        var dataLength = this.data.getLength();
        // is the data for this row loaded?
        if (row < dataLength && !this.getDataItem(row)) {
            return false;
        }
        // are we in the Add New row?  can we create new from this cell?
        if (this.columns[cell].cannotTriggerInsert && row >= dataLength) {
            return false;
        }
        // does this cell have an editor?
        if (!this.getEditor(row, cell)) {
            return false;
        }
        return true;
    };
    SlickGrid.prototype.makeActiveCellNormal = function () {
        if (!this.currentEditor) {
            return;
        }
        this.trigger(this.onBeforeCellEditorDestroy, { editor: this.currentEditor });
        this.currentEditor.destroy();
        this.currentEditor = null;
        if (this.activeCellNode) {
            var d = this.getDataItem(this.activeRow);
            $(this.activeCellNode).removeClass('editable invalid');
            if (d) {
                var column = this.columns[this.activeCell];
                var formatter = this.getFormatter(this.activeRow, column);
                this.activeCellNode.innerHTML = formatter(this.activeRow, this.activeCell, this.getDataItemValueForColumn(d, column), column, d, this);
                this.invalidatePostProcessingResults(this.activeRow);
            }
        }
        // if there previously was text selected on a page (such as selected text in the edit cell just removed),
        // IE can't set focus to anything else correctly
        if (navigator.userAgent.toLowerCase().match(/msie/)) {
            this.clearTextSelection();
        }
        this.getEditorLock().deactivate(this.editController);
    };
    SlickGrid.prototype.editActiveCell = function (editor) {
        if (!this.activeCellNode) {
            return;
        }
        if (!this.options.editable) {
            throw 'Grid : editActiveCell : should never get called when options.editable is false';
        }
        // cancel pending async call if there is one
        if (this.h_editorLoader) {
            clearTimeout(this.h_editorLoader);
        }
        if (!this.isCellPotentiallyEditable(this.activeRow, this.activeCell)) {
            return;
        }
        var columnDef = this.columns[this.activeCell];
        var item = this.getDataItem(this.activeRow);
        if (this.trigger(this.onBeforeEditCell, { row: this.activeRow, cell: this.activeCell, item: item, column: columnDef }) === false) {
            this.focus();
            return;
        }
        this.getEditorLock().activate(this.editController);
        $(this.activeCellNode).addClass('editable');
        // don't clear the cell if a custom editor is passed through
        if (!editor) {
            this.activeCellNode.innerHTML = '';
        }
        this.currentEditor = new (editor || this.getEditor(this.activeRow, this.activeCell))({
            grid: this,
            gridPosition: this.absBox(this.$container[0]),
            position: this.absBox(this.activeCellNode),
            container: this.activeCellNode,
            column: columnDef,
            item: item || {},
            commitChanges: this.commitEditAndSetFocus,
            cancelChanges: this.cancelEditAndSetFocus
        });
        if (item) {
            this.currentEditor.loadValue(item);
        }
        this.serializedEditorValue = this.currentEditor.serializeValue();
        if (this.currentEditor.position) {
            this.handleActiveCellPositionChange();
        }
    };
    SlickGrid.prototype.commitEditAndSetFocus = function () {
        // if the commit fails, it would do so due to a validation error
        // if so, do not steal the focus from the editor
        if (this.getEditorLock().commitCurrentEdit()) {
            this.focus();
            if (this.options.autoEdit) {
                this.navigate('down');
            }
        }
    };
    SlickGrid.prototype.cancelEditAndSetFocus = function () {
        if (this.getEditorLock().cancelCurrentEdit()) {
            this.focus();
        }
    };
    SlickGrid.prototype.absBox = function (elem) {
        var box = {
            top: elem.offsetTop,
            left: elem.offsetLeft,
            bottom: 0,
            right: 0,
            width: $(elem).outerWidth(),
            height: $(elem).outerHeight(),
            visible: true
        };
        box.bottom = box.top + box.height;
        box.right = box.left + box.width;
        // walk up the tree
        var offsetParent = elem.offsetParent;
        while ((elem = elem.parentNode) !== document.body) {
            if (box.visible && elem.scrollHeight !== elem.offsetHeight && $(elem).css('overflowY') !== 'visible') {
                box.visible = box.bottom > elem.scrollTop && box.top < elem.scrollTop + elem.clientHeight;
            }
            if (box.visible && elem.scrollWidth !== elem.offsetWidth && $(elem).css('overflowX') !== 'visible') {
                box.visible = box.right > elem.scrollLeft && box.left < elem.scrollLeft + elem.clientWidth;
            }
            box.left -= elem.scrollLeft;
            box.top -= elem.scrollTop;
            if (elem === offsetParent) {
                box.left += elem.offsetLeft;
                box.top += elem.offsetTop;
                offsetParent = elem.offsetParent;
            }
            box.bottom = box.top + box.height;
            box.right = box.left + box.width;
        }
        return box;
    };
    SlickGrid.prototype.getActiveCellPosition = function () {
        return this.absBox(this.activeCellNode);
    };
    SlickGrid.prototype.getGridPosition = function () {
        return this.absBox(this.$container[0]);
    };
    SlickGrid.prototype.handleActiveCellPositionChange = function () {
        if (!this.activeCellNode) {
            return;
        }
        this.trigger(this.onActiveCellPositionChanged, {});
        if (this.currentEditor) {
            var cellBox = this.getActiveCellPosition();
            if (this.currentEditor.show && this.currentEditor.hide) {
                if (!cellBox.visible) {
                    this.currentEditor.hide();
                }
                else {
                    this.currentEditor.show();
                }
            }
            if (this.currentEditor.position) {
                this.currentEditor.position(cellBox);
            }
        }
    };
    // TODOCK: remove this since its usages are covered by grid.getEditorLock().isActive()
    SlickGrid.prototype.getCellEditor = function () {
        return this.currentEditor;
    };
    SlickGrid.prototype.getActiveCell = function () {
        if (!this.activeCellNode) {
            return null;
        }
        else {
            return { row: this.activeRow, cell: this.activeCell };
        }
    };
    SlickGrid.prototype.getActiveCellNode = function () {
        return this.activeCellNode;
    };
    SlickGrid.prototype.scrollRowIntoView = function (rowIndex, doPaging) {
        var rowAtTop = rowIndex * this.options.rowHeight;
        var rowAtBottom = (rowIndex + 1) * this.options.rowHeight - this.contentViewport.height + (this.viewportHasHScroll ? scrollbarDimensions.height : 0);
        // need to page down?
        if ((rowIndex + 1) * this.options.rowHeight > this.scrollTop + this.contentViewport.height + this.offset) {
            this.scrollTo(doPaging ? rowAtTop : rowAtBottom);
            this.render();
        }
        else if (rowIndex * this.options.rowHeight < this.scrollTop + this.offset) {
            // or page up?
            this.scrollTo(doPaging ? rowAtBottom : rowAtTop);
            this.render();
        }
    };
    SlickGrid.prototype.scrollRowToTop = function (row) {
        this.scrollTo(row * this.options.rowHeight);
        this.render();
    };
    SlickGrid.prototype.scrollPage = function (dir) {
        var deltaRows = dir * this.numVisibleRows;
        this.scrollTo((this.getRowFromPosition(this.scrollTop) + deltaRows) * this.options.rowHeight);
        this.render();
        if (this.options.enableCellNavigation && this.activeRow != null) {
            var row = this.activeRow + deltaRows;
            var dataLengthIncludingAddNew = this.getDataLengthIncludingAddNew();
            if (row >= dataLengthIncludingAddNew) {
                row = dataLengthIncludingAddNew - 1;
            }
            if (row < 0) {
                row = 0;
            }
            var cell = 0;
            var prevCell = null;
            var prevActivePosX = this.activePosX;
            while (cell <= this.activePosX) {
                if (this.canCellBeActive(row, cell)) {
                    prevCell = cell;
                }
                cell += this.getColspan(row, cell);
            }
            if (prevCell !== null) {
                this.setActiveCellInternal(this.getCellNode(row, prevCell));
                this.activePosX = prevActivePosX;
            }
            else {
                this.resetActiveCell();
            }
        }
    };
    SlickGrid.prototype.getColspan = function (rowIndex, cell) {
        var metadata = this.data.getItemMetadata && this.data.getItemMetadata(rowIndex);
        if (!metadata || !metadata.columns) {
            return 1;
        }
        var columnData = metadata.columns[this.columns[cell].id] || metadata.columns[cell];
        var colspan = (columnData && columnData.colspan);
        if (colspan === '*') {
            return this.columns.length - cell;
        }
        else {
            return colspan || 1;
        }
    };
    SlickGrid.prototype.findFirstFocusableCell = function (rowIndex) {
        var cell = 0;
        while (cell < this.columns.length) {
            if (this.canCellBeActive(rowIndex, cell)) {
                return cell;
            }
            cell += this.getColspan(rowIndex, cell);
        }
        return null;
    };
    SlickGrid.prototype.findLastFocusableCell = function (rowIndex) {
        var cell = 0;
        var lastFocusableCell = null;
        while (cell < this.columns.length) {
            if (this.canCellBeActive(rowIndex, cell)) {
                lastFocusableCell = cell;
            }
            cell += this.getColspan(rowIndex, cell);
        }
        return lastFocusableCell;
    };
    SlickGrid.prototype.gotoRight = function (row, cell, posX) {
        if (cell >= this.columns.length) {
            return null;
        }
        do {
            cell += this.getColspan(row, cell);
        } while (cell < this.columns.length && !this.canCellBeActive(row, cell));
        if (cell < this.columns.length) {
            return {
                row: row,
                cell: cell,
                posX: cell
            };
        }
        return null;
    };
    SlickGrid.prototype.gotoLeft = function (row, cell, posX) {
        if (cell <= 0) {
            return null;
        }
        var firstFocusableCell = this.findFirstFocusableCell(row);
        if (firstFocusableCell === null || firstFocusableCell >= cell) {
            return null;
        }
        var prev = {
            row: row,
            cell: firstFocusableCell,
            posX: firstFocusableCell
        };
        var pos;
        while (true) {
            pos = this.gotoRight(prev.row, prev.cell, prev.posX);
            if (!pos) {
                return null;
            }
            if (pos.cell >= cell) {
                return prev;
            }
            prev = pos;
        }
    };
    SlickGrid.prototype.gotoDown = function (row, cell, posX) {
        var prevCell;
        var dataLengthIncludingAddNew = this.getDataLengthIncludingAddNew();
        while (true) {
            row++;
            if (row >= dataLengthIncludingAddNew) {
                return null;
            }
            prevCell = cell = 0;
            while (cell <= posX) {
                prevCell = cell;
                cell += this.getColspan(row, cell);
            }
            if (this.canCellBeActive(row, prevCell)) {
                return {
                    row: row,
                    cell: prevCell,
                    posX: posX
                };
            }
        }
    };
    SlickGrid.prototype.gotoUp = function (row, cell, posX) {
        var prevCell;
        while (true) {
            row--;
            if (row < 0) {
                return null;
            }
            prevCell = cell = 0;
            while (cell <= posX) {
                prevCell = cell;
                cell += this.getColspan(row, cell);
            }
            if (this.canCellBeActive(row, prevCell)) {
                return {
                    row: row,
                    cell: prevCell,
                    posX: posX
                };
            }
        }
    };
    SlickGrid.prototype.gotoNext = function (row, cell, posX) {
        if (row == null && cell == null) {
            row = cell = posX = 0;
            if (this.canCellBeActive(row, cell)) {
                return {
                    row: row,
                    cell: cell,
                    posX: cell
                };
            }
        }
        var pos = this.gotoRight(row, cell, posX);
        if (pos) {
            return pos;
        }
        var firstFocusableCell = null;
        var dataLengthIncludingAddNew = this.getDataLengthIncludingAddNew();
        while ((row = row + 1) < dataLengthIncludingAddNew) {
            firstFocusableCell = this.findFirstFocusableCell(row);
            if (firstFocusableCell !== null) {
                return {
                    row: row,
                    cell: firstFocusableCell,
                    posX: firstFocusableCell
                };
            }
        }
        return null;
    };
    SlickGrid.prototype.gotoPrev = function (row, cell, posX) {
        if (row == null && cell == null) {
            row = this.getDataLengthIncludingAddNew() - 1;
            cell = posX = this.columns.length - 1;
            if (this.canCellBeActive(row, cell)) {
                return {
                    row: row,
                    cell: cell,
                    posX: cell
                };
            }
        }
        var pos;
        var lastSelectableCell;
        while (!pos) {
            pos = this.gotoLeft(row, cell, posX);
            if (pos) {
                break;
            }
            row--;
            if (row < 0) {
                return null;
            }
            cell = 0;
            lastSelectableCell = this.findLastFocusableCell(row);
            if (lastSelectableCell !== null) {
                pos = {
                    row: row,
                    cell: lastSelectableCell,
                    posX: lastSelectableCell
                };
            }
        }
        return pos;
    };
    SlickGrid.prototype.navigate = function (dir) {
        if (!this.options.enableCellNavigation) {
            return false;
        }
        if (!this.activeCellNode && dir !== 'prev' && dir !== 'next') {
            return false;
        }
        if (!this.getEditorLock().commitCurrentEdit()) {
            return true;
        }
        this.focus();
        var tabbingDirections = {
            up: -1,
            down: 1,
            left: -1,
            right: 1,
            prev: -1,
            next: 1
        };
        this.tabbingDirection = tabbingDirections[dir];
        var stepFunctions = {
            up: this.gotoUp.bind(this),
            down: this.gotoDown.bind(this),
            left: this.gotoLeft.bind(this),
            right: this.gotoRight.bind(this),
            prev: this.gotoPrev.bind(this),
            next: this.gotoNext.bind(this)
        };
        var stepFn = stepFunctions[dir];
        var pos = stepFn(this.activeRow, this.activeCell, this.activePosX);
        if (pos) {
            var isAddNewRow = (pos.row === this.data.getLength());
            this.scrollCellIntoView(pos.row, pos.cell, (this.options.skipPaging ? false : !isAddNewRow));
            this.setActiveCellInternal(this.getCellNode(pos.row, pos.cell));
            this.activePosX = pos.posX;
            return true;
        }
        else {
            this.setActiveCellInternal(this.getCellNode(this.activeRow, this.activeCell));
            return false;
        }
    };
    SlickGrid.prototype.getCellNode = function (rowIndex, cell) {
        if (rowIndex === null || cell === null) {
            return null;
        }
        if (this.rowsCache[rowIndex]) {
            this.ensureCellNodesInRowsCache(rowIndex);
            return this.rowsCache[rowIndex].cellNodesByColumnIdx[cell];
        }
        return null;
    };
    SlickGrid.prototype.setActiveCell = function (rowIndex, columnIndex, settings) {
        if (settings === void 0) { settings = {}; }
        if (!this.initialized) {
            return;
        }
        settings = $.extend({ scrollIntoView: true }, settings);
        if (rowIndex > this.data.getLength() || rowIndex < 0 || columnIndex >= this.columns.length || columnIndex < 0) {
            return;
        }
        if (!this.options.enableCellNavigation) {
            return;
        }
        if (settings.scrollIntoView)
            this.scrollCellIntoView(rowIndex, columnIndex, false);
        this.setActiveCellInternal(this.getCellNode(rowIndex, columnIndex), false);
    };
    SlickGrid.prototype.canCellBeActive = function (rowIndex, columnIndex) {
        if (!this.options.enableCellNavigation || rowIndex >= this.getDataLengthIncludingAddNew() ||
            rowIndex < 0 || columnIndex >= this.columns.length || columnIndex < 0) {
            return false;
        }
        var rowMetadata = this.data.getItemMetadata && this.data.getItemMetadata(rowIndex);
        var columnMetadata = rowMetadata && rowMetadata.columns && (rowMetadata.columns[this.columns[columnIndex].id] || rowMetadata.columns[columnIndex]);
        if (columnMetadata && typeof columnMetadata.focusable === 'boolean') {
            return columnMetadata.focusable;
        }
        if (rowMetadata && typeof rowMetadata.focusable === 'boolean') {
            return rowMetadata.focusable;
        }
        return Boolean(this.columns[columnIndex].focusable && this.isColumnVisible(this.columns[columnIndex]));
    };
    // Given an array of column indexes, return true if the lowest index and the highest index span across the column that is marked as pinned.
    SlickGrid.prototype.crossesPinnedArea = function (indices) {
        if (this.options.pinnedColumn == null || !indices || indices.length < 2) {
            return false; // can't cross a boundary if there are 0 or 1 indices, or if columns aren't pinned
        }
        var max = Math.max.apply(null, indices);
        var min = Math.min.apply(null, indices);
        if (min <= this.options.pinnedColumn && max > this.options.pinnedColumn) {
            return true;
        }
        else {
            return false;
        }
    };
    SlickGrid.prototype.canCellBeSelected = function (rowIndex, columnIndex) {
        if (rowIndex >= this.data.getLength() || rowIndex < 0 || columnIndex >= this.columns.length || columnIndex < 0) {
            return false;
        }
        var rowMetadata = this.data.getItemMetadata && this.data.getItemMetadata(rowIndex);
        var columnMetadata = rowMetadata && rowMetadata.columns && (rowMetadata.columns[this.columns[columnIndex].id] || rowMetadata.columns[columnIndex]);
        if (columnMetadata && typeof columnMetadata.selectable === 'boolean') {
            return columnMetadata.selectable;
        }
        if (rowMetadata && typeof rowMetadata.selectable === 'boolean') {
            return rowMetadata.selectable;
        }
        return Boolean(this.columns[columnIndex].selectable);
    };
    SlickGrid.prototype.gotoCell = function (rowIndex, columnIndex, forceEdit) {
        if (!this.initialized) {
            return;
        }
        if (!this.canCellBeActive(rowIndex, columnIndex)) {
            return;
        }
        if (!this.getEditorLock().commitCurrentEdit()) {
            return;
        }
        this.scrollCellIntoView(rowIndex, columnIndex, false);
        var newCell = this.getCellNode(rowIndex, columnIndex);
        // if selecting the 'add new' rowIndex, start editing right away
        this.setActiveCellInternal(newCell, forceEdit || (rowIndex === this.data.getLength()) || this.options.autoEdit);
        // if no editor was created, set the focus back on the grid
        if (!this.currentEditor) {
            this.focus();
        }
    };
    //////////////////////////////////////////////////////////////////////////////////////////////
    // IEditor implementation for the editor lock
    SlickGrid.prototype.commitCurrentEdit = function () {
        var _this = this;
        var item = this.getDataItem(this.activeRow);
        var column = this.columns[this.activeCell];
        if (this.currentEditor) {
            if (this.currentEditor.isValueChanged()) {
                var validationResults = this.currentEditor.validate();
                if (validationResults.valid) {
                    if (this.activeRow < this.data.getLength()) {
                        var editCommand_1 = {
                            row: this.activeRow,
                            cell: this.activeCell,
                            editor: this.currentEditor,
                            serializedValue: this.currentEditor.serializeValue(),
                            prevSerializedValue: this.serializedEditorValue,
                            execute: function () {
                                editCommand_1.editor.applyValue(item, editCommand_1.serializedValue);
                                _this.updateRow(editCommand_1.row);
                                _this.trigger(_this.onCellChange, {
                                    row: _this.activeRow,
                                    cell: _this.activeCell,
                                    item: item
                                });
                            },
                            undo: function () {
                                editCommand_1.editor.applyValue(item, editCommand_1.prevSerializedValue);
                                _this.updateRow(editCommand_1.row);
                                _this.trigger(_this.onCellChange, {
                                    row: _this.activeRow,
                                    cell: _this.activeCell,
                                    item: item
                                });
                            }
                        };
                        if (this.options.editCommandHandler) {
                            this.makeActiveCellNormal();
                            this.options.editCommandHandler(item, column, editCommand_1);
                        }
                        else {
                            editCommand_1.execute();
                            this.makeActiveCellNormal();
                        }
                    }
                    else {
                        var newItem = {};
                        this.currentEditor.applyValue(newItem, this.currentEditor.serializeValue());
                        this.makeActiveCellNormal();
                        this.trigger(this.onAddNewRow, { item: newItem, column: column });
                    }
                    // check whether the lock has been re-acquired by event handlers
                    return !this.getEditorLock().isActive();
                }
                else {
                    // Re-add the CSS class to trigger transitions, if any.
                    if (this.activeCellNode) {
                        $(this.activeCellNode).removeClass('invalid');
                        $(this.activeCellNode).width(); // force layout
                        $(this.activeCellNode).addClass('invalid');
                    }
                    this.trigger(this.onValidationError, {
                        editor: this.currentEditor,
                        cellNode: this.activeCellNode,
                        validationResults: validationResults,
                        row: this.activeRow,
                        cell: this.activeCell,
                        column: column
                    });
                    this.currentEditor.focus();
                    return false;
                }
            }
            this.makeActiveCellNormal();
        }
        return true;
    };
    SlickGrid.prototype.cancelCurrentEdit = function () {
        this.makeActiveCellNormal();
        return true;
    };
    SlickGrid.prototype.rowsToRanges = function (rows) {
        var ranges = [];
        var lastCell = this.columns.length - 1;
        for (var i = 0; i < rows.length; i++) {
            ranges.push(new Range(rows[i], 0, rows[i], lastCell));
        }
        return ranges;
    };
    SlickGrid.prototype.getSelectedRows = function () {
        if (!this.selectionModel) {
            throw 'Selection model is not set';
        }
        return this.selectedRows;
    };
    SlickGrid.prototype.setSelectedRows = function (rows) {
        if (!this.selectionModel) {
            throw 'Selection model is not set';
        }
        this.selectionModel.setSelectedRanges(this.rowsToRanges(rows));
    };
    SlickGrid.prototype.isGroupNode = function (row, cell) {
        var node = this.getCellNode(row, cell);
        if (!node)
            return false;
        return $(node)
            .parents('.slick-group')
            .length > 0;
    };
    SlickGrid.prototype.getHiddenCssClass = function (index) {
        var column = this.columns[index];
        if (!column.isHidden)
            return null;
        if (column.showHidden)
            return 'show-hidden';
        return 'isHidden';
    };
    SlickGrid.prototype.getColumnVisibleWidth = function (column) {
        return this.isColumnVisible(column) ? column.width : 0;
    };
    SlickGrid.prototype.refreshColumns = function () {
        this.setColumns(this.columns, { forceUpdate: true, skipResizeCanvas: false });
    };
    SlickGrid.prototype.hideColumn = function (column) {
        column.isHidden = true;
        delete (column.showHidden);
    };
    SlickGrid.prototype.unhideColumn = function (column) {
        delete (column.isHidden);
        delete (column.showHidden);
    };
    SlickGrid.prototype.iterateColumnsInDirection = function (column, columnDirection, fn) {
        var startIndex = this.getColumnIndex(column.id) + columnDirection;
        var value;
        if (columnDirection === SlickGrid.COLUMNS_TO_LEFT) {
            for (var i = startIndex; i >= 0; i--) {
                value = fn(this.columns[i], i);
                if (value)
                    return value;
            }
        }
        else if (columnDirection === SlickGrid.COLUMNS_TO_RIGHT) {
            var l = this.columns.length;
            for (var i_5 = startIndex; i_5 < l; i_5++) {
                value = fn(this.columns[i_5], i_5);
                if (value)
                    return value;
            }
        }
        else {
            throw new RangeError('columnDirection must be -1 or 1.');
        }
    };
    SlickGrid.prototype.showAdjacentHiddenColumns = function (column, columnDirection) {
        this.iterateColumnsInDirection(column, columnDirection, function (column) {
            if (!column.isHidden)
                return true;
            column.showHidden = true;
        });
    };
    SlickGrid.prototype.getNextVisibleColumn = function (column, columnDirection) {
        var _this = this;
        return this.iterateColumnsInDirection(column, columnDirection, function (column) {
            if (_this.isColumnVisible(column))
                return column;
        });
    };
    SlickGrid.prototype.isColumnHidden = function (column) {
        return Boolean(column.isHidden);
    };
    SlickGrid.prototype.isColumnInvisible = function (column) {
        return Boolean(column.isHidden && !column.showHidden);
    };
    SlickGrid.prototype.isColumnVisible = function (column) {
        return Boolean(!column.isHidden || column.showHidden);
    };
    SlickGrid.prototype.isHiddenColumnVisible = function (column) {
        return Boolean(column.isHidden && column.showHidden);
    };
    SlickGrid.prototype.isAnyColumnHidden = function () {
        return this.columns.some(this.isColumnHidden);
    };
    SlickGrid.prototype.isAnyColumnInvisible = function () {
        var _this = this;
        return this.columns.some(function (column) {
            return _this.isColumnInvisible(column);
        });
    };
    SlickGrid.prototype.toggleHiddenColumns = function () {
        var showHidden = this.isAnyColumnInvisible();
        this.columns.filter(this.isColumnHidden).forEach(function (column) {
            column.showHidden = showHidden;
        });
    };
    SlickGrid.prototype.getColumnsFromIndices = function (indices) {
        var _this = this;
        return indices.map(function (index) {
            return _this.columns[index];
        });
    };
    SlickGrid.prototype.withTransaction = function (fn) {
        this.data.beginUpdate();
        try {
            fn();
        }
        catch (e) {
            console.error('Error caught in SlickGrid transaction', e);
        }
        finally {
            this.data.endUpdate();
            this.invalidateSafe();
        }
    };
    return SlickGrid;
}());
// constants
SlickGrid.COLUMNS_TO_LEFT = COLUMNS_TO_LEFT;
SlickGrid.COLUMNS_TO_RIGHT = COLUMNS_TO_RIGHT;

/**
 * @license
 * (c) 2016-2017 Coatue Management LLC
 * (c) 2009-2013 Michael Leibman
 * https://github.com/coatue-oss/slickgrid2
 *
 * Distributed under MIT license.
 * All rights reserved.
 */
// make sure required JavaScript modules are loaded
if (typeof jQuery === 'undefined')
    throw new Error('slickgrid2 requires jquery module to be loaded');
if (jQuery.fn.drag == null)
    throw new Error('slickgrid2 requires jquery.event.drag module to be loaded');

exports.AvgAggregator = AvgAggregator;
exports.Aggregator = Aggregator;
exports.MaxAggregator = MaxAggregator;
exports.MinAggregator = MinAggregator;
exports.SumAggregator = SumAggregator;
exports.DataView = DataView;
exports.Editor = Editor;
exports.TextEditor = TextEditor;
exports.EditorLock = EditorLock;
exports.Event = Event;
exports.EventData = EventData;
exports.EventHandler = EventHandler;
exports.GlobalEditorLock = GlobalEditorLock;
exports.Group = Group;
exports.GroupTotals = GroupTotals;
exports.NonDataItem = NonDataItem;
exports.Range = Range;
exports.COLUMNS_TO_LEFT = COLUMNS_TO_LEFT;
exports.COLUMNS_TO_RIGHT = COLUMNS_TO_RIGHT;
exports.SlickGrid = SlickGrid;
exports.GroupItemMetadataProvider = GroupItemMetadataProvider;

Object.defineProperty(exports, '__esModule', { value: true });

})));
