"use strict";
/**
 * @license
 * (c) 2016-2017 Coatue Management LLC
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
Object.defineProperty(exports, "__esModule", { value: true });
var aggregators_1 = require("./aggregators");
exports.Aggregator = aggregators_1.Aggregator;
var AvgAggregator_1 = require("./aggregators/AvgAggregator");
exports.AvgAggregator = AvgAggregator_1.AvgAggregator;
var MaxAggregator_1 = require("./aggregators/MaxAggregator");
exports.MaxAggregator = MaxAggregator_1.MaxAggregator;
var MinAggregator_1 = require("./aggregators/MinAggregator");
exports.MinAggregator = MinAggregator_1.MinAggregator;
var SumAggregator_1 = require("./aggregators/SumAggregator");
exports.SumAggregator = SumAggregator_1.SumAggregator;
var core_1 = require("./core");
exports.EditorLock = core_1.EditorLock;
exports.Event = core_1.Event;
exports.EventData = core_1.EventData;
exports.EventHandler = core_1.EventHandler;
exports.GlobalEditorLock = core_1.GlobalEditorLock;
exports.Group = core_1.Group;
exports.GroupTotals = core_1.GroupTotals;
exports.NonDataItem = core_1.NonDataItem;
exports.Range = core_1.Range;
var dataview_1 = require("./dataview");
exports.DataView = dataview_1.DataView;
var editors_1 = require("./editors");
exports.Editor = editors_1.Editor;
var grid_1 = require("./grid");
exports.COLUMNS_TO_LEFT = grid_1.COLUMNS_TO_LEFT;
exports.COLUMNS_TO_RIGHT = grid_1.COLUMNS_TO_RIGHT;
exports.SelectionModel = grid_1.SelectionModel;
exports.SlickGrid = grid_1.SlickGrid;
var groupitemmetadataprovider_1 = require("./groupitemmetadataprovider");
exports.GroupItemMetadataProvider = groupitemmetadataprovider_1.GroupItemMetadataProvider;
// make sure required JavaScript modules are loaded
if (typeof jQuery === 'undefined') {
    throw 'SlickGrid requires jquery module to be loaded';
}
if (!jQuery.fn.drag) {
    throw 'SlickGrid requires jquery.event.drag module to be loaded';
}
