import type { Upload } from "./class";
import type { typeFile } from "../../types/file";
/**
 * @description file upload function
 * track all data and update list
 * @param {upload} parent
 * @param {File} file file object
 * @return void
 */
export declare function upload(parent: Upload, file: typeFile): void;
/**
 * @description format file size
 * @param {number} bytes
 * @param {number} decimalPoint
 * @return {string}
 */
export declare function formatFileSize(bytes: number, decimalPoint?: number): string;
/**
 * @description generate new string id
 * @param {number} len total of number
 * @return {string}
 */
export declare function generateId(len: number): string;
