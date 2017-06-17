import { Formatter } from './'

export const checkboxFormatter: Formatter = (row, cell, value, columnDef, dataContext) =>
  value ? '<img src="./themes/default/images/tick.png" />' : ''
