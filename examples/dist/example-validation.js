(function (lodash,slickgrid2) {
'use strict';

function validateRequiredField(value) {
    if (value == null || value === undefined || value.length === 0) {
        return {
            valid: false,
            msg: 'This is a required field'
        };
    }
    return {
        valid: true,
        msg: null
    };
}
var columns = [
    {
        id: 'title',
        name: 'Title',
        field: 'title',
        width: 200,
        editor: slickgrid2.TextEditor,
        validator: validateRequiredField
    },
    {
        id: 'priority',
        name: 'Priority',
        field: 'priority',
        width: 80
    }
];
var dataView = new slickgrid2.DataView({
    items: lodash.range(0, 100).map(function (id) { return ({
        id: id,
        title: "Task " + id,
        priority: 'Medium'
    }); })
});
var grid = new slickgrid2.SlickGrid('#myGrid', dataView, columns, {
    rowHeight: 30
});

}(_,slickgrid2));
