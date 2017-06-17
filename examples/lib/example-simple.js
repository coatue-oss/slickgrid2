import { range } from 'lodash';
import { DataView, SlickGrid } from 'slickgrid2';
var columns = [
    { id: 'title', name: 'Title', field: 'title', width: 200 },
    { id: 'duration', name: 'Duration', field: 'duration', width: 100 },
    { id: '%', name: '% Complete', field: 'percentComplete', width: 150 },
    { id: 'start', name: 'Start', field: 'start', width: 100 },
    { id: 'finish', name: 'Finish', field: 'finish', width: 100 },
    { id: 'effort-driven', name: 'Effort Driven', field: 'effortDriven', width: 150 }
];
var dataView = new DataView({
    items: range(0, 500).map(function (id) { return ({
        id: id,
        title: "Task " + id,
        duration: '5 days',
        percentComplete: Math.round(Math.random() * 100),
        start: '01/01/2009',
        finish: '01/05/2009',
        effortDriven: (id % 5 === 0)
    }); })
});
var grid = new SlickGrid('#myGrid', dataView, columns);
