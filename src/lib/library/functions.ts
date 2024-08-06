import type {Upload} from "./class";
import {objectInstance} from "./events";
import type {typeFile} from "../../types/file";
import {constants} from "./constants";

/**
 * @description file upload function
 * track all data and update list
 * @param {upload} parent
 * @param {File} file file object
 * @return void
 */
export function upload(parent: Upload, file: typeFile) : void {
    if (file.file instanceof File){
        parent.files.update(file);
        let formData = new FormData();
        formData.append("file", file.file);
        const ajax = new XMLHttpRequest();
        if (ajax.upload){
            objectInstance.updateFileData(file, parent);
            ajax.upload.addEventListener("progress", (e : ProgressEvent<XMLHttpRequestEventTarget>) => {
                uploadProgressHandler(file, e, parent);
            }, false);
            ajax.addEventListener("error", uploadErrorhandler, false);
            ajax.addEventListener("abort", uploadAbortHandler, false);
            ajax.open("POST", "/file");
            ajax.send(formData as XMLHttpRequestBodyInit);
        }
    }
}

/**
 * @description progress event handler
 * @param {typeFile} file
 * @param {ProgressEvent} e event
 * @param {upload} parent
 * @return void
 */
function uploadProgressHandler(file : typeFile, e : ProgressEvent, parent: Upload) : void {
    file.progress = Math.round((e.loaded / e.total) * 100)
    objectInstance.updateFileData(file, parent);
}

/**
 * @description error event handler
 * @param {ProgressEvent} e event
 * @return void
 */
function uploadErrorhandler(e : Event) : void {
    console.error(constants.prefixError + ' failed to upload file ', e);
}

/**
 * @description progress event handler
 * @param {ProgressEvent} e event
 * @return void
 */
function uploadAbortHandler(e : Event): void {
    console.error(constants.prefixError + ' aborted file upload ', e);
}

/**
 * @description format file size
 * @param {number} bytes
 * @param {number} decimalPoint
 * @return {string}
 */
export function formatFileSize(bytes : number, decimalPoint : number = 2){
    if(bytes == 0) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(decimalPoint)) + ' ' + sizes[i];
}
/**
 * @description decimal to hex string
 * @param {number} dec number
 * @return {string}
 */
function dec2hex(dec : number) : string {
    return dec.toString(16).padStart(2, "0");
}
/**
 * @description generate new string id
 * @param {number} len total of number
 * @return {string}
 */
export function generateId(len : number) : string {
    const arr = new Uint8Array((len || 40) / 2);
    window.crypto.getRandomValues(arr);
    return Array.from(arr, dec2hex).join('');
}