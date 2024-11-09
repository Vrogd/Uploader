import type { Tabs } from "../lib/types/tabs";
import type { typeFile } from "../lib/types/file";
import type { adjustOptions } from "../lib/types/adjustOptions";
/**
 * @description upload class
 * @class Upload
 * @constructor {typeOptions} object
 */
export declare class Upload {
    private fallback;
    maxAmountOfFiles: Number;
    component: null | HTMLElement;
    input: null | HTMLElement;
    files: {
        list: typeFile[];
        callback: ((files: typeFile[]) => void) | null;
        update: (item: typeFile, tabActive: Tabs) => void;
        delete: (item: typeFile) => void;
    };
    backend: boolean;
    tabActive: Tabs;
    windowBlobList: string;
    external: boolean;
    options: adjustOptions;
    constructor(object: unknown | undefined, fallback?: boolean);
    /**
     * @description set settings
     * @param {typeOptions} options all options
     * @return void
     */
    private setSettings;
    /**
     * @description on change event file list
     * @param {Event} e upload event change
     * @return void
     */
    private eventChange;
    /**
     * @description default event upload
     * @return void
     */
    eventUpload: () => void;
    /**
     * @description drop file inside block
     * @param {DragEvent} e event from dragging
     * @return void
     */
    eventDrop: (e: DragEvent) => void;
    /**
     * @description prevent default event
     * @param {event} e event
     * @return void
     */
    eventPrevent: (e: Event) => void;
    /**
     * @description switch tabs
     * @param {Tabs} key tab name
     * @return void
     */
    switch: (key: Tabs) => void;
    /**
     * @description add event listeners
     * @param {HTMLElement | Element} wrapper dom element
     * @return void
     */
    dom: (wrapper?: HTMLElement | Element) => void;
    /**
     * @description download file
     * @param {typeFile} file file object
     * @return void
     */
    download: (file: typeFile) => void;
    /**
     * @description delete file
     * @param {typeFile} file file object
     * @return void
     */
    delete: (file: typeFile) => void;
    /**
     * @description check if crop can be shown
     * @param {typeFile} file file object
     * @return boolean
     */
    hasCrop: (file: typeFile) => boolean;
    /**
     * @description check if crop can be shown
     * @param {typeFile} file file object
     * @return void
     */
    crop: (file: typeFile) => void;
    /**
     * @description save / get blob to window list / based on change date
     * @param {string} url current file url / name
     * @param {Blob} blob blob element
     * @param {number} modified date of file creation on people pc
     * @return {Blob|void}
     */
    blob: (url: string, modified: number, blob?: Blob | null) => Blob | void;
    /**
     * @description decide when to show external input
     * @return void
     */
    isExternal: () => boolean;
    /**
     * @description if other tab show different dat / no preview / compact
     * @return {boolean}
     */
    isCompact: () => boolean;
    /**
     * @description toggle external window
     * @return void
     */
    toggleExternal: () => void;
}
export default Upload;
