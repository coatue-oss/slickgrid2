import { Editor } from './'

export class CheckboxEditor extends Editor {
  private $select: JQuery
  private defaultValue: boolean | null

  init() {
    this.$select = $('<input type="checkbox" value="true" class="editor-checkbox" hideFocus />')
      .appendTo(this.args.container)
      .focus()
  }

  destroy() {
    this.$select.remove()
  }

  focus() {
    this.$select.focus()
  }

  loadValue(item) {
    this.defaultValue = !!item[this.args.column.field]
    if (this.defaultValue) {
      this.$select.prop('checked', true)
    } else {
      this.$select.prop('checked', false)
    }
  }

  serializeValue() {
    return this.$select.prop('checked')
  }

  applyValue(item, state) {
    item[this.args.column.field] = state
  }

  isValueChanged() {
    return (this.serializeValue() !== this.defaultValue)
  }

  validate() {
    return {
      valid: true,
      msg: null
    }
  }

}
