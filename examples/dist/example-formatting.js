(function (lodash) {
'use strict';

var data = lodash.range(0, 5).map(function (i) { return ({
    title: "Task " + i,
    duration: Math.round(Math.random() * 10),
    percentComplete: Math.min(100, Math.round(Math.random() * 110)),
    start: '01/01/2009',
    finish: '01/05/2009',
    effortDriven: i % 2 === 0
}); });
// CKTODO
// const grid = new SlickGrid('#myGrid', data, columns, {
//   editable: false,
//   enableAddRow: false,
//   enableCellNavigation: true
// })

}(_));
