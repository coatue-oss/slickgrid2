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
var MinAggregator = (function (_super) {
    __extends(MinAggregator, _super);
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
}(_1.Aggregator));
exports.MinAggregator = MinAggregator;
