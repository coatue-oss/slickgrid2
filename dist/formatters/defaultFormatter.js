"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultFormatter = function (row, cell, value, columnDef, dataContext) {
    if (value == null) {
        return '';
    }
    else {
        return (value + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
};
