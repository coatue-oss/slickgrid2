(function () {
'use strict';

/***
 * Contains core SlickGrid classes.
 * @module Core
 * @namespace Slick
 */

(function ($) {
  // register namespace
  $.extend(true, window, {
    "Slick": {
      "Event": Event,
      "EventData": EventData,
      "EventHandler": EventHandler,
      "Range": Range,
      "NonDataRow": NonDataItem,
      "Group": Group,
      "GroupTotals": GroupTotals,
      "EditorLock": EditorLock,

      /***
       * A global singleton editor lock.
       * @class GlobalEditorLock
       * @static
       * @constructor
       */
      "GlobalEditorLock": new EditorLock()
    }
  });

  /***
   * An event object for passing data to event handlers and letting them control propagation.
   * <p>This is pretty much identical to how W3C and jQuery implement events.</p>
   * @class EventData
   * @constructor
   */
  function EventData() {
    var isPropagationStopped = false;
    var isImmediatePropagationStopped = false;

    /***
     * Stops event from propagating up the DOM tree.
     * @method stopPropagation
     */
    this.stopPropagation = function () {
      isPropagationStopped = true;
    };

    /***
     * Returns whether stopPropagation was called on this event object.
     * @method isPropagationStopped
     * @return {Boolean}
     */
    this.isPropagationStopped = function () {
      return isPropagationStopped;
    };

    /***
     * Prevents the rest of the handlers from being executed.
     * @method stopImmediatePropagation
     */
    this.stopImmediatePropagation = function () {
      isImmediatePropagationStopped = true;
    };

    /***
     * Returns whether stopImmediatePropagation was called on this event object.\
     * @method isImmediatePropagationStopped
     * @return {Boolean}
     */
    this.isImmediatePropagationStopped = function () {
      return isImmediatePropagationStopped;
    }
  }

  /***
   * A simple publisher-subscriber implementation.
   * @class Event
   * @constructor
   */
  function Event() {
    var handlers = [];

    /***
     * Adds an event handler to be called when the event is fired.
     * <p>Event handler will receive two arguments - an <code>EventData</code> and the <code>data</code>
     * object the event was fired with.<p>
     * @method subscribe
     * @param fn {Function} Event handler.
     */
    this.subscribe = function (fn) {
      handlers.push(fn);
    };

    /***
     * Removes an event handler added with <code>subscribe(fn)</code>.
     * @method unsubscribe
     * @param fn {Function} Event handler to be removed.
     */
    this.unsubscribe = function (fn) {
      for (var i = handlers.length - 1; i >= 0; i--) {
        if (handlers[i] === fn) {
          handlers.splice(i, 1);
        }
      }
    };

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
    this.notify = function (args, e, scope) {
      e = e || new EventData();
      scope = scope || this;

      var returnValue;
      for (var i = 0; i < handlers.length && !(e.isPropagationStopped() || e.isImmediatePropagationStopped()); i++) {
        returnValue = handlers[i].call(scope, e, args);
      }

      return returnValue;
    };
  }

  function EventHandler() {
    var handlers = [];

    this.subscribe = function (event, handler) {
      handlers.push({
        event: event,
        handler: handler
      });
      event.subscribe(handler);

      return this;  // allow chaining
    };

    this.unsubscribe = function (event, handler) {
      var i = handlers.length;
      while (i--) {
        if (handlers[i].event === event &&
            handlers[i].handler === handler) {
          handlers.splice(i, 1);
          event.unsubscribe(handler);
          return;
        }
      }

      return this;  // allow chaining
    };

    this.unsubscribeAll = function () {
      var i = handlers.length;
      while (i--) {
        handlers[i].event.unsubscribe(handlers[i].handler);
      }
      handlers = [];

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
  function Range(fromRow, fromCell, toRow, toCell) {
    if (toRow === undefined && toCell === undefined) {
      toRow = fromRow;
      toCell = fromCell;
    }

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

    /***
     * Returns whether a range represents a single row.
     * @method isSingleRow
     * @return {Boolean}
     */
    this.isSingleRow = function () {
      return this.fromRow == this.toRow;
    };

    /***
     * Returns whether a range represents a single cell.
     * @method isSingleCell
     * @return {Boolean}
     */
    this.isSingleCell = function () {
      return this.fromRow == this.toRow && this.fromCell == this.toCell;
    };

    /***
     * Returns whether a range contains a given cell.
     * @method contains
     * @param row {Integer}
     * @param cell {Integer}
     * @return {Boolean}
     */
    this.contains = function (row, cell) {
      return row >= this.fromRow && row <= this.toRow &&
          cell >= this.fromCell && cell <= this.toCell;
    };

    /***
     * Returns a readable representation of a range.
     * @method toString
     * @return {String}
     */
    this.toString = function () {
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
  function NonDataItem() {
    this.__nonDataRow = true;
  }


  /***
   * Information about a group of rows.
   * @class Group
   * @extends Slick.NonDataItem
   * @constructor
   */
  function Group() {
    this.__group = true;

    /**
     * Grouping level, starting with 0.
     * @property level
     * @type {Number}
     */
    this.level = 0;

    /***
     * Number of rows in the group.
     * @property count
     * @type {Integer}
     */
    this.count = 0;

    /***
     * Grouping value.
     * @property value
     * @type {Object}
     */
    this.value = null;

    /***
     * Formatted display value of the group.
     * @property title
     * @type {String}
     */
    this.title = null;

    /***
     * Whether a group is collapsed.
     * @property collapsed
     * @type {Boolean}
     */
    this.collapsed = false;

    /***
     * GroupTotals, if any.
     * @property totals
     * @type {GroupTotals}
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
     * @property groups
     * @type {Array}
     */
    this.groups = null;

    /**
     * A unique key used to identify the group.  This key can be used in calls to DataView
     * collapseGroup() or expandGroup().
     * @property groupingKey
     * @type {Object}
     */
    this.groupingKey = null;
  }

  Group.prototype = new NonDataItem();

  /***
   * Compares two Group instances.
   * @method equals
   * @return {Boolean}
   * @param group {Group} Group instance to compare to.
   */
  Group.prototype.equals = function (group) {
    return this.value === group.value &&
        this.count === group.count &&
        this.collapsed === group.collapsed &&
        this.title === group.title;
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
  function GroupTotals() {
    this.__groupTotals = true;

    /***
     * Parent Group.
     * @param group
     * @type {Group}
     */
    this.group = null;

    /***
     * Whether the totals have been fully initialized / calculated.
     * Will be set to false for lazy-calculated group totals.
     * @param initialized
     * @type {Boolean}
     */
    this.initialized = false;
  }

  GroupTotals.prototype = new NonDataItem();

  /***
   * A locking helper to track the active edit controller and ensure that only a single controller
   * can be active at a time.  This prevents a whole class of state and validation synchronization
   * issues.  An edit controller (such as SlickGrid) can query if an active edit is in progress
   * and attempt a commit or cancel before proceeding.
   * @class EditorLock
   * @constructor
   */
  function EditorLock() {
    var activeEditController = null;

    /***
     * Returns true if a specified edit controller is active (has the edit lock).
     * If the parameter is not specified, returns true if any edit controller is active.
     * @method isActive
     * @param editController {EditController}
     * @return {Boolean}
     */
    this.isActive = function (editController) {
      return (editController ? activeEditController === editController : activeEditController !== null);
    };

    /***
     * Sets the specified edit controller as the active edit controller (acquire edit lock).
     * If another edit controller is already active, and exception will be thrown.
     * @method activate
     * @param editController {EditController} edit controller acquiring the lock
     */
    this.activate = function (editController) {
      if (editController === activeEditController) { // already activated?
        return;
      }
      if (activeEditController !== null) {
        throw "SlickGrid.EditorLock.activate: an editController is still active, can't activate another editController";
      }
      if (!editController.commitCurrentEdit) {
        throw "SlickGrid.EditorLock.activate: editController must implement .commitCurrentEdit()";
      }
      if (!editController.cancelCurrentEdit) {
        throw "SlickGrid.EditorLock.activate: editController must implement .cancelCurrentEdit()";
      }
      activeEditController = editController;
    };

    /***
     * Unsets the specified edit controller as the active edit controller (release edit lock).
     * If the specified edit controller is not the active one, an exception will be thrown.
     * @method deactivate
     * @param editController {EditController} edit controller releasing the lock
     */
    this.deactivate = function (editController) {
      if (activeEditController !== editController) {
        throw "SlickGrid.EditorLock.deactivate: specified editController is not the currently active one";
      }
      activeEditController = null;
    };

    /***
     * Attempts to commit the current edit by calling "commitCurrentEdit" method on the active edit
     * controller and returns whether the commit attempt was successful (commit may fail due to validation
     * errors, etc.).  Edit controller's "commitCurrentEdit" must return true if the commit has succeeded
     * and false otherwise.  If no edit controller is active, returns true.
     * @method commitCurrentEdit
     * @return {Boolean}
     */
    this.commitCurrentEdit = function () {
      return (activeEditController ? activeEditController.commitCurrentEdit() : true);
    };

    /***
     * Attempts to cancel the current edit by calling "cancelCurrentEdit" method on the active edit
     * controller and returns whether the edit was successfully cancelled.  If no edit controller is
     * active, returns true.
     * @method cancelCurrentEdit
     * @return {Boolean}
     */
    this.cancelCurrentEdit = function cancelCurrentEdit() {
      return (activeEditController ? activeEditController.cancelCurrentEdit() : true);
    };
  }
})(jQuery);

(function ($) {
  $.extend(true, window, {
    Slick: {
      Data: {
        DataView: DataView,
        Aggregators: {
          Avg: AvgAggregator,
          Min: MinAggregator,
          Max: MaxAggregator,
          Sum: SumAggregator
        }
      }
    }
  });


  /***
   * A sample Model implementation.
   * Provides a filtered view of the underlying data.
   *
   * Relies on the data item having an "id" property uniquely identifying it.
   */
  function DataView(options) {
    var self = this;

    var defaults = {
      groupItemMetadataProvider: null,
      inlineFilters: false
    };


    // private
    var idProperty = "id";  // property holding a unique row id
    var items = [];         // data by index
    var rows = [];          // data by row
    var idxById = {};       // indexes by id
    var rowsById = null;    // rows by id; lazy-calculated
    var filter = null;      // filter function
    var updated = null;     // updated item ids
    var suspend = false;    // suspends the recalculation
    var sortAsc = true;
    var fastSortField;
    var sortComparer;
    var refreshHints = {};
    var prevRefreshHints = {};
    var filterArgs;
    var filteredItems = [];
    var previousFilteredItems = [];
    var compiledFilter;
    var compiledFilterWithCaching;
    var filterCache = [];

    // grouping
    var groupingInfoDefaults = {
      getter: null,
      formatter: null,
      comparer: function(a, b) { return a.value - b.value; },
      predefinedValues: [],
      aggregators: [],
      aggregateEmpty: false,
      aggregateCollapsed: false,
      aggregateChildGroups: false,
      collapsed: false,
      displayTotalsRow: true,
      lazyTotalsCalculation: false
    };
    var groupingInfos = [];
    var groups = [];
    var toggledGroupsByLevel = [];
    var groupingDelimiter = ':|:';

    var pagesize = 0;
    var pagenum = 0;
    var totalRows = 0;

    // events
    var onGroupsChanged = new Slick.Event();
    var onRowCountChanged = new Slick.Event();
    var onRowsChanged = new Slick.Event();
    var onSetItems = new Slick.Event();
    var onFilteredItemsChanged = new Slick.Event();
    var onPagingInfoChanged = new Slick.Event();

    setOptions(options);


    function beginUpdate() {
      suspend = true;
    }

    function endUpdate() {
      suspend = false;
      refresh();
    }

    // (fn: (void) => Any) => void
    function withTransaction (fn) {
      if (!jQuery.isFunction(fn)) {
        throw new TypeError('Slick.DataView.withTransaction expects a Function');
      }
      beginUpdate();
      try {
        fn();
      } catch (e) {
        console.error('Error caught in Slick.DataView transaction', e);
      } finally {
        endUpdate();
      }
    }

    function setRefreshHints(hints) {
      refreshHints = hints;
    }

    function setFilterArgs(args) {
      filterArgs = args;
    }

    function updateIdxById(startingIndex) {
      startingIndex = startingIndex || 0;
      var id;
      for (var i = startingIndex, l = items.length; i < l; i++) {
        id = items[i][idProperty];
        if (id === undefined) {
          throw "Each data element must implement a unique 'id' property, it can't be undefined." ;
        }
        idxById[id] = i;
      }
    }

    function ensureIdUniqueness() {
      var id;
      for (var i = 0, l = items.length; i < l; i++) {
        id = items[i][idProperty];
        if (id === undefined || idxById[id] !== i) {
          throw "Each data element must implement a unique 'id' property. `"+ id +"` is not unique." ;
        }
      }
    }

    function getItems() {
      return items;
    }

    function setItems(data, objectIdProperty) {
      if (objectIdProperty !== undefined) {
        idProperty = objectIdProperty;
      }
      items = filteredItems = data;
      idxById = {};
      updateIdxById();
      ensureIdUniqueness();
      refresh();
      onSetItems.notify({ items: items }, null, self);
    }

    function setPagingOptions(args) {
      if (args.pageSize != undefined) {
        pagesize = args.pageSize;
        pagenum = pagesize ? Math.min(pagenum, Math.max(0, Math.ceil(totalRows / pagesize) - 1)) : 0;
      }

      if (args.pageNum != undefined) {
        pagenum = Math.min(args.pageNum, Math.max(0, Math.ceil(totalRows / pagesize) - 1));
      }

      onPagingInfoChanged.notify(getPagingInfo(), null, self);

      refresh();
    }

    function getPagingInfo() {
      var totalPages = pagesize ? Math.max(1, Math.ceil(totalRows / pagesize)) : 1;
      return {pageSize: pagesize, pageNum: pagenum, totalRows: totalRows, totalPages: totalPages};
    }

    function sort(comparer, ascending) {
      sortAsc = ascending;
      sortComparer = comparer;
      fastSortField = null;
      if (ascending === false) {
        items.reverse();
      }
      items.sort(comparer);
      if (ascending === false) {
        items.reverse();
      }
      idxById = {};
      updateIdxById();
      refresh();
    }

    /***
     * Provides a workaround for the extremely slow sorting in IE.
     * Does a [lexicographic] sort on a give column by temporarily overriding Object.prototype.toString
     * to return the value of that field and then doing a native Array.sort().
     */
    function fastSort(field, ascending) {
      sortAsc = ascending;
      fastSortField = field;
      sortComparer = null;
      var oldToString = Object.prototype.toString;
      Object.prototype.toString = (typeof field == "function") ? field : function () {
        return this[field]
      };
      // an extra reversal for descending sort keeps the sort stable
      // (assuming a stable native sort implementation, which isn't true in some cases)
      if (ascending === false) {
        items.reverse();
      }
      items.sort();
      Object.prototype.toString = oldToString;
      if (ascending === false) {
        items.reverse();
      }
      idxById = {};
      updateIdxById();
      refresh();
    }

    function reSort() {
      if (sortComparer) {
        sort(sortComparer, sortAsc);
      } else if (fastSortField) {
        fastSort(fastSortField, sortAsc);
      }
    }

    function setFilter(filterFn) {
      filter = filterFn;
      if (options.inlineFilters) {
        compiledFilter = compileFilter();
        compiledFilterWithCaching = compileFilterWithCaching();
      }
      refresh();
    }

    function getGrouping() {
      return groupingInfos;
    }

    function setGrouping(groupingInfo) {
      if (!options.groupItemMetadataProvider) {
        options.groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider();
      }

      groups = [];
      toggledGroupsByLevel = [];
      groupingInfo = groupingInfo || [];
      groupingInfos = (groupingInfo instanceof Array) ? groupingInfo : [groupingInfo];

      for (var i = 0; i < groupingInfos.length; i++) {
        var gi = groupingInfos[i] = $.extend(true, {}, groupingInfoDefaults, groupingInfos[i]);
        gi.getterIsAFn = typeof gi.getter === "function";

        // pre-compile accumulator loops
        gi.compiledAccumulators = [];
        var idx = gi.aggregators.length;
        while (idx--) {
          gi.compiledAccumulators[idx] = compileAccumulatorLoop(gi.aggregators[idx]);
        }

        toggledGroupsByLevel[i] = {};
      }

      refresh();
    }

    /**
     * @deprecated Please use {@link setGrouping}.
     */
    function groupBy(valueGetter, valueFormatter, sortComparer) {
      if (valueGetter == null) {
        setGrouping([]);
        return;
      }

      setGrouping({
        getter: valueGetter,
        formatter: valueFormatter,
        comparer: sortComparer
      });
    }

    /**
     * @deprecated Please use {@link setGrouping}.
     */
    function setAggregators(groupAggregators, includeCollapsed) {
      if (!groupingInfos.length) {
        throw new Error("At least one grouping must be specified before calling setAggregators().");
      }

      groupingInfos[0].aggregators = groupAggregators;
      groupingInfos[0].aggregateCollapsed = includeCollapsed;

      setGrouping(groupingInfos);
    }

    function getItemByIdx(i) {
      return items[i];
    }

    function getIdxById(id) {
      return idxById[id];
    }

    function ensureRowsByIdCache() {
      if (!rowsById) {
        rowsById = {};
        for (var i = 0, l = rows.length; i < l; i++) {
          rowsById[rows[i][idProperty]] = i;
        }
      }
    }

    function getRowById(id) {
      ensureRowsByIdCache();
      return rowsById[id];
    }

    function getItemById(id) {
      return items[idxById[id]];
    }

    function mapIdsToRows(idArray) {
      var rows = [];
      ensureRowsByIdCache();
      for (var i = 0, l = idArray.length; i < l; i++) {
        var row = rowsById[idArray[i]];
        if (row != null) {
          rows[rows.length] = row;
        }
      }
      return rows;
    }

    function mapRowsToIds(rowArray) {
      var ids = [];
      for (var i = 0, l = rowArray.length; i < l; i++) {
        if (rowArray[i] < rows.length) {
          ids[ids.length] = rows[rowArray[i]][idProperty];
        }
      }
      return ids;
    }

    function updateItem(id, item) {
      if (idxById[id] === undefined || id !== item[idProperty]) {
        throw "Invalid or non-matching id";
      }
      items[idxById[id]] = item;
      if (!updated) {
        updated = {};
      }
      updated[id] = true;
      refresh();
    }

    function insertItem(insertBefore, item) {
      items.splice(insertBefore, 0, item);
      updateIdxById(insertBefore);
      refresh();
    }

    function addItem(item) {
      items.push(item);
      updateIdxById(items.length - 1);
      refresh();
    }

    function deleteItem(id) {
      var idx = idxById[id];
      if (idx === undefined) {
        throw "Invalid id";
      }
      delete idxById[id];
      items.splice(idx, 1);
      updateIdxById(idx);
      refresh();
    }

    function getLength() {
      return rows.length;
    }

    // (groups: Object[], { excludeHiddenGroups: boolean }) => Object[]
    function getFlattenedGroups(groups, options) {
      if (!options) options = {}
      if (options.excludeHiddenGroups == null) options.excludeHiddenGroups = false

      var flattenedGroups = [].concat(groups)
      groups.forEach(function(group) {
        if (!group.groups) return
        if (options.excludeHiddenGroups && group.collapsed) return
        flattenedGroups = flattenedGroups.concat(getFlattenedGroups(group.groups, options))
      })
      return flattenedGroups
    }

    // (void) => Number
    function getLengthWithoutGroupHeaders() {
      return rows.length - getFlattenedGroups(groups, { excludeHiddenGroups: true }).length
    }

    function getItem(i) {
      var item = rows[i];

      // if this is a group row, make sure totals are calculated and update the title
      if (item && item.__group && item.totals && !item.totals.initialized) {
        var gi = groupingInfos[item.level];
        if (!gi.displayTotalsRow) {
          calculateTotals(item.totals);
          item.title = gi.formatter ? gi.formatter(item) : item.value;
        }
      }
      // if this is a totals row, make sure it's calculated
      else if (item && item.__groupTotals && !item.initialized) {
        calculateTotals(item);
      }

      return item;
    }

    function getItemMetadata(i) {
      var item = rows[i];
      if (item === undefined) {
        return null;
      }

      // overrides for grouping rows
      if (item.__group) {
        return options.groupItemMetadataProvider.getGroupRowMetadata(item);
      }

      // overrides for totals rows
      if (item.__groupTotals) {
        return options.groupItemMetadataProvider.getTotalsRowMetadata(item);
      }

      return null;
    }

    function expandCollapseAllGroups(level, collapse) {
      if (level == null) {
        for (var i = 0; i < groupingInfos.length; i++) {
          toggledGroupsByLevel[i] = {};
          groupingInfos[i].collapsed = collapse;
        }
      } else {
        toggledGroupsByLevel[level] = {};
        groupingInfos[level].collapsed = collapse;
      }
      refresh();
    }

    /**
     * @param level {Number} Optional level to collapse.  If not specified, applies to all levels.
     */
    function collapseAllGroups(level) {
      expandCollapseAllGroups(level, true);
    }

    /**
     * @param level {Number} Optional level to expand.  If not specified, applies to all levels.
     */
    function expandAllGroups(level) {
      expandCollapseAllGroups(level, false);
    }

    function expandCollapseGroup(level, groupingKey, collapse) {
      toggledGroupsByLevel[level][groupingKey] = groupingInfos[level].collapsed ^ collapse;
      refresh();
    }

    /**
     * @param varArgs Either a Slick.Group's "groupingKey" property, or a
     *     variable argument list of grouping values denoting a unique path to the row.  For
     *     example, calling collapseGroup('high', '10%') will collapse the '10%' subgroup of
     *     the 'high' group.
     */
    function collapseGroup(varArgs) {
      var args = Array.prototype.slice.call(arguments);
      var arg0 = args[0];
      if (args.length == 1 && arg0.indexOf(groupingDelimiter) != -1) {
        expandCollapseGroup(arg0.split(groupingDelimiter).length - 1, arg0, true);
      } else {
        expandCollapseGroup(args.length - 1, args.join(groupingDelimiter), true);
      }
    }

    /**
     * @param varArgs Either a Slick.Group's "groupingKey" property, or a
     *     variable argument list of grouping values denoting a unique path to the row.  For
     *     example, calling expandGroup('high', '10%') will expand the '10%' subgroup of
     *     the 'high' group.
     */
    function expandGroup(varArgs) {
      var args = Array.prototype.slice.call(arguments);
      var arg0 = args[0];
      if (args.length == 1 && arg0.indexOf(groupingDelimiter) != -1) {
        expandCollapseGroup(arg0.split(groupingDelimiter).length - 1, arg0, false);
      } else {
        expandCollapseGroup(args.length - 1, args.join(groupingDelimiter), false);
      }
    }

    function getGroups() {
      return groups;
    }

    function extractGroups(rows, parentGroup) {
      var group;
      var val;
      var groups = [];
      var groupsByVal = {};
      var r;
      var level = parentGroup ? parentGroup.level + 1 : 0;
      var gi = groupingInfos[level];

      for (var i = 0, l = gi.predefinedValues.length; i < l; i++) {
        val = gi.predefinedValues[i];
        group = groupsByVal[val];
        if (!group) {
          group = new Slick.Group();
          group.value = val;
          group.level = level;
          group.groupingKey = (parentGroup ? parentGroup.groupingKey + groupingDelimiter : '') + val;
          groups[groups.length] = group;
          groupsByVal[val] = group;
        }
      }

      for (var i = 0, l = rows.length; i < l; i++) {
        r = rows[i];
        val = gi.getterIsAFn ? gi.getter(r) : r[gi.getter];
        group = groupsByVal[val];
        if (!group) {
          group = new Slick.Group();
          group.value = val;
          group.level = level;
          group.groupingKey = (parentGroup ? parentGroup.groupingKey + groupingDelimiter : '') + val;
          groups[groups.length] = group;
          groupsByVal[val] = group;
        }

        group.rows[group.count++] = r;
      }

      if (level < groupingInfos.length - 1) {
        for (var i = 0; i < groups.length; i++) {
          group = groups[i];
          group.groups = extractGroups(group.rows, group);
        }
      }

      return groups;
    }

    // (groups: Array[Object], parentGroup: Object) => void
    function sortGroups(groups, parentGroup) {
      for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        if (group.groups) {
          sortGroups(group.groups, group);
        }
      }

      var level = parentGroup ? parentGroup.level + 1 : 0;
      groups.sort(groupingInfos[level].comparer);
    }

    function calculateTotals(totals) {
      var group = totals.group;
      var gi = groupingInfos[group.level];
      var isLeafLevel = (group.level == groupingInfos.length);
      var agg, idx = gi.aggregators.length;

      if (!isLeafLevel && gi.aggregateChildGroups) {
        // make sure all the subgroups are calculated
        var i = group.groups.length;
        while (i--) {
          if (!group.groups[i].initialized) {
            calculateTotals(group.groups[i]);
          }
        }
      }

      while (idx--) {
        agg = gi.aggregators[idx];
        agg.init();
        if (!isLeafLevel && gi.aggregateChildGroups) {
          gi.compiledAccumulators[idx].call(agg, group.groups);
        } else {
          gi.compiledAccumulators[idx].call(agg, group.rows);
        }
        agg.storeResult(totals);
      }
      totals.initialized = true;
    }

    function addGroupTotals(group) {
      var gi = groupingInfos[group.level];
      var totals = new Slick.GroupTotals();
      totals.group = group;
      group.totals = totals;
      if (!gi.lazyTotalsCalculation) {
        calculateTotals(totals);
      }
    }

    function addTotals(groups, level) {
      level = level || 0;
      var gi = groupingInfos[level];
      var groupCollapsed = gi.collapsed;
      var toggledGroups = toggledGroupsByLevel[level];
      var idx = groups.length, g;
      while (idx--) {
        g = groups[idx];

        if (g.collapsed && !gi.aggregateCollapsed) {
          continue;
        }

        // Do a depth-first aggregation so that parent group aggregators can access subgroup totals.
        if (g.groups) {
          addTotals(g.groups, level + 1);
        }

        if (gi.aggregators.length && (
            gi.aggregateEmpty || g.rows.length || (g.groups && g.groups.length))) {
          addGroupTotals(g);
        }

        g.collapsed = groupCollapsed ^ toggledGroups[g.groupingKey];
        g.title = gi.formatter ? gi.formatter(g) : g.value;
      }
    }

    function flattenGroupedRows(groups, level) {
      level = level || 0;
      var gi = groupingInfos[level];
      var groupedRows = [], rows, gl = 0, g;
      for (var i = 0, l = groups.length; i < l; i++) {
        g = groups[i];
        groupedRows[gl++] = g;

        if (!g.collapsed) {
          rows = g.groups ? flattenGroupedRows(g.groups, level + 1) : g.rows;
          for (var j = 0, jj = rows.length; j < jj; j++) {
            groupedRows[gl++] = rows[j];
          }
        }

        if (g.totals && gi.displayTotalsRow && (!g.collapsed || gi.aggregateCollapsed)) {
          groupedRows[gl++] = g.totals;
        }
      }
      return groupedRows;
    }

    function getFunctionInfo(fn) {
      var fnRegex = /^function[^(]*\(([^)]*)\)\s*{([\s\S]*)}$/;
      var matches = fn.toString().match(fnRegex);
      return {
        params: matches[1].split(","),
        body: matches[2]
      };
    }

    function compileAccumulatorLoop(aggregator) {
      var accumulatorInfo = getFunctionInfo(aggregator.accumulate);
      var fn = new Function(
          "_items",
          "for (var " + accumulatorInfo.params[0] + ", _i=0, _il=_items.length; _i<_il; _i++) {" +
              accumulatorInfo.params[0] + " = _items[_i]; " +
              accumulatorInfo.body +
          "}"
      );
      fn.displayName = fn.name = "compiledAccumulatorLoop";
      return fn;
    }

    function compileFilter() {
      var filterInfo = getFunctionInfo(filter);

      var filterBody = filterInfo.body
          .replace(/return false\s*([;}]|$)/gi, "{ continue _coreloop; }$1")
          .replace(/return true\s*([;}]|$)/gi, "{ _retval[_idx++] = $item$; continue _coreloop; }$1")
          .replace(/return ([^;}]+?)\s*([;}]|$)/gi,
          "{ if ($1) { _retval[_idx++] = $item$; }; continue _coreloop; }$2");

      // This preserves the function template code after JS compression,
      // so that replace() commands still work as expected.
      var tpl = [
        //"function(_items, _args) { ",
        "var _retval = [], _idx = 0; ",
        "var $item$, $args$ = _args; ",
        "_coreloop: ",
        "for (var _i = 0, _il = _items.length; _i < _il; _i++) { ",
        "$item$ = _items[_i]; ",
        "$filter$; ",
        "} ",
        "return _retval; "
        //"}"
      ].join("");
      tpl = tpl.replace(/\$filter\$/gi, filterBody);
      tpl = tpl.replace(/\$item\$/gi, filterInfo.params[0]);
      tpl = tpl.replace(/\$args\$/gi, filterInfo.params[1]);

      var fn = new Function("_items,_args", tpl);
      fn.displayName = fn.name = "compiledFilter";
      return fn;
    }

    function compileFilterWithCaching() {
      var filterInfo = getFunctionInfo(filter);

      var filterBody = filterInfo.body
          .replace(/return false\s*([;}]|$)/gi, "{ continue _coreloop; }$1")
          .replace(/return true\s*([;}]|$)/gi, "{ _cache[_i] = true;_retval[_idx++] = $item$; continue _coreloop; }$1")
          .replace(/return ([^;}]+?)\s*([;}]|$)/gi,
          "{ if ((_cache[_i] = $1)) { _retval[_idx++] = $item$; }; continue _coreloop; }$2");

      // This preserves the function template code after JS compression,
      // so that replace() commands still work as expected.
      var tpl = [
        //"function(_items, _args, _cache) { ",
        "var _retval = [], _idx = 0; ",
        "var $item$, $args$ = _args; ",
        "_coreloop: ",
        "for (var _i = 0, _il = _items.length; _i < _il; _i++) { ",
        "$item$ = _items[_i]; ",
        "if (_cache[_i]) { ",
        "_retval[_idx++] = $item$; ",
        "continue _coreloop; ",
        "} ",
        "$filter$; ",
        "} ",
        "return _retval; "
        //"}"
      ].join("");
      tpl = tpl.replace(/\$filter\$/gi, filterBody);
      tpl = tpl.replace(/\$item\$/gi, filterInfo.params[0]);
      tpl = tpl.replace(/\$args\$/gi, filterInfo.params[1]);

      var fn = new Function("_items,_args,_cache", tpl);
      fn.displayName = fn.name = "compiledFilterWithCaching";
      return fn;
    }

    function uncompiledFilter(items, args) {
      var retval = [], idx = 0;

      for (var i = 0, ii = items.length; i < ii; i++) {
        if (filter(items[i], args)) {
          retval[idx++] = items[i];
        }
      }

      return retval;
    }

    function uncompiledFilterWithCaching(items, args, cache) {
      var retval = [], idx = 0, item;

      for (var i = 0, ii = items.length; i < ii; i++) {
        item = items[i];
        if (cache[i]) {
          retval[idx++] = item;
        } else if (filter(item, args)) {
          retval[idx++] = item;
          cache[i] = true;
        }
      }

      return retval;
    }

    function getFilteredAndPagedItems(items) {
      if (filter) {
        var batchFilter = options.inlineFilters ? compiledFilter : uncompiledFilter;
        var batchFilterWithCaching = options.inlineFilters ? compiledFilterWithCaching : uncompiledFilterWithCaching;

        if (refreshHints.isFilterNarrowing) {
          filteredItems = batchFilter(filteredItems, filterArgs);
        } else if (refreshHints.isFilterExpanding) {
          filteredItems = batchFilterWithCaching(items, filterArgs, filterCache);
        } else if (!refreshHints.isFilterUnchanged) {
          filteredItems = batchFilter(items, filterArgs);
        }
      } else {
        // special case:  if not filtering and not paging, the resulting
        // rows collection needs to be a copy so that changes due to sort
        // can be caught
        filteredItems = pagesize ? items : items.concat();
      }

      // get the current page
      var paged;
      if (pagesize) {
        if (filteredItems.length < pagenum * pagesize) {
          pagenum = Math.floor(filteredItems.length / pagesize);
        }
        paged = filteredItems.slice(pagesize * pagenum, pagesize * pagenum + pagesize);
      } else {
        paged = filteredItems;
      }

      return {totalRows: filteredItems.length, rows: paged};
    }

    function getRowDiffs(rows, newRows) {
      var item, r, eitherIsNonData, diff = [];
      var from = 0, to = newRows.length;

      if (refreshHints && refreshHints.ignoreDiffsBefore) {
        from = Math.max(0,
            Math.min(newRows.length, refreshHints.ignoreDiffsBefore));
      }

      if (refreshHints && refreshHints.ignoreDiffsAfter) {
        to = Math.min(newRows.length,
            Math.max(0, refreshHints.ignoreDiffsAfter));
      }

      for (var i = from, rl = rows.length; i < to; i++) {
        if (i >= rl) {
          diff[diff.length] = i;
        } else {
          item = newRows[i];
          r = rows[i];

          if ((groupingInfos.length && (eitherIsNonData = (item.__nonDataRow) || (r.__nonDataRow)) &&
              item.__group !== r.__group ||
              item.__group && !item.equals(r))
              || (eitherIsNonData &&
              // no good way to compare totals since they are arbitrary DTOs
              // deep object comparison is pretty expensive
              // always considering them 'dirty' seems easier for the time being
              (item.__groupTotals || r.__groupTotals))
              || item[idProperty] != r[idProperty]
              || (updated && updated[item[idProperty]])
              ) {
            diff[diff.length] = i;
          }
        }
      }
      return diff;
    }

    function recalc(_items) {
      rowsById = null;

      if (refreshHints.isFilterNarrowing != prevRefreshHints.isFilterNarrowing ||
          refreshHints.isFilterExpanding != prevRefreshHints.isFilterExpanding) {
        filterCache = [];
      }

      var filteredItems = getFilteredAndPagedItems(_items);
      totalRows = filteredItems.totalRows;
      var newRows = filteredItems.rows;

      groups = [];
      if (groupingInfos.length) {
        groups = extractGroups(newRows);

        if (groups.length) {
          addTotals(groups);
          onGroupsChanged.notify({groups: groups}, null, self);
          sortGroups(groups);
          newRows = flattenGroupedRows(groups);
        }
      }

      var diff = getRowDiffs(rows, newRows);

      rows = newRows;

      return diff;
    }

    function refresh() {
      if (suspend) {
        return;
      }

      var countBefore = rows.length;
      var totalRowsBefore = totalRows;

      var diff = recalc(items, filter); // pass as direct refs to avoid closure perf hit

      // if the current page is no longer valid, go to last page and recalc
      // we suffer a performance penalty here, but the main loop (recalc) remains highly optimized
      if (pagesize && totalRows < pagenum * pagesize) {
        pagenum = Math.max(0, Math.ceil(totalRows / pagesize) - 1);
        diff = recalc(items, filter);
      }

      updated = null;
      prevRefreshHints = refreshHints;
      refreshHints = {};

      if (totalRowsBefore != totalRows) {
        onPagingInfoChanged.notify(getPagingInfo(), null, self);
      }
      if (countBefore != rows.length) {
        onRowCountChanged.notify({previous: countBefore, current: rows.length}, null, self);
        onRowsChanged.notify({rows: diff}, null, self);
      }
      if (filteredItems.length !== previousFilteredItems.length) {
        onFilteredItemsChanged.notify({filteredItems: filteredItems, previousFilteredItems: previousFilteredItems}, null, self);
        previousFilteredItems = filteredItems;
      }

    }

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
     * @return {Slick.Event} An event that notifies when an internal list of selected row ids
     *     changes.  This is useful since, in combination with the above two options, it allows
     *     access to the full list selected row ids, and not just the ones visible to the grid.
     * @method syncGridSelection
     */
    function syncGridSelection(grid, preserveHidden, preserveHiddenOnSelectionChange) {
      var self = this;
      var inHandler;
      var selectedRowIds = self.mapRowsToIds(grid.getSelectedRows());
      var onSelectedRowIdsChanged = new Slick.Event();

      function setSelectedRowIds(rowIds) {
        if (selectedRowIds.join(",") == rowIds.join(",")) {
          return;
        }

        selectedRowIds = rowIds;

        onSelectedRowIdsChanged.notify({
          "grid": grid,
          "ids": selectedRowIds
        }, new Slick.EventData(), self);
      }

      function update() {
        if (selectedRowIds.length > 0) {
          inHandler = true;
          var selectedRows = self.mapIdsToRows(selectedRowIds);
          if (!preserveHidden) {
            setSelectedRowIds(self.mapRowsToIds(selectedRows));
          }
          grid.setSelectedRows(selectedRows);
          inHandler = false;
        }
      }

      grid.onSelectedRowsChanged.subscribe(function(e, args) {
        if (inHandler) { return; }
        var newSelectedRowIds = self.mapRowsToIds(grid.getSelectedRows());
        if (!preserveHiddenOnSelectionChange || !grid.getOptions().multiSelect) {
          setSelectedRowIds(newSelectedRowIds);
        } else {
          // keep the ones that are hidden
          var existing = $.grep(selectedRowIds, function(id) { return self.getRowById(id) === undefined; });
          // add the newly selected ones
          setSelectedRowIds(existing.concat(newSelectedRowIds));
        }
      });

      this.onRowsChanged.subscribe(update);

      this.onRowCountChanged.subscribe(update);

      return onSelectedRowIdsChanged;
    }

    function syncGridCellCssStyles(grid, key) {
      var hashById;
      var inHandler;

      // since this method can be called after the cell styles have been set,
      // get the existing ones right away
      storeCellCssStyles(grid.getCellCssStyles(key));

      function storeCellCssStyles(hash) {
        hashById = {};
        for (var row in hash) {
          var id = rows[row][idProperty];
          hashById[id] = hash[row];
        }
      }

      function update() {
        if (hashById) {
          inHandler = true;
          ensureRowsByIdCache();
          var newHash = {};
          for (var id in hashById) {
            var row = rowsById[id];
            if (row != undefined) {
              newHash[row] = hashById[id];
            }
          }
          grid.setCellCssStyles(key, newHash);
          inHandler = false;
        }
      }

      grid.onCellCssStylesChanged.subscribe(function(e, args) {
        if (inHandler) { return; }
        if (key != args.key) { return; }
        if (args.hash) {
          storeCellCssStyles(args.hash);
        }
      });

      this.onRowsChanged.subscribe(update);

      this.onRowCountChanged.subscribe(update);
    }

    function getFilteredItems () {
      return filteredItems;
    }

    function setOptions (opts) {
      return options = $.extend(true, {}, defaults, options, opts);
    }

    $.extend(this, {
      // methods
      "beginUpdate": beginUpdate,
      "endUpdate": endUpdate,
      "withTransaction": withTransaction,
      "setPagingOptions": setPagingOptions,
      "getPagingInfo": getPagingInfo,
      "getItems": getItems,
      "getFilteredItems": getFilteredItems,
      "getFlattenedGroups": getFlattenedGroups,
      "setItems": setItems,
      "setFilter": setFilter,
      "sort": sort,
      "fastSort": fastSort,
      "reSort": reSort,
      "setGrouping": setGrouping,
      "getGrouping": getGrouping,
      "groupBy": groupBy,
      "setAggregators": setAggregators,
      "collapseAllGroups": collapseAllGroups,
      "expandAllGroups": expandAllGroups,
      "collapseGroup": collapseGroup,
      "expandGroup": expandGroup,
      "getGroups": getGroups,
      "getIdxById": getIdxById,
      "getRowById": getRowById,
      "getItemById": getItemById,
      "getItemByIdx": getItemByIdx,
      "mapRowsToIds": mapRowsToIds,
      "mapIdsToRows": mapIdsToRows,
      "setRefreshHints": setRefreshHints,
      "setFilterArgs": setFilterArgs,
      "refresh": refresh,
      "updateItem": updateItem,
      "insertItem": insertItem,
      "addItem": addItem,
      "deleteItem": deleteItem,
      "syncGridSelection": syncGridSelection,
      "syncGridCellCssStyles": syncGridCellCssStyles,
      "setOptions": setOptions,

      // data provider methods
      "getLength": getLength,
      "getLengthWithoutGroupHeaders": getLengthWithoutGroupHeaders,
      "getItem": getItem,
      "getItemMetadata": getItemMetadata,

      // events
      "onGroupsChanged": onGroupsChanged,
      "onRowCountChanged": onRowCountChanged,
      "onRowsChanged": onRowsChanged,
      "onSetItems": onSetItems,
      "onFilteredItemsChanged": onFilteredItemsChanged,
      "onPagingInfoChanged": onPagingInfoChanged
    });
  }

  function AvgAggregator(field) {
    this.field_ = field;

    this.init = function () {
      this.count_ = 0;
      this.nonNullCount_ = 0;
      this.sum_ = 0;
    };

    this.accumulate = function (item) {
      var val = item[this.field_];
      this.count_++;
      if (val != null && val !== "" && val !== NaN) {
        this.nonNullCount_++;
        this.sum_ += parseFloat(val);
      }
    };

    this.storeResult = function (groupTotals) {
      if (!groupTotals.avg) {
        groupTotals.avg = {};
      }
      if (this.nonNullCount_ != 0) {
        groupTotals.avg[this.field_] = this.sum_ / this.nonNullCount_;
      }
    };
  }

  function MinAggregator(field) {
    this.field_ = field;

    this.init = function () {
      this.min_ = null;
    };

    this.accumulate = function (item) {
      var val = item[this.field_];
      if (val != null && val !== "" && val !== NaN) {
        if (this.min_ == null || val < this.min_) {
          this.min_ = val;
        }
      }
    };

    this.storeResult = function (groupTotals) {
      if (!groupTotals.min) {
        groupTotals.min = {};
      }
      groupTotals.min[this.field_] = this.min_;
    }
  }

  function MaxAggregator(field) {
    this.field_ = field;

    this.init = function () {
      this.max_ = null;
    };

    this.accumulate = function (item) {
      var val = item[this.field_];
      if (val != null && val !== "" && val !== NaN) {
        if (this.max_ == null || val > this.max_) {
          this.max_ = val;
        }
      }
    };

    this.storeResult = function (groupTotals) {
      if (!groupTotals.max) {
        groupTotals.max = {};
      }
      groupTotals.max[this.field_] = this.max_;
    }
  }

  function SumAggregator(field) {
    this.field_ = field;

    this.init = function () {
      this.sum_ = null;
    };

    this.accumulate = function (item) {
      var val = item[this.field_];
      if (val != null && val !== "" && val !== NaN) {
        this.sum_ += parseFloat(val);
      }
    };

    this.storeResult = function (groupTotals) {
      if (!groupTotals.sum) {
        groupTotals.sum = {};
      }
      groupTotals.sum[this.field_] = this.sum_;
    }
  }

  // TODO:  add more built-in aggregators
  // TODO:  merge common aggregators in one to prevent needles iterating

})(jQuery);

