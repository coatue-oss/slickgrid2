import { Event } from './core';
/***
 * A sample AJAX data store implementation.
 * Right now, it's hooked up to load Hackernews stories, but can
 * easily be extended to support any JSONP-compatible backend that accepts paging parameters.
 */
export declare function RemoteModel(): {
    data: {
        length: number;
    };
    clear: () => void;
    isDataLoaded: (from: any, to: any) => boolean;
    ensureData: (from: any, to: any) => void;
    reloadData: (from: any, to: any) => void;
    setSort: (column: any, dir: any) => void;
    setSearch: (str: any) => void;
    onDataLoading: Event<{}>;
    onDataLoaded: Event<{}>;
};
