import { GroupTotals } from '../core'
import { Item } from '../dataview'

export abstract class Aggregator {
  constructor(protected field: number) {}
  abstract init(): void
  abstract accumulate(item: Item): void
  abstract storeResult(groupTotals: GroupTotals): void
}
