import { Column } from '../Column';
import { Group } from '../core';
import { Item } from '../dataview';
import { SlickGrid } from '../grid';
export interface AbsBox {
    bottom: number;
    height: number;
    left: number;
    right: number;
    top: number;
    visible: boolean;
    width: number;
}
export interface EditorArgs {
    cancelChanges(): void;
    column: Column;
    commitChanges(): void;
    container: JQuery;
    grid: SlickGrid;
    gridPosition: AbsBox;
    item: Group | Item;
    position: AbsBox;
}
export declare abstract class Editor {
    protected args: EditorArgs;
    constructor(args: EditorArgs);
    abstract init(): void;
    abstract isValueChanged(): boolean;
    abstract destroy(): void;
    abstract focus(): void;
    abstract validate(): EditorValidationObject;
    abstract serializeValue(): any;
    abstract applyValue(item: Item | Group, serializedValue: any): void;
    abstract loadValue(item: Item | Group): void;
    hide?(): any;
    show?(): any;
    position?(cellBox?: any): any;
}
export interface EditorValidationObject {
    valid: boolean;
    msg: string | null;
}
