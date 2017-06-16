import { GroupTotals } from '../core'
import { Item } from '../dataview'
import { Aggregator } from './index'

export class MaxAggregator extends Aggregator {

  private max: number | null

  init() {
    this.max = null
  }

  accumulate(item: Item) {
    var val = item[this.field]
    if (val != null && val !== '' && !isNaN(val)) {
      if (this.max == null || val > this.max) {
        this.max = val
      }
    }
  }

  storeResult(groupTotals: GroupTotals) {
    if (!groupTotals['max']) {
      groupTotals['max'] = {}
    }
    groupTotals['max'][this.field] = this.max
  }
}
