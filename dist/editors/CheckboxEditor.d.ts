import { Editor } from './';
export declare class CheckboxEditor extends Editor {
    private $select;
    private defaultValue;
    init(): void;
    destroy(): void;
    focus(): void;
    loadValue(item: any): void;
    serializeValue(): any;
    applyValue(item: any, state: any): void;
    isValueChanged(): boolean;
    validate(): {
        valid: boolean;
        msg: null;
    };
}
