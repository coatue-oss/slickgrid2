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
var LEFT = 37;
var RIGHT = 39;
var TextEditor = (function (_super) {
    __extends(TextEditor, _super);
    function TextEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TextEditor.prototype.init = function () {
        this.$input = $('<input type="text" class="editor-text" />')
            .appendTo(this.args.container)
            .bind('keydown.nav', function (e) {
            if (e.keyCode === LEFT || e.keyCode === RIGHT) {
                e.stopImmediatePropagation();
            }
        })
            .focus()
            .select();
    };
    TextEditor.prototype.destroy = function () {
        this.$input.remove();
    };
    TextEditor.prototype.focus = function () {
        this.$input.focus();
    };
    TextEditor.prototype.getValue = function () {
        return this.$input.val();
    };
    TextEditor.prototype.setValue = function (val) {
        this.$input.val(val);
    };
    TextEditor.prototype.loadValue = function (item) {
        this.defaultValue = item[this.args.column.field] || '';
        this.$input.val(this.defaultValue);
        this.$input[0].defaultValue = this.defaultValue;
        this.$input.select();
    };
    TextEditor.prototype.serializeValue = function () {
        return this.$input.val();
    };
    TextEditor.prototype.applyValue = function (item, state) {
        item[this.args.column.field] = state;
    };
    TextEditor.prototype.isValueChanged = function () {
        return (!(this.$input.val() === '' && this.defaultValue == null)) && (this.$input.val() !== this.defaultValue);
    };
    TextEditor.prototype.validate = function () {
        if (this.args.column.validator) {
            var validationResults = this.args.column.validator(this.$input.val());
            if (!validationResults.valid) {
                return validationResults;
            }
        }
        return {
            valid: true,
            msg: null
        };
    };
    return TextEditor;
}(Editor));
export { TextEditor };
