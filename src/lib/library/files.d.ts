import type { typeFile } from "../lib/types/file";
import type { Tabs } from "../lib/types/tabs";
/**
 * @description data object
 * @type {typeFileList} hold data of files
 */
export declare const filesList: {
    list: typeFile[];
    callback: ((files: typeFile[]) => void) | null;
    /**
     * @description add
     * @param {typeFile} item
     * @param {Tabs} tabActive active tab
     * @return void
     */
    update: (item: typeFile, tabActive: Tabs) => void;
    delete: (item: typeFile) => void;
};
