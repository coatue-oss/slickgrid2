import * as tslib_1 from "tslib";
import { Editor } from './index';
var CheckboxEditor = (function (_super) {
    tslib_1.__extends(CheckboxEditor, _super);
    function CheckboxEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CheckboxEditor.prototype.init = function () {
        this.$select = $('<input type="checkbox" value="true" class="editor-checkbox" hideFocus />')
            .appendTo(this.args.container)
            .focus();
    };
    CheckboxEditor.prototype.destroy = function () {
        this.$select.remove();
    };
    CheckboxEditor.prototype.focus = function () {
        this.$select.focus();
    };
    CheckboxEditor.prototype.loadValue = function (item) {
        this.defaultValue = !!item[this.args.column.field];
        if (this.defaultValue) {
            this.$select.prop('checked', true);
        }
        else {
            this.$select.prop('checked', false);
        }
    };
    CheckboxEditor.prototype.serializeValue = function () {
        return this.$select.prop('checked');
    };
    CheckboxEditor.prototype.applyValue = function (item, state) {
        item[this.args.column.field] = state;
    };
    CheckboxEditor.prototype.isValueChanged = function () {
        return (this.serializeValue() !== this.defaultValue);
    };
    CheckboxEditor.prototype.validate = function () {
        return {
            valid: true,
            msg: null
        };
    };
    return CheckboxEditor;
}(Editor));
export { CheckboxEditor };
