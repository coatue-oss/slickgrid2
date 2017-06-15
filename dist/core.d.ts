/// <reference types="jquery" />
import { Item } from './dataview';
/**
 * Contains core SlickGrid classes.
 * @module Core
 * @namespace Slick
 */
export interface EditController {
    cancelCurrentEdit(): boolean;
    commitCurrentEdit(): boolean;
}
/**
 * An event object for passing data to event handlers and letting them control propagation.
 *
 * This is pretty much identical to how W3C and jQuery implement events.
 */
export declare class EventData {
    private state;
    /**
     * Stops event from propagating up the DOM tree.
     */
    stopPropagation(): void;
    /**
     * Returns whether stopPropagation was called on this event object.
     */
    isPropagationStopped(): boolean;
    /**
     * Prevents the rest of the handlers from being executed.
     */
    stopImmediatePropagation(): void;
    /**
     * Returns whether stopImmediatePropagation was called on this event object.
     */
    isImmediatePropagationStopped(): boolean;
}
export declare type Handler<T> = ($event: JQueryEventObject, args: T) => any;
/**
 * A simple publisher-subscriber implementation.
 */
export declare class Event<T> {
    private handlers;
    /**
     * Adds an event handler to be called when the event is fired.
     *
     * Event handler will receive two arguments - an `EventData` and the `data`
     * object the event was fired with.
     */
    subscribe(fn: Handler<T>): void;
    /**
     * Removes an event handler added with `subscribe(fn)`.
     */
    unsubscribe(fn: Handler<T>): void;
    /**
     * Fires an event notifying all subscribers.
     */
    notify(args: T, e?: EventData | null, scope?: any): any;
}
export declare class EventHandler {
    private handlers;
    subscribe(event: any, handler: any): this;
    unsubscribe(event: any, handler: any): this | undefined;
    unsubscribeAll(): this;
}
/**
 * A structure containing a range of cells.
 */
export declare class Range {
    fromRow: number;
    fromCell: number;
    toRow: number;
    toCell: number;
    leftPx?: number;
    rightPx?: number;
    constructor(fromRow: number, fromCell: number, toRow?: number, toCell?: number);
    /**
     * Returns whether a range represents a single row.
     */
    isSingleRow(): boolean;
    /**
     * Returns whether a range represents a single cell.
     */
    isSingleCell(): boolean;
    /**
     * Returns whether a range contains a given cell.
     */
    contains(row: number, cell: number): boolean;
    /**
     * Returns a readable representation of a range.
     */
    toString(): string;
}
/**
 * A base class that all special / non-data rows (like Group and GroupTotals) derive from.
 */
export declare class NonDataItem {
    __nonDataRow: boolean;
}
export interface Stat {
    raw: number;
    formatted: string;
    symbol: string | null;
    stat: string;
}
/**
 * Information about a group of rows.
 */
export declare class Group extends NonDataItem {
    __group: boolean;
    initialized: boolean;
    statResult: {
        [columnKey: string]: Stat;
    } | undefined;
    /**
     * Grouping level, starting with 0.
     */
    level: number;
    /**
     * Number of rows in the group.
     */
    count: number;
    /**
     * Grouping value.
     */
    value: any | null;
    /**
     * Formatted display value of the group.
     */
    title: string | null;
    /**
     * Whether a group is collapsed.
     */
    collapsed: boolean;
    /**
     * GroupTotals, if any.
     */
    totals: GroupTotals | null;
    /**
     * Rows that are part of the group.
     * @property rows
     * @type {Array}
     */
    rows: Item[];
    /**
     * Sub-groups that are part of the group.
     */
    groups: Group[] | null;
    /**
     * A unique key used to identify the group.  This key can be used in calls to DataView
     * collapseGroup() or expandGroup().
     */
    groupingKey: string;
    /**
     * Compares two Group instances.
     */
    equals(group: Group): boolean;
}
/**
 * Information about group totals.
 * An instance of GroupTotals will be created for each totals row and passed to the aggregators
 * so that they can store arbitrary data in it.  That data can later be accessed by group totals
 * formatters during the display.
 */
export declare class GroupTotals extends NonDataItem {
    __groupTotals: boolean;
    /**
     * Parent Group.
     */
    group: Group | null;
    /**
     * Whether the totals have been fully initialized / calculated.
     * Will be set to false for lazy-calculated group totals.
     */
    initialized: boolean;
}
/**
 * A locking helper to track the active edit controller and ensure that only a single controller
 * can be active at a time.  This prevents a whole class of state and validation synchronization
 * issues.  An edit controller (such as SlickGrid) can query if an active edit is in progress
 * and attempt a commit or cancel before proceeding.
 */
export declare class EditorLock {
    private activeEditController;
    /**
     * Returns true if a specified edit controller is active (has the edit lock).
     * If the parameter is not specified, returns true if any edit controller is active.
     */
    isActive(editController?: EditController): boolean;
    /**
     * Sets the specified edit controller as the active edit controller (acquire edit lock).
     * If another edit controller is already active, and exception will be thrown.
     */
    activate(editController: EditController): void;
    /**
     * Unsets the specified edit controller as the active edit controller (release edit lock).
     * If the specified edit controller is not the active one, an exception will be thrown.
     */
    deactivate(editController: EditController): void;
    /**
     * Attempts to commit the current edit by calling "commitCurrentEdit" method on the active edit
     * controller and returns whether the commit attempt was successful (commit may fail due to validation
     * errors, etc.).  Edit controller's "commitCurrentEdit" must return true if the commit has succeeded
     * and false otherwise.  If no edit controller is active, returns true.
     */
    commitCurrentEdit(): boolean;
    /**
     * Attempts to cancel the current edit by calling "cancelCurrentEdit" method on the active edit
     * controller and returns whether the edit was successfully cancelled.  If no edit controller is
     * active, returns true.
     */
    cancelCurrentEdit(): boolean;
}
/**
 * A global singleton editor lock.
 */
export declare const GlobalEditorLock: EditorLock;
