import * as tslib_1 from "tslib";
import { Aggregator } from './index';
var MaxAggregator = (function (_super) {
    tslib_1.__extends(MaxAggregator, _super);
    function MaxAggregator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MaxAggregator.prototype.init = function () {
        this.max = null;
    };
    MaxAggregator.prototype.accumulate = function (item) {
        var val = item[this.field];
        if (val != null && val !== '' && !isNaN(val)) {
            if (this.max == null || val > this.max) {
                this.max = val;
            }
        }
    };
    MaxAggregator.prototype.storeResult = function (groupTotals) {
        if (!groupTotals['max']) {
            groupTotals['max'] = {};
        }
        groupTotals['max'][this.field] = this.max;
    };
    return MaxAggregator;
}(Aggregator));
export { MaxAggregator };
