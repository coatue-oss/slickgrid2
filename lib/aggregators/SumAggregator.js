import { Aggregator } from './index';
export class SumAggregator extends Aggregator {
    init() {
        this.sum = 0;
    }
    accumulate(item) {
        var val = item[this.field];
        if (val != null && val !== '' && !isNaN(val)) {
            this.sum += parseFloat(val);
        }
    }
    storeResult(groupTotals) {
        if (!groupTotals['sum']) {
            groupTotals['sum'] = {};
        }
        groupTotals['sum'][this.field] = this.sum;
    }
}
