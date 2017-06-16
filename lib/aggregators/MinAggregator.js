import { Aggregator } from './index';
export class MinAggregator extends Aggregator {
    init() {
        this.min = null;
    }
    accumulate(item) {
        var val = item[this.field];
        if (val != null && val !== '' && !isNaN(val)) {
            if (this.min == null || val < this.min) {
                this.min = val;
            }
        }
    }
    storeResult(groupTotals) {
        if (!groupTotals['min']) {
            groupTotals['min'] = {};
        }
        groupTotals['min'][this.field] = this.min;
    }
}
