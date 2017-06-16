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
import { Editor } from './index';
var LEFT = 37;
var RIGHT = 39;
var IntegerEditor = (function (_super) {
    __extends(IntegerEditor, _super);
    function IntegerEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IntegerEditor.prototype.init = function () {
        this.$input = $('<input type="text" class="editor-text" />')
            .on('keydown', function (e) {
            if (e.keyCode === LEFT || e.keyCode === RIGHT) {
                e.stopImmediatePropagation();
            }
        })
            .appendTo(this.args.container)
            .focus()
            .select();
    };
    IntegerEditor.prototype.destroy = function () {
        this.$input.remove();
    };
    IntegerEditor.prototype.focus = function () {
        this.$input.focus();
    };
    IntegerEditor.prototype.loadValue = function (item) {
        this.defaultValue = item[this.args.column.field];
        this.$input.val(this.defaultValue || '');
        this.$input[0].defaultValue = this.defaultValue || '';
        this.$input.select();
    };
    IntegerEditor.prototype.serializeValue = function () {
        return parseInt(this.$input.val(), 10) || 0;
    };
    IntegerEditor.prototype.applyValue = function (item, state) {
        item[this.args.column.field] = state;
    };
    IntegerEditor.prototype.isValueChanged = function () {
        return (!(this.$input.val() === '' && this.defaultValue == null)) && (this.$input.val() !== this.defaultValue);
    };
    IntegerEditor.prototype.validate = function () {
        if (isNaN(this.$input.val())) {
            return {
                valid: false,
                msg: 'Please enter a valid integer'
            };
        }
        return {
            valid: true,
            msg: null
        };
    };
    return IntegerEditor;
}(Editor));
export { IntegerEditor };
