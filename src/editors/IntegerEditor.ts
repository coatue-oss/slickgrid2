import { Group } from '../core'
import { Item } from '../dataview'
import { Editor } from './index'

const LEFT = 37
const RIGHT = 39

export class IntegerEditor extends Editor {
  private $input: JQuery
  private defaultValue: string | null

  init() {
    this.$input = $('<input type="text" class="editor-text" />')
      .bind('keydown.nav', function (e) {
        if (e.keyCode === LEFT || e.keyCode === RIGHT) {
          e.stopImmediatePropagation()
        }
      })
      .appendTo(this.args.container)
      .focus()
      .select()
  }

  destroy() {
    this.$input.remove()
  }

  focus() {
    this.$input.focus()
  }

  loadValue(item: Group | Item) {
    this.defaultValue = item[this.args.column.field]
    this.$input.val(this.defaultValue || '');
    (this.$input[0] as HTMLInputElement).defaultValue = this.defaultValue || ''
    this.$input.select()
  }

  serializeValue() {
    return parseInt(this.$input.val(), 10) || 0
  }

  applyValue(item: Group | Item, state: number) {
    item[this.args.column.field] = state
  }

  isValueChanged() {
    return (!(this.$input.val() === '' && this.defaultValue == null)) && (this.$input.val() !== this.defaultValue)
  }

  validate() {
    if (isNaN(this.$input.val())) {
      return {
        valid: false,
        msg: 'Please enter a valid integer'
      }
    }

    return {
      valid: true,
      msg: null
    }
  }
}
