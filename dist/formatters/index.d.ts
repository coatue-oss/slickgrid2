import { Group, GroupTotals } from '../core';
import { Item } from '../dataview';
import { Column, SlickGrid } from '../grid';
export interface Formatter {
    (row: number, cell: number, value: any, columnDef: Column, dataContext: Item, grid: SlickGrid): string;
}
export interface GroupFormatter {
    (row: number, cell: number, value: any, columnDef: Column, dataContext: Group, grid: SlickGrid): string;
}
export interface GroupTotalsFormatter {
    (row: number, cell: number, value: any, columnDef: Column, dataContext: GroupTotals, grid: SlickGrid): string;
}
