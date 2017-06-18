import { GroupTotals } from './core'
import { Editor } from './editors/index'
import { Formatter } from './formatters/index'
import { AsyncPostRenderer, Validator } from './grid'

export interface Column {
  asyncPostRender?: AsyncPostRenderer
  cannotTriggerInsert?: boolean
  cssClass?: string
  colspan?: number | '*'
  defaultSortAsc?: boolean
  editor?: typeof Editor
  field: number | string
  focusable?: boolean
  formatter?: Formatter
  groupTotalsFormatter?(item: GroupTotals, columnDef: Column): string
  headerCssClass?: string
  id: number | string
  isHidden?: boolean
  json?: any // catchall for meta info - TODO: rm
  key?: string
  manuallySized?: boolean
  maxWidth?: number
  minWidth?: number
  name?: string
  previousWidth?: number
  resizable?: boolean
  rerenderOnResize?: boolean
  showHidden?: boolean
  selectable?: boolean
  sortable?: boolean
  toolTip?: string
  validator?: Validator
  width?: number
}
