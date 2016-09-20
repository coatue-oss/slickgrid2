/***
 * Contains core SlickGrid classes.
 * @module Core
 * @namespace Slick
 */

/***
 * An event object for passing data to event handlers and letting them control propagation.
 * <p>This is pretty much identical to how W3C and jQuery implement events.</p>
 * @class EventData
 * @constructor
 */
export class EventData {
  private state = {
    isPropagationStopped: false,
    isImmediatePropagationStopped: false
  };

  /***
   * Stops event from propagating up the DOM tree.
   * @method stopPropagation
   */
  stopPropagation() {
    this.state.isPropagationStopped = true;
  }

  /***
   * Returns whether stopPropagation was called on this event object.
   * @method isPropagationStopped
   * @return {Boolean}
   */
  isPropagationStopped() {
    return this.state.isPropagationStopped;
  }

  /***
   * Prevents the rest of the handlers from being executed.
   * @method stopImmediatePropagation
   */
  stopImmediatePropagation() {
    this.state.isImmediatePropagationStopped = true;
  }

  /***
   * Returns whether stopImmediatePropagation was called on this event object.\
   * @method isImmediatePropagationStopped
   * @return {Boolean}
   */
  isImmediatePropagationStopped() {
    return this.state.isImmediatePropagationStopped;
  }
}

/***
 * A simple publisher-subscriber implementation.
 * @class Event
 * @constructor
 */
export class Event {
  private handlers = [];

  /***
   * Adds an event handler to be called when the event is fired.
   * <p>Event handler will receive two arguments - an <code>EventData</code> and the <code>data</code>
   * object the event was fired with.<p>
   * @method subscribe
   * @param fn {Function} Event handler.
   */
  subscribe(fn) {
    this.handlers.push(fn);
  }

  /***
   * Removes an event handler added with <code>subscribe(fn)</code>.
   * @method unsubscribe
   * @param fn {Function} Event handler to be removed.
   */
  unsubscribe(fn) {
    for (var i = this.handlers.length - 1; i >= 0; i--) {
      if (this.handlers[i] === fn) {
        this.handlers.splice(i, 1);
      }
    }
  }

  /***
   * Fires an event notifying all subscribers.
   * @method notify
   * @param args {Object} Additional data object to be passed to all handlers.
   * @param e {EventData}
   *      Optional.
   *      An <code>EventData</code> object to be passed to all handlers.
   *      For DOM events, an existing W3C/jQuery event object can be passed in.
   * @param scope {Object}
   *      Optional.
   *      The scope ("this") within which the handler will be executed.
   *      If not specified, the scope will be set to the <code>Event</code> instance.
   */
  notify(args, e, scope) {
    e = e || new EventData();
    scope = scope || this;

    var returnValue;
    for (var i = 0; i < this.handlers.length && !(e.isPropagationStopped() || e.isImmediatePropagationStopped()); i++) {
      returnValue = this.handlers[i].call(scope, e, args);
    }

    return returnValue;
  }
}

export class EventHandler {
  private handlers = [];

  subscribe(event, handler) {
    this.handlers.push({
      event: event,
      handler: handler
    });
    event.subscribe(handler);

    return this;  // allow chaining
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

    return this;  // allow chaining
  }

  unsubscribeAll() {
    var i = this.handlers.length;
    while (i--) {
      this.handlers[i].event.unsubscribe(this.handlers[i].handler);
    }
    this.handlers = [];

    return this;  // allow chaining
  }
}

/***
 * A structure containing a range of cells.
 * @class Range
 * @constructor
 * @param fromRow {Integer} Starting row.
 * @param fromCell {Integer} Starting cell.
 * @param toRow {Integer} Optional. Ending row. Defaults to <code>fromRow</code>.
 * @param toCell {Integer} Optional. Ending cell. Defaults to <code>fromCell</code>.
 */
export class Range {
  fromRow: number;
  fromCell: number;
  toRow: number;
  toCell: number;

  constructor(fromRow: number, fromCell: number, toRow: number = fromRow, toCell: number = fromCell) {

    /***
     * @property fromRow
     * @type {Integer}
     */
    this.fromRow = Math.min(fromRow, toRow);

    /***
     * @property fromCell
     * @type {Integer}
     */
    this.fromCell = Math.min(fromCell, toCell);

    /***
     * @property toRow
     * @type {Integer}
     */
    this.toRow = Math.max(fromRow, toRow);

    /***
     * @property toCell
     * @type {Integer}
     */
    this.toCell = Math.max(fromCell, toCell);
  }

  /***
   * Returns whether a range represents a single row.
   * @method isSingleRow
   * @return {Boolean}
   */
  isSingleRow() {
    return this.fromRow == this.toRow;
  };

  /***
   * Returns whether a range represents a single cell.
   * @method isSingleCell
   * @return {Boolean}
   */
  isSingleCell() {
    return this.fromRow == this.toRow && this.fromCell == this.toCell;
  };

  /***
   * Returns whether a range contains a given cell.
   * @method contains
   * @param row {Integer}
   * @param cell {Integer}
   * @return {Boolean}
   */
  contains(row: number, cell: number) {
    return row >= this.fromRow && row <= this.toRow &&
        cell >= this.fromCell && cell <= this.toCell;
  };

  /***
   * Returns a readable representation of a range.
   * @method toString
   * @return {String}
   */
  toString(): string {
    if (this.isSingleCell()) {
      return "(" + this.fromRow + ":" + this.fromCell + ")";
    }
    else {
      return "(" + this.fromRow + ":" + this.fromCell + " - " + this.toRow + ":" + this.toCell + ")";
    }
  }
}


