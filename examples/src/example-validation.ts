import * as _ from 'lodash'
import { EditorValidationObject, SlickGrid, TextEditor } from 'slickgrid2'

function validateRequiredField(value): EditorValidationObject {
  if (value == null || value === undefined || value.length === 0) {
    return {
      valid: false,
      msg: 'This is a required field'
    }
  }
  return {
    valid: true,
    msg: null
  }
}

const columns = [
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
]

const data = _.range(0, 100).map(i => ({
  title: `Task ${i}`,
  priority: 'Medium'
}))

const grid = new SlickGrid('#myGrid', data, columns, {
  rowHeight: 30
})