/***
 * Contains basic SlickGrid editors.
 * @module Editors
 * @namespace Slick
 */

(function ($) {
  // register namespace
  $.extend(true, window, {
    "Slick": {
      "Editors": {
        "Text": TextEditor,
        "Integer": IntegerEditor,
        "Date": DateEditor,
        "YesNoSelect": YesNoSelectEditor,
        "Checkbox": CheckboxEditor,
        "PercentComplete": PercentCompleteEditor,
        "LongText": LongTextEditor
      }
    }
  });

  function TextEditor(args) {
    var $input;
    var defaultValue;
    var scope = this;

    this.init = function () {
      $input = $("<INPUT type=text class='editor-text' />")
          .appendTo(args.container)
          .bind("keydown.nav", function (e) {
            if (e.keyCode === $.ui.keyCode.LEFT || e.keyCode === $.ui.keyCode.RIGHT) {
              e.stopImmediatePropagation();
            }
          })
          .focus()
          .select();
    };

    this.destroy = function () {
      $input.remove();
    };

    this.focus = function () {
      $input.focus();
    };

    this.getValue = function () {
      return $input.val();
    };

    this.setValue = function (val) {
      $input.val(val);
    };

    this.loadValue = function (item) {
      defaultValue = item[args.column.field] || "";
      $input.val(defaultValue);
      $input[0].defaultValue = defaultValue;
      $input.select();
    };

    this.serializeValue = function () {
      return $input.val();
    };

    this.applyValue = function (item, state) {
      item[args.column.field] = state;
    };

    this.isValueChanged = function () {
      return (!($input.val() == "" && defaultValue == null)) && ($input.val() != defaultValue);
    };

    this.validate = function () {
      if (args.column.validator) {
        var validationResults = args.column.validator($input.val());
        if (!validationResults.valid) {
          return validationResults;
        }
      }

      return {
        valid: true,
        msg: null
      };
    };

    this.init();
  }

  function IntegerEditor(args) {
    var $input;
    var defaultValue;
    var scope = this;

    this.init = function () {
      $input = $("<INPUT type=text class='editor-text' />");

      $input.bind("keydown.nav", function (e) {
        if (e.keyCode === $.ui.keyCode.LEFT || e.keyCode === $.ui.keyCode.RIGHT) {
          e.stopImmediatePropagation();
        }
      });

      $input.appendTo(args.container);
      $input.focus().select();
    };

    this.destroy = function () {
      $input.remove();
    };

    this.focus = function () {
      $input.focus();
    };

    this.loadValue = function (item) {
      defaultValue = item[args.column.field];
      $input.val(defaultValue);
      $input[0].defaultValue = defaultValue;
      $input.select();
    };

    this.serializeValue = function () {
      return parseInt($input.val(), 10) || 0;
    };

    this.applyValue = function (item, state) {
      item[args.column.field] = state;
    };

    this.isValueChanged = function () {
      return (!($input.val() == "" && defaultValue == null)) && ($input.val() != defaultValue);
    };

    this.validate = function () {
      if (isNaN($input.val())) {
        return {
          valid: false,
          msg: "Please enter a valid integer"
        };
      }

      return {
        valid: true,
        msg: null
      };
    };

    this.init();
  }

  function DateEditor(args) {
    var $input;
    var defaultValue;
    var scope = this;
    var calendarOpen = false;

    this.init = function () {
      $input = $("<INPUT type=text class='editor-text' />");
      $input.appendTo(args.container);
      $input.focus().select();
      $input.datepicker({
        showOn: "button",
        buttonImageOnly: true,
        buttonImage: "../images/calendar.gif",
        beforeShow: function () {
          calendarOpen = true
        },
        onClose: function () {
          calendarOpen = false
        }
      });
      $input.width($input.width() - 18);
    };

    this.destroy = function () {
      $.datepicker.dpDiv.stop(true, true);
      $input.datepicker("hide");
      $input.datepicker("destroy");
      $input.remove();
    };

    this.show = function () {
      if (calendarOpen) {
        $.datepicker.dpDiv.stop(true, true).show();
      }
    };

    this.hide = function () {
      if (calendarOpen) {
        $.datepicker.dpDiv.stop(true, true).hide();
      }
    };

    this.position = function (position) {
      if (!calendarOpen) {
        return;
      }
      $.datepicker.dpDiv
          .css("top", position.top + 30)
          .css("left", position.left);
    };

    this.focus = function () {
      $input.focus();
    };

    this.loadValue = function (item) {
      defaultValue = item[args.column.field];
      $input.val(defaultValue);
      $input[0].defaultValue = defaultValue;
      $input.select();
    };

    this.serializeValue = function () {
      return $input.val();
    };

    this.applyValue = function (item, state) {
      item[args.column.field] = state;
    };

    this.isValueChanged = function () {
      return (!($input.val() == "" && defaultValue == null)) && ($input.val() != defaultValue);
    };

    this.validate = function () {
      return {
        valid: true,
        msg: null
      };
    };

    this.init();
  }

  function YesNoSelectEditor(args) {
    var $select;
    var defaultValue;
    var scope = this;

    this.init = function () {
      $select = $("<SELECT tabIndex='0' class='editor-yesno'><OPTION value='yes'>Yes</OPTION><OPTION value='no'>No</OPTION></SELECT>");
      $select.appendTo(args.container);
      $select.focus();
    };

    this.destroy = function () {
      $select.remove();
    };

    this.focus = function () {
      $select.focus();
    };

    this.loadValue = function (item) {
      $select.val((defaultValue = item[args.column.field]) ? "yes" : "no");
      $select.select();
    };

    this.serializeValue = function () {
      return ($select.val() == "yes");
    };

    this.applyValue = function (item, state) {
      item[args.column.field] = state;
    };

    this.isValueChanged = function () {
      return ($select.val() != defaultValue);
    };

    this.validate = function () {
      return {
        valid: true,
        msg: null
      };
    };

    this.init();
  }

  function CheckboxEditor(args) {
    var $select;
    var defaultValue;
    var scope = this;

    this.init = function () {
      $select = $("<INPUT type=checkbox value='true' class='editor-checkbox' hideFocus>");
      $select.appendTo(args.container);
      $select.focus();
    };

    this.destroy = function () {
      $select.remove();
    };

    this.focus = function () {
      $select.focus();
    };

    this.loadValue = function (item) {
      defaultValue = !!item[args.column.field];
      if (defaultValue) {
        $select.prop('checked', true);
      } else {
        $select.prop('checked', false);
      }
    };

    this.serializeValue = function () {
      return $select.prop('checked');
    };

    this.applyValue = function (item, state) {
      item[args.column.field] = state;
    };

    this.isValueChanged = function () {
      return (this.serializeValue() !== defaultValue);
    };

    this.validate = function () {
      return {
        valid: true,
        msg: null
      };
    };

    this.init();
  }

  function PercentCompleteEditor(args) {
    var $input, $picker;
    var defaultValue;
    var scope = this;

    this.init = function () {
      $input = $("<INPUT type=text class='editor-percentcomplete' />");
      $input.width($(args.container).innerWidth() - 25);
      $input.appendTo(args.container);

      $picker = $("<div class='editor-percentcomplete-picker' />").appendTo(args.container);
      $picker.append("<div class='editor-percentcomplete-helper'><div class='editor-percentcomplete-wrapper'><div class='editor-percentcomplete-slider' /><div class='editor-percentcomplete-buttons' /></div></div>");

      $picker.find(".editor-percentcomplete-buttons").append("<button val=0>Not started</button><br/><button val=50>In Progress</button><br/><button val=100>Complete</button>");

      $input.focus().select();

      $picker.find(".editor-percentcomplete-slider").slider({
        orientation: "vertical",
        range: "min",
        value: defaultValue,
        slide: function (event, ui) {
          $input.val(ui.value)
        }
      });

      $picker.find(".editor-percentcomplete-buttons button").bind("click", function (e) {
        $input.val($(this).attr("val"));
        $picker.find(".editor-percentcomplete-slider").slider("value", $(this).attr("val"));
      })
    };

    this.destroy = function () {
      $input.remove();
      $picker.remove();
    };

    this.focus = function () {
      $input.focus();
    };

    this.loadValue = function (item) {
      $input.val(defaultValue = item[args.column.field]);
      $input.select();
    };

    this.serializeValue = function () {
      return parseInt($input.val(), 10) || 0;
    };

    this.applyValue = function (item, state) {
      item[args.column.field] = state;
    };

    this.isValueChanged = function () {
      return (!($input.val() == "" && defaultValue == null)) && ((parseInt($input.val(), 10) || 0) != defaultValue);
    };

    this.validate = function () {
      if (isNaN(parseInt($input.val(), 10))) {
        return {
          valid: false,
          msg: "Please enter a valid positive number"
        };
      }

      return {
        valid: true,
        msg: null
      };
    };

    this.init();
  }

  /*
   * An example of a "detached" editor.
   * The UI is added onto document BODY and .position(), .show() and .hide() are implemented.
   * KeyDown events are also handled to provide handling for Tab, Shift-Tab, Esc and Ctrl-Enter.
   */
  function LongTextEditor(args) {
    var $input, $wrapper;
    var defaultValue;
    var scope = this;

    this.init = function () {
      var $container = $("body");

      $wrapper = $("<DIV style='z-index:10000;position:absolute;background:white;padding:5px;border:3px solid gray; -moz-border-radius:10px; border-radius:10px;'/>")
          .appendTo($container);

      $input = $("<TEXTAREA hidefocus rows=5 style='backround:white;width:250px;height:80px;border:0;outline:0'>")
          .appendTo($wrapper);

      $("<DIV style='text-align:right'><BUTTON>Save</BUTTON><BUTTON>Cancel</BUTTON></DIV>")
          .appendTo($wrapper);

      $wrapper.find("button:first").bind("click", this.save);
      $wrapper.find("button:last").bind("click", this.cancel);
      $input.bind("keydown", this.handleKeyDown);

      scope.position(args.position);
      $input.focus().select();
    };

    this.handleKeyDown = function (e) {
      if (e.which == $.ui.keyCode.ENTER && e.ctrlKey) {
        scope.save();
      } else if (e.which == $.ui.keyCode.ESCAPE) {
        e.preventDefault();
        scope.cancel();
      } else if (e.which == $.ui.keyCode.TAB && e.shiftKey) {
        e.preventDefault();
        args.grid.navigatePrev();
      } else if (e.which == $.ui.keyCode.TAB) {
        e.preventDefault();
        args.grid.navigateNext();
      }
    };

    this.save = function () {
      args.commitChanges();
    };

    this.cancel = function () {
      $input.val(defaultValue);
      args.cancelChanges();
    };

    this.hide = function () {
      $wrapper.hide();
    };

    this.show = function () {
      $wrapper.show();
    };

    this.position = function (position) {
      $wrapper
          .css("top", position.top - 5)
          .css("left", position.left - 5)
    };

    this.destroy = function () {
      $wrapper.remove();
    };

    this.focus = function () {
      $input.focus();
    };

    this.loadValue = function (item) {
      $input.val(defaultValue = item[args.column.field]);
      $input.select();
    };

    this.serializeValue = function () {
      return $input.val();
    };

    this.applyValue = function (item, state) {
      item[args.column.field] = state;
    };

    this.isValueChanged = function () {
      return (!($input.val() == "" && defaultValue == null)) && ($input.val() != defaultValue);
    };

    this.validate = function () {
      return {
        valid: true,
        msg: null
      };
    };

    this.init();
  }
})(jQuery);

