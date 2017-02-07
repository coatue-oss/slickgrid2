import { Group, Item, Totals } from '../dataview'
import { Column } from '../grid'

export interface Formatter {
  (row: number, cell: number, value: any, columnDef: Column, dataContext: Item, grid: any): string
}

export interface GroupFormatter {
  (row: number, cell: number, value: any, columnDef: Column, dataContext: Group, grid: any): string
}

export interface GroupTotalsFormatter {
  (row: number, cell: number, value: any, columnDef: Column, dataContext: Totals, grid: any): string
}
