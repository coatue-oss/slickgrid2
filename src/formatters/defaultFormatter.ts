import { Formatter } from './'

export const defaultFormatter: Formatter = (row, cell, value, columnDef, dataContext) => {
  if (value == null) {
    return ''
  } else {
    return (value + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
}
