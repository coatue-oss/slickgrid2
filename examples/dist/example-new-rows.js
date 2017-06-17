(function (lodash,slickgrid2) {
'use strict';

var columns = [
    {
        id: 'title',
        name: 'Title',
        field: 'title',
        width: 120,
        editor: slickgrid2.TextEditor
    },
    {
        id: 'duration',
        name: 'Duration',
        field: 'duration',
        editor: slickgrid2.TextEditor
    }
];
var data = lodash.range(0, 8).map(function (i) { return ({
    title: "Task " + i,
    duration: '5 days'
}); });
var grid = new slickgrid2.SlickGrid('#myGrid', data, columns, {
    enableAddRow: true
});
grid.onAddNewRow.subscribe(function (e, args) {
    var item = args['item']; // TODOCK: check the args type
    grid.invalidateRow(data.length);
    data.push(item);
    grid.updateRowCount();
    grid.render();
});

}(_,slickgrid2));
