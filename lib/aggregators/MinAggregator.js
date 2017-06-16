import * as tslib_1 from "tslib";
import { Aggregator } from './index';
var MinAggregator = (function (_super) {
    tslib_1.__extends(MinAggregator, _super);
    function MinAggregator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MinAggregator.prototype.init = function () {
        this.min = null;
    };
    MinAggregator.prototype.accumulate = function (item) {
        var val = item[this.field];
        if (val != null && val !== '' && !isNaN(val)) {
            if (this.min == null || val < this.min) {
                this.min = val;
            }
        }
    };
    MinAggregator.prototype.storeResult = function (groupTotals) {
        if (!groupTotals['min']) {
            groupTotals['min'] = {};
        }
        groupTotals['min'][this.field] = this.min;
    };
    return MinAggregator;
}(Aggregator));
export { MinAggregator };
