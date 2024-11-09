import type { typeFile } from "../lib/types/file";
import type { Tabs } from "../lib/types/tabs";
import { Upload } from "./class";
/**
 * @description update and create of files
 * @type {object} objectInstance
 */
export declare const functions: {
    /**
     * @description create new instance
     * @param {File} file file upload or drag
     * @param {Tabs} tab active tab
     * @return {typeFile} new file object
     */
    new: (file: File | string, tab: Tabs) => typeFile;
    /**
     * @description read file from upload
     * @param {typeFile} file file object
     * @param {Upload} parent parent class
     * @return void
     */
    updateFileData(file: typeFile, parent: Upload): void;
    /**
     * @description read file / get preview
     * @param {typeFile} file file object
     * @param {Upload} parent parent class
     * @return {Promise<void>}
     */
    fileReader(file: typeFile, parent: Upload | undefined): Promise<void>;
    /**
     * @description load preview from request / not stored yet
     * @param {typeFile} file file
     * @param {Upload | null} parent main class
     * @param {HTMLCanvasElement} canvas html canvas
     * @return {Promise<void>}
     */
    loadPreview(file: typeFile, parent: Upload | undefined, canvas: HTMLCanvasElement): Promise<void>;
    /**
     * @description load image from cache / blob
     * @param {typeFile} file
     * @param {Upload} parent parent class
     * @param {HTMLCanvasElement} canvas
     * @param {Blob} blob blob stored in js
     * @return {Promise<void>}
     */
    loadCache(file: typeFile, parent: Upload | undefined, canvas: HTMLCanvasElement, blob: Blob): Promise<unknown>;
    /**
     * @description render dom element if available
     * @param {typeFile} file current file
     * @param {HTMLElement} node dom element
     * @return void
     */
    previewEvent(file: typeFile, node: HTMLElement): void;
    /**
     * @description validate url
     * @param {string} url url to validate
     * @return {boolean}
     */
    validateUrl(url: string): boolean;
    /**
     * @description check if url is on same domain as current
     * @param {string|null} url
     * @return boolean
     */
    isSameDomain(url?: string | null): boolean;
    /**
     * @description check if url is youtube
     * @param {string|null} url
     * @return boolean
     */
    isYouTubeURl(url: string | null): boolean;
    /**
     * @description generate custom event
     * @param {string} key string value
     * @param {any} detail data
     * @return {CustomEvent} CustomEvent
     */
    customEvent(key: string, detail: any): CustomEvent;
    /**
     * @description validate if correct type of file is upload / external otherwise throw error
     * @param {typeFile} file
     * @param {Tabs} activeTab
     * @param {Upload} parent main class
     * @return {Promise} void
     */
    validateCorrectUploadType(file: typeFile, activeTab: Tabs, parent: Upload): Promise<typeFile>;
};
/**
 * @description generate new string id
 * @param {number} len total of number
 * @return {string}
 */
export declare function generateId(len: number): string;
/**
 * @description clean up url
 * @param {string} url string params clean up after ?
 * @return string should be clear url
 */
export declare function cleanUrl(url: string): string;
/**
 * @description format file size
 * @param {number} bytes
 * @param {number} decimalPoint
 * @return {string}
 */
export declare function formatFileSize(bytes: number, decimalPoint?: number): string;
export default functions;
