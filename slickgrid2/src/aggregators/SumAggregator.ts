import { GroupTotals } from '../core'
import { Item } from '../dataview'
import { Aggregator } from './index'

export class SumAggregator extends Aggregator {

  private sum: number

  init() {
    this.sum = 0
  }

  accumulate(item: Item) {
    var val = item[this.field]
    if (val != null && val !== '' && !isNaN(val)) {
      this.sum += parseFloat(val)
    }
  }

  storeResult(groupTotals: GroupTotals) {
    if (!groupTotals['sum']) {
      groupTotals['sum'] = {}
    }
    groupTotals['sum'][this.field] = this.sum
  }
}
