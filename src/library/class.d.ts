import type { typeOptions } from "../types/options";
import type { Tabs } from "../types/tabs";
/**
 * @description upload class
 * @class Upload
 * @constructor {typeOptions} object
 */
export declare class Upload {
    private fallback;
    maxAmountOfFiles: Number;
    input: null | HTMLElement;
    files: import("../types/fileList").typeFileList;
    image: boolean;
    video: boolean;
    other: boolean;
    tabActive: Tabs;
    constructor(object?: typeOptions);
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
}
