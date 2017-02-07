import { Formatter } from './'

export const CheckboxFormatter: Formatter = (row, cell, value, columnDef, dataContext) =>
  value ? '<img src="./themes/default/images/tick.png" />' : ''
