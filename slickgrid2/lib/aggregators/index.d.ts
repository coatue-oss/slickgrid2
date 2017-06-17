import { GroupTotals } from '../core';
import { Item } from '../dataview';
export declare abstract class Aggregator {
    protected field: number;
    constructor(field: number);
    abstract init(): void;
    abstract accumulate(item: Item): void;
    abstract storeResult(groupTotals: GroupTotals): void;
}
