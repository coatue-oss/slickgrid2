import * as tslib_1 from "tslib";
import { Aggregator } from './index';
var SumAggregator = (function (_super) {
    tslib_1.__extends(SumAggregator, _super);
    function SumAggregator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SumAggregator.prototype.init = function () {
        this.sum = 0;
    };
    SumAggregator.prototype.accumulate = function (item) {
        var val = item[this.field];
        if (val != null && val !== '' && !isNaN(val)) {
            this.sum += parseFloat(val);
        }
    };
    SumAggregator.prototype.storeResult = function (groupTotals) {
        if (!groupTotals['sum']) {
            groupTotals['sum'] = {};
        }
        groupTotals['sum'][this.field] = this.sum;
    };
    return SumAggregator;
}(Aggregator));
export { SumAggregator };
