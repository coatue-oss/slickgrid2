import { Editor } from './';
const LEFT = 37;
const RIGHT = 39;
export class IntegerEditor extends Editor {
    init() {
        this.$input = $('<input type="text" class="editor-text" />')
            .bind('keydown.nav', function (e) {
            if (e.keyCode === LEFT || e.keyCode === RIGHT) {
                e.stopImmediatePropagation();
            }
        })
            .appendTo(this.args.container)
            .focus()
            .select();
    }
    destroy() {
        this.$input.remove();
    }
    focus() {
        this.$input.focus();
    }
    loadValue(item) {
        this.defaultValue = item[this.args.column.field];
        this.$input.val(this.defaultValue || '');
        this.$input[0].defaultValue = this.defaultValue || '';
        this.$input.select();
    }
    serializeValue() {
        return parseInt(this.$input.val(), 10) || 0;
    }
    applyValue(item, state) {
        item[this.args.column.field] = state;
    }
    isValueChanged() {
        return (!(this.$input.val() === '' && this.defaultValue == null)) && (this.$input.val() !== this.defaultValue);
    }
    validate() {
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
    }
}
