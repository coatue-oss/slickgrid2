var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
export { EventData };
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
export { Event };
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
export { EventHandler };
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
export { Range };
/**
 * A base class that all special / non-data rows (like Group and GroupTotals) derive from.
 */
var NonDataItem = (function () {
    function NonDataItem() {
        this.__nonDataRow = true;
    }
    return NonDataItem;
}());
export { NonDataItem };
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
export { Group };
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
export { GroupTotals };
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
export { EditorLock };
/**
 * A global singleton editor lock.
 */
export var GlobalEditorLock = new EditorLock();
