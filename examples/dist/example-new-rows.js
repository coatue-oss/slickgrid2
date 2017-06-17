(function (lodash,slickgrid2) {
'use strict';

var data = lodash.range(0, 8).map(function (i) { return ({
    title: "Task " + i,
    duration: '5 days'
}); });
// CKTODO
// const grid = new SlickGrid('#myGrid', data, columns, {
//   enableAddRow: true
// })
// grid.onAddNewRow.subscribe((e, args) => {
//   const item = args['item'] // TODOCK: check the args type
//   grid.invalidateRow(data.length)
//   data.push(item)
//   grid.updateRowCount()
//   grid.render()
// })

}(_,slickgrid2));