/***
 * A base class that all special / non-data rows (like Group and GroupTotals) derive from.
 * @class NonDataItem
 * @constructor
 */
export class NonDataItem {
  __nonDataRow = true;
}


/***
 * Information about a group of rows.
 * @class Group
 * @extends Slick.NonDataItem
 * @constructor
 */
export class Group extends NonDataItem {
  __group = true;

  /**
   * Grouping level, starting with 0.
   * @property level
   * @type {Number}
   */
  level = 0;

  /***
   * Number of rows in the group.
   * @property count
   * @type {Integer}
   */
  count = 0;

  /***
   * Grouping value.
   * @property value
   * @type {Object}
   */
  value = null;

  /***
   * Formatted display value of the group.
   * @property title
   * @type {String}
   */
  title = null;

  /***
   * Whether a group is collapsed.
   * @property collapsed
   * @type {Boolean}
   */
  collapsed = false;

  /***
   * GroupTotals, if any.
   * @property totals
   * @type {GroupTotals}
   */
  totals = null;

  /**
   * Rows that are part of the group.
   * @property rows
   * @type {Array}
   */
  rows = [];

  /**
   * Sub-groups that are part of the group.
   * @property groups
   * @type {Array}
   */
  groups = null;

  /**
   * A unique key used to identify the group.  This key can be used in calls to DataView
   * collapseGroup() or expandGroup().
   * @property groupingKey
   * @type {Object}
   */
  groupingKey = null;

  /***
   * Compares two Group instances.
   * @method equals
   * @return {Boolean}
   * @param group {Group} Group instance to compare to.
   */
  equals(group: Group) {
    return this.value === group.value &&
      this.count === group.count &&
      this.collapsed === group.collapsed &&
      this.title === group.title;
  }
};

/***
 * Information about group totals.
 * An instance of GroupTotals will be created for each totals row and passed to the aggregators
 * so that they can store arbitrary data in it.  That data can later be accessed by group totals
 * formatters during the display.
 * @class GroupTotals
 * @extends Slick.NonDataItem
 * @constructor
 */
export class GroupTotals extends NonDataItem {
  __groupTotals = true;

  /***
   * Parent Group.
   * @param group
   * @type {Group}
   */
  group = null;

  /***
   * Whether the totals have been fully initialized / calculated.
   * Will be set to false for lazy-calculated group totals.
   * @param initialized
   * @type {Boolean}
   */
  initialized = false;
}

/***
 * A locking helper to track the active edit controller and ensure that only a single controller
 * can be active at a time.  This prevents a whole class of state and validation synchronization
 * issues.  An edit controller (such as SlickGrid) can query if an active edit is in progress
 * and attempt a commit or cancel before proceeding.
 * @class EditorLock
 * @constructor
 */
export class EditorLock {
  private activeEditController = null;

  /***
   * Returns true if a specified edit controller is active (has the edit lock).
   * If the parameter is not specified, returns true if any edit controller is active.
   * @method isActive
   * @param editController {EditController}
   * @return {Boolean}
   */
  isActive(editController) {
    return (editController ? this.activeEditController === editController : this.activeEditController !== null);
  }

  /***
   * Sets the specified edit controller as the active edit controller (acquire edit lock).
   * If another edit controller is already active, and exception will be thrown.
   * @method activate
   * @param editController {EditController} edit controller acquiring the lock
   */
  activate(editController) {
    if (editController === this.activeEditController) { // already activated?
      return;
    }
    if (this.activeEditController !== null) {
      throw "SlickGrid.EditorLock.activate: an editController is still active, can't activate another editController";
    }
    if (!editController.commitCurrentEdit) {
      throw "SlickGrid.EditorLock.activate: editController must implement .commitCurrentEdit()";
    }
    if (!editController.cancelCurrentEdit) {
      throw "SlickGrid.EditorLock.activate: editController must implement .cancelCurrentEdit()";
    }
    this.activeEditController = editController;
  }

  /***
   * Unsets the specified edit controller as the active edit controller (release edit lock).
   * If the specified edit controller is not the active one, an exception will be thrown.
   * @method deactivate
   * @param editController {EditController} edit controller releasing the lock
   */
  deactivate(editController) {
    if (this.activeEditController !== editController) {
      throw "SlickGrid.EditorLock.deactivate: specified editController is not the currently active one";
    }
    this.activeEditController = null;
  }

  /***
   * Attempts to commit the current edit by calling "commitCurrentEdit" method on the active edit
   * controller and returns whether the commit attempt was successful (commit may fail due to validation
   * errors, etc.).  Edit controller's "commitCurrentEdit" must return true if the commit has succeeded
   * and false otherwise.  If no edit controller is active, returns true.
   * @method commitCurrentEdit
   * @return {Boolean}
   */
  commitCurrentEdit() {
    return (this.activeEditController ? this.activeEditController.commitCurrentEdit() : true);
  }

  /***
   * Attempts to cancel the current edit by calling "cancelCurrentEdit" method on the active edit
   * controller and returns whether the edit was successfully cancelled.  If no edit controller is
   * active, returns true.
   * @method cancelCurrentEdit
   * @return {Boolean}
   */
  cancelCurrentEdit() {
    return (this.activeEditController ? this.activeEditController.cancelCurrentEdit() : true);
  }
}

/***
 * A global singleton editor lock.
 * @class GlobalEditorLock
 * @static
 * @constructor
 */
export const GlobalEditorLock = new EditorLock();
