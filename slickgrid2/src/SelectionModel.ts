import { Event, Group, Range } from './core'
import { Item } from './dataview'
import { SlickGrid } from './grid'

export interface SelectionModel {

  // methods
  destroy(): void
  getFullySelectedRowIndices(): number[]
  getLastKeydown(): KeyboardEvent | undefined
  getSelectedCols(): number[]
  getSelectedColNodes(): JQuery
  handleGridKeydown(e: KeyboardEvent, args: { cell: number, row: number, grid: SlickGrid }): void
  init(grid: SlickGrid): void
  rangesToRowIndices(ranges: Range[]): number[]
  rangesToRowObjects(ranges: Range[]): (Group | Item)[]
  refresh(): void
  refreshSelection(): void
  rowIndicesToRanges(rows: number[], excludeGutter: boolean): Range[]
  rows: (Group | Item)[] // selected rows
  selectCell(row: number, cell: number): this
  selectRow(row: number): this
  selectFirstSelectable(colIdx?: number): void
  setSelectedCols(cols: number[]): number[]
  setSelectedRanges(newRanges: Range[], force?: boolean): void

  // events
  onSelectedRangesChanged: Event<Range[]>
}
