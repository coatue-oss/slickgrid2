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
import { Editor } from './';
var CheckboxEditor = (function (_super) {
    __extends(CheckboxEditor, _super);
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
