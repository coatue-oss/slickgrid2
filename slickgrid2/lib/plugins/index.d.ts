import { SlickGrid } from '../grid';
export interface SlickPlugin {
    init(grid: SlickGrid): void;
    destroy(): void;
}
