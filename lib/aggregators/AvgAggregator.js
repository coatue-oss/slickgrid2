import { Aggregator } from './index';
export class AvgAggregator extends Aggregator {
    init() {
        this.count = 0;
        this.nonNullCount = 0;
        this.sum = 0;
    }
    accumulate(item) {
        var val = item[this.field];
        this.count++;
        if (val != null && val !== '' && !isNaN(val)) {
            this.nonNullCount++;
            this.sum += parseFloat(val);
        }
    }
    storeResult(groupTotals) {
        if (!groupTotals['avg']) {
            groupTotals['avg'] = {};
        }
        if (this.nonNullCount !== 0) {
            groupTotals['avg'][this.field] = this.sum / this.nonNullCount;
        }
    }
}