/***
 * Contains basic SlickGrid formatters.
 * 
 * NOTE:  These are merely examples.  You will most likely need to implement something more
 *        robust/extensible/localizable/etc. for your use!
 * 
 * @module Formatters
 * @namespace Slick
 */

(function ($) {
  // register namespace
  $.extend(true, window, {
    "Slick": {
      "Formatters": {
        "PercentComplete": PercentCompleteFormatter,
        "PercentCompleteBar": PercentCompleteBarFormatter,
        "YesNo": YesNoFormatter,
        "Checkmark": CheckmarkFormatter
      }
    }
  });

  function PercentCompleteFormatter(row, cell, value, columnDef, dataContext) {
    if (value == null || value === "") {
      return "-";
    } else if (value < 50) {
      return "<span style='color:red;font-weight:bold;'>" + value + "%</span>";
    } else {
      return "<span style='color:green'>" + value + "%</span>";
    }
  }

  function PercentCompleteBarFormatter(row, cell, value, columnDef, dataContext) {
    if (value == null || value === "") {
      return "";
    }

    var color;

    if (value < 30) {
      color = "red";
    } else if (value < 70) {
      color = "silver";
    } else {
      color = "green";
    }

    return "<span class='percent-complete-bar' style='background:" + color + ";width:" + value + "%'></span>";
  }

  function YesNoFormatter(row, cell, value, columnDef, dataContext) {
    return value ? "Yes" : "No";
  }

  function CheckmarkFormatter(row, cell, value, columnDef, dataContext) {
    return value ? "<img src='../images/tick.png'>" : "";
  }
})(jQuery);

(function ($) {
  $.extend(true, window, {
    Slick: {
      Data: {
        GroupItemMetadataProvider: GroupItemMetadataProvider
      }
    }
  });


  /***
   * Provides item metadata for group (Slick.Group) and totals (Slick.Totals) rows produced by the DataView.
   * This metadata overrides the default behavior and formatting of those rows so that they appear and function
   * correctly when processed by the grid.
   *
   * This class also acts as a grid plugin providing event handlers to expand & collapse groups.
   * If "grid.registerPlugin(...)" is not called, expand & collapse will not work.
   *
   * @class GroupItemMetadataProvider
   * @module Data
   * @namespace Slick.Data
   * @constructor
   * @param options
   */
  function GroupItemMetadataProvider(options) {
    var _grid;
    var _defaults = {
      groupCssClass: "slick-group",
      groupTitleCssClass: "slick-group-title",
      totalsCssClass: "slick-group-totals",
      groupFocusable: true,
      totalsFocusable: false,
      toggleCssClass: "slick-group-toggle",
      toggleExpandedCssClass: "expanded",
      toggleCollapsedCssClass: "collapsed",
      enableExpandCollapse: true,
      groupFormatter: defaultGroupCellFormatter,
      totalsFormatter: defaultTotalsCellFormatter
    };

    options = $.extend(true, {}, _defaults, options);


    function defaultGroupCellFormatter(row, cell, value, columnDef, item) {
      if (!options.enableExpandCollapse) {
        return item.title;
      }

      var indentation = item.level * 15 + "px";

      return "<span class='" + options.toggleCssClass + " " +
          (item.collapsed ? options.toggleCollapsedCssClass : options.toggleExpandedCssClass) +
          "' style='margin-left:" + indentation +"'>" +
          "</span>" +
          "<span class='" + options.groupTitleCssClass + "' level='" + item.level + "'>" +
            item.title +
          "</span>";
    }

    function defaultTotalsCellFormatter(row, cell, value, columnDef, item) {
      return (columnDef.groupTotalsFormatter && columnDef.groupTotalsFormatter(item, columnDef)) || "";
    }


    function init(grid) {
      _grid = grid;
      _grid.onClick.subscribe(handleGridClick);
      _grid.onKeyDown.subscribe(handleGridKeyDown);

    }

    function destroy() {
      if (_grid) {
        _grid.onClick.unsubscribe(handleGridClick);
        _grid.onKeyDown.unsubscribe(handleGridKeyDown);
      }
    }

    function handleGridClick(e, args) {
      var item = this.getDataItem(args.row);
      if (item && item instanceof Slick.Group && $(e.target).hasClass(options.toggleCssClass)) {
        var range = _grid.getRenderedRange();
        this.getData().setRefreshHints({
          ignoreDiffsBefore: range.top,
          ignoreDiffsAfter: range.bottom
        });

        if (item.collapsed) {
          this.getData().expandGroup(item.groupingKey);
        } else {
          this.getData().collapseGroup(item.groupingKey);
        }

        e.stopImmediatePropagation();
        e.preventDefault();
      }
    }

    // TODO:  add -/+ handling
    function handleGridKeyDown(e, args) {
      if (options.enableExpandCollapse && (e.which == $.ui.keyCode.SPACE)) {
        var activeCell = this.getActiveCell();
        if (activeCell) {
          var item = this.getDataItem(activeCell.row);
          if (item && item instanceof Slick.Group) {
            var range = _grid.getRenderedRange();
            this.getData().setRefreshHints({
              ignoreDiffsBefore: range.top,
              ignoreDiffsAfter: range.bottom
            });

            if (item.collapsed) {
              this.getData().expandGroup(item.groupingKey);
            } else {
              this.getData().collapseGroup(item.groupingKey);
            }

            e.stopImmediatePropagation();
            e.preventDefault();
          }
        }
      }
    }

    function getGroupRowMetadata(item) {
      return {
        selectable: false,
        focusable: options.groupFocusable,
        cssClasses: options.groupCssClass,
        columns: {
          0: {
            colspan: "*",
            formatter: options.groupFormatter,
            editor: null
          }
        }
      };
    }

    function getTotalsRowMetadata(item) {
      return {
        selectable: false,
        focusable: options.totalsFocusable,
        cssClasses: options.totalsCssClass,
        formatter: options.totalsFormatter,
        editor: null
      };
    }


    return {
      "init": init,
      "destroy": destroy,
      "getGroupRowMetadata": getGroupRowMetadata,
      "getTotalsRowMetadata": getTotalsRowMetadata
    };
  }
})(jQuery);

(function ($) {
  /***
   * A sample AJAX data store implementation.
   * Right now, it's hooked up to load Hackernews stories, but can
   * easily be extended to support any JSONP-compatible backend that accepts paging parameters.
   */
  function RemoteModel() {
    // private
    var PAGESIZE = 50;
    var data = {length: 0};
    var searchstr = "";
    var sortcol = null;
    var sortdir = 1;
    var h_request = null;
    var req = null; // ajax request

    // events
    var onDataLoading = new Slick.Event();
    var onDataLoaded = new Slick.Event();


    function init() {
    }


    function isDataLoaded(from, to) {
      for (var i = from; i <= to; i++) {
        if (data[i] == undefined || data[i] == null) {
          return false;
        }
      }

      return true;
    }


    function clear() {
      for (var key in data) {
        delete data[key];
      }
      data.length = 0;
    }


    function ensureData(from, to) {
      if (req) {
        req.abort();
        for (var i = req.fromPage; i <= req.toPage; i++)
          data[i * PAGESIZE] = undefined;
      }

      if (from < 0) {
        from = 0;
      }

      if (data.length > 0) {
        to = Math.min(to, data.length - 1);
      }

      var fromPage = Math.floor(from / PAGESIZE);
      var toPage = Math.floor(to / PAGESIZE);

      while (data[fromPage * PAGESIZE] !== undefined && fromPage < toPage)
        fromPage++;

      while (data[toPage * PAGESIZE] !== undefined && fromPage < toPage)
        toPage--;

      if (fromPage > toPage || ((fromPage == toPage) && data[fromPage * PAGESIZE] !== undefined)) {
        // TODO:  look-ahead
        onDataLoaded.notify({from: from, to: to});
        return;
      }

      var url = "http://api.thriftdb.com/api.hnsearch.com/items/_search?filter[fields][type][]=submission&q=" + searchstr + "&start=" + (fromPage * PAGESIZE) + "&limit=" + (((toPage - fromPage) * PAGESIZE) + PAGESIZE);

      if (sortcol != null) {
          url += ("&sortby=" + sortcol + ((sortdir > 0) ? "+asc" : "+desc"));
      }

      if (h_request != null) {
        clearTimeout(h_request);
      }

      h_request = setTimeout(function () {
        for (var i = fromPage; i <= toPage; i++)
          data[i * PAGESIZE] = null; // null indicates a 'requested but not available yet'

        onDataLoading.notify({from: from, to: to});

        req = $.jsonp({
          url: url,
          callbackParameter: "callback",
          cache: true,
          success: onSuccess,
          error: function () {
            onError(fromPage, toPage)
          }
        });
        req.fromPage = fromPage;
        req.toPage = toPage;
      }, 50);
    }


    function onError(fromPage, toPage) {
      alert("error loading pages " + fromPage + " to " + toPage);
    }

    function onSuccess(resp) {
      var from = resp.request.start, to = from + resp.results.length;
      data.length = Math.min(parseInt(resp.hits),1000); // limitation of the API

      for (var i = 0; i < resp.results.length; i++) {
        var item = resp.results[i].item;

        // Old IE versions can't parse ISO dates, so change to universally-supported format.
        item.create_ts = item.create_ts.replace(/^(\d+)-(\d+)-(\d+)T(\d+:\d+:\d+)Z$/, "$2/$3/$1 $4 UTC"); 
        item.create_ts = new Date(item.create_ts);

        data[from + i] = item;
        data[from + i].index = from + i;
      }

      req = null;

      onDataLoaded.notify({from: from, to: to});
    }


    function reloadData(from, to) {
      for (var i = from; i <= to; i++)
        delete data[i];

      ensureData(from, to);
    }


    function setSort(column, dir) {
      sortcol = column;
      sortdir = dir;
      clear();
    }

    function setSearch(str) {
      searchstr = str;
      clear();
    }


    init();

    return {
      // properties
      "data": data,

      // methods
      "clear": clear,
      "isDataLoaded": isDataLoaded,
      "ensureData": ensureData,
      "reloadData": reloadData,
      "setSort": setSort,
      "setSearch": setSearch,

      // events
      "onDataLoading": onDataLoading,
      "onDataLoaded": onDataLoaded
    };
  }

  // Slick.Data.RemoteModel
  $.extend(true, window, { Slick: { Data: { RemoteModel: RemoteModel }}});
})(jQuery);

/**
 * @license
 * (c) 2016 Coatue Management LLC
 * (c) 2009-2013 Michael Leibman
 * http://github.com/coatue/slickgrid
 *
 * Distributed under MIT license.
 * All rights reserved.
 *
 * NOTES:
 *     Cell/row DOM manipulations are done directly bypassing jQuery's DOM manipulation methods.
 *     This increases the speed dramatically, but can only be done safely because there are no event handlers
 *     or data associated with any cell/row DOM nodes. Cell editors must make sure they implement .destroy()
 *     and do proper cleanup.
 *
 * type Range {
 *   top: Number,
 *   bottom: Number,
 *   leftPx: Number,
 *   rightPx: Number
 * }
 *
 */

// make sure required JavaScript modules are loaded
if (typeof jQuery === "undefined") {
  throw "SlickGrid requires jquery module to be loaded";
}
if (!jQuery.fn.drag) {
  throw "SlickGrid requires jquery.event.drag module to be loaded";
}
if (typeof Slick === "undefined") {
  throw "slick.core.js not loaded";
}

var $ = jQuery;

// Slick.Grid
$.extend(true, window, {
  Slick: {
    Grid: SlickGrid
  }
});

// constants
var COLUMNS_TO_LEFT = -1;
var COLUMNS_TO_RIGHT = 1;

// shared across all grids on the page
var scrollbarDimensions;
var maxSupportedCssHeight; // browser's breaking point

// ////////////////////////////////////////////////////////////////////////////////////////////
// SlickGrid class implementation (available as Slick.Grid)

/**
 * Creates a new instance of the grid.
 * @class SlickGrid
 * @constructor
 * @param {Node}              container   Container node to create the grid in.
 * @param {Array,Object}      data        An array of objects for databinding.
 * @param {Array}             columns     An array of column definitions.
 * @param {Object}            options     Grid options.
 **/
