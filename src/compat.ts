import { EditorLock, Event, EventData, EventHandler, GlobalEditorLock, Group, GroupTotals, NonDataItem, Range } from "./core";
import { AvgAggregator, DataView, MaxAggregator, MinAggregator, SumAggregator } from "./dataview";
import { CheckboxEditor, DateEditor, IntegerEditor, LongTextEditor, PercentCompleteEditor, TextEditor, YesNoSelectEditor } from "./editors";
import { CheckmarkFormatter, PercentCompleteBarFormatter, PercentCompleteFormatter, YesNoFormatter } from "./formatters";
import { SlickGrid } from "./grid";
import { GroupItemMetadataProvider } from "./groupitemmetadataprovider";
import { RemoteModel } from "./remotemodel";
import { extend } from "jquery";

extend(true, window, {
  Slick: {
    Data: {
      DataView,
      Aggregators: {
        Avg: AvgAggregator,
        Min: MinAggregator,
        Max: MaxAggregator,
        Sum: SumAggregator
      },
      GroupItemMetadataProvider,
      RemoteModel
    },
    Editors: {
      Text: TextEditor,
      Integer: IntegerEditor,
      Date: DateEditor,
      YesNoSelect: YesNoSelectEditor,
      Checkbox: CheckboxEditor,
      PercentComplete: PercentCompleteEditor,
      LongText: LongTextEditor
    },
    Event,
    EventData,
    EventHandler,
    Formatters: {
      PercentComplete: PercentCompleteFormatter,
      PercentCompleteBar: PercentCompleteBarFormatter,
      YesNo: YesNoFormatter,
      Checkmark: CheckmarkFormatter
    },
    Grid: SlickGrid,
    Range,
    NonDataItem,
    Group,
    GroupTotals,
    EditorLock,
    GlobalEditorLock
  }
});
