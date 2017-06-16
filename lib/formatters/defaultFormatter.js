export const defaultFormatter = (row, cell, value, columnDef, dataContext) => {
    if (value == null) {
        return '';
    }
    else {
        return (value + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
};