function SlickGrid(container, data, columns, options) {
  // settings
  var defaults = {
    debug: false, // bool for debug mode. turns on some css styling and console logging.
    explicitInitialization: false,
    //rowHeight: 25,
    defaultColumnWidth: 80,
    absoluteColumnMinWidth: 20, // Don't let folks resize smaller than this, Should be the width of ellipsis. May need to take box-sizing into account
    enableAddRow: false,
    leaveSpaceForNewRows: false,
    editable: false,
    autoEdit: true,
    enableCellNavigation: true,
    enableColumnReorder: false, // Breaking change to default. Don't want to depend on jQuery UI by default
    enableColumnResize: true,
    asyncEditorLoading: false,
    asyncEditorLoadDelay: 100,
    forceFitColumns: false,
    enableAsyncPostRender: false,
    asyncPostRenderDelay: 50,
    autoHeight: false,
    editorLock: new Slick.EditorLock(),
    showSubHeaders: false,
    addRowIndexToClassName: true,
    formatterFactory: null,
    editorFactory: null,
    cellFlashingCssClass: "flashing",
    selectedCellCssClass: "selected",
    multiSelect: true,
    enableTextSelectionOnCells: false,
    dataItemColumnValueExtractor: null,
    fullWidthRows: false,
    multiColumnSort: false,
    defaultFormatter: defaultFormatter,
    columnHeaderRenderer: columnHeaderRenderer,
    subHeaderRenderers: [], // Array[(Column) => jQuery]
    forceSyncScrolling: false,
    addNewRowCssClass: "new-row",
    useAntiscroll: false,
    showScrollbarsOnHover: false,
    skipPaging: false, // reveal one hidden row at a time instead of an entirely new page on keypress
    appendSubheadersToContainer: false, // useful for fixed subheaders, or to make subheaders appear as footers
    scrollbarSize: null, // ({ height: Number, width: Number }|null) we can avoid a forced layout if we know this beforehand
    maxSupportedCssHeight: null // (Number|null) we can avoid a forced layout if we know this beforehand
  };

  var columnDefaults = {
    name: "",
    resizable: true,
    sortable: false,
    minWidth: defaults.absoluteColumnMinWidth,
    rerenderOnResize: false,
    headerCssClass: null,
    defaultSortAsc: true,
    focusable: true,
    selectable: true
  };

  // scroller
  var th;   // virtual height
  var h;    // real scrollable height
  var ph;   // page height
  var n;    // number of pages
  var cj;   // "jumpiness" coefficient

  var page = 0;       // current page
  var offset = 0;     // current page offset
  var vScrollDir = 1;

  // private
  var initialized = false;
  var $container;
  var objectName = 'slickGrid';
  var uid = objectName + '_' + Math.round(1000000 * Math.random());
  var isPinned;
  var self = this;
  var $focusSink, $focusSink2;

  // TODO: move all state to this object
  var state = {
    invalidateSafeCellChangeCallback: null // Function|null
  };

  var $style;
  var $boundAncestors;
  var stylesheet, columnCssRulesL, columnCssRulesR;

  var viewportHasHScroll, viewportHasVScroll;

  var tabbingDirection = 1;
  var activePosX;
  var activeRow, activeCell;
  var activeCellNode = null;
  var currentEditor = null;
  var serializedEditorValue;
  var editController;

  var rowsCache = {};
  var renderedRows = 0;
  var numVisibleRows;
  var prevScrollTop = 0;
  var scrollTop = 0;
  var lastRenderedScrollTop = 0;
  var lastRenderedScrollLeft = 0;
  var prevScrollLeft = 0;
  var scrollLeft = 0;

  var selectionModel;
  var selectedRows = [];

  var plugins = [];
  var cellCssClasses = {};

  var columnIdxById = {};
  var sortColumns = [];
  var columnPosLeft = [];
  var columnPosRight = [];


  // async call handles
  var h_editorLoader = null;
  var h_render = null;
  var h_postrender = null;
  var postProcessedRows = {};
  var postProcessToRow = null;
  var postProcessFromRow = null;

  // perf counters
  var counter_rows_rendered = 0;
  var counter_rows_removed = 0;

  var $activeCanvasNode;

  // This variable works around a bug with inertial scrolling in Webkit/Blink on Mac.
  // See http://crbug.com/312427.
  // The index of the row that started the latest bout of scrolling is temporarily protected from removal.
  var protectedRowIdx;



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

  var topViewport         = [{},{}],  // The scrolling region
      topCanvas           = [{},{}],  // The full size of content (both off and on screen)
      header              = [{},{}],  // The column headers
      subHeaders          = [{},{}],  // Optional rows of cells below the column headers
      contentViewportWrap = {},       // Content viewports are wrapped with elements that have
                                      //   the same dimensions as the viewports themselves.
                                      //   This is in service of the antiscroll plugin.
      contentViewport     = [{},{}],  // The scrolling region for the grid rows
      contentCanvas       = [{},{}],  // Full size of row content, both width and height
      rows                = [{},{}];  // Container for information about rows

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

  function init() {
    // calculate these only once and share between grid instances
    maxSupportedCssHeight = maxSupportedCssHeight || getMaxSupportedCssHeight();
    scrollbarDimensions   = scrollbarDimensions   || measureScrollbar();

    options = $.extend({}, defaults, options);

    if (options.useAntiscroll && !$.isFunction($.fn.antiscroll)) {
      throw new ReferenceError('The { useAntiscroll: true } option was passed to SlickGrid, but the antiscroll library is not loaded. You can download the library here: https://github.com/bcherny/antiscroll.');
    }

    validateAndEnforceOptions();
    columnDefaults.width = options.defaultColumnWidth;

    enforceWidthLimits(columns);

    // validate loaded JavaScript modules against requested options
    if (options.enableColumnReorder && !$.fn.sortable) {
      throw new Error("SlickGrid's 'enableColumnReorder = true' option requires jquery-ui.sortable module to be loaded");
    }

    editController = {
      "commitCurrentEdit": commitCurrentEdit,
      "cancelCurrentEdit": cancelCurrentEdit
    };

    if (!options.explicitInitialization) {
      finishInitialization();
    }

  }


  function finishInitialization(newContainer) {
    if(initialized) { return }
    initialized = true;

    container = container || newContainer
    $container = $(container);
    if ($container.length < 1) {
      throw new Error("SlickGrid requires a valid container, " + container + " does not exist in the DOM.");
    }

    $container.empty().addClass(objectName +' '+ uid +' ui-widget');
    if (options.debug) { $container.addClass('debug') }

    // set up a positioning container if needed
    if (!/relative|absolute|fixed/.test($container.css("position"))) {
      $container.css("position", "relative");
    }

    $focusSink = $("<div tabIndex='0' hideFocus class='focus-sink'></div>").appendTo($container);

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
    topViewport.el = $(
      "<div class='viewport T L' tabIndex='0' hideFocus />" +
      "<div class='viewport T R' tabIndex='0' hideFocus />"
    );
    topCanvas.el = $(
      "<div class='canvas T L' />" +
      "<div class='canvas T R' />"
    );
    header.el = $(
      "<div class='header' />" +
      "<div class='header' />"
    );
    subHeaders.el = $(
      "<div class='subHeaders' />" +
      "<div class='subHeaders' />"
    );

    if (!options.showSubHeaders) { subHeaders.el.hide(); }

    contentViewportWrap.el = $(
      "<div class='viewport-wrap C L' tabIndex='0' hideFocus />" +
      "<div class='viewport-wrap C R' tabIndex='0' hideFocus />"
    );

    contentViewport.el = $(
      "<div class='viewport C L antiscroll-inner' tabIndex='0' hideFocus />" +
      "<div class='viewport C R antiscroll-inner' tabIndex='0' hideFocus />"
    );
    contentCanvas.el = $(
      "<div class='canvas C L' tabIndex='0' hideFocus />" +
      "<div class='canvas C R' tabIndex='0' hideFocus />"
    );


    // ----------------------- Matryoshka the elements together
    topCanvas.el[0].appendChild(header.el[0]);
    topCanvas.el[1].appendChild(header.el[1]);
    topViewport.el[0].appendChild(topCanvas.el[0]);
    topViewport.el[1].appendChild(topCanvas.el[1]);
    contentViewport.el[0].appendChild(contentCanvas.el[0]);
    contentViewport.el[1].appendChild(contentCanvas.el[1]);
    contentViewportWrap.el[0].appendChild(contentViewport.el[0]);
    contentViewportWrap.el[1].appendChild(contentViewport.el[1]);

    injectSubheaders(options.appendSubheadersToContainer);

    $container.append( topViewport.el, contentViewportWrap.el );

    measureCssSizes(); // Wins award for most 's'es in a row.


    // Default the active canvas to the top left
    $activeCanvasNode = contentCanvas.el.eq(0);

    $focusSink2 = $focusSink.clone().appendTo($container); // after the grid, in tab index order.

    // Start of original finishInitialization

    calculateViewportWidth();

    // for usability reasons, all text selection in SlickGrid is disabled
    // with the exception of input and textarea elements (selection must
    // be enabled there so that editors work as expected); note that
    // selection in grid cells (grid body) is already unavailable in
    // all browsers except IE
    disableSelection(header.el); // disable all text selection in header (including input and textarea)

    if (!options.enableTextSelectionOnCells) {
      // disable text selection in grid cells except in input and textarea elements
      // (this is IE-specific, because selectstart event will only fire in IE)
      contentViewport.el.bind("selectstart.ui", function (event) {
        return $(event.target).is("input,textarea");
      });
    }

    updateColumnCaches();
    createCssRules();
    updatePinnedState();
    setupColumnSort();
    bindAncestorScrollEvents();

    $container
      .bind("resize.slickgrid", resizeCanvas);
    contentViewport.el
      .bind("scroll", onScroll);
    topViewport.el
      .bind("mousewheel", onHeaderMouseWheel); // modern browsers only, not in gecko
    header.el
      .bind("contextmenu", handleHeaderContextMenu)
      .bind("click", handleHeaderClick)
      .delegate(".slick-header-column", "mouseenter", handleHeaderMouseEnter)
      .delegate(".slick-header-column", "mouseleave", handleHeaderMouseLeave);
    subHeaders.el
      .bind('contextmenu', handleSubHeaderContextMenu);
    $focusSink.add($focusSink2)
      .bind("keydown", handleKeyDown);
    contentCanvas.el
      .bind("keydown", handleKeyDown)
      .bind("click", handleClick)
      .bind("dblclick", handleDblClick)
      .bind("contextmenu", handleContextMenu)
      .bind("draginit", handleDragInit)
      .bind("dragstart", {distance: 3}, handleDragStart)
      .bind("drag", handleDrag)
      .bind("dragend", handleDragEnd)
      .delegate(".cell", "mouseenter", handleMouseEnter)
      .delegate(".cell", "mouseleave", handleMouseLeave);

    // Work around http://crbug.com/312427.
    if (navigator.userAgent.toLowerCase().match(/webkit/) &&
      navigator.userAgent.toLowerCase().match(/macintosh/)) {
      contentCanvas.el.bind("mousewheel", function(evt){
        var scrolledRow = $(evt.target).closest(".row")[0];
        protectedRowIdx = getRowFromNode(scrolledRow);
      });
    }
  }

  function registerPlugin(plugin) {
    plugins.unshift(plugin);
    plugin.init(self);
  }

  function unregisterPlugin(plugin) {
    for (var i = plugins.length; i >= 0; i--) {
      if (plugins[i] === plugin) {
        if (plugins[i].destroy) {
          plugins[i].destroy();
        }
        plugins.splice(i, 1);
        break;
      }
    }
  }

  function setSelectionModel(model) {
    if (selectionModel) {
      selectionModel.onSelectedRangesChanged.unsubscribe(handleSelectedRangesChanged);
      if (selectionModel.destroy) {
        selectionModel.destroy();
      }
    }

    selectionModel = model;
    if (selectionModel) {
      selectionModel.init(self);
      selectionModel.onSelectedRangesChanged.subscribe(handleSelectedRangesChanged);
    }
  }

  function getSelectionModel() {
    return selectionModel;
  }

  function getContentCanvasNode() {
    return contentCanvas.el; // could be one or two elements, depending on whether columns are pinned. Always a jquery element.
  }
  function getTopCanvasNode() {
    return topCanvas.el;
  }

  function measureScrollbar() {
    if (options.scrollbarSize) {
      return options.scrollbarSize;
    }
    var $c = $("<div style='position:absolute; top:-10000px; left:-10000px; width:100px; height:100px; overflow:scroll;'></div>").appendTo("body");
    var dim = {
      width: $c.width() - $c[0].clientWidth,
      height: $c.height() - $c[0].clientHeight
    };
    $c.remove();
    return dim;
  }

  // (void) => void
  function calculateCanvasWidth() {
    var availableWidth = viewportHasVScroll ? contentViewport.width - scrollbarDimensions.width : contentViewport.width;
    var i = columns.length;
    contentCanvas.width = contentCanvas[0].width = contentCanvas[1].width = 0;

    while (i--) {
      var column = columns[i];
      if (column.width == null) {
        console.warn("width shouldn't be null/undefined", column);
        continue;
      }

      if (isColumnInvisible(column)) continue;

      if (i > options.pinnedColumn) {
        contentCanvas[1].width += column.width;
      } else {
        contentCanvas[0].width += column.width;
      }
    }

    contentCanvas.width = contentCanvas[0].width + contentCanvas[1].width;
    if (options.fullWidthRows) {
      var extraRoom = Math.max(0, availableWidth - contentCanvas.width);
      contentCanvas.width += extraRoom;
      if (options.pinnedColumn != null) {
        contentCanvas[1].width += extraRoom
      } else {
        contentCanvas[0].width += extraRoom
      }
    }
  }

  function updateCanvasWidth(forceColumnWidthsUpdate) {
    var oldCanvasWidth  = contentCanvas.width,
      oldCanvasWidthL = contentCanvas[0].width,
      oldCanvasWidthR = contentCanvas[1].width,
      widthChanged;

    calculateCanvasWidth();

    var canvasWidth  = contentCanvas.width,
      canvasWidthL = contentCanvas[0].width,
      canvasWidthR = contentCanvas[1].width;

    widthChanged =  canvasWidth  !== oldCanvasWidth  ||
    canvasWidthL !== oldCanvasWidthL ||
    canvasWidthR !== oldCanvasWidthR;

    if (widthChanged || isPinned) { // TODO: why would it always do this work if there is a pinned column?
//        setHeadersWidth();
      topCanvas.el[0].style.width =
        contentCanvas.el[0].style.width =
          canvasWidthL + 'px';

      if (isPinned) {
        topCanvas.el[1].style.width =
          contentCanvas.el[1].style.width =
            canvasWidthR + 'px';

        // Set widths on the left side, and width+left offset on the right side
        topViewport.el[0].style.width =
          topViewport.el[1].style.left =
            contentViewportWrap.el[0].style.width =
              contentViewportWrap.el[1].style.left =
                canvasWidthL + 'px';
        topViewport.el[1].style.width =
          contentViewportWrap.el[1].style.width =
            (contentViewport.width - canvasWidthL) + 'px';

      } else {
        topViewport.el[0].style.width =
          contentViewportWrap.el[0].style.width =
            null;
      }

      if (options.appendSubheadersToContainer) {
        subHeaders.el.find('.subHeader-row').css('width', canvasWidthL);
      }

      viewportHasHScroll = (canvasWidth > contentViewport.width - scrollbarDimensions.width);
    }

    if (true || widthChanged || forceColumnWidthsUpdate) {
      applyColumnWidths();
    }
  }

  function disableSelection($target) {
    if ($target && $target.jquery) {
      $target
        .attr("unselectable", "on")
        .css("MozUserSelect", "none")
        .bind("selectstart.ui", function () {
          return false;
        }); // from jquery:ui.core.js 1.7.2
    }
  }

  function getMaxSupportedCssHeight() {
    if (options.maxSupportedCssHeight) {
      return options.maxSupportedCssHeight;
    }
    var supportedHeight = 1000000;
    // FF reports the height back but still renders blank after ~6M px
    var testUpTo = navigator.userAgent.toLowerCase().match(/firefox/) ? 6000000 : 1000000000;
    var div = $("<div style='display:none' />").appendTo(document.body);

    while (true) {
      var test = supportedHeight * 2;
      div.css("height", test);
      if (test > testUpTo || div.height() !== test) {
        break;
      } else {
        supportedHeight = test;
      }
    }

    div.remove();
    return supportedHeight;
  }

  // TODO:  this is static.  need to handle page mutation.
  function bindAncestorScrollEvents() {
    var elem = contentCanvas.el[0];
    while ((elem = elem.parentNode) != document.body && elem != null) {
      // bind to scroll containers only
      if (elem == contentViewport.el[0] || elem.scrollWidth != elem.clientWidth || elem.scrollHeight != elem.clientHeight) {
        var $elem = $(elem);
        if (!$boundAncestors) {
          $boundAncestors = $elem;
        } else {
          $boundAncestors = $boundAncestors.add($elem);
        }
        $elem.bind("scroll." + uid, handleActiveCellPositionChange);
      }
    }
  }

  function updateColumnHeaders() {
    for (var i = 0; i < columns.length; i++) {
      updateColumnHeader(columns[i].id);
    }
  }

  function unbindAncestorScrollEvents() {
    if (!$boundAncestors) {
      return;
    }
    $boundAncestors.unbind("scroll." + uid);
    $boundAncestors = null;
  }

  function updateColumnHeader(columnId, title, toolTip) {
    if (!initialized) { return; }
    var idx = getColumnIndex(columnId);
    if (idx == null) { return; }

    var columnDef = columns[idx];
    var $header = header.el.children().eq(idx); //var $header = topCanvas.el.children().eq(idx);
    if ($header) {
      if (title !== undefined) {
        columns[idx].name = title;
      }
      if (toolTip !== undefined) {
        columns[idx].toolTip = toolTip;
      }

      trigger(self.onBeforeHeaderCellDestroy, {
        "node": $header[0],
        "column": columnDef
      });

      $header
        .attr("title", toolTip || "")
        .removeClass($header.data("headerCssClass"))
        .addClass(columnDef.headerCssClass || "")
        .data("headerCssClass", columnDef.headerCssClass)
        .children().eq(0).html(title);

      trigger(self.onHeaderCellRendered, {
        "node": $header[0],
        "column": columnDef
      });
    }
  }

  // TODO: support subHeaders.el[1]
  // (appendSubheadersToContainer: Boolean) => DOMElement|jQuery
  function injectSubheaders(appendSubheadersToContainer) {
    if (appendSubheadersToContainer) {
      $container.append(subHeaders.el[0]);
    } else {
      topCanvas.el[0].appendChild(subHeaders.el[0]);
      topCanvas.el[1].appendChild(subHeaders.el[1]);
    }
  }

  // Updates the contents of a single subHeader cell
  // Does not destroy, remove event listeners, update any attached .data(), etc.
  // (columnId: Number, rowIndex: Number) => void
  function updateSubHeaders(columnId, rowIndex) {
    if (!initialized) { return; }
    var columnIndex = getColumnIndex(columnId);
    if (columnIndex == null) {
      throw new ReferenceError('Slick.Grid#updateSubHeader cannot update subheader because column ' + columnId + ' is not defined on the given grid');
    }
    if (rowIndex == null) {
      rowIndex = 0;
    }

    // Get needed data for this column
    var columnDef = columns[columnIndex];
    var newEl = options.subHeaderRenderers[rowIndex](columnDef);

    var hiddenClass = getHiddenCssClass(columnIndex);

    // Replace only the contents, but copy over any className that the subHeaderRenderer might have added
    subHeaders.el
      .map(function (n, a) { return $(a).find('.subHeader-row'); })
      .map(function (n, a) { return a[rowIndex]; })
      .children()
      .eq(columnIndex)
      .html(newEl.html())
      .addClass(newEl[0].className)
      .addClass(hiddenClass);
  }

  function getSubHeader() { return subHeaders.el; }

  // Use a columnId to return the related header dom element
  function getSubHeaderColumn(columnId) {
    var idx = getColumnIndex(columnId);
    return subHeaders.el.children().eq(idx);
  }

  // (void) => void
  function createColumnHeaders() {
    function onMouseEnter() { $(this).addClass("ui-state-hover"); }
    function onMouseLeave() { $(this).removeClass("ui-state-hover"); }

    // Broadcast destroy events and empty out any current headers
    header.el.children()
      .each(function () {
        var columnDef = $(this).data("column");
        if (columnDef) {
          trigger(self.onBeforeHeaderCellDestroy, { "node": this, "column": columnDef });
        }
      });

    // Broadcast destroy events and empty out any current subHeaders
    subHeaders.el.children()
      .each(function () {
        var columnDef = $(this).data("column");
        if (columnDef) {
          trigger(self.onBeforeSubHeaderCellDestroy, { "node": this, "column": columnDef });
        }
      });

    header.el.empty();
    subHeaders.el.empty();

    // generate subheader rows
    for (var i = 0; i < options.subHeaderRenderers.length; i++) {
      var l = subHeaders.el.eq(0).append($('<div class="subHeader-row">'));
      l.data('subHeader-row-' + i);
      var r = subHeaders.el.eq(1).append($('<div class="subHeader-row">'));
      r.data('subHeader-row-' + i);
    }

    // Build new headers based on column data.
    var $headerHolder, $subHeaderHolder, m, oneHeader;
    for (var i = 0; i < columns.length; i++) {
      // Select the correct region to draw into based on the column index.
      $headerHolder    = i > options.pinnedColumn ? header.el.eq(1) : header.el.eq(0);
      $subHeaderHolder = i > options.pinnedColumn ? subHeaders.el.eq(1) : subHeaders.el.eq(0);

      m = columns[i];
      oneHeader = options.columnHeaderRenderer(m);

      var hiddenClass = getHiddenCssClass(i);

      oneHeader
//          .width(m.width - headerColumnWidthDiff)
        .addClass("cell l" + i + " r" + i)
        .attr("id", "" + uid +'_'+ m.id)
        .attr("title", m.toolTip || "")
        .data("column", m)
        .addClass(m.headerCssClass || "")
        .data("headerCssClass", m.headerCssClass)
        .addClass(hiddenClass)
        .bind("dragstart", { distance: 3 }, function(e, dd) {
          trigger(self.onHeaderColumnDragStart, { "origEvent": e, "dragData": dd, "node": this, "columnIndex": getColumnIndexFromEvent(e) })
        })
        .bind("drag", function(e, dd) {
          trigger(self.onHeaderColumnDrag, { "origEvent": e, "dragData": dd, "node": this, "columnIndex": getColumnIndexFromEvent(e) })
        })
        .bind("dragend", function(e, dd) {
          trigger(self.onHeaderColumnDragEnd, { "origEvent": e, "dragData": dd, "node": this, "columnIndex": getColumnIndexFromEvent(e) })
        })
        .appendTo($headerHolder);

      if (options.enableColumnReorder || m.sortable) {
        oneHeader
          .on('mouseenter', onMouseEnter)
          .on('mouseleave', onMouseLeave);
      }

      if (m.sortable) {
        oneHeader.addClass("slick-header-sortable");
        oneHeader.append("<span class='slick-sort-indicator' />");
      }

      trigger(self.onHeaderCellRendered, { "node": oneHeader[0], "column": m });
      options.subHeaderRenderers.forEach(function (renderer, n) {
        var oneSubHeader = renderer(m);
        oneSubHeader
          .data("column", m)
          .addClass("cell l" + i + " r" + i)
          .addClass(hiddenClass)
          .appendTo($subHeaderHolder.find('.subHeader-row').eq(n));
        trigger(self.onSubHeaderCellRendered, {
          "node": oneSubHeader[0],
          "column": m,
          "subHeader": n
        });
      });
    }
    setSortColumns(sortColumns);
    if (options.enableColumnResize) {
      setupColumnResize();
    }
    if (options.enableColumnReorder) {
      setupColumnReorder();
    }
    trigger(self.onHeadersCreated);
  }

  // Given a column object, return a jquery element with HTML for the column
  // Can be overridden by providing a function to options.columnHeaderRenderer
  function columnHeaderRenderer(column) {

    // 50% faster using native API, versus the old jQuery way
    // jQuery's .html() is particularly slow
    //
    // Saves roughly 0.5ms * N in synchronous processing time, where N is the number of columns
    var d = document.createElement('div')
    d.className = 'cell';
    d.innerHTML = "<span class='name'>" + column.name + "</span>";
    if (column.toolTip) { d.title = column.toolTip; }
    return $(d);

  }

  function setupColumnSort() {
    topCanvas.el.click(function (e) {
      // temporary workaround for a bug in jQuery 1.7.1 (http://bugs.jquery.com/ticket/11328)
      e.metaKey = e.metaKey || e.ctrlKey;

      if ($(e.target).hasClass("resizer")) {
        return;
      }

      var $col = $(e.target).closest(".cell");
      if (!$col.length) {
        return;
      }

      var column = $col.data("column");
      if (column.sortable) {
        if (!getEditorLock().commitCurrentEdit()) {
          return;
        }

        var sortOpts = null;
        var i = 0;
        for (; i < sortColumns.length; i++) {
          if (sortColumns[i].columnId == column.id) {
            sortOpts = sortColumns[i];
            sortOpts.sortAsc = !sortOpts.sortAsc;
            break;
          }
        }

        if (e.metaKey && options.multiColumnSort) {
          if (sortOpts) {
            sortColumns.splice(i, 1);
          }
        }
        else {
          if ((!e.shiftKey && !e.metaKey) || !options.multiColumnSort) {
            sortColumns = [];
          }

          if (!sortOpts) {
            sortOpts = { columnId: column.id, sortAsc: column.defaultSortAsc };
            sortColumns.push(sortOpts);
          } else if (sortColumns.length == 0) {
            sortColumns.push(sortOpts);
          }
        }

        setSortColumns(sortColumns);

        if (!options.multiColumnSort) {
          trigger(self.onSort, {
            multiColumnSort: false,
            sortCol: column,
            sortAsc: sortOpts.sortAsc}, e);
        } else {
          trigger(self.onSort, {
            multiColumnSort: true,
            sortCols: $.map(sortColumns, function(col) {
              return {sortCol: columns[getColumnIndex(col.columnId)], sortAsc: col.sortAsc };
            })}, e);
        }
      }
    });
  }

  function setupColumnReorder() {
    topCanvas.el.filter(":ui-sortable").sortable("destroy");
    topCanvas.el.sortable({
      containment: "parent",
      distance: 3,
      axis: "x",
      cursor: "default",
      tolerance: "intersection",
      helper: "clone",
      placeholder: "slick-sortable-placeholder ui-state-default slick-header-column",
      start: function (e, ui) {
        ui.placeholder.width(ui.helper.outerWidth()); // - headerColumnWidthDiff);
        $(ui.helper).addClass("slick-header-column-active");
      },
      beforeStop: function (e, ui) {
        $(ui.helper).removeClass("slick-header-column-active");
      },
      stop: function (e) {
        if (!getEditorLock().commitCurrentEdit()) {
          $(this).sortable("cancel");
          return;
        }

        var reorderedIds = topCanvas.el.sortable("toArray");
        var reorderedColumns = [];
        for (var i = 0; i < reorderedIds.length; i++) {
          reorderedColumns.push(columns[getColumnIndex(reorderedIds[i].replace(uid, ""))]);
        }
        setColumns(reorderedColumns);

        trigger(self.onColumnsReordered, {});
        e.stopPropagation();
        setupColumnResize();
      }
    });
  }

  function setupColumnResize() {
    var j, c, pageX, columnElements, minPageX, maxPageX, firstResizable, lastResizable;
    if(!columns.length){ return; }
    columnElements = getHeaderEls();
    columnElements.find(".resizer").remove();
    // Get the first and last resizable column
    columnElements.each(function (i, e) {
      if (columns[i].resizable) {
        if (firstResizable === undefined) {
          firstResizable = i;
        }
        lastResizable = i;
      }
    });
    if (firstResizable === undefined) { return; }
    // Configure resizing on each column
    columnElements.each(function (i, e) {
      if (i < firstResizable || (options.forceFitColumns && i >= lastResizable)) {
        return;
      }
      $("<div class='resizer' />")
        .appendTo(e)
        .bind("dragstart", function (e, dd) {
          if (!getEditorLock().commitCurrentEdit()) {
            return false;
          }
          pageX = e.pageX;
          $(this).parent().addClass("active");

          // Get the dragged column object and set a flag on it
          var idx = getCellFromNode($(this).parent());
          if (idx > -1) { columns[idx].manuallySized = true; }

          var shrinkLeewayOnRight = null, stretchLeewayOnRight = null;
          // lock each column's width option to current width
          columnElements.each(function (i, e) {
            columns[i].previousWidth = $(e).outerWidth();
          });
          if (options.forceFitColumns) {
            shrinkLeewayOnRight = 0;
            stretchLeewayOnRight = 0;
            // colums on right affect maxPageX/minPageX
            for (j = i + 1; j < columnElements.length; j++) {
              c = columns[j];
              if (c.resizable) {
                if (stretchLeewayOnRight !== null) {
                  if (c.maxWidth) {
                    stretchLeewayOnRight += c.maxWidth - c.previousWidth;
                  } else {
                    stretchLeewayOnRight = null;
                  }
                }
                shrinkLeewayOnRight += c.previousWidth - Math.max(c.minWidth || 0, options.absoluteColumnMinWidth);
              }
            }
          }
          var shrinkLeewayOnLeft = 0, stretchLeewayOnLeft = 0;
          for (j = 0; j <= i; j++) {
            // columns on left only affect minPageX
            c = columns[j];
            if (c.resizable) {
              if (stretchLeewayOnLeft !== null) {
                if (c.maxWidth) {
                  stretchLeewayOnLeft += c.maxWidth - c.previousWidth;
                } else {
                  stretchLeewayOnLeft = null;
                }
              }
              shrinkLeewayOnLeft += c.previousWidth - Math.max(c.minWidth || 0, options.absoluteColumnMinWidth);
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
        .bind("drag", function (e, dd) {
          var actualMinWidth, d = Math.min(maxPageX, Math.max(minPageX, e.pageX)) - pageX, x;
          if (d < 0) { // shrink column
            x = d;
            if (options.resizeOnlyDraggedColumn) {
              columns[i].width = Math.max(columns[i].previousWidth + x, (columns[i].minWidth || 0)); // apply shrinkage to this column only.
            } else {
              for (j = i; j >= 0; j--) {
                c = columns[j];
                if (c.resizable) {
                  actualMinWidth = Math.max(c.minWidth || 0, options.absoluteColumnMinWidth);
                  if (x && c.previousWidth + x < actualMinWidth) {
                    x += c.previousWidth - actualMinWidth;
                    c.width = actualMinWidth;
                  } else {
                    c.width = c.previousWidth + x;
                    x = 0;
                  }
                }
              }
            }

            if (options.forceFitColumns) {
              x = -d;
              for (j = i + 1; j < columnElements.length; j++) {
                c = columns[j];
                if (c.resizable) {
                  if (x && c.maxWidth && (c.maxWidth - c.previousWidth < x)) {
                    x -= c.maxWidth - c.previousWidth;
                    c.width = c.maxWidth;
                  } else {
                    c.width = c.previousWidth + x;
                    x = 0;
                  }
                }
              }
            }
          } else { // stretch column
            x = d;
            if (options.resizeOnlyDraggedColumn) {
              columns[i].width = Math.min(columns[i].previousWidth + x, columns[i].maxWidth || maxPageX);
            } else {
              for (j = i; j >= 0; j--) {
                c = columns[j];
                if (c.resizable) {
                  if (x && c.maxWidth && (c.maxWidth - c.previousWidth < x)) {
                    x -= c.maxWidth - c.previousWidth;
                    c.width = c.maxWidth;
                  } else {
                    c.width = c.previousWidth + x;
                    x = 0;
                  }
                }
              }
            }

            if (options.forceFitColumns) {
              x = -d;
              for (j = i + 1; j < columnElements.length; j++) {
                c = columns[j];
                if (c.resizable) {
                  actualMinWidth = Math.max(c.minWidth || 0, options.absoluteColumnMinWidth);
                  if (x && c.previousWidth + x < actualMinWidth) {
                    x += c.previousWidth - actualMinWidth;
                    c.width = actualMinWidth;
                  } else {
                    c.width = c.previousWidth + x;
                    x = 0;
                  }
                }
              }
            }
          }
          applyColumnHeaderWidths();
          if (options.syncColumnCellResize) {
            updateCanvasWidth(true); // If you're resizing one of the columns in the pinned section, we should update the size of that area as you drag
            applyColumnWidths();
          }
        })
        .bind("dragend", function (e, dd) {
          var newWidth;
          $(this).parent().removeClass("active");
          for (j = 0; j < columnElements.length; j++) {
            c = columns[j];
            newWidth = $(columnElements[j]).outerWidth();

            if (c.previousWidth !== newWidth && c.rerenderOnResize) {
              invalidateAllRows();
            }
          }
          updateCanvasWidth(true);
          render();
          trigger(self.onColumnsResized, {});
        });
    });
  }

  // Given an element, return the sum of vertical paddings and borders on that element.
  function getVBoxDelta($el) {
    var p = ["borderTopWidth", "borderBottomWidth", "paddingTop", "paddingBottom"];
    var delta = 0;
    $.each(p, function (n, val) {
      delta += parseFloat($el.css(val)) || 0;
    });
    return delta;
  }

  // Hide extra panes if they're not needed (eg: the grid is not using pinned columns)
  function updatePinnedState() {
    if (!isPinned) {
      topViewport.el.eq(1).hide();
      contentViewportWrap.el.eq(1).hide();
    } else {
      topViewport.el.eq(1).show();
      contentViewportWrap.el.eq(1).show();
    }
    setScroller();
    setOverflow();
    createColumnHeaders();
    updateCanvasWidth();
    invalidateAllRows();
    resizeCanvas();
  }

  // enable antiscroll for an element
  function disableAntiscroll ($element) {

    $element.removeClass('antiscroll-wrap');

    if ($element.data('antiscroll')) {
      $element.data('antiscroll').destroy();
    }

  }

  function enableAntiscroll ($element) {

    $element
      .addClass('antiscroll-wrap')
      .antiscroll({
        autoShow: options.showScrollbarsOnHover
      });

  }

  function updateAntiscroll () {
    if (!options.useAntiscroll) {
      return;
    }

    var cl = contentViewportWrap.el.filter('.C.L'),
        cr = contentViewportWrap.el.filter('.C.R');

    if (isPinned) {
      enableAntiscroll(cr);
      disableAntiscroll(cl);
    } else {
      enableAntiscroll(cl);
      disableAntiscroll(cr);
    }

  }

  // If columns are pinned, scrollers are in the right-side panes, otherwise they're in the left ones
  function setScroller() {
    if (options.pinnedColumn == undefined) {
      topViewport.scroller = topViewport.el[0];
      contentViewport.scroller = contentViewport.el[0];
    } else {
      topViewport.scroller = topViewport.el[1];
      contentViewport.scroller = contentViewport.el[1];
    }
  }

  function setOverflow() {
    if (isPinned) {
      contentViewport.el.eq(0).addClass('pinned');
    } else {
      contentViewport.el.eq(0).removeClass('pinned');
    }
  }

  // Measures the computed sizes of important elements
  // With this method, folks can set whatever CSS size they'd like, and the grid's js can figure it out from there
  function measureCssSizes() {
    if (!options.rowHeight) {
      var el,
        markup = "<div class='cell' style='visibility:hidden'>-</div>";
      el = $('<div class="row">'+ markup +'</div>').appendTo(contentCanvas.el[0]);
      options.rowHeight = el.outerHeight();
      el.remove();
    }
  }

  function createCssRules() {
    $style = $("<style type='text/css' rel='stylesheet' />").appendTo($("head"));
    var rules = [];

    for (var i = 0; i < columns.length; i++) {
      rules.push("." + uid + " .l" + i + " { }");
      rules.push("." + uid + " .r" + i + " { }");
    }

    if ($style[0].styleSheet) { // IE
      $style[0].styleSheet.cssText = rules.join(" ");
    } else {
      $style[0].appendChild(document.createTextNode(rules.join(" ")));
    }
  }

  function getColumnCssRules(idx) {
    if (!stylesheet) {
      var sheets = document.styleSheets;
      for (var i = 0; i < sheets.length; i++) {
        if ((sheets[i].ownerNode || sheets[i].owningElement) == $style[0]) {
          stylesheet = sheets[i];
          break;
        }
      }

      if (!stylesheet) {
        throw new Error("Cannot find stylesheet.");
      }

      // find and cache column CSS rules
      columnCssRulesL = [];
      columnCssRulesR = [];
      var cssRules = (stylesheet.cssRules || stylesheet.rules);
      var matches, columnIdx;
      for (var i = 0; i < cssRules.length; i++) {
        var selector = cssRules[i].selectorText;
        if (matches = /\.l\d+/.exec(selector)) {
          columnIdx = parseInt(matches[0].substr(2, matches[0].length - 2), 10);
          columnCssRulesL[columnIdx] = cssRules[i];
        } else if (matches = /\.r\d+/.exec(selector)) {
          columnIdx = parseInt(matches[0].substr(2, matches[0].length - 2), 10);
          columnCssRulesR[columnIdx] = cssRules[i];
        }
      }
    }

    return {
      "left": columnCssRulesL[idx],
      "right": columnCssRulesR[idx]
    };
  }

  function removeCssRules() {
    $style.remove();
    stylesheet = null;
  }

  function destroy() {
    getEditorLock().cancelCurrentEdit();

    trigger(self.onBeforeDestroy, {});

    var i = plugins.length;
    while(i--) {
      unregisterPlugin(plugins[i]);
    }

    if (options.enableColumnReorder) {
      header.el.filter(":ui-sortable").sortable("destroy");
    }

    unbindAncestorScrollEvents();
    $container.unbind(".slickgrid");
    removeCssRules();

    contentCanvas.el.unbind("draginit dragstart dragend drag");
    $container.empty()
      .removeClass(uid)
      .removeClass(objectName);
  }


  //////////////////////////////////////////////////////////////////////////////////////////////
  // General

  // A simple way to expose the uid to consumers, who might care which slickgrid instance they're dealing with.
  function getId() {
    return uid;
  }

  function trigger(evt, args, e) {
    e = e || new Slick.EventData();
    args = $.extend({}, args, {grid: self});
    return evt.notify(args, e, self);
  }

  function getEditorLock() {
    return options.editorLock;
  }

  function getEditController() {
    return editController;
  }

  function getColumnIndex(id) {
    return columnIdxById[id];
  }

  // returns a jQuery node that matches the given id
  // if the provided id is undefined, returns an empty jQuery object
  function getColumnNodeById(id) {
    var idx = getColumnIndex(id);
    if (idx > -1)
      return getHeaderEls(idx);
    else
      return $([]);
  }

  // Return the header element(s) that wrap all column headers
  // There is one or two, depending on whether columns are pinned
  function getHeaderEl() {
    return header.el;
  }

  // Get all column header cell elements.
  // There should be as many elements as there are columns
  // It doesn't differentiate between pinned and unpinned columns
  // If you provide an index, it returns only that column
  function getHeaderEls(idx) {
    if (idx == null) {
      return header.el.children()
    } else {
      return header.el.children().eq(idx)
    }
  }

  // Given an x and a y coord, return the index of the column
  function getColumnIndexFromEvent(evt) {
    var nearestEl = document.elementFromPoint(evt.clientX, evt.clientY);
    var headerEl = $(nearestEl).closest('.cell');
    if (!headerEl.length) {
      return null;
    }
    return getCellFromNode(headerEl[0]);
  }

  function getColumnFromEvent(evt) {
    return columns[getColumnIndexFromEvent(evt)];
  }

  function autosizeColumns() {
    var i, c,
      widths = [],
      shrinkLeeway = 0,
      total = 0,
      prevTotal,
      availWidth = viewportHasVScroll ? contentViewport.width - scrollbarDimensions.width : contentViewport.width;

    for (i = 0; i < columns.length; i++) {
      c = columns[i];
      widths.push(c.width);
      total += c.width;
      if (c.resizable) {
        shrinkLeeway += c.width - Math.max(c.minWidth, options.absoluteColumnMinWidth);
      }
    }

    // shrink
    prevTotal = total;
    while (total > availWidth && shrinkLeeway) {
      var shrinkProportion = (total - availWidth) / shrinkLeeway;
      for (i = 0; i < columns.length && total > availWidth; i++) {
        c = columns[i];
        var width = widths[i];
        if (!c.resizable || width <= c.minWidth || width <= options.absoluteColumnMinWidth) {
          continue;
        }
        var absMinWidth = Math.max(c.minWidth, options.absoluteColumnMinWidth);
        var shrinkSize = Math.floor(shrinkProportion * (width - absMinWidth)) || 1;
        shrinkSize = Math.min(shrinkSize, width - absMinWidth);
        total -= shrinkSize;
        shrinkLeeway -= shrinkSize;
        widths[i] -= shrinkSize;
      }
      if (prevTotal <= total) {  // avoid infinite loop
        break;
      }
      prevTotal = total;
    }

    // grow
    prevTotal = total;
    while (total < availWidth) {
      var growProportion = availWidth / total;
      for (i = 0; i < columns.length && total < availWidth; i++) {
        c = columns[i];
        var currentWidth = widths[i];
        var growSize;

        if (!c.resizable || c.maxWidth <= currentWidth) {
          growSize = 0;
        } else {
          growSize = Math.min(Math.floor(growProportion * currentWidth) - currentWidth, (c.maxWidth - currentWidth) || 1000000) || 1;
        }
        total += growSize;
        widths[i] += growSize;
      }
      if (prevTotal >= total) {  // avoid infinite loop
        break;
      }
      prevTotal = total;
    }

    var reRender = false;
    for (i = 0; i < columns.length; i++) {
      if (columns[i].rerenderOnResize && columns[i].width != widths[i]) {
        reRender = true;
      }
      columns[i].width = widths[i];
    }

    applyColumnHeaderWidths();
    updateCanvasWidth(true);
    if (reRender) {
      invalidateAllRows();
      render();
    }
  }

  // (void) => void
  function applyColumnHeaderWidths() {
    if (!initialized) { return; }
    var h;
    for (var i = 0, headers = header.el.children(), ii = headers.length; i < ii; i++) {
      h = $(headers[i]);
      if (h.width() !== columns[i].width) {
        h.width(columns[i].width);
      }
    }
    updateColumnCaches();
  }

  // (void) => void
  function applyColumnWidths() {
    var x = 0;
    for (var i = 0; i < columns.length; i++) {
      var column = columns[i];
      var width = getColumnVisibleWidth(column);

      var rule = getColumnCssRules(i);
      if (!rule.left) return;
      rule.left.style.left = x + 'px';

      var canvasWidth = i > options.pinnedColumn ? contentCanvas[1].width : contentCanvas[0].width;
      rule.right.style.right = (canvasWidth - x - width) + 'px';

      // If this column is frozen, reset the css left value since the column starts in a new viewport.
      if (options.pinnedColumn === i) {
        x = 0;
      } else {
        x += width;
      }
    }
  }

  function setSortColumn(columnId, ascending) {
    setSortColumns([{ columnId: columnId, sortAsc: ascending}]);
  }

  function setSortColumns(cols) {
    sortColumns = cols;

    var headerColumnEls = getHeaderEls();
    headerColumnEls
      .removeClass("slick-header-column-sorted")
      .find(".slick-sort-indicator")
      .removeClass("slick-sort-indicator-asc slick-sort-indicator-desc");

    $.each(sortColumns, function(i, col) {
      if (col.sortAsc == null) {
        col.sortAsc = true;
      }
      var columnIndex = getColumnIndex(col.columnId);
      if (columnIndex != null) {
        headerColumnEls.eq(columnIndex)
          .addClass("slick-header-column-sorted")
          .find(".slick-sort-indicator")
          .addClass(col.sortAsc ? "slick-sort-indicator-asc" : "slick-sort-indicator-desc");
      }
    });
  }

  function getSortColumns() {
    return sortColumns;
  }

  function handleSelectedRangesChanged(e, ranges) {
    selectedRows = [];
    var hash = {};
    var maxRow = getDataLength() - 1;
    var maxCell = columns.length - 1;
    for (var i = 0, len = ranges.length; i < len; i++) {
      for (var j = Math.max(0, ranges[i].fromRow), jlen = Math.min(ranges[i].toRow, maxRow); j <= jlen; j++) {
        if (!hash[j]) {  // prevent duplicates
          selectedRows.push(j);
          hash[j] = {};
        }
        for (var k = Math.max(0, ranges[i].fromCell), klen = Math.min(ranges[i].toCell, maxCell); k <= klen; k++) {
          if (canCellBeSelected(j, k)) {
            hash[j][columns[k].id] = options.selectedCellCssClass;
          }
        }
      }
    }

    setCellCssStyles(options.selectedCellCssClass, hash);

    trigger(self.onSelectedRowsChanged, {rows: getSelectedRows()}, e);
  }

  function getColumns() {
    return columns;
  }

  // (void) => void
  function updateColumnCaches() {
    // Pre-calculate cell boundaries.
    columnPosLeft = [];
    columnPosRight = [];
    var x = 0;
    for (var i = 0, ii = columns.length; i < ii; i++) {
      var column = columns[i];
      var columnWidth = getColumnVisibleWidth(column);
      columnPosLeft[i] = x;
      x += columnWidth;
      columnPosRight[i] = x;
    }
  }

  // Given a set of columns, make sure `minWidth <= width <= maxWidth`
  // (cols: Array[Column]) => void
  function enforceWidthLimits(cols) {
    columnIdxById = {};

    for (var i = 0; i < cols.length; i++) {
      var m = cols[i];
      columnIdxById[m.id] = i;

      // Changing the object reference can cause problems for external consumers of that object, so we're careful to maintain it using this crazy double extend.
      var tempCol = $.extend({}, columnDefaults, m);
      $.extend(m, tempCol);

      if (m.minWidth && m.width < m.minWidth) {
        m.width = m.minWidth;
      } else if (m.maxWidth && m.width > m.maxWidth) {
        m.width = m.maxWidth;
      }
    }
  }

  /**
   * Set or re-set the columns in the grid
   * @param {array}     columnDefinitions   columns to set
   * @param {object}    opts                mixed in with the `onColumnsChanged` data sent to event handlers
   *                                        opts.skipResizeCanvas let's you skip that step. Boosts performance if you don't need it because you're planning to to manually call resizeCanvas.
   */
  function setColumns(columnDefinitions, opts) {
    columns = columnDefinitions;
    opts = opts || {};
    enforceWidthLimits(columns);
    updateColumnCaches();
    if (initialized) {
      invalidateAllRows();
      createColumnHeaders();
      removeCssRules();
      createCssRules();
      if (!opts.skipResizeCanvas) {
        resizeCanvas();
      }
      applyColumnWidths();
      handleScroll();
      trigger(self.onColumnsChanged, opts);
    }
  }

  // Given a column definition object, do all the steps required to react to a change in the widths of any of the columns, and nothing more.
  function updateColumnWidths(columnDefinitions) {
    columns = columnDefinitions;
    enforceWidthLimits(columns);
    applyColumnWidths();
    updateColumnCaches();
    updateCanvasWidth(true); // Update the grid-canvas width. The `true` tells it to update the width of all the cells even if the canvas hasn't changed size (eg: if there was plenty of room for the cells both before and after the sizing, the canvas doesn't change)
//      trigger(self.onColumnsResized); // TODO: find why this was needed and solve it without an infinite loop
  }

  function getOptions() {
    return options;
  }

  function setOptions(args) {
    if (!getEditorLock().commitCurrentEdit()) {
      return;
    }
    var pinnedColChanged; // If the pinned column has changed, we need to take some extra steps to render canvii

    makeActiveCellNormal();

    if (args.hasOwnProperty('enableAddRow') && options.enableAddRow !== args.enableAddRow) {
      invalidateRow(getDataLength());
    }

    if (args.hasOwnProperty('pinnedColumn') && args.pinnedColumn !== options.pinnedColumn) {
      pinnedColChanged = true;
      options.pinnedColumn = args.pinnedColumn; // $extend usually works, but not in the case where the new value is undefined. $.extend does not copy over null or undefined values.
    }

    // Do we need to redraw the subheader rows?
    if (args.hasOwnProperty('subHeaderRenderers')) {
      var subHeaderCount = subHeaders.el.eq(0).find('.subHeader-row').length;
      if (subHeaderCount !== options.subHeaderRenderers.length) {
        createColumnHeaders();
        calculateHeights();
        resizeCanvas();
      }
    }

    if (args.hasOwnProperty('appendSubheadersToContainer')) {
      injectSubheaders(args.appendSubheadersToContainer);
    }

    options = $.extend(options, args);
    validateAndEnforceOptions();

    if (options.autoHeight) {
      contentViewport.el.css("overflow-y", "hidden");
    } else {
      contentViewport.el.css("overflow-y", null);
    }

    if (pinnedColChanged) { updatePinnedState(); }

    render();
    updateAntiscroll();
  }

  function validateAndEnforceOptions() {
    if (options.autoHeight) {
      options.leaveSpaceForNewRows = false;
    }
    if (options.pinnedColumn != undefined) {
      isPinned = true;
    } else {
      isPinned = false;
      options.pinnedColumn = undefined; // map null and undefined both to undefined. null does some odd things in numerical comparisons. eg: 20 > null is true (wat!)
    }
  }

  function setData(newData, scrollToTop) {
    data = newData;
    invalidateAllRows();
    updateRowCount();
    if (scrollToTop) {
      scrollTo(0);
    }
  }

  function getData() {
    return data;
  }

  function getDataLength() {
    if (data.getLength) {
      return data.getLength();
    } else {
      return data.length;
    }
  }

  function getDataLengthIncludingAddNew() {
    return getDataLength() + (options.enableAddRow ? 1 : 0);
  }

  function getDataItem(i) {
    if (data.getItem) {
      return data.getItem(i);
    } else {
      return data[i];
    }
  }

  function setSubHeadersVisibility(visible) {
    if (options.showSubHeaders != visible) {
      options.showSubHeaders = visible;
      if (visible) {
        subHeaders.el.show();
      } else {
        subHeaders.el.hide();
      }
    }
    resizeCanvas();
  }

  function getContainerNode() {
    return $container.get(0);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // Rendering / Scrolling

  function getRowTop(row) {
    return options.rowHeight * row - offset;
  }

  // Given a Y position, get the row index.
  // The Y position must be relative to the row canvas for an accurate answer.
  function getRowFromPosition(y) {
    return Math.floor((y + offset) / options.rowHeight);
  }

  function scrollTo(y) {
    y = Math.max(y, 0);
    y = Math.min(y, th - contentViewport.height + (viewportHasHScroll ? scrollbarDimensions.height : 0));

    var oldOffset = offset;

    page = Math.min(n - 1, Math.floor(y / ph));
    offset = Math.round(page * cj);
    var newScrollTop = y - offset;

    if (offset != oldOffset) {
      var range = getVisibleRange(newScrollTop);
      cleanupRows(range);
      updateRowPositions();
    }

    if (prevScrollTop != newScrollTop) {
      vScrollDir = (prevScrollTop + oldOffset < newScrollTop + offset) ? 1 : -1;
      lastRenderedScrollTop = scrollTop = prevScrollTop = newScrollTop;
      contentViewport.el.scrollTop(newScrollTop); // using jquery's .scrollTop() method handles multiple viewports
      trigger(self.onViewportChanged, {});
    }
  }

  function defaultFormatter(row, cell, value, columnDef, dataContext) {
    if (value == null) {
      return "";
    } else {
      return (value + "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    }
  }

  function getFormatter(row, column) {
    var rowMetadata = data.getItemMetadata && data.getItemMetadata(row);

    // look up by id, then index
    var columnOverrides = rowMetadata &&
      rowMetadata.columns &&
      (rowMetadata.columns[column.id] || rowMetadata.columns[getColumnIndex(column.id)]);

    return (columnOverrides && columnOverrides.formatter) ||
      (rowMetadata && rowMetadata.formatter) ||
      column.formatter ||
      (options.formatterFactory && options.formatterFactory.getFormatter(column)) ||
      options.defaultFormatter;
  }

  function getEditor(row, cell) {
    var column = columns[cell];
    var rowMetadata = data.getItemMetadata && data.getItemMetadata(row);
    var columnMetadata = rowMetadata && rowMetadata.columns;

    if (columnMetadata && columnMetadata[column.id] && columnMetadata[column.id].editor !== undefined) {
      return columnMetadata[column.id].editor;
    }
    if (columnMetadata && columnMetadata[cell] && columnMetadata[cell].editor !== undefined) {
      return columnMetadata[cell].editor;
    }

    return column.editor || (options.editorFactory && options.editorFactory.getEditor(column));
  }

  function getDataItemValueForColumn(item, columnDef) {
    if (options.dataItemColumnValueExtractor) {
      return options.dataItemColumnValueExtractor(item, columnDef);
    }
    return item[columnDef.field];
  }

  // (markupArrayL: Array[String], markupArrayR: Array[String], row: Number, range: Range, dataLength: Number) => void
  function appendRowHtml(markupArrayL, markupArrayR, row, range, dataLength) {
    var d = getDataItem(row);
    var dataLoading = row < dataLength && !d;
    var rowCss = "row" +
      (options.addRowIndexToClassName ? " row_" + row : "") +
      (dataLoading ? " loading" : "") +
      (row === activeRow ? " active" : "") +
      (row % 2 == 1 ? " odd" : " even");

    var metadata = data.getItemMetadata && data.getItemMetadata(row);
    if (metadata && metadata.cssClasses) { rowCss += " " + metadata.cssClasses; }

    var rowHtml = "<div class='" + rowCss + "' style='top:" + (getRowTop(row) ) + "px; height:"+ options.rowHeight +"px;line-height:"+ options.rowHeight +"px;'>";
    markupArrayL.push(rowHtml);
    if (isPinned) { markupArrayR.push(rowHtml); }

    var colspan, m;
    for (var i = 0, ii = columns.length; i < ii; i++) {
      m = columns[i];
      colspan = 1;
      if (metadata && metadata.columns) {
        var columnData = metadata.columns[m.id] || metadata.columns[i];
        colspan = (columnData && columnData.colspan) || 1;
        // Grouping metadata can indicate that columns should autocalculate spanning.
        // In this case, we span whatever pinned region we're in, but not the whole grid.
        if (colspan === "*") {
          if (i > options.pinnedColumn || options.pinnedColumn == null) {
            colspan = ii - i;
          } else {
            colspan = options.pinnedColumn + 1 - i;
          }
        }
      }

      // Do not render cells outside of the viewport.
      if (columnPosRight[Math.min(ii - 1, i + colspan - 1)] > range.leftPx) {
        if (columnPosLeft[i] > range.rightPx) {
          // All columns to the right are outside the range.
          break;
        }
        if (i > options.pinnedColumn) {
          appendCellHtml(markupArrayR, row, i, colspan, d);
        } else {
          appendCellHtml(markupArrayL, row, i, colspan, d);
        }
      } else if (isPinned && ( i <= options.pinnedColumn )) {
        appendCellHtml(markupArrayL, row, i, colspan, d);
      }

      if (colspan > 1) { i += (colspan - 1); }
    }

    markupArrayL.push("</div>");
    if (isPinned) { markupArrayR.push("</div>"); }
  }

  // (markupArray: Array[String], row: Number, cell: Number, colspan: Number, item: Object) => void
  function appendCellHtml(markupArray, row, cell, colspan, item) {
    var m = columns[cell];
    var cellCss ="cell l" + cell +
      " r" + Math.min(columns.length - 1, cell + colspan - 1) +
      (m.cssClass ? " " + m.cssClass : "");

    var hiddenClass = getHiddenCssClass(cell);
    if (hiddenClass) {
      cellCss += ' ' + hiddenClass;
    }

    if (row === activeRow && cell === activeCell) {
      cellCss += (" active");
    }

    // TODO:  merge them together in the setter
    for (var key in cellCssClasses) {
      if (cellCssClasses[key][row] && cellCssClasses[key][row][m.id]) {
        cellCss += (" " + cellCssClasses[key][row][m.id]);
      }
    }

    markupArray.push("<div class='" + cellCss + "'>");

    // if there is a corresponding row (if not, this is the Add New row or this data hasn't been loaded yet)
    if (item) {
      var value = getDataItemValueForColumn(item, m);
      markupArray.push(getFormatter(row, m)(row, cell, value, m, item, self));
    }

    markupArray.push("</div>");

    rowsCache[row].cellRenderQueue.push(cell);
    rowsCache[row].cellColSpans[cell] = colspan;
  }


  function cleanupRows(rangeToKeep) {
    for (var i in rowsCache) {
      if (((i = parseInt(i, 10)) !== activeRow) && (i < rangeToKeep.top || i > rangeToKeep.bottom)) {
        removeRowFromCache(i);
      }
    }
  }

  function invalidate() {
    updateRowCount();
    invalidateAllRows();
    render();
    updateAntiscroll();
    trigger(self.onInvalidate);
  }

  // convenience method - like #invalidate, but waits for current
  // edit to complete before invalidating.
  // WARNING: while this API is convenient for invalidating data
  //          without impacting the UX, note that its sometimes-
  //          sync, sometimes-async API releases Zalgo! use with
  //          caution!
  // (void) => void
  function invalidateSafe() {
    if (getEditorLock().isActive()) {

      // if an invalidate is already scheduled, there's no need to call it twice
      if (state.invalidateSafeCellChangeCallback) { return; }

      state.invalidateSafeCellChangeCallback = function() {
        self.onCellChange.unsubscribe(state.invalidateSafeCellChangeCallback);
        state.invalidateSafeCellChangeCallback = null;
        invalidateSafe();
      };
      self.onCellChange.subscribe(state.invalidateSafeCellChangeCallback);

    } else {
      invalidate();
    }
  }

  function invalidateAllRows() {
    if (currentEditor) {
      makeActiveCellNormal();
    }
    for (var row in rowsCache) {
      removeRowFromCache(row);
    }
  }

  // While scrolling, remove rows from cache and dom if they're off screen
  // There's an exception in here for OSX--if you remove the element that triggered a scroll it interrupts inertial scrolling and feels janky.
  function removeRowFromCache(row) {
    var cacheEntry = rowsCache[row];
    if (!cacheEntry) { return; }
    if (row === protectedRowIdx) { return; }

    // call jquery's .remove, so we can listen on cleanup events.
    // See https://github.com/mleibman/SlickGrid/issues/354
    cacheEntry.rowNode.remove()

    delete rowsCache[row];
    delete postProcessedRows[row];
    renderedRows--;
    counter_rows_removed++;
  }

  function invalidateRows(rows) {
    var i, rl;
    if (!rows || !rows.length) {
      return;
    }
    vScrollDir = 0;
    for (i = 0, rl = rows.length; i < rl; i++) {
      if (currentEditor && activeRow === rows[i]) {
        makeActiveCellNormal();
      }
      if (rowsCache[rows[i]]) {
        removeRowFromCache(rows[i]);
      }
    }
  }

  function invalidateRow(row) {
    invalidateRows([row]);
  }

  function updateCell(row, cell) {
    var cellNode = getCellNode(row, cell);
    if (!cellNode) {
      return;
    }

    var m = columns[cell], d = getDataItem(row);
    if (currentEditor && activeRow === row && activeCell === cell) {
      currentEditor.loadValue(d);
    } else {
      cellNode.innerHTML = d ? getFormatter(row, m)(row, cell, getDataItemValueForColumn(d, m), m, d, self) : "";
      invalidatePostProcessingResults(row);
    }
  }

  function updateRow(row) {
    var cacheEntry = rowsCache[row];
    if (!cacheEntry) {
      return;
    }

    ensureCellNodesInRowsCache(row);

    var d = getDataItem(row);

    for (var columnIdx in cacheEntry.cellNodesByColumnIdx) {
      if (!cacheEntry.cellNodesByColumnIdx.hasOwnProperty(columnIdx)) {
        continue;
      }

      columnIdx = columnIdx | 0;
      var m = columns[columnIdx],
        node = cacheEntry.cellNodesByColumnIdx[columnIdx];

      if (row === activeRow && columnIdx === activeCell && currentEditor) {
        currentEditor.loadValue(d);
      } else if (d) {
        node.innerHTML = getFormatter(row, m)(row, columnIdx, getDataItemValueForColumn(d, m), m, d, self);
      } else {
        node.innerHTML = "";
      }
    }

    invalidatePostProcessingResults(row);
  }

  // TODO: calculate the height of the header and subHeader row based on their css size
  function calculateHeights() {
    if (options.autoHeight) {
      contentViewport.height = options.rowHeight
      * getDataLengthIncludingAddNew()
      + header.el.outerHeight();
    } else {
      contentViewport.height = parseFloat($.css($container[0], "height", true))
      - parseFloat($.css($container[0], "paddingTop", true))
      - parseFloat($.css($container[0], "paddingBottom", true))
      - parseFloat($.css(topViewport.el[0], "height"))
      - getVBoxDelta(topViewport.el.eq(0))
      - (options.appendSubheadersToContainer ? subHeaders.el.height() : 0);
    }
    numVisibleRows = Math.ceil(contentViewport.height / options.rowHeight);

  }

  // If you pass it a width, that width is used as the viewport width. If you do not, it is calculated as normal.
  // This is more performant if the canvas size is changed externally. The width is already known so we can pass it in instead of recalculating.
  function calculateViewportWidth(width) {
    contentViewport.width = width || parseFloat($.css($container[0], "width", true));
  }

  // If you pass resizeOptions.width, the viewport width calculation can be skipped. This saves 15ms or so.
  function resizeCanvas(resizeOptions) {
    if (!initialized) { return; }
    resizeOptions = resizeOptions || {};

    // Reset
    contentViewport.height = 0;
    calculateHeights();
    calculateViewportWidth();

    var topOffset = topViewport.el.height(); // the top boundary of the center row of things
    contentViewportWrap.el.css({ 'top': topOffset, 'height': contentViewport.height });

    // something is setting the contentViewport's height, and should't be.
    // this causes the viewport to not resize when the window is resized.
    // as a workaround, override the CSS here.
    // TODO: figure out what's setting the height and fix it there instead.
    contentViewport.el.css({ top: 0, height: '100%', width: '100%' });

    if (options.forceFitColumns) {
      autosizeColumns();
    }

    updateRowCount();
    // Since the width has changed, force the render() to reevaluate virtually rendered cells.
    lastRenderedScrollLeft = -1;
    render();
    updateAntiscroll();
  }

  function updateRowCount() {
    if (!initialized) { return; }

    var dataLengthIncludingAddNew = getDataLengthIncludingAddNew();
    var numberOfRows = dataLengthIncludingAddNew +
      (options.leaveSpaceForNewRows ? numVisibleRows - 1 : 0);

    var oldViewportHasVScroll = viewportHasVScroll;
    // with autoHeight, we do not need to accommodate the vertical scroll bar
    viewportHasVScroll = !options.autoHeight && (numberOfRows * options.rowHeight > contentViewport.height);

    makeActiveCellNormal();

    // remove the rows that are now outside of the data range
    // this helps avoid redundant calls to .removeRow() when the size of the data decreased by thousands of rows
    var l = dataLengthIncludingAddNew - 1;
    for (var i in rowsCache) {
      if (i >= l) {
        removeRowFromCache(i);
      }
    }

    if (activeCellNode && activeRow > l) {
      resetActiveCell();
    }

    var oldH = h;
    th = Math.max(options.rowHeight * numberOfRows, contentViewport.height - scrollbarDimensions.height);
    if (th < maxSupportedCssHeight) {
      // just one page
      h = ph = th;
      n = 1;
      cj = 0;
    } else {
      // break into pages
      h = maxSupportedCssHeight;
      ph = h / 100;
      n = Math.floor(th / ph);
      cj = (th - h) / (n - 1);
    }

    if (h !== oldH) {
      contentCanvas.el.css("height", h);
      scrollTop = contentViewport.el[0].scrollTop;
    }

    var oldScrollTopInRange = (scrollTop + offset <= th - contentViewport.height);

    if (th == 0 || scrollTop == 0) {
      page = offset = 0;
    } else if (oldScrollTopInRange) {
      // maintain virtual position
      scrollTo(scrollTop + offset);
    } else {
      // scroll to bottom
      scrollTo(th - contentViewport.height);
    }

    if (h != oldH && options.autoHeight) {
      resizeCanvas();
    }

    if (options.forceFitColumns && oldViewportHasVScroll != viewportHasVScroll) {
      autosizeColumns();
    }
    updateCanvasWidth(false);
  }

  function getVisibleRange(viewportTop, viewportLeft) {
    if (viewportTop == null) {
      viewportTop = scrollTop;
    }
    if (viewportLeft == null) {
      viewportLeft = scrollLeft;
    }

    return {
      top: getRowFromPosition(viewportTop),
      bottom: getRowFromPosition(viewportTop + contentViewport.height) + 1,
      leftPx: viewportLeft,
      rightPx: viewportLeft + contentViewport.width
    };
  }

  function getRenderedRange(viewportTop, viewportLeft) {
    var range = getVisibleRange(viewportTop, viewportLeft);
    var buffer = Math.round(contentViewport.height / options.rowHeight);
    var minBuffer = 3;

    if (vScrollDir == -1) {
      range.top -= buffer;
      range.bottom += minBuffer;
    } else if (vScrollDir == 1) {
      range.top -= minBuffer;
      range.bottom += buffer;
    } else {
      range.top -= minBuffer;
      range.bottom += minBuffer;
    }

    range.top = Math.max(0, range.top);
    range.bottom = Math.min(getDataLengthIncludingAddNew() - 1, range.bottom);

    range.leftPx  -= contentViewport.width;
    range.rightPx += contentViewport.width;

    range.leftPx = Math.max(0, range.leftPx);
    range.rightPx = Math.min(contentCanvas.width, range.rightPx);

    return range;
  }

  /*
    Fills in cellNodesByColumnIdx with dom node references
    -
    rowsCache[idx].rowNode is a jquery element that wraps two raw dom elements.
    When pinned, there are two containers, one left and one right.
    rowsCache[idx].rowNode.children().length // sum of both
    rowsCache[idx].rowNode[0].childNodes.length // left side
    rowsCache[idx].rowNode[1].childNodes.length // right side
    */
  function ensureCellNodesInRowsCache(row) {
    var cacheEntry = rowsCache[row];
    if (cacheEntry) {
      if (cacheEntry.cellRenderQueue.length) {
        var $lastNode = cacheEntry.rowNode.children().last();           // The last cell in the row
        while (cacheEntry.cellRenderQueue.length) {
          var columnIdx = cacheEntry.cellRenderQueue.pop();
          cacheEntry.cellNodesByColumnIdx[columnIdx] = $lastNode[0];
          $lastNode = $lastNode.prev();
          // cellRenderQueue is not empty but there is no .prev() element.
          // We must need to switch to the other pinned row container.
          if ($lastNode.length === 0) { $lastNode = $(cacheEntry.rowNode[0]).children().last(); }
        }
      }
    }
  }

  function cleanUpCells(range, row) {
    var totalCellsRemoved = 0;
    var cacheEntry = rowsCache[row];

    // Remove cells outside the range.
    var cellsToRemove = [];
    for (var i in cacheEntry.cellNodesByColumnIdx) {
      // I really hate it when people mess with Array.prototype.
      if (!cacheEntry.cellNodesByColumnIdx.hasOwnProperty(i)) {
        continue;
      }
      i = i | 0;                                        // This is a string, so it needs to be cast back to a number.
      if (i <= options.pinnedColumn) { continue; }      // never remove cells in a frozen column

      var colspan = cacheEntry.cellColSpans[i];
      if (columnPosLeft[i] > range.rightPx || columnPosRight[Math.min(columns.length - 1, i + colspan - 1)] < range.leftPx) {
        if (!(row == activeRow && i == activeCell)) {
          cellsToRemove.push(i);
        }
      }
    }

    // Remove every cell that isn't in the range,
    // remove the dom element, cellColSpans, cellNodesByColumnIdx, and postProcessedRows entries.
    var cellToRemove, el;
    while ((cellToRemove = cellsToRemove.pop()) != null) {
      el = cacheEntry.cellNodesByColumnIdx[cellToRemove];
      // We used to know the parent, but now there are two possible parents (left or right), so it's easier to go from element to parent to remove:
      // The parent element won't exist if we removed the whole row. eg: we've stopping pinning columns so the whole viewport was removed.
      if (el && el.parentElement) {
        el.parentElement.removeChild(el);
      }
      delete cacheEntry.cellColSpans[cellToRemove];
      delete cacheEntry.cellNodesByColumnIdx[cellToRemove];
      if (postProcessedRows[row]) { delete postProcessedRows[row][cellToRemove]; }
      totalCellsRemoved++;
    }
    return totalCellsRemoved;
  }

  function cleanUpAndRenderCells(range) {
    var cacheEntry;
    var markupArray = [];
    var processedRows = [];
    var cellsAdded, cellsRemoved;
    var totalCellsAdded = 0;
    var colspan;

    for (var row = range.top, btm = range.bottom; row <= btm; row++) {
      cacheEntry = rowsCache[row];
      if (!cacheEntry) {
        continue;
      }

      // cellRenderQueue populated in renderRows() needs to be cleared first
      ensureCellNodesInRowsCache(row);

      cellsRemoved = cleanUpCells(range, row);

      // Render missing cells.
      cellsAdded = 0;

      var metadata = data.getItemMetadata && data.getItemMetadata(row);
      metadata = metadata && metadata.columns;

      var d = getDataItem(row);

      // TODO:  shorten this loop (index? heuristics? binary search?)
      for (var i = 0, ii = columns.length; i < ii; i++) {
        // Cells to the right are outside the range.
        if (columnPosLeft[i] > range.rightPx) {
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
          var columnData = metadata[columns[i].id] || metadata[i];
          colspan = (columnData && columnData.colspan) || 1;
          if (colspan === "*") {
            colspan = ii - i;
          }
        }

        // Cells whose right edge is inside the left range boundary are visible and should be drawn
        if (columnPosRight[Math.min(ii - 1, i + colspan - 1)] > range.leftPx) {
          appendCellHtml(markupArray, row, i, colspan, d);
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
    var x = document.createElement("div");
    x.innerHTML = markupArray.join("");

    var processedRow, $node, side;
    while ((processedRow = processedRows.pop()) != null) {
      cacheEntry = rowsCache[processedRow];
      var columnIdx;

      // Starting on the rightmost cell,
      while ((columnIdx = cacheEntry.cellRenderQueue.pop()) != null) {
        $node = $(x).children().last();
        side = columnIdx > options.pinnedColumn ? 1 : 0;
        $(cacheEntry.rowNode[side]).append($node);
        cacheEntry.cellNodesByColumnIdx[columnIdx] = $node[0];
      }
    }
  }

  function renderRows(range) {
    var markupArrayL = [],
      markupArrayR = [],
      rows = [],
      needToReselectCell = false,
      dataLength = getDataLength();

    for (var i = range.top, ii = range.bottom; i <= ii; i++) {
      if (rowsCache[i]) {
        continue;
      }
      renderedRows++;
      rows.push(i);

      // Create an entry right away so that appendRowHtml() can
      // start populating it.
      rowsCache[i] = {
        "rowNode": null,

        // ColSpans of rendered cells (by column idx).
        // Can also be used for checking whether a cell has been rendered.
        "cellColSpans": [],

        // Cell nodes (by column idx).  Lazy-populated by ensureCellNodesInRowsCache().
        "cellNodesByColumnIdx": [],

        // Column indices of cell nodes that have been rendered, but not yet indexed in
        // cellNodesByColumnIdx.  These are in the same order as cell nodes added at the
        // end of the row.
        "cellRenderQueue": []
      };

      appendRowHtml(markupArrayL, markupArrayR, i, range, dataLength);
      if (activeCellNode && activeRow === i) {
        needToReselectCell = true;
      }
      counter_rows_rendered++;
    }

    if (!rows.length) { return; }

    var l = document.createElement("div"),
      r = document.createElement("div");
    l.innerHTML = markupArrayL.join('');
    r.innerHTML = markupArrayR.join('');

    // For each row, add a row node that contains either one or two elements, depending on whether columns are pinned
    for (var i = 0, ii = rows.length; i < ii; i++) {
      if (isPinned) {
        rowsCache[rows[i]].rowNode = $()
          .add($(l.firstChild).appendTo(contentCanvas.el[0]))
          .add($(r.firstChild).appendTo(contentCanvas.el[1]));
      } else {
        rowsCache[rows[i]].rowNode = $()
          .add($(l.firstChild).appendTo(contentCanvas.el[0]));
      }
    }

    if (needToReselectCell) {
      activeCellNode = getCellNode(activeRow, activeCell);
    }
  }

  function startPostProcessing() {
    if (!options.enableAsyncPostRender) {
      return;
    }
    if (!columns.some(function (column) { return column.asyncPostRender })) {
      return;
    }
    clearTimeout(h_postrender);
    h_postrender = setTimeout(asyncPostProcessRows, options.asyncPostRenderDelay);
  }

  function invalidatePostProcessingResults(row) {
    delete postProcessedRows[row];
    postProcessFromRow = Math.min(postProcessFromRow, row);
    postProcessToRow = Math.max(postProcessToRow, row);
    startPostProcessing();
  }

  function updateRowPositions() {
    for (var row in rowsCache) {
      rowsCache[row].rowNode.css('top', getRowTop(row) + "px");
    }
  }

  function render() {
    if (!initialized) {
      return;
    }
    var visible = getVisibleRange();
    var rendered = getRenderedRange();

    // remove rows no longer in the viewport
    cleanupRows(rendered);

    // If we change the left scroll, we may need to add/remove cells from already drawn rows.
    if (lastRenderedScrollLeft != scrollLeft) {
      cleanUpAndRenderCells(rendered);
    }

    // render missing rows
    renderRows(rendered);

    postProcessFromRow = visible.top;
    postProcessToRow = Math.min(getDataLengthIncludingAddNew() - 1, visible.bottom);
    startPostProcessing();

    lastRenderedScrollTop = scrollTop;
    lastRenderedScrollLeft = scrollLeft;

    trigger(self.onRender, {});

    h_render = null;
  }

  // React to a mousewheel event on a header element, translate them to the grid contents
  // It's OK to always decrement because the browser never lets scrollLeft or Top get set less than 0.
  function onHeaderMouseWheel(evt) {
    contentViewport.scroller.scrollLeft -= evt.originalEvent.wheelDeltaX;
    contentViewport.scroller.scrollTop  -= evt.originalEvent.wheelDeltaY;
  }

  // Handle an actual, browser triggered scroll event
  // Send the scrollTop from the triggering element into `handleScroll`, which can be triggered programatically.
  function onScroll(evt, el) {
    handleScroll(this.scrollTop);
  }

  function handleScroll(top) {
    scrollTop  = top || contentViewport.scroller.scrollTop;
    scrollLeft = contentViewport.scroller.scrollLeft;
    reallyHandleScroll(false);
  }

  function reallyHandleScroll(isMouseWheel) {
    var contentScroller = contentViewport.scroller;
    // Ceiling the max scroll values
    var maxScrollDistanceY = contentScroller.scrollHeight - contentScroller.clientHeight;
    var maxScrollDistanceX = contentScroller.scrollWidth  - contentScroller.clientWidth;
    if (scrollTop  > maxScrollDistanceY) { scrollTop  = maxScrollDistanceY; }
    if (scrollLeft > maxScrollDistanceX) { scrollLeft = maxScrollDistanceX; }

    var vScrollDist = Math.abs(scrollTop - prevScrollTop);
    var hScrollDist = Math.abs(scrollLeft - prevScrollLeft);

    if (hScrollDist) {
      prevScrollLeft = scrollLeft;
      contentScroller.scrollLeft = scrollLeft;
      topViewport.scroller.scrollLeft = scrollLeft;

      if (options.appendSubheadersToContainer) {
        subHeaders.el.scrollLeft(scrollLeft);
      }
    }

    if (vScrollDist) {
      vScrollDir = prevScrollTop < scrollTop ? 1 : -1;
      prevScrollTop = scrollTop;

      if (isMouseWheel) { contentScroller.scrollTop = scrollTop; }
      // Set the scroll position of the paired viewport to match this one
      if (isPinned) {
        contentViewport.el[0].scrollTop = scrollTop;
        contentViewport.el[1].scrollTop = scrollTop;
      }
      // switch virtual pages if needed
      if (vScrollDist < contentViewport.height) {
        scrollTo(scrollTop + offset);
      } else {
        var oldOffset = offset;
        if (h == contentViewport.height) {
          page = 0;
        } else {
          page = Math.min(n - 1, Math.floor(scrollTop * ((th - contentViewport.height) / (h - contentViewport.height)) * (1 / ph)));
        }
        offset = Math.round(page * cj);
        if (oldOffset != offset) {
          invalidateAllRows();
        }
      }
    }

    if (hScrollDist || vScrollDist) {
      if (h_render) {
        clearTimeout(h_render);
      }

      if (Math.abs(lastRenderedScrollTop - scrollTop) > 20 ||
        Math.abs(lastRenderedScrollLeft - scrollLeft) > 20) {
        if (options.forceSyncScrolling || (
          Math.abs(lastRenderedScrollTop - scrollTop) < contentViewport.height &&
          Math.abs(lastRenderedScrollLeft - scrollLeft) < contentViewport.width)) {
          render();
        } else {
          h_render = setTimeout(render, 50);
        }

        trigger(self.onViewportChanged, {});
      }
    }

    trigger(self.onScroll, {scrollLeft: scrollLeft, scrollTop: scrollTop});
  }

  function asyncPostProcessRows() {
    var dataLength = getDataLength();
    while (postProcessFromRow <= postProcessToRow) {
      var row = (vScrollDir >= 0) ? postProcessFromRow++ : postProcessToRow--;
      var cacheEntry = rowsCache[row];
      if (!cacheEntry || row >= dataLength) {
        continue;
      }

      if (!postProcessedRows[row]) {
        postProcessedRows[row] = {};
      }

      ensureCellNodesInRowsCache(row);
      for (var columnIdx in cacheEntry.cellNodesByColumnIdx) {
        if (!cacheEntry.cellNodesByColumnIdx.hasOwnProperty(columnIdx)) {
          continue;
        }

        columnIdx = columnIdx | 0;

        var m = columns[columnIdx];
        if (m.asyncPostRender && !postProcessedRows[row][columnIdx]) {
          var node = cacheEntry.cellNodesByColumnIdx[columnIdx];
          if (node) {
            try {
              m.asyncPostRender(node, row, getDataItem(row), m, self);
            } catch (error) {
              console.error('Error in asyncPostRenderer:', error, [node, row, getDataItem(row), m, self]);
            }
          }
          postProcessedRows[row][columnIdx] = true;
        }
      }

      h_postrender = setTimeout(asyncPostProcessRows, options.asyncPostRenderDelay);
      return;
    }
  }

  function updateCellCssStylesOnRenderedRows(addedHash, removedHash) {
    var node, columnId, addedRowHash, removedRowHash;
    for (var row in rowsCache) {
      removedRowHash = removedHash && removedHash[row];
      addedRowHash = addedHash && addedHash[row];

      if (removedRowHash) {
        for (columnId in removedRowHash) {
          if (!addedRowHash || removedRowHash[columnId] != addedRowHash[columnId]) {
            node = getCellNode(row, getColumnIndex(columnId));
            if (node) {
              $(node).removeClass(removedRowHash[columnId]);
            }
          }
        }
      }

      if (addedRowHash) {
        for (columnId in addedRowHash) {
          if (!removedRowHash || removedRowHash[columnId] != addedRowHash[columnId]) {
            node = getCellNode(row, getColumnIndex(columnId));
            if (node) {
              $(node).addClass(addedRowHash[columnId]);
            }
          }
        }
      }
    }
  }

  function addCellCssStyles(key, hash) {
    if (cellCssClasses[key]) {
      throw "addCellCssStyles: cell CSS hash with key '" + key + "' already exists.";
    }

    cellCssClasses[key] = hash;
    updateCellCssStylesOnRenderedRows(hash, null);

    trigger(self.onCellCssStylesChanged, { "key": key, "hash": hash });
  }

  function removeCellCssStyles(key) {
    if (!cellCssClasses[key]) {
      return;
    }

    updateCellCssStylesOnRenderedRows(null, cellCssClasses[key]);
    delete cellCssClasses[key];

    trigger(self.onCellCssStylesChanged, { "key": key, "hash": null });
  }

  function setCellCssStyles(key, hash) {
    var prevHash = cellCssClasses[key];

    cellCssClasses[key] = hash;
    updateCellCssStylesOnRenderedRows(hash, prevHash);

    trigger(self.onCellCssStylesChanged, { "key": key, "hash": hash });
  }

  // (key: String) => Object
  function getCellCssStyles(key) {
    return cellCssClasses[key];
  }

  function flashCell(row, cell, speed) {
    speed = speed || 100;
    if (rowsCache[row]) {
      var $cell = $(getCellNode(row, cell));

      var toggleCellClass = function(times) {
        if (!times) {
          return;
        }
        setTimeout(function () {
            $cell.queue(function () {
              $cell.toggleClass(options.cellFlashingCssClass).dequeue();
              toggleCellClass(times - 1);
            });
          },
          speed);
      }

      toggleCellClass(4);
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // Interactivity

  function handleDragInit(e, dd) {
    var cell = getCellFromEvent(e);
    if (!cell || !cellExists(cell.row, cell.cell)) {
      return false;
    }

    var retval = trigger(self.onDragInit, dd, e);
    if (e.isImmediatePropagationStopped()) {
      return retval;
    }

    // if nobody claims to be handling drag'n'drop by stopping immediate propagation,
    // cancel out of it
    return false;
  }

  function handleDragStart(e, dd) {
    var cell = getCellFromEvent(e);
    if (!cell || !cellExists(cell.row, cell.cell)) {
      return false;
    }

    var retval = trigger(self.onDragStart, dd, e);
    if (e.isImmediatePropagationStopped()) {
      return retval;
    }

    return false;
  }

  function handleDrag(e, dd) {
    return trigger(self.onDrag, dd, e);
  }

  function handleDragEnd(e, dd) {
    trigger(self.onDragEnd, dd, e);
  }

  function handleKeyDown(e) {
    trigger(self.onBeforeKeyDown, {row: activeRow, cell: activeCell}, e);
    trigger(self.onKeyDown, {row: activeRow, cell: activeCell}, e);
    var handled = e.isImmediatePropagationStopped();

    if (!handled) {
      if (!e.shiftKey && !e.altKey && !e.ctrlKey) {
        if (e.which == 27) {
          if (!getEditorLock().isActive()) {
            return; // no editing mode to cancel, allow bubbling and default processing (exit without cancelling the event)
          }
          cancelEditAndSetFocus();
        } else if (e.which == 34) {
          navigatePageDown();
          handled = true;
        } else if (e.which == 33) {
          navigatePageUp();
          handled = true;
        } else if (e.which == 37) {
          handled = navigateLeft();
        } else if (e.which == 39) {
          handled = navigateRight();
        } else if (e.which == 38) {
          handled = navigateUp();
        } else if (e.which == 40) {
          handled = navigateDown();
        } else if (e.which == 9) {
          handled = navigateNext();
        } else if (e.which == 13) {
          if (options.editable) {
            if (currentEditor) {
              // adding new row
              if (activeRow === getDataLength()) {
                navigateDown();
              } else {
                commitEditAndSetFocus();
              }
            } else {
              if (getEditorLock().commitCurrentEdit()) {
                makeActiveCellEditable();
              }
            }
          }
          handled = true;
        }
      } else if (e.which == 9 && e.shiftKey && !e.ctrlKey && !e.altKey) {
        handled = navigatePrev();
      }
    }

    if (handled) {
      // the event has been handled so don't let parent element (bubbling/propagation) or browser (default) handle it
      e.stopPropagation();
      e.preventDefault();
      try {
        e.originalEvent.keyCode = 0; // prevent default behaviour for special keys in IE browsers (F3, F5, etc.)
      }
        // ignore exceptions - setting the original event's keycode throws access denied exception for "Ctrl"
        // (hitting control key only, nothing else), "Shift" (maybe others)
      catch (error) {
      }
    }
  }

  function handleClick(e) {
    if (!currentEditor) {
      // if this click resulted in some cell child node getting focus,
      // don't steal it back - keyboard events will still bubble up
      // IE9+ seems to default DIVs to tabIndex=0 instead of -1, so check for cell clicks directly.
      if (e.target != document.activeElement || $(e.target).hasClass("cell")) {
        setFocus();
      }
    }

    var cell = getCellFromEvent(e);
    if (!cell || (currentEditor !== null && activeRow == cell.row && activeCell == cell.cell)) {
      return;
    }

    trigger(self.onClick, {row: cell.row, cell: cell.cell}, e);
    if (e.isImmediatePropagationStopped()) {
      return;
    }

    if ((activeCell != cell.cell || activeRow != cell.row) && canCellBeActive(cell.row, cell.cell)) {
      if (!getEditorLock().isActive() || getEditorLock().commitCurrentEdit()) {
        scrollRowIntoView(cell.row, false);
        setActiveCellInternal(getCellNode(cell.row, cell.cell));
      }
    }
  }

  function handleContextMenu(e) {
    var $cell = $(e.target).closest(".cell", contentCanvas.el);
    if ($cell.length === 0) {
      return;
    }

    // are we editing this cell?
    if (activeCellNode === $cell[0] && currentEditor !== null) {
      return;
    }

    trigger(self.onContextMenu, {}, e);
  }

  function handleDblClick(e) {
    var cell = getCellFromEvent(e);
    if (!cell || (currentEditor !== null && activeRow == cell.row && activeCell == cell.cell)) {
      return;
    }

    trigger(self.onDblClick, {row: cell.row, cell: cell.cell}, e);
    if (e.isImmediatePropagationStopped()) {
      return;
    }

    if (options.editable) {
      gotoCell(cell.row, cell.cell, true);
    }
  }

  function handleHeaderMouseEnter(e) {
    trigger(self.onHeaderMouseEnter, {
      "column": $(this).data("column")
    }, e);
  }

  function handleHeaderMouseLeave(e) {
    trigger(self.onHeaderMouseLeave, {
      "column": $(this).data("column")
    }, e);
  }

  function handleHeaderContextMenu(e) {
    var $header = $(e.target).closest(".cell", ".header");
    var column = $header && $header.data("column");
    trigger(self.onHeaderContextMenu, {column: column}, e);
  }

  function handleSubHeaderContextMenu(e) {
    var $subHeader = $(e.target).closest(".cell", ".subHeaders");
    var column = $subHeader && $subHeader.data("column");
    trigger(self.onSubHeaderContextMenu, {column: column}, e);
  }

  function handleHeaderClick(e) {
    var $header = $(e.target).closest(".cell", ".header");
    var column = $header && $header.data("column");
    if (column) {
      trigger(self.onHeaderClick, {column: column}, e);
    }
  }

  function handleMouseEnter(e) {
    trigger(self.onMouseEnter, {}, e);
  }

  function handleMouseLeave(e) {
    trigger(self.onMouseLeave, {}, e);
  }

  function cellExists(row, cell) {
    return !(row < 0 || row >= getDataLength() || cell < 0 || cell >= columns.length);
  }

  function getCellFromPoint(x, y) {
    var row = getRowFromPosition(y);
    var cell = 0;

    var w = 0;
    for (var i = 0; i < columns.length && w < x; i++) {
      w += columns[i].width;
      cell++;
    }

    if (cell < 0) {
      cell = 0;
    }

    return {row: row, cell: cell - 1};
  }

  // Given a cell element, read column number from .l<columnNumber> CSS class
  function getCellFromNode(cellNode) {
    if (cellNode[0]) { cellNode = cellNode[0]; } // unwrap jquery
    var cls = /l\d+/.exec(cellNode.className);
    if (!cls) {
      throw "getCellFromNode: cannot get cell - " + cellNode.className;
    }
    return parseInt(cls[0].substr(1, cls[0].length - 1), 10);
  }

  // Given a dom element for a row, find out which row index it belongs to
  function getRowFromNode(node) {
    for (var idx in rowsCache) {
      if(
        rowsCache[idx].rowNode[0] === node ||
        rowsCache[idx].rowNode[1] === node
      ){
        return parseInt(idx);
//        if (rowsCache[row].rowNode[0] === rowNode[0]) {
//          return row | 0;
//        }
      }
    }
    return null;
  }

  function getCellFromEvent(e) {
    var $cell = $(e.target).closest(".cell", contentCanvas.el);
    if (!$cell.length) {
      return null;
    }

    var row = getRowFromNode($cell[0].parentNode);
    var cell = getCellFromNode($cell[0]);

    if (row == null || cell == null) {
      return null;
    } else {
      return {
        "row": row,
        "cell": cell
      };
    }
  }

  function getCellNodeBox(row, cell) {
    if (!cellExists(row, cell)) {
      return null;
    }

    var y1 = getRowTop(row);
    var y2 = y1 + options.rowHeight - 1;
    var x1 = 0;
    for (var i = 0; i < cell; i++) {
      x1 += columns[i].width;
    }
    var x2 = x1 + columns[cell].width;

    return {
      top: y1,
      left: x1,
      bottom: y2,
      right: x2
    };
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // Cell switching

  function resetActiveCell() {
    setActiveCellInternal(null, false);
  }

  function setFocus() {
    if (tabbingDirection == -1) {
      $focusSink[0].focus();
    } else {
      $focusSink2[0].focus();
    }
  }

  // Returns the sum of the widths of every column in the pinned viewport
  // (Void) => Number
  function getPinnedColumnsWidth() {
    return options.pinnedColumn
      ? sum(range(options.pinnedColumn + getFirstFocusableColumnIndex() + 1).map(function(_, n) {
          return columnPosLeft[n];
        }))
      : 0;
  }

  // Returns an array of length n
  // (n: Number) => Array[Undefined]
  function range(n) {
    return Array.apply(null, { length: n });
  }

  // Returns the sum of every element in the given array
  // (array: Array[Number]) => Number
  function sum(array) {
    return array.reduce(function(a, b) { return a + b; }, 0);
  }

  // Returns the index of the first column (counting from the left) that is focusable
  // (Void) => Number
  function getFirstFocusableColumnIndex() {
    var columns = getColumns();
    var index = 0;
    while (index < columns.length) {
      if (columns[index].focusable) {
        return index;
      }
      index++;
    }
    return -1;
  }

  function scrollCellIntoView(row, cell, doPaging) {
    scrollRowIntoView(row, doPaging);

    var colspan = getColspan(row, cell);

    // When navigating left, be sure to take (1) the pinned area and (2) whether or not columns are
    // selectable into account
    var left = columnPosLeft[cell] - getPinnedColumnsWidth() - columnPosLeft[getFirstFocusableColumnIndex()];

    var right = columnPosRight[cell + (colspan > 1 ? colspan - 1 : 0)],
        scrollRight = scrollLeft + contentViewport.width;

    if(cell <= options.pinnedColumn) { // We assume pinned columns have a fully visible X dimension.
      return;
    }

    if (left < scrollLeft) {
      contentViewport.el.scrollLeft(left);
      handleScroll();
      render();
    } else if (right > scrollRight) {
      contentViewport.el.scrollLeft(Math.min(left, right - contentViewport.el[0].clientWidth));
      handleScroll();
      render();
    }
  }

  function setActiveCellInternal(newCell, opt_editMode) {

    var previousActiveRow = activeRow;

    if (activeCellNode !== null) {
      makeActiveCellNormal();
      $(activeCellNode).removeClass("active");
      if (rowsCache[activeRow]) {
        $(rowsCache[activeRow].rowNode).removeClass("active");
      }
    }

    var activeCellChanged = (activeCellNode !== newCell);
    activeCellNode = newCell;

    if (activeCellNode != null) {
      activeRow = getRowFromNode(activeCellNode.parentNode);
      activeCell = activePosX = getCellFromNode(activeCellNode);

      if (opt_editMode == null) {
        opt_editMode = (activeRow == getDataLength()) || options.autoEdit;
      }

      $(activeCellNode).addClass("active");
      $(rowsCache[activeRow].rowNode).addClass("active");

      if (options.editable && opt_editMode && isCellPotentiallyEditable(activeRow, activeCell)) {
        clearTimeout(h_editorLoader);

        if (options.asyncEditorLoading) {
          h_editorLoader = setTimeout(function () {
            makeActiveCellEditable();
          }, options.asyncEditorLoadDelay);
        } else {
          makeActiveCellEditable();
        }
      }
    } else {
      activeRow = activeCell = null;
    }

    if (activeCellChanged) {
      trigger(self.onActiveCellChanged, getActiveCell());
    }

    var activeRowChanged = (activeRow !== previousActiveRow);
    if (activeRowChanged) {
      trigger(self.onActiveRowChanged, {row: getDataItem(activeRow)});
    }
  }

  function clearTextSelection() {
    if (document.selection && document.selection.empty) {
      try {
        //IE fails here if selected element is not in dom
        document.selection.empty();
      } catch (e) { }
    } else if (window.getSelection) {
      var sel = window.getSelection();
      if (sel && sel.removeAllRanges) {
        sel.removeAllRanges();
      }
    }
  }

  function isCellPotentiallyEditable(row, cell) {
    var dataLength = getDataLength();
    // is the data for this row loaded?
    if (row < dataLength && !getDataItem(row)) {
      return false;
    }

    // are we in the Add New row?  can we create new from this cell?
    if (columns[cell].cannotTriggerInsert && row >= dataLength) {
      return false;
    }

    // does this cell have an editor?
    if (!getEditor(row, cell)) {
      return false;
    }

    return true;
  }

  function makeActiveCellNormal() {
    if (!currentEditor) {
      return;
    }
    trigger(self.onBeforeCellEditorDestroy, {editor: currentEditor});
    currentEditor.destroy();
    currentEditor = null;

    if (activeCellNode) {
      var d = getDataItem(activeRow);
      $(activeCellNode).removeClass("editable invalid");
      if (d) {
        var column = columns[activeCell];
        var formatter = getFormatter(activeRow, column);
        activeCellNode.innerHTML = formatter(activeRow, activeCell, getDataItemValueForColumn(d, column), column, d, self);
        invalidatePostProcessingResults(activeRow);
      }
    }

    // if there previously was text selected on a page (such as selected text in the edit cell just removed),
    // IE can't set focus to anything else correctly
    if (navigator.userAgent.toLowerCase().match(/msie/)) {
      clearTextSelection();
    }

    getEditorLock().deactivate(editController);
  }

  function makeActiveCellEditable(editor) {
    if (!activeCellNode) {
      return;
    }
    if (!options.editable) {
      throw "Grid : makeActiveCellEditable : should never get called when options.editable is false";
    }

    // cancel pending async call if there is one
    clearTimeout(h_editorLoader);

    if (!isCellPotentiallyEditable(activeRow, activeCell)) {
      return;
    }

    var columnDef = columns[activeCell];
    var item = getDataItem(activeRow);

    if (trigger(self.onBeforeEditCell, {row: activeRow, cell: activeCell, item: item, column: columnDef}) === false) {
      setFocus();
      return;
    }

    getEditorLock().activate(editController);
    $(activeCellNode).addClass("editable");

    // don't clear the cell if a custom editor is passed through
    if (!editor) {
      activeCellNode.innerHTML = "";
    }

    currentEditor = new (editor || getEditor(activeRow, activeCell))({
      grid: self,
      gridPosition: absBox($container[0]),
      position: absBox(activeCellNode),
      container: activeCellNode,
      column: columnDef,
      item: item || {},
      commitChanges: commitEditAndSetFocus,
      cancelChanges: cancelEditAndSetFocus
    });

    if (item) {
      currentEditor.loadValue(item);
    }

    serializedEditorValue = currentEditor.serializeValue();

    if (currentEditor.position) {
      handleActiveCellPositionChange();
    }
  }

  function commitEditAndSetFocus() {
    // if the commit fails, it would do so due to a validation error
    // if so, do not steal the focus from the editor
    if (getEditorLock().commitCurrentEdit()) {
      setFocus();
      if (options.autoEdit) {
        navigateDown();
      }
    }
  }

  function cancelEditAndSetFocus() {
    if (getEditorLock().cancelCurrentEdit()) {
      setFocus();
    }
  }

  function absBox(elem) {
    var box = {
      top: elem.offsetTop,
      left: elem.offsetLeft,
      bottom: 0,
      right: 0,
      width: $(elem).outerWidth(),
      height: $(elem).outerHeight(),
      visible: true};
    box.bottom = box.top + box.height;
    box.right = box.left + box.width;

    // walk up the tree
    var offsetParent = elem.offsetParent;
    while ((elem = elem.parentNode) != document.body) {
      if (box.visible && elem.scrollHeight != elem.offsetHeight && $(elem).css("overflowY") != "visible") {
        box.visible = box.bottom > elem.scrollTop && box.top < elem.scrollTop + elem.clientHeight;
      }

      if (box.visible && elem.scrollWidth != elem.offsetWidth && $(elem).css("overflowX") != "visible") {
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
  }

  function getActiveCellPosition() {
    return absBox(activeCellNode);
  }

  function getGridPosition() {
    return absBox($container[0])
  }

  function handleActiveCellPositionChange() {
    if (!activeCellNode) {
      return;
    }

    trigger(self.onActiveCellPositionChanged, {});

    if (currentEditor) {
      var cellBox = getActiveCellPosition();
      if (currentEditor.show && currentEditor.hide) {
        if (!cellBox.visible) {
          currentEditor.hide();
        } else {
          currentEditor.show();
        }
      }

      if (currentEditor.position) {
        currentEditor.position(cellBox);
      }
    }
  }

  function getCellEditor() {
    return currentEditor;
  }

  function getActiveCell() {
    if (!activeCellNode) {
      return null;
    } else {
      return {row: activeRow, cell: activeCell};
    }
  }

  function getActiveCellNode() {
    return activeCellNode;
  }

  function scrollRowIntoView(row, doPaging) {
    var rowAtTop = row * options.rowHeight;
    var rowAtBottom = (row + 1) * options.rowHeight - contentViewport.height + (viewportHasHScroll ? scrollbarDimensions.height : 0);

    // need to page down?
    if ((row + 1) * options.rowHeight > scrollTop + contentViewport.height + offset) {
      scrollTo(doPaging ? rowAtTop : rowAtBottom);
      render();
    }
    // or page up?
    else if (row * options.rowHeight < scrollTop + offset) {
      scrollTo(doPaging ? rowAtBottom : rowAtTop);
      render();
    }
  }

  function scrollRowToTop(row) {
    scrollTo(row * options.rowHeight);
    render();
  }

  function scrollPage(dir) {
    var deltaRows = dir * numVisibleRows;
    scrollTo((getRowFromPosition(scrollTop) + deltaRows) * options.rowHeight);
    render();

    if (options.enableCellNavigation && activeRow != null) {
      var row = activeRow + deltaRows;
      var dataLengthIncludingAddNew = getDataLengthIncludingAddNew();
      if (row >= dataLengthIncludingAddNew) {
        row = dataLengthIncludingAddNew - 1;
      }
      if (row < 0) {
        row = 0;
      }

      var cell = 0, prevCell = null;
      var prevActivePosX = activePosX;
      while (cell <= activePosX) {
        if (canCellBeActive(row, cell)) {
          prevCell = cell;
        }
        cell += getColspan(row, cell);
      }

      if (prevCell !== null) {
        setActiveCellInternal(getCellNode(row, prevCell));
        activePosX = prevActivePosX;
      } else {
        resetActiveCell();
      }
    }
  }

  function navigatePageDown() {
    scrollPage(1);
  }

  function navigatePageUp() {
    scrollPage(-1);
  }

  function getColspan(row, cell) {
    var metadata = data.getItemMetadata && data.getItemMetadata(row);
    if (!metadata || !metadata.columns) {
      return 1;
    }

    var columnData = metadata.columns[columns[cell].id] || metadata.columns[cell];
    var colspan = (columnData && columnData.colspan);
    if (colspan === "*") {
      colspan = columns.length - cell;
    } else {
      colspan = colspan || 1;
    }

    return colspan;
  }

  function findFirstFocusableCell(row) {
    var cell = 0;
    while (cell < columns.length) {
      if (canCellBeActive(row, cell)) {
        return cell;
      }
      cell += getColspan(row, cell);
    }
    return null;
  }

  function findLastFocusableCell(row) {
    var cell = 0;
    var lastFocusableCell = null;
    while (cell < columns.length) {
      if (canCellBeActive(row, cell)) {
        lastFocusableCell = cell;
      }
      cell += getColspan(row, cell);
    }
    return lastFocusableCell;
  }

  function gotoRight(row, cell, posX) {
    if (cell >= columns.length) {
      return null;
    }

    do {
      cell += getColspan(row, cell);
    }
    while (cell < columns.length && !canCellBeActive(row, cell));

    if (cell < columns.length) {
      return {
        "row": row,
        "cell": cell,
        "posX": cell
      };
    }
    return null;
  }

  function gotoLeft(row, cell, posX) {
    if (cell <= 0) {
      return null;
    }

    var firstFocusableCell = findFirstFocusableCell(row);
    if (firstFocusableCell === null || firstFocusableCell >= cell) {
      return null;
    }

    var prev = {
      "row": row,
      "cell": firstFocusableCell,
      "posX": firstFocusableCell
    };
    var pos;
    while (true) {
      pos = gotoRight(prev.row, prev.cell, prev.posX);
      if (!pos) {
        return null;
      }
      if (pos.cell >= cell) {
        return prev;
      }
      prev = pos;
    }
  }

  function gotoDown(row, cell, posX) {
    var prevCell;
    var dataLengthIncludingAddNew = getDataLengthIncludingAddNew();
    while (true) {
      if (++row >= dataLengthIncludingAddNew) {
        return null;
      }

      prevCell = cell = 0;
      while (cell <= posX) {
        prevCell = cell;
        cell += getColspan(row, cell);
      }

      if (canCellBeActive(row, prevCell)) {
        return {
          "row": row,
          "cell": prevCell,
          "posX": posX
        };
      }
    }
  }

  function gotoUp(row, cell, posX) {
    var prevCell;
    while (true) {
      if (--row < 0) {
        return null;
      }

      prevCell = cell = 0;
      while (cell <= posX) {
        prevCell = cell;
        cell += getColspan(row, cell);
      }

      if (canCellBeActive(row, prevCell)) {
        return {
          "row": row,
          "cell": prevCell,
          "posX": posX
        };
      }
    }
  }

  function gotoNext(row, cell, posX) {
    if (row == null && cell == null) {
      row = cell = posX = 0;
      if (canCellBeActive(row, cell)) {
        return {
          "row": row,
          "cell": cell,
          "posX": cell
        };
      }
    }

    var pos = gotoRight(row, cell, posX);
    if (pos) {
      return pos;
    }

    var firstFocusableCell = null;
    var dataLengthIncludingAddNew = getDataLengthIncludingAddNew();
    while (++row < dataLengthIncludingAddNew) {
      firstFocusableCell = findFirstFocusableCell(row);
      if (firstFocusableCell !== null) {
        return {
          "row": row,
          "cell": firstFocusableCell,
          "posX": firstFocusableCell
        };
      }
    }
    return null;
  }

  function gotoPrev(row, cell, posX) {
    if (row == null && cell == null) {
      row = getDataLengthIncludingAddNew() - 1;
      cell = posX = columns.length - 1;
      if (canCellBeActive(row, cell)) {
        return {
          "row": row,
          "cell": cell,
          "posX": cell
        };
      }
    }

    var pos;
    var lastSelectableCell;
    while (!pos) {
      pos = gotoLeft(row, cell, posX);
      if (pos) {
        break;
      }
      if (--row < 0) {
        return null;
      }

      cell = 0;
      lastSelectableCell = findLastFocusableCell(row);
      if (lastSelectableCell !== null) {
        pos = {
          "row": row,
          "cell": lastSelectableCell,
          "posX": lastSelectableCell
        };
      }
    }
    return pos;
  }

  function navigateRight() {
    return navigate("right");
  }

  function navigateLeft() {
    return navigate("left");
  }

  function navigateDown() {
    return navigate("down");
  }

  function navigateUp() {
    return navigate("up");
  }

  function navigateNext() {
    return navigate("next");
  }

  function navigatePrev() {
    return navigate("prev");
  }

  /**
   * @param {string} dir Navigation direction.
   * @return {boolean} Whether navigation resulted in a change of active cell.
   */
  function navigate(dir) {
    if (!options.enableCellNavigation) {
      return false;
    }

    if (!activeCellNode && dir != "prev" && dir != "next") {
      return false;
    }

    if (!getEditorLock().commitCurrentEdit()) {
      return true;
    }
    setFocus();

    var tabbingDirections = {
      "up": -1,
      "down": 1,
      "left": -1,
      "right": 1,
      "prev": -1,
      "next": 1
    };
    tabbingDirection = tabbingDirections[dir];

    var stepFunctions = {
      "up": gotoUp,
      "down": gotoDown,
      "left": gotoLeft,
      "right": gotoRight,
      "prev": gotoPrev,
      "next": gotoNext
    };
    var stepFn = stepFunctions[dir];
    var pos = stepFn(activeRow, activeCell, activePosX);
    if (pos) {
      var isAddNewRow = (pos.row == getDataLength());
      scrollCellIntoView(pos.row, pos.cell, (options.skipPaging ? false : !isAddNewRow));
      setActiveCellInternal(getCellNode(pos.row, pos.cell));
      activePosX = pos.posX;
      return true;
    } else {
      setActiveCellInternal(getCellNode(activeRow, activeCell));
      return false;
    }
  }

  function getCellNode(row, cell) {
    if (rowsCache[row]) {
      ensureCellNodesInRowsCache(row);
      return rowsCache[row].cellNodesByColumnIdx[cell];
    }
    return null;
  }

  function setActiveCell(row, cell) {
    if (!initialized) { return; }
    if (row > getDataLength() || row < 0 || cell >= columns.length || cell < 0) {
      return;
    }

    if (!options.enableCellNavigation) {
      return;
    }
    scrollCellIntoView(row, cell, false);
    setActiveCellInternal(getCellNode(row, cell), false);
  }

  function canCellBeActive(row, cell) {
    if (!options.enableCellNavigation || row >= getDataLengthIncludingAddNew() ||
      row < 0 || cell >= columns.length || cell < 0) {
      return false;
    }

    var rowMetadata = data.getItemMetadata && data.getItemMetadata(row);
    var columnMetadata = rowMetadata && rowMetadata.columns && (rowMetadata.columns[columns[cell].id] || rowMetadata.columns[cell]);

    if (columnMetadata && typeof columnMetadata.focusable === "boolean") {
      return columnMetadata.focusable;
    }

    if (rowMetadata && typeof rowMetadata.focusable === "boolean") {
      return rowMetadata.focusable;
    }

    return columns[cell].focusable && isColumnVisible(columns[cell]);
  }

  // Given an array of column indexes, return true if the lowest index and the highest index span across the column that is marked as pinned.
  function crossesPinnedArea(indices) {
    if (options.pinnedColumn == null || !indices || indices.length < 2){
      return false; // can't cross a boundary if there are 0 or 1 indices, or if columns aren't pinned
    }
    var max = Math.max.apply(null, indices),
        min = Math.min.apply(null, indices);
    if (min <= options.pinnedColumn && max > options.pinnedColumn) {
      return true;
    } else {
      return false;
    }
  }

  function canCellBeSelected(row, cell) {
    if (row >= getDataLength() || row < 0 || cell >= columns.length || cell < 0) {
      return false;
    }

    var rowMetadata = data.getItemMetadata && data.getItemMetadata(row);
    var columnMetadata = rowMetadata && rowMetadata.columns && (rowMetadata.columns[columns[cell].id] || rowMetadata.columns[cell]);

    if (columnMetadata && typeof columnMetadata.selectable === "boolean") {
      return columnMetadata.selectable;
    }

    if (rowMetadata && typeof rowMetadata.selectable === "boolean") {
      return rowMetadata.selectable;
    }

    return columns[cell].selectable;
  }

  function gotoCell(row, cell, forceEdit) {
    if (!initialized) { return; }
    if (!canCellBeActive(row, cell)) {
      return;
    }

    if (!getEditorLock().commitCurrentEdit()) {
      return;
    }

    scrollCellIntoView(row, cell, false);

    var newCell = getCellNode(row, cell);

    // if selecting the 'add new' row, start editing right away
    setActiveCellInternal(newCell, forceEdit || (row === getDataLength()) || options.autoEdit);

    // if no editor was created, set the focus back on the grid
    if (!currentEditor) {
      setFocus();
    }
  }


  //////////////////////////////////////////////////////////////////////////////////////////////
  // IEditor implementation for the editor lock

  function commitCurrentEdit() {
    var item = getDataItem(activeRow);
    var column = columns[activeCell];

    if (currentEditor) {
      if (currentEditor.isValueChanged()) {
        var validationResults = currentEditor.validate();

        if (validationResults.valid) {
          if (activeRow < getDataLength()) {
            var editCommand = {
              row: activeRow,
              cell: activeCell,
              editor: currentEditor,
              serializedValue: currentEditor.serializeValue(),
              prevSerializedValue: serializedEditorValue,
              execute: function () {
                this.editor.applyValue(item, this.serializedValue);
                updateRow(this.row);
                trigger(self.onCellChange, {
                  row: activeRow,
                  cell: activeCell,
                  item: item
                });
              },
              undo: function () {
                this.editor.applyValue(item, this.prevSerializedValue);
                updateRow(this.row);
                trigger(self.onCellChange, {
                  row: activeRow,
                  cell: activeCell,
                  item: item
                });
              }
            };

            if (options.editCommandHandler) {
              makeActiveCellNormal();
              options.editCommandHandler(item, column, editCommand);
            } else {
              editCommand.execute();
              makeActiveCellNormal();
            }

          } else {
            var newItem = {};
            currentEditor.applyValue(newItem, currentEditor.serializeValue());
            makeActiveCellNormal();
            trigger(self.onAddNewRow, {item: newItem, column: column});
          }

          // check whether the lock has been re-acquired by event handlers
          return !getEditorLock().isActive();
        } else {
          // Re-add the CSS class to trigger transitions, if any.
          $(activeCellNode).removeClass("invalid");
          $(activeCellNode).width();  // force layout
          $(activeCellNode).addClass("invalid");

          trigger(self.onValidationError, {
            editor: currentEditor,
            cellNode: activeCellNode,
            validationResults: validationResults,
            row: activeRow,
            cell: activeCell,
            column: column
          });

          currentEditor.focus();
          return false;
        }
      }

      makeActiveCellNormal();
    }
    return true;
  }

  function cancelCurrentEdit() {
    makeActiveCellNormal();
    return true;
  }

  function rowsToRanges(rows) {
    var ranges = [];
    var lastCell = columns.length - 1;
    for (var i = 0; i < rows.length; i++) {
      ranges.push(new Slick.Range(rows[i], 0, rows[i], lastCell));
    }
    return ranges;
  }

  function getSelectedRows() {
    if (!selectionModel) {
      throw "Selection model is not set";
    }
    return selectedRows;
  }

  function setSelectedRows(rows) {
    if (!selectionModel) {
      throw "Selection model is not set";
    }
    selectionModel.setSelectedRanges(rowsToRanges(rows));
  }

  // (row: Number, cell: Number) => Boolean
  function isGroupNode(row, cell) {
    return $(getCellNode(row, cell))
      .parents('.slick-group')
      .length > 0;
  }

  // (index: Number) => String
  function getHiddenCssClass(index) {
    var column = columns[index];
    if (!column.isHidden) return null;
    if (column.showHidden) return 'show-hidden';
    return 'isHidden';
  }

  // (column: Column) => Number
  function getColumnVisibleWidth(column) {
    return isColumnVisible(column) ? column.width : 0;
  }

  // (void) => void
  function refreshColumns() {
    setColumns(columns);
  }

  // (column: Column) => void
  function hideColumn(column) {
    column.isHidden = true;
    delete(column.showHidden);
  }

  // (column: Column) => void
  function unhideColumn(column) {
    delete(column.isHidden);
    delete(column.showHidden);
  }

  // (column: Column, columnDirection: COLUMNS_TO_LEFT|COLUMNS_TO_RIGHT) => Any
  function iterateColumnsInDirection(column, columnDirection, fn) {
    var startIndex = getColumnIndex(column.id) + columnDirection;
    var value;

    if (columnDirection === COLUMNS_TO_LEFT) {
      for (var i = startIndex; i >= 0; i--) {
        value = fn(columns[i], i);
        if (value) return value;
      }
    } else if (columnDirection === COLUMNS_TO_RIGHT) {
      var l = columns.length;
      for (var i = startIndex; i < l; i++) {
        value = fn(columns[i], i);
        if (value) return value;
      }
    } else {
      throw new RangeError('columnDirection must be -1 or 1.');
    }
  }

  // (column: Column, columnDirection: COLUMNS_TO_LEFT|COLUMNS_TO_RIGHT) => void
  function showAdjacentHiddenColumns(column, columnDirection) {
    iterateColumnsInDirection(column, columnDirection, function(column) {
      if (!column.isHidden) return true;
      column.showHidden = true;
    })
  }

  // (column: Column, columnDirection: COLUMNS_TO_LEFT|COLUMNS_TO_RIGHT) => Column
  function getNextVisibleColumn(column, columnDirection) {
    return iterateColumnsInDirection(column, columnDirection, function(column) {
      if (isColumnVisible(column)) return column;
    });
  }

  // (column: Column) => Boolean
  function isColumnHidden(column) {
    return column.isHidden;
  }

  // (column: Column) => Boolean
  function isColumnInvisible(column) {
    return column.isHidden && !column.showHidden;
  }

  // (column: Column) => Boolean
  function isColumnVisible(column) {
    return !column.isHidden || column.showHidden;
  }

  // (column: Column) => Boolean
  function isHiddenColumnVisible(column) {
    return column.isHidden && column.showHidden;
  }

  // (void) => Boolean
  function isAnyColumnHidden() {
    return columns.some(isColumnHidden);
  }

  // (void) => Boolean
  function isAnyColumnInvisible() {
    return columns.some(function(column) {
      return isColumnInvisible(column);
    });
  }

  // (void) => void
  function toggleHiddenColumns() {
    var showHidden = isAnyColumnInvisible();
    columns.filter(isColumnHidden).forEach(function(column) {
      column.showHidden = showHidden;
    });
  }

  // (indices: Array[Number]) => Array[Column]
  function getColumnsFromIndices(indices) {
    return indices.map(function(index) {
      return columns[index];
    });
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // Debug

  this.getStateInfo = function() { return {
    rowsCache: rowsCache, // Super important object, responsible for the present rendered dom of the rows
    uiRegions: {
      topViewport: topViewport,
      topCanvas: topCanvas,
      header: header,
      subHeaders: subHeaders,
      contentViewportWrap: contentViewportWrap,
      contentViewport: contentViewport,
      contentCanvas: contentCanvas,
      rows: rows
    },
    colInfo: {
      columnPosLeft:  columnPosLeft,
      columnPosRight: columnPosRight
    },
    scrollInfo: {
      visibleRange:  getVisibleRange(),
      renderedRange: getRenderedRange(),
      offset: offset,
      scrollTop: scrollTop,
      lastRenderedScrollTop: lastRenderedScrollTop,
      lastRenderedScrollLeft: lastRenderedScrollLeft,
      numVisibleRows: numVisibleRows
    }
  } };

  this.debug = function () {
    var s = "";

    s += ("\n" + "counter_rows_rendered:  " + counter_rows_rendered);
    s += ("\n" + "counter_rows_removed:  " + counter_rows_removed);
    s += ("\n" + "renderedRows:  " + renderedRows);
    s += ("\n" + "numVisibleRows:  " + numVisibleRows);
    s += ("\n" + "maxSupportedCssHeight:  " + maxSupportedCssHeight);
    s += ("\n" + "n(umber of pages):  " + n);
    s += ("\n" + "(current) page:  " + page);
    s += ("\n" + "page height (ph):  " + ph);
    s += ("\n" + "vScrollDir:  " + vScrollDir);
    s += ("\n\n" + "(More info in the console)");

    console.log(this.getStateInfo());
    alert(s);
  };

  //////////////////////////////////////////////////////////////////////////////////////////////
  // Public API

  $.extend(this, {
    // Constants
    'COLUMNS_TO_LEFT': COLUMNS_TO_LEFT,
    'COLUMNS_TO_RIGHT': COLUMNS_TO_RIGHT,

    // Events
    "onScroll": new Slick.Event(),
    "onSort": new Slick.Event(),
    "onHeaderMouseEnter": new Slick.Event(),
    "onHeaderMouseLeave": new Slick.Event(),
    "onHeaderContextMenu": new Slick.Event(),
    "onSubHeaderContextMenu": new Slick.Event(),
    "onHeaderClick": new Slick.Event(),
    "onHeaderCellRendered": new Slick.Event(),
    "onHeaderColumnDragStart": new Slick.Event(),
    "onHeaderColumnDrag": new Slick.Event(),
    "onHeaderColumnDragEnd": new Slick.Event(),
    "onHeadersCreated": new Slick.Event(), // Throws once after all headers and subheaders are created (or re-created)
    "onBeforeHeaderCellDestroy": new Slick.Event(),
    "onSubHeaderCellRendered": new Slick.Event(),
    "onBeforeSubHeaderCellDestroy": new Slick.Event(),
    "onMouseEnter": new Slick.Event(),
    "onMouseLeave": new Slick.Event(),
    "onClick": new Slick.Event(),
    "onDblClick": new Slick.Event(),
    "onContextMenu": new Slick.Event(),
    "onBeforeKeyDown": new Slick.Event(),
    "onKeyDown": new Slick.Event(),
    "onAddNewRow": new Slick.Event(),
    "onValidationError": new Slick.Event(),
    "onViewportChanged": new Slick.Event(),
    "onRender": new Slick.Event(),
    "onInvalidate": new Slick.Event(),
    "onColumnsReordered": new Slick.Event(),
    "onColumnsResized": new Slick.Event(),
    "onColumnsChanged": new Slick.Event(),
    "onCellChange": new Slick.Event(),
    "onBeforeEditCell": new Slick.Event(),
    "onBeforeCellEditorDestroy": new Slick.Event(),
    "onBeforeDestroy": new Slick.Event(),
    "onActiveCellChanged": new Slick.Event(),
    "onActiveCellPositionChanged": new Slick.Event(),
    "onActiveRowChanged": new Slick.Event(),
    "onDragInit": new Slick.Event(),
    "onDragStart": new Slick.Event(),
    "onDrag": new Slick.Event(),
    "onDragEnd": new Slick.Event(),
    "onSelectedRowsChanged": new Slick.Event(),
    "onCellCssStylesChanged": new Slick.Event(),

    // Methods
    "registerPlugin": registerPlugin,
    "unregisterPlugin": unregisterPlugin,
    "getId": getId,
    "getColumns": getColumns,
    "getColumnIndexFromEvent": getColumnIndexFromEvent,
    "getColumnFromEvent": getColumnFromEvent,
    "setColumns": setColumns,
    "updateColumnWidths": updateColumnWidths,
    "getColumnIndex": getColumnIndex,
    "getColumnNodeById": getColumnNodeById,
    "updateColumnHeader": updateColumnHeader,
    "updateColumnHeaders": updateColumnHeaders,
    "refreshColumns": refreshColumns,
    "hideColumn": hideColumn,
    "unhideColumn": unhideColumn,
    "showAdjacentHiddenColumns": showAdjacentHiddenColumns,
    "getNextVisibleColumn": getNextVisibleColumn,
    "isColumnHidden": isColumnHidden,
    "isColumnInvisible": isColumnInvisible,
    "isColumnVisible": isColumnVisible,
    "isHiddenColumnVisible": isHiddenColumnVisible,
    "isAnyColumnHidden": isAnyColumnHidden,
    "toggleHiddenColumns": toggleHiddenColumns,
    "getColumnsFromIndices": getColumnsFromIndices,
    "updateSubHeaders": updateSubHeaders,
    "createColumnHeaders": createColumnHeaders,
    "setSortColumn": setSortColumn,
    "setSortColumns": setSortColumns,
    "getSortColumns": getSortColumns,
    "autosizeColumns": autosizeColumns,
    "setupColumnResize": setupColumnResize,
    "getOptions": getOptions,
    "setOptions": setOptions,
    "getData": getData,
    "getDataLength": getDataLength,
    "getDataItem": getDataItem,
    "setData": setData,
    "getSelectionModel": getSelectionModel,
    "setSelectionModel": setSelectionModel,
    "getSelectedRows": getSelectedRows,
    "setSelectedRows": setSelectedRows,
    "getContainerNode": getContainerNode,
    "isGroupNode": isGroupNode,

    "render": render,
    "invalidate": invalidate,
    "invalidateRow": invalidateRow,
    "invalidateRows": invalidateRows,
    "invalidateSafe": invalidateSafe,
    "invalidateAllRows": invalidateAllRows,
    "updateCell": updateCell,
    "updateRow": updateRow,
    "getViewport": getVisibleRange,
    "getRenderedRange": getRenderedRange,
    "resizeCanvas": resizeCanvas,
    "updateRowCount": updateRowCount,
    "scrollRowIntoView": scrollRowIntoView,
    "scrollRowToTop": scrollRowToTop,
    "scrollCellIntoView": scrollCellIntoView,
    "getCanvasNode": getContentCanvasNode,
    "getContentCanvasNode": getContentCanvasNode,
    "getTopCanvasNode": getTopCanvasNode,
    "focus": setFocus,

    "getCellFromPoint": getCellFromPoint,
    "getCellFromEvent": getCellFromEvent,
    "getActiveCell": getActiveCell,
    "setActiveCell": setActiveCell,
    "getActiveCellNode": getActiveCellNode,
    "getActiveCellPosition": getActiveCellPosition,
    "resetActiveCell": resetActiveCell,
    "editActiveCell": makeActiveCellEditable,
    "getCellEditor": getCellEditor,
    "getCellNode": getCellNode,
    "getCellNodeBox": getCellNodeBox,
    "canCellBeSelected": canCellBeSelected,
    "canCellBeActive": canCellBeActive,
    "crossesPinnedArea": crossesPinnedArea,
    "navigatePrev": navigatePrev,
    "navigateNext": navigateNext,
    "navigateUp": navigateUp,
    "navigateDown": navigateDown,
    "navigateLeft": navigateLeft,
    "navigateRight": navigateRight,
    "navigatePageUp": navigatePageUp,
    "navigatePageDown": navigatePageDown,
    "gotoCell": gotoCell,
    "getHeaderEl":            getHeaderEl,
    "getHeaderEls":           getHeaderEls,
    "setSubHeadersVisibility": setSubHeadersVisibility,
    "getSubHeader":           getSubHeader,
    "getSubHeaderColumn":     getSubHeaderColumn,
    "setHeaderRowVisibility": setSubHeadersVisibility, // alias for backwards compatibility
    "getHeaderRow":           getSubHeader,
    "getHeaderRowColumn":     getSubHeaderColumn,
    "getGridPosition": getGridPosition,
    "flashCell": flashCell,
    "addCellCssStyles": addCellCssStyles,
    "setCellCssStyles": setCellCssStyles,
    "removeCellCssStyles": removeCellCssStyles,
    "getCellCssStyles": getCellCssStyles,

    "init": finishInitialization,
    "destroy": destroy,

    // IEditor implementation
    "getEditorLock": getEditorLock,
    "getEditController": getEditController
  });

  init();
}

}());