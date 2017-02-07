import { extend } from 'jquery'
import { AvgAggregator } from './aggregators/AvgAggregator'
import { MaxAggregator } from './aggregators/MaxAggregator'
import { MinAggregator } from './aggregators/MinAggregator'
import { SumAggregator } from './aggregators/SumAggregator'
import { EditorLock, Event, EventData, EventHandler, GlobalEditorLock, Group, GroupTotals, NonDataItem, Range } from './core'
import { DataView } from './dataview'
import { CheckboxEditor } from './editors/CheckboxEditor'
import { IntegerEditor } from './editors/IntegerEditor'
import { TextEditor } from './editors/TextEditor'
import { checkboxFormatter } from './formatters/checkboxFormatter'
import { SlickGrid } from './grid'
import { GroupItemMetadataProvider } from './groupitemmetadataprovider'
import { RemoteModel } from './remotemodel'

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
      Checkbox: CheckboxEditor
    },
    Event,
    EventData,
    EventHandler,
    Formatters: {
      Checkmark: checkboxFormatter
    },
    Grid: SlickGrid,
    Range,
    NonDataItem,
    Group,
    GroupTotals,
    EditorLock,
    GlobalEditorLock
  }
})
