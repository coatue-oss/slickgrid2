import { range } from 'lodash';
export var KEYCODES;
(function (KEYCODES) {
    KEYCODES[KEYCODES["DOWN"] = 40] = "DOWN";
    KEYCODES[KEYCODES["ESCAPE"] = 27] = "ESCAPE";
    KEYCODES[KEYCODES["F2"] = 113] = "F2";
    KEYCODES[KEYCODES["LEFT"] = 37] = "LEFT";
    KEYCODES[KEYCODES["ENTER"] = 13] = "ENTER";
    KEYCODES[KEYCODES["PAGE_UP"] = 33] = "PAGE_UP";
    KEYCODES[KEYCODES["PAGE_DOWN"] = 34] = "PAGE_DOWN";
    KEYCODES[KEYCODES["RIGHT"] = 39] = "RIGHT";
    KEYCODES[KEYCODES["UP"] = 38] = "UP";
    KEYCODES[KEYCODES["SPACE"] = 32] = "SPACE";
    KEYCODES[KEYCODES["TAB"] = 9] = "TAB";
})(KEYCODES || (KEYCODES = {}));
// useful reference is https://css-tricks.com/snippets/javascript/javascript-keycodes/
var ALPHANUMERIC_KEYCODES = range(48, 91);
var KEYPAD_KEYCODES = range(96, 112);
var SYMBOL_KEYCODES = range(186, 223);
export var ACTIVATE_EDITOR_KEYCODES = [
    KEYCODES.SPACE
].concat(ALPHANUMERIC_KEYCODES, KEYPAD_KEYCODES, SYMBOL_KEYCODES);
