/**
 * @license
 * (c) 2016-2017 Coatue Management LLC
 * (c) 2009-2013 Michael Leibman
 * http://github.com/coatue/slickgrid
 *
 * Distributed under MIT license.
 * All rights reserved.
 */
export { AvgAggregator } from './aggregators/AvgAggregator';
export { Aggregator } from './aggregators/index';
export { MaxAggregator } from './aggregators/MaxAggregator';
export { MinAggregator } from './aggregators/MinAggregator';
export { SumAggregator } from './aggregators/SumAggregator';
export { DataView } from './dataview';
export { Editor } from './editors/index';
export { TextEditor } from './editors/TextEditor';
export { EditorLock, Event, EventData, EventHandler, GlobalEditorLock, Group, GroupTotals, NonDataItem, Range } from './core';
export { COLUMNS_TO_LEFT, COLUMNS_TO_RIGHT, SlickGrid } from './grid';
export { GroupItemMetadataProvider } from './groupitemmetadataprovider';
// make sure required JavaScript modules are loaded
if (typeof jQuery === 'undefined')
    throw new Error('slickgrid2 requires jquery module to be loaded');
if (jQuery.fn.drag == null)
    throw new Error('slickgrid2 requires jquery.event.drag module to be loaded');
