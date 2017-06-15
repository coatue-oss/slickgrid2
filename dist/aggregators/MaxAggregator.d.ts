import { GroupTotals } from '../core';
import { Item } from '../dataview';
import { Aggregator } from './';
export declare class MaxAggregator extends Aggregator {
    private max;
    init(): void;
    accumulate(item: Item): void;
    storeResult(groupTotals: GroupTotals): void;
}
