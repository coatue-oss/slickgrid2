(function (lodash,slickgrid2) {
'use strict';

var columns = [
    { id: 'title', name: 'Title', field: 'title', width: 200 },
    { id: 'priority', name: 'Priority', field: 'priority', width: 80, selectable: true, resizable: false }
];
window.onload = function () {
    var data = lodash.range(0, 100).map(function (i) { return ({
        title: "Task " + i,
        priority: 'Medium'
    }); });
    var grid = new slickgrid2.SlickGrid('#myGrid', data, columns, {
        rowHeight: 30
    });
    var $contextMenu = $('#contextMenu');
    grid.onContextMenu.subscribe(function (e) {
        e.preventDefault();
        // TODOCK: double check whether need to ignore null with ! or not
        var cell = grid.getCellFromEvent(e);
        if (grid.getColumns()[cell.cell].id !== 'priority')
            return;
        grid.setActiveCell(cell.row, cell.cell);
        $contextMenu
            .data('row', cell.row)
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
        var row = $contextMenu.data('row');
        data[row].priority = $(e.target).attr('data');
        grid.updateRow(row);
        grid.focus();
    });
};

}(_,slickgrid2));
