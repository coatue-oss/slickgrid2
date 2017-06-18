import { Group } from '../core'
import { Item } from '../dataview'
import { KEYCODES } from '../keycodes'
import { Editor, EditorArgs, EditorValidationObject } from './index'

export class TextEditor extends Editor {
  private $input: JQuery
  private initialValue: string

  init() {
    this.$input = $('<input type="text" class="editor-text" />')
    .appendTo(this.args.container)
    .on('keydown', function (e) {
      if (e.keyCode === KEYCODES.LEFT || e.keyCode === KEYCODES.RIGHT) {
        e.stopImmediatePropagation()
      }
    })
    .focus()
    .select()
  }

  destroy() {
    this.$input.remove()
  }

  focus() {
    this.$input.focus()
  }

  getValue() {
    return this.$input.val()
  }

  setValue(val: string) {
    this.$input.val(val)
  }

  loadValue(item: Item | Group) {
    this.initialValue = item[this.args.column.field] || ''
    this.$input.val(this.initialValue!);
    (this.$input[0] as HTMLInputElement).defaultValue = this.initialValue!
    this.$input.select()
  }

  // TODOCK: what's the difference between serializeValue & applyValue?
  serializeValue() {
    return this.$input.val()
  }

  applyValue(item: Item | Group, state: any) {
    item[this.args.column.field] = state
  }

  isValueChanged() {
    const value = this.$input.val()
    return (!(value === '' && this.initialValue == null)) && (value !== this.initialValue)
  }

  validate(): EditorValidationObject {
    if (this.args.column.validator) {
      var validationResults = this.args.column.validator(this.$input.val())
      if (!validationResults.valid) {
        return validationResults
      }
    }

    return {
      valid: true,
      msg: null
    }
  }
}
