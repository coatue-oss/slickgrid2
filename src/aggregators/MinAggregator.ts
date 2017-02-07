import { Item, Totals } from '../dataview'
import { Aggregator } from './'

export class MinAggregator extends Aggregator {

  private min: number | null

  init(): void {
    this.min = null
  }

  accumulate(item: Item): void {
    var val = item[this.field]
    if (val != null && val !== '' && !isNaN(val)) {
      if (this.min == null || val < this.min) {
        this.min = val
      }
    }
  }

  storeResult(groupTotals: Totals): void {
    if (!groupTotals['min']) {
      groupTotals['min'] = {}
    }
    groupTotals['min'][this.field] = this.min
  }
}
