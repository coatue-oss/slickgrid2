/**
 * An event object for passing data to event handlers and letting them control propagation.
 *
 * This is pretty much identical to how W3C and jQuery implement events.
 */
export class EventData {
    constructor() {
        this.state = {
            isPropagationStopped: false,
            isImmediatePropagationStopped: false
        };
    }
    /**
     * Stops event from propagating up the DOM tree.
     */
    stopPropagation() {
        this.state.isPropagationStopped = true;
    }
    /**
     * Returns whether stopPropagation was called on this event object.
     */
    isPropagationStopped() {
        return this.state.isPropagationStopped;
    }
    /**
     * Prevents the rest of the handlers from being executed.
     */
    stopImmediatePropagation() {
        this.state.isImmediatePropagationStopped = true;
    }
    /**
     * Returns whether stopImmediatePropagation was called on this event object.
     */
    isImmediatePropagationStopped() {
        return this.state.isImmediatePropagationStopped;
    }
}
/**
 * A simple publisher-subscriber implementation.
 */
export class Event {
    constructor() {
        this.handlers = [];
    }
    /**
     * Adds an event handler to be called when the event is fired.
     *
     * Event handler will receive two arguments - an `EventData` and the `data`
     * object the event was fired with.
     */
    subscribe(fn) {
        this.handlers.push(fn);
    }
    /**
     * Removes an event handler added with `subscribe(fn)`.
     */
    unsubscribe(fn) {
        for (var i = this.handlers.length - 1; i >= 0; i--) {
            if (this.handlers[i] === fn) {
                this.handlers.splice(i, 1);
            }
        }
    }
    /**
     * Fires an event notifying all subscribers.
     */
    notify(args, e, scope = this) {
        if (!e) {
            e = new EventData;
        }
        var returnValue;
        for (var i = 0; i < this.handlers.length && !(e.isPropagationStopped() || e.isImmediatePropagationStopped()); i++) {
            returnValue = this.handlers[i].call(scope, e, args);
        }
        return returnValue;
    }
}
export class EventHandler {
    constructor() {
        this.handlers = [];
    }
    subscribe(event, handler) {
        this.handlers.push({
            event: event,
            handler: handler
        });
        event.subscribe(handler);
        return this; // allow chaining
    }
    unsubscribe(event, handler) {
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
    }
    unsubscribeAll() {
        var i = this.handlers.length;
        while (i--) {
            this.handlers[i].event.unsubscribe(this.handlers[i].handler);
        }
        this.handlers = [];
        return this; // allow chaining
    }
}
/**
 * A structure containing a range of cells.
 */
export class Range {
    constructor(fromRow, fromCell, toRow = fromRow, toCell = fromCell) {
        this.fromRow = Math.min(fromRow, toRow);
        this.fromCell = Math.min(fromCell, toCell);
        this.toRow = Math.max(fromRow, toRow);
        this.toCell = Math.max(fromCell, toCell);
    }
    /**
     * Returns whether a range represents a single row.
     */
    isSingleRow() {
        return this.fromRow === this.toRow;
    }
    /**
     * Returns whether a range represents a single cell.
     */
    isSingleCell() {
        return this.fromRow === this.toRow && this.fromCell === this.toCell;
    }
    /**
     * Returns whether a range contains a given cell.
     */
    contains(row, cell) {
        return row >= this.fromRow && row <= this.toRow &&
            cell >= this.fromCell && cell <= this.toCell;
    }
    /**
     * Returns a readable representation of a range.
     */
    toString() {
        if (this.isSingleCell()) {
            return '(' + this.fromRow + ':' + this.fromCell + ')';
        }
        else {
            return '(' + this.fromRow + ':' + this.fromCell + ' - ' + this.toRow + ':' + this.toCell + ')';
        }
    }
}
/**
 * A base class that all special / non-data rows (like Group and GroupTotals) derive from.
 */
export class NonDataItem {
    constructor() {
        this.__nonDataRow = true;
    }
}
/**
 * Information about a group of rows.
 */
export class Group extends NonDataItem {
    constructor() {
        super(...arguments);
        this.__group = true;
        this.initialized = false;
        this.statResult = undefined;
        /**
         * Grouping level, starting with 0.
         */
        this.level = 0;
        /**
         * Number of rows in the group.
         */
        this.count = 0;
        /**
         * Grouping value.
         */
        this.value = null;
        /**
         * Formatted display value of the group.
         */
        this.title = null;
        /**
         * Whether a group is collapsed.
         */
        this.collapsed = false;
        /**
         * GroupTotals, if any.
         */
        this.totals = null;
        /**
         * Rows that are part of the group.
         * @property rows
         * @type {Array}
         */
        this.rows = [];
        /**
         * Sub-groups that are part of the group.
         */
        this.groups = null;
    }
    /**
     * Compares two Group instances.
     */
    equals(group) {
        return this.value === group.value &&
            this.count === group.count &&
            this.collapsed === group.collapsed &&
            this.title === group.title;
    }
}
/**
 * Information about group totals.
 * An instance of GroupTotals will be created for each totals row and passed to the aggregators
 * so that they can store arbitrary data in it.  That data can later be accessed by group totals
 * formatters during the display.
 */
export class GroupTotals extends NonDataItem {
    constructor() {
        super(...arguments);
        this.__groupTotals = true;
        /**
         * Parent Group.
         */
        this.group = null;
        /**
         * Whether the totals have been fully initialized / calculated.
         * Will be set to false for lazy-calculated group totals.
         */
        this.initialized = false;
    }
}
/**
 * A locking helper to track the active edit controller and ensure that only a single controller
 * can be active at a time.  This prevents a whole class of state and validation synchronization
 * issues.  An edit controller (such as SlickGrid) can query if an active edit is in progress
 * and attempt a commit or cancel before proceeding.
 */
export class EditorLock {
    constructor() {
        this.activeEditController = null;
    }
    /**
     * Returns true if a specified edit controller is active (has the edit lock).
     * If the parameter is not specified, returns true if any edit controller is active.
     */
    isActive(editController) {
        return (editController ? this.activeEditController === editController : this.activeEditController !== null);
    }
    /**
     * Sets the specified edit controller as the active edit controller (acquire edit lock).
     * If another edit controller is already active, and exception will be thrown.
     */
    activate(editController) {
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
    }
    /**
     * Unsets the specified edit controller as the active edit controller (release edit lock).
     * If the specified edit controller is not the active one, an exception will be thrown.
     */
    deactivate(editController) {
        if (this.activeEditController !== editController) {
            throw 'SlickGrid.EditorLock.deactivate: specified editController is not the currently active one';
        }
        this.activeEditController = null;
    }
    /**
     * Attempts to commit the current edit by calling "commitCurrentEdit" method on the active edit
     * controller and returns whether the commit attempt was successful (commit may fail due to validation
     * errors, etc.).  Edit controller's "commitCurrentEdit" must return true if the commit has succeeded
     * and false otherwise.  If no edit controller is active, returns true.
     */
    commitCurrentEdit() {
        return (this.activeEditController ? this.activeEditController.commitCurrentEdit() : true);
    }
    /**
     * Attempts to cancel the current edit by calling "cancelCurrentEdit" method on the active edit
     * controller and returns whether the edit was successfully cancelled.  If no edit controller is
     * active, returns true.
     */
    cancelCurrentEdit() {
        return (this.activeEditController ? this.activeEditController.cancelCurrentEdit() : true);
    }
}
/**
 * A global singleton editor lock.
 */
export const GlobalEditorLock = new EditorLock();
