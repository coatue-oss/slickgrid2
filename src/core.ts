import { Item } from './dataview'

/**
 * Contains core SlickGrid classes.
 * @module Core
 * @namespace Slick
 */

export interface EditController {
  cancelCurrentEdit(): boolean
  commitCurrentEdit(): boolean
}

/**
 * An event object for passing data to event handlers and letting them control propagation.
 *
 * This is pretty much identical to how W3C and jQuery implement events.
 */
export class EventData {
  private state = {
    isPropagationStopped: false,
    isImmediatePropagationStopped: false
  }

  /**
   * Stops event from propagating up the DOM tree.
   */
  stopPropagation(): void {
    this.state.isPropagationStopped = true
  }

  /**
   * Returns whether stopPropagation was called on this event object.
   */
  isPropagationStopped(): boolean {
    return this.state.isPropagationStopped
  }

  /**
   * Prevents the rest of the handlers from being executed.
   */
  stopImmediatePropagation(): void {
    this.state.isImmediatePropagationStopped = true
  }

  /**
   * Returns whether stopImmediatePropagation was called on this event object.
   */
  isImmediatePropagationStopped(): boolean {
    return this.state.isImmediatePropagationStopped
  }
}

type Handler<T> = ($event: JQueryEventObject, args: T) => any

/**
 * A simple publisher-subscriber implementation.
 */
export class Event<T> {
  private handlers: Handler<T>[] = []

  /**
   * Adds an event handler to be called when the event is fired.
   *
   * Event handler will receive two arguments - an `EventData` and the `data`
   * object the event was fired with.
   */
  subscribe(fn: Handler<T>): void {
    this.handlers.push(fn)
  }

  /**
   * Removes an event handler added with `subscribe(fn)`.
   */
  unsubscribe(fn: Handler<T>): void {
    for (var i = this.handlers.length - 1; i >= 0; i--) {
      if (this.handlers[i] === fn) {
        this.handlers.splice(i, 1)
      }
    }
  }

  /**
   * Fires an event notifying all subscribers.
   */
  notify(args: T, e?: EventData | null, scope: any = this) {

    if (!e) {
      e = new EventData
    }

    var returnValue
    for (var i = 0; i < this.handlers.length && !(e.isPropagationStopped() || e.isImmediatePropagationStopped()); i++) {
      returnValue = this.handlers[i].call(scope, e, args)
    }

    return returnValue
  }
}

export class EventHandler {
  private handlers: { event: any, handler: Function }[] = []

  subscribe(event, handler) {
    this.handlers.push({
      event: event,
      handler: handler
    })
    event.subscribe(handler)

    return this  // allow chaining
  }

  unsubscribe(event, handler) {
    var i = this.handlers.length
    while (i--) {
      if (this.handlers[i].event === event &&
          this.handlers[i].handler === handler) {
        this.handlers.splice(i, 1)
        event.unsubscribe(handler)
        return
      }
    }

    return this  // allow chaining
  }

  unsubscribeAll() {
    var i = this.handlers.length
    while (i--) {
      this.handlers[i].event.unsubscribe(this.handlers[i].handler)
    }
    this.handlers = []

    return this  // allow chaining
  }
}

/**
 * A structure containing a range of cells.
 */
export class Range {
  fromRow: number
  fromCell: number
  toRow: number
  toCell: number

  constructor(fromRow: number, fromCell: number, toRow: number = fromRow, toCell: number = fromCell) {
    this.fromRow = Math.min(fromRow, toRow)
    this.fromCell = Math.min(fromCell, toCell)
    this.toRow = Math.max(fromRow, toRow)
    this.toCell = Math.max(fromCell, toCell)
  }

  /**
   * Returns whether a range represents a single row.
   */
  isSingleRow(): boolean {
    return this.fromRow === this.toRow
  }

  /**
   * Returns whether a range represents a single cell.
   */
  isSingleCell(): boolean {
    return this.fromRow === this.toRow && this.fromCell === this.toCell
  }

  /**
   * Returns whether a range contains a given cell.
   */
  contains(row: number, cell: number): boolean {
    return row >= this.fromRow && row <= this.toRow &&
        cell >= this.fromCell && cell <= this.toCell
  }

  /**
   * Returns a readable representation of a range.
   */
  toString(): string {
    if (this.isSingleCell()) {
      return '(' + this.fromRow + ':' + this.fromCell + ')'
    } else {
      return '(' + this.fromRow + ':' + this.fromCell + ' - ' + this.toRow + ':' + this.toCell + ')'
    }
  }
}


