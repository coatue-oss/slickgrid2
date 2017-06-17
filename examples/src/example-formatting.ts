import { range } from 'lodash'
import { DataView, SlickGrid } from 'slickgrid2'

function durationFormatter(row, cell, value, columnDef, dataContext) {
  return `${value} <span style="color: #ddd">days</span>`
}

function tickFormatter(row, cell, value, columnDef, dataContext) {
  return value ? '<img src="images/tick.png">' : ''
}

const columns = [
  {
    id: 'title',
    name: 'Title',
    field: 'title',
    width: 120,
    cssClass: 'cell-title'
  },
  {
    id: 'duration',
    name: 'Duration',
    field: 'duration',
    formatter: durationFormatter
  },
  {
    id: '%',
    name: '% Complete',
    field: 'percentComplete',
    width: 100,
    resizable: false // TODOCK: doesn't work, but you can overcome it by setting min & maxWidth to same number
  },
  {
    id: 'start',
    name: 'Start',
    field: 'start',
    minWidth: 100
  },
  {
    id: 'finish',
    name: 'Finish',
    field: 'finish',
    minWidth: 100
  },
  {
    id: 'effort-driven',
    name: 'Effort Driven',
    sortable: false,
    width: 110,
    minWidth: 20,
    maxWidth: 160,
    field: 'effortDriven',
    formatter: tickFormatter
  }
]

const dataView = new DataView({
  items: range(0, 5).map(id => ({
    id,
    title: `Task ${id}`,
    duration: Math.round(Math.random() * 10),
    percentComplete: Math.min(100, Math.round(Math.random() * 110)),
    start: '01/01/2009',
    finish: '01/05/2009',
    effortDriven: id % 2 === 0
  }))
})

const grid = new SlickGrid('#myGrid', dataView, columns)
