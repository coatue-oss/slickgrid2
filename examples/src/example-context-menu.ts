import { range } from 'lodash'
import { DataView, SlickGrid } from 'slickgrid2'

interface Item {
  id: number
  title: string
  priority: string
}

const columns = [
  { id: 'title', name: 'Title', field: 'title', width: 200 },
  { id: 'priority', name: 'Priority', field: 'priority', width: 80, selectable: true, resizable: false }
]

const dataView = new DataView({
  items: range(80, 70).map(id => ({
    id,
    title: `Task ${id}`,
    priority: 'Medium'
  }))
})

const grid = new SlickGrid('#myGrid', dataView, columns, {
  rowHeight: 30
})

const $contextMenu = $('#contextMenu')
grid.onContextMenu.subscribe(function (e) {
  e.preventDefault()
  const cell = grid.getCellFromEvent(e)
  if (cell == null) return

  if (grid.getColumns()[cell.cell].id !== 'priority') return
  grid.setActiveCell(cell.row, cell.cell)

  $contextMenu
  .data('rowIdx', cell.row)
  .css('top', e.pageY)
  .css('left', e.pageX)
  .show()

  $('body').one('click', () => {
    $('#contextMenu').hide()
  })
})
$contextMenu.click(e => {
  if (!$(e.target).is('li')) return
  if (!grid.getEditorLock().commitCurrentEdit()) return

  // TODOCK: this API is terrible - improve on it
  const rowIdx = $contextMenu.data('rowIdx') as number
  const item = dataView.getItem(rowIdx) as Item
  item.priority = $(e.target).attr('data')
  dataView.updateItem(item.id, item)
  grid.updateRow(rowIdx)
  grid.focus()
})
