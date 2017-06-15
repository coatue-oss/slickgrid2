"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require("./");
var MaxAggregator = (function (_super) {
    __extends(MaxAggregator, _super);
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
}(_1.Aggregator));
exports.MaxAggregator = MaxAggregator;
