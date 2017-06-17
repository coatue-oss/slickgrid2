(function (lodash,slickgrid2) {
'use strict';

var columns = [
    { id: 'title', name: 'Title', field: 'title', width: 200 },
    { id: 'priority', name: 'Priority', field: 'priority', width: 80, selectable: true, resizable: false }
];
var dataView = new slickgrid2.DataView({
    items: lodash.range(80, 70).map(function (id) { return ({
        id: id,
        title: "Task " + id,
        priority: 'Medium'
    }); })
});
var grid = new slickgrid2.SlickGrid('#myGrid', dataView, columns, {
    rowHeight: 30
});
var $contextMenu = $('#contextMenu');
grid.onContextMenu.subscribe(function (e) {
    e.preventDefault();
    var cell = grid.getCellFromEvent(e);
    if (cell == null)
        return;
    if (grid.getColumns()[cell.cell].id !== 'priority')
        return;
    grid.setActiveCell(cell.row, cell.cell);
    $contextMenu
        .data('rowIdx', cell.row)
        .css('top', e.pageY)
        .css('left', e.pageX)
        .show();
    $('body').one('click', function () {
        $('#contextMenu').hide();
    });
});
$contextMenu.click(function (e) {
    if (!$(e.target).is('li'))
        return;
    if (!grid.getEditorLock().commitCurrentEdit())
        return;
    // TODOCK: this API is terrible - improve on it
    var rowIdx = $contextMenu.data('rowIdx');
    var item = dataView.getItem(rowIdx);
    item.priority = $(e.target).attr('data');
    dataView.updateItem(item.id, item);
    grid.updateRow(rowIdx);
    grid.focus();
});

}(_,slickgrid2));
