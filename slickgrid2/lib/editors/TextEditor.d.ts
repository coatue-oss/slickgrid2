import { Group } from '../core';
import { Item } from '../dataview';
import { Editor, EditorValidationObject } from './index';
export declare class TextEditor extends Editor {
    private $input;
    private initialValue;
    init(): void;
    destroy(): void;
    focus(): void;
    getValue(): any;
    setValue(val: string): void;
    loadValue(item: Item | Group): void;
    serializeValue(): any;
    applyValue(item: Item | Group, state: any): void;
    isValueChanged(): boolean;
    validate(): EditorValidationObject;
}
