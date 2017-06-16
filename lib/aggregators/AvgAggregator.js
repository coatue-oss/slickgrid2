import * as tslib_1 from "tslib";
import { Aggregator } from './index';
var AvgAggregator = (function (_super) {
    tslib_1.__extends(AvgAggregator, _super);
    function AvgAggregator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AvgAggregator.prototype.init = function () {
        this.count = 0;
        this.nonNullCount = 0;
        this.sum = 0;
    };
    AvgAggregator.prototype.accumulate = function (item) {
        var val = item[this.field];
        this.count++;
        if (val != null && val !== '' && !isNaN(val)) {
            this.nonNullCount++;
            this.sum += parseFloat(val);
        }
    };
    AvgAggregator.prototype.storeResult = function (groupTotals) {
        if (!groupTotals['avg']) {
            groupTotals['avg'] = {};
        }
        if (this.nonNullCount !== 0) {
            groupTotals['avg'][this.field] = this.sum / this.nonNullCount;
        }
    };
    return AvgAggregator;
}(Aggregator));
export { AvgAggregator };
