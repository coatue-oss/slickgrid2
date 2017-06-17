import * as _ from 'lodash'
import * as slickgrid2 from 'slickgrid2'

const columns = [
  { id: 'title', name: 'Title', field: 'title', width: 200 },
  { id: 'duration', name: 'Duration', field: 'duration', width: 100 },
  { id: '%', name: '% Complete', field: 'percentComplete', width: 150 },
  { id: 'start', name: 'Start', field: 'start', width: 100 },
  { id: 'finish', name: 'Finish', field: 'finish', width: 100 },
  { id: 'effort-driven', name: 'Effort Driven', field: 'effortDriven', width: 150 }
]

const data = _.range(0, 500).map(i => ({
  title: `Task ${i}`,
  duration: '5 days',
  percentComplete: Math.round(Math.random() * 100),
  start: '01/01/2009',
  finish: '01/05/2009',
  effortDriven: (i % 5 === 0)
}))

const grid = new slickgrid2.SlickGrid('#myGrid', data, columns)
