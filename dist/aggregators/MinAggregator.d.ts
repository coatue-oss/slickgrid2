import { GroupTotals } from '../core';
import { Item } from '../dataview';
import { Aggregator } from './';
export declare class MinAggregator extends Aggregator {
    private min;
    init(): void;
    accumulate(item: Item): void;
    storeResult(groupTotals: GroupTotals): void;
}
