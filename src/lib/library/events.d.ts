import type { typeFile } from "../../types/file";
import type { Tabs } from "../../types/tabs";
/**
 * @description update and create of files
 * @type {object} objectInstance
 */
export declare const objectInstance: {
    /**
     * @description create new instance
     * @param {File} file file upload or drag
     * @param {Tabs} tab active tab
     * @return {typeFile} new file object
     */
    new: (file: File, tab: Tabs) => typeFile;
    update: () => void;
    /**
     * @description create new instance
     * @param {typeFile} file file object
     * @return void
     */
    updateFileData(file: typeFile): void;
    /**
     * @description read file / get preview
     * @param {typeFile} file file object
     * @return void
     */
    fileReader(file: typeFile): Promise<void>;
    /**
     * @description render dom element if available
     * @param {typeFile} file current file
     * @param {HTMLElement} node dom element
     * @return void
     */
    previewEvent(file: typeFile, node: HTMLElement): void;
};
export default objectInstance;
