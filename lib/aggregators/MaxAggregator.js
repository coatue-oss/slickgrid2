import { Aggregator } from './index';
export class MaxAggregator extends Aggregator {
    init() {
        this.max = null;
    }
    accumulate(item) {
        var val = item[this.field];
        if (val != null && val !== '' && !isNaN(val)) {
            if (this.max == null || val > this.max) {
                this.max = val;
            }
        }
    }
    storeResult(groupTotals) {
        if (!groupTotals['max']) {
            groupTotals['max'] = {};
        }
        groupTotals['max'][this.field] = this.max;
    }
}
