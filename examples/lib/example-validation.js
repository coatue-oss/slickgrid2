import { range } from 'lodash';
import { DataView, SlickGrid, TextEditor } from 'slickgrid2';
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
        editor: TextEditor,
        validator: validateRequiredField
    },
    {
        id: 'priority',
        name: 'Priority',
        field: 'priority',
        width: 80
    }
];
var dataView = new DataView({
    items: range(0, 100).map(function (id) { return ({
        id: id,
        title: "Task " + id,
        priority: 'Medium'
    }); })
});
var grid = new SlickGrid('#myGrid', dataView, columns, {
    rowHeight: 30
});
