import { Item, Totals } from '../dataview'
import { Aggregator } from './'

export class AvgAggregator extends Aggregator {

  private count: number
  private nonNullCount: number
  private sum: number

  init() {
    this.count = 0
    this.nonNullCount = 0
    this.sum = 0
  }

  accumulate(item: Item) {
    var val = item[this.field]
    this.count++
    if (val != null && val !== '' && !isNaN(val)) {
      this.nonNullCount++
      this.sum += parseFloat(val)
    }
  }

  storeResult(groupTotals: Totals) {
    if (!groupTotals['avg']) {
      groupTotals['avg'] = {}
    }
    if (this.nonNullCount !== 0) {
      groupTotals['avg'][this.field] = this.sum / this.nonNullCount
    }
  }
}
