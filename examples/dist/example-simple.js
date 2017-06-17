(function (lodash) {
'use strict';

var data = lodash.range(0, 500).map(function (i) { return ({
    title: "Task " + i,
    duration: '5 days',
    percentComplete: Math.round(Math.random() * 100),
    start: '01/01/2009',
    finish: '01/05/2009',
    effortDriven: (i % 5 === 0)
}); });
// CKTODO
// const grid = new SlickGrid('#myGrid', data, columns)

}(_));
