import { range } from 'lodash'

export enum KEYCODES {
  DOWN = 40,
  ESCAPE = 27,
  F2 = 113,
  LEFT = 37,
  ENTER = 13,
  PAGE_UP = 33,
  PAGE_DOWN = 34,
  RIGHT = 39,
  UP = 38,
  SPACE = 32,
  TAB = 9
}

// useful reference is https://css-tricks.com/snippets/javascript/javascript-keycodes/
const ALPHANUMERIC_KEYCODES = range(48, 91)
const KEYPAD_KEYCODES = range(96, 112)
const SYMBOL_KEYCODES = range(186, 223)

export const TYPABLE_KEYCODES = [
  KEYCODES.SPACE,
  ...ALPHANUMERIC_KEYCODES,
  ...KEYPAD_KEYCODES,
  ...SYMBOL_KEYCODES
]
