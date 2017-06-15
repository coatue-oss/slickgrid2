"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkboxFormatter = function (row, cell, value, columnDef, dataContext) {
    return value ? '<img src="./themes/default/images/tick.png" />' : '';
};
