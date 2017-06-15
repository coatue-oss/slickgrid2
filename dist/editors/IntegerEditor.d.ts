import { Group } from '../core';
import { Item } from '../dataview';
import { Editor } from './';
export declare class IntegerEditor extends Editor {
    private $input;
    private defaultValue;
    init(): void;
    destroy(): void;
    focus(): void;
    loadValue(item: Group | Item): void;
    serializeValue(): number;
    applyValue(item: Group | Item, state: number): void;
    isValueChanged(): boolean;
    validate(): {
        valid: boolean;
        msg: string;
    } | {
        valid: boolean;
        msg: null;
    };
}
