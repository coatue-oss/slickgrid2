import { range } from 'lodash';
import { SlickGrid, TextEditor } from 'slickgrid2';
var columns = [
    {
        id: 'title',
        name: 'Title',
        field: 'title',
        width: 120,
        editor: TextEditor
    },
    {
        id: 'duration',
        name: 'Duration',
        field: 'duration',
        editor: TextEditor
    }
];
var data = range(0, 8).map(function (i) { return ({
    title: "Task " + i,
    duration: '5 days'
}); });
var grid = new SlickGrid('#myGrid', data, columns, {
    enableAddRow: true
});
grid.onAddNewRow.subscribe(function (e, args) {
    var item = args['item']; // TODOCK: check the args type
    grid.invalidateRow(data.length);
    data.push(item);
    grid.updateRowCount();
    grid.render();
});