/**
 * A base class that all special / non-data rows (like Group and GroupTotals) derive from.
 */
export class NonDataItem {
  __nonDataRow = true
}

export interface Stat {
  raw: number
  formatted: string
  symbol: string | null
  stat: string // same as symbol.id
}

/**
 * Information about a group of rows.
 */
export class Group extends NonDataItem {
  __group = true
  initialized = false
  statResult: { [columnKey: string]: Stat } | undefined = undefined

  /**
   * Grouping level, starting with 0.
   */
  level = 0

  /**
   * Number of rows in the group.
   */
  count = 0

  /**
   * Grouping value.
   */
  value: any | null = null

  /**
   * Formatted display value of the group.
   */
  title: string | null = null

  /**
   * Whether a group is collapsed.
   */
  collapsed = false

  /**
   * GroupTotals, if any.
   */
  totals: GroupTotals | null = null

  /**
   * Rows that are part of the group.
   * @property rows
   * @type {Array}
   */
  rows: Item[] = []

  /**
   * Sub-groups that are part of the group.
   */
  groups: Group[] | null = null

  /**
   * A unique key used to identify the group.  This key can be used in calls to DataView
   * collapseGroup() or expandGroup().
   */
  groupingKey: string | null = null

  /**
   * Compares two Group instances.
   */
  equals(group: Group): boolean {
    return this.value === group.value &&
      this.count === group.count &&
      this.collapsed === group.collapsed &&
      this.title === group.title
  }
};

/**
 * Information about group totals.
 * An instance of GroupTotals will be created for each totals row and passed to the aggregators
 * so that they can store arbitrary data in it.  That data can later be accessed by group totals
 * formatters during the display.
 */
export class GroupTotals extends NonDataItem {
  __groupTotals = true

  /**
   * Parent Group.
   */
  group: Group | null = null

  /**
   * Whether the totals have been fully initialized / calculated.
   * Will be set to false for lazy-calculated group totals.
   */
  initialized = false
}

/**
 * A locking helper to track the active edit controller and ensure that only a single controller
 * can be active at a time.  This prevents a whole class of state and validation synchronization
 * issues.  An edit controller (such as SlickGrid) can query if an active edit is in progress
 * and attempt a commit or cancel before proceeding.
 */
export class EditorLock {
  private activeEditController: EditController | null = null

  /**
   * Returns true if a specified edit controller is active (has the edit lock).
   * If the parameter is not specified, returns true if any edit controller is active.
   */
  isActive(editController?: EditController): boolean {
    return (editController ? this.activeEditController === editController : this.activeEditController !== null)
  }

  /**
   * Sets the specified edit controller as the active edit controller (acquire edit lock).
   * If another edit controller is already active, and exception will be thrown.
   */
  activate(editController: EditController): void {
    if (editController === this.activeEditController) { // already activated?
      return
    }
    if (this.activeEditController !== null) {
      throw 'SlickGrid.EditorLock.activate: an editController is still active, can\'t activate another editController'
    }
    if (!editController.commitCurrentEdit) {
      throw 'SlickGrid.EditorLock.activate: editController must implement .commitCurrentEdit()'
    }
    if (!editController.cancelCurrentEdit) {
      throw 'SlickGrid.EditorLock.activate: editController must implement .cancelCurrentEdit()'
    }
    this.activeEditController = editController
  }

  /**
   * Unsets the specified edit controller as the active edit controller (release edit lock).
   * If the specified edit controller is not the active one, an exception will be thrown.
   */
  deactivate(editController: EditController): void {
    if (this.activeEditController !== editController) {
      throw 'SlickGrid.EditorLock.deactivate: specified editController is not the currently active one'
    }
    this.activeEditController = null
  }

  /**
   * Attempts to commit the current edit by calling "commitCurrentEdit" method on the active edit
   * controller and returns whether the commit attempt was successful (commit may fail due to validation
   * errors, etc.).  Edit controller's "commitCurrentEdit" must return true if the commit has succeeded
   * and false otherwise.  If no edit controller is active, returns true.
   */
  commitCurrentEdit(): boolean {
    return (this.activeEditController ? this.activeEditController.commitCurrentEdit() : true)
  }

  /**
   * Attempts to cancel the current edit by calling "cancelCurrentEdit" method on the active edit
   * controller and returns whether the edit was successfully cancelled.  If no edit controller is
   * active, returns true.
   */
  cancelCurrentEdit(): boolean {
    return (this.activeEditController ? this.activeEditController.cancelCurrentEdit() : true)
  }
}

/**
 * A global singleton editor lock.
 */
export const GlobalEditorLock = new EditorLock()
