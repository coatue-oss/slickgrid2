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
var SumAggregator = (function (_super) {
    __extends(SumAggregator, _super);
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
}(_1.Aggregator));
exports.SumAggregator = SumAggregator;
