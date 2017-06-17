(function (lodash) {
'use strict';

var data = lodash.range(0, 100).map(function (i) { return ({
    title: "Task " + i,
    priority: 'Medium'
}); });
// CKTODO
// const grid = new SlickGrid('#myGrid', data, columns, {
//   rowHeight: 30
// })
// const $contextMenu = $('#contextMenu')
// grid.onContextMenu.subscribe(function (e) {
//   e.preventDefault()
//   // TODOCK: double check whether need to ignore null with ! or not
//   const cell = grid.getCellFromEvent(e)
//   if (grid.getColumns()[cell!.cell].id !== 'priority') return
//   grid.setActiveCell(cell!.row, cell!.cell)
//   $contextMenu
//   .data('row', cell!.row)
//   .css('top', e.pageY)
//   .css('left', e.pageX)
//   .show()
//   $('body').one('click', () => {
//     $('#contextMenu').hide()
//   })
// })
// $contextMenu.click(e => {
//   if (!$(e.target).is('li')) return
//   if (!grid.getEditorLock().commitCurrentEdit()) return
//   const row = $contextMenu.data('row')
//   data[row].priority = $(e.target).attr('data')
//   grid.updateRow(row)
//   grid.focus()
// })

}(_));
