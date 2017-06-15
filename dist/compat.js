"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jquery_1 = require("jquery");
var AvgAggregator_1 = require("./aggregators/AvgAggregator");
var MaxAggregator_1 = require("./aggregators/MaxAggregator");
var MinAggregator_1 = require("./aggregators/MinAggregator");
var SumAggregator_1 = require("./aggregators/SumAggregator");
var core_1 = require("./core");
var dataview_1 = require("./dataview");
var CheckboxEditor_1 = require("./editors/CheckboxEditor");
var IntegerEditor_1 = require("./editors/IntegerEditor");
var TextEditor_1 = require("./editors/TextEditor");
var CheckboxFormatter_1 = require("./formatters/CheckboxFormatter");
var grid_1 = require("./grid");
var groupitemmetadataprovider_1 = require("./groupitemmetadataprovider");
var remotemodel_1 = require("./remotemodel");
jquery_1.extend(true, window, {
    Slick: {
        Data: {
            DataView: dataview_1.DataView,
            Aggregators: {
                Avg: AvgAggregator_1.AvgAggregator,
                Min: MinAggregator_1.MinAggregator,
                Max: MaxAggregator_1.MaxAggregator,
                Sum: SumAggregator_1.SumAggregator
            },
            GroupItemMetadataProvider: groupitemmetadataprovider_1.GroupItemMetadataProvider,
            RemoteModel: remotemodel_1.RemoteModel
        },
        Editors: {
            Text: TextEditor_1.TextEditor,
            Integer: IntegerEditor_1.IntegerEditor,
            Checkbox: CheckboxEditor_1.CheckboxEditor
        },
        Event: core_1.Event,
        EventData: core_1.EventData,
        EventHandler: core_1.EventHandler,
        Formatters: {
            Checkmark: CheckboxFormatter_1.checkboxFormatter
        },
        Grid: grid_1.SlickGrid,
        Range: core_1.Range,
        NonDataItem: core_1.NonDataItem,
        Group: core_1.Group,
        GroupTotals: core_1.GroupTotals,
        EditorLock: core_1.EditorLock,
        GlobalEditorLock: core_1.GlobalEditorLock
    }
});
