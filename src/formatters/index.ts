import { Item } from '../dataview'
import { Column } from '../grid'

export interface Formatter {
  (row: number, cell: number, value: any, columnDef: Column, dataContext: Item, grid: any): string // Grid
}
