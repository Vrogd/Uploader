import type {Upload} from "./class";
import {customEvent, functions} from "./functions";
import type {typeFile} from "../../types/file";
import {constants} from "./constants";

/**
 * @description file upload function
 * track all data and update list
 * @param {upload} parent
 * @param {File} file file object
 * @return void
 */
export function upload(parent: Upload, file: typeFile | string) : void {
    if (file?.file instanceof File){
        parent.files.update(file);
        let formData = new FormData();
        formData.append("file", file.file);
        const ajax = new XMLHttpRequest();
        if (ajax.upload){
            functions.updateFileData(file, parent);
            ajax.upload.addEventListener("progress", (e : ProgressEvent<XMLHttpRequestEventTarget>) => {
                uploadProgressHandler(file, e, parent);
            }, false);
            ajax.upload.addEventListener("error", (e) => {
                console.log(e)
                uploadErrorhandler(e);
            }, false);
            ajax.upload.addEventListener("abort", (e) => {
                uploadAbortHandler(e);
                console.log(e)
            }, false);
            ajax.upload.addEventListener("timeout", (e) => {
                console.log(e, 'timeout')
            }, false);
            ajax.upload.addEventListener("loadend", () => {
                uploadLoadEndHandler(file, parent)
            });
            ajax.addEventListener("load", () => {
                if (ajax.status === 404) {
                    // Handle 404 error
                    console.error('File not found (404)');
                    // You can call a specific handler or perform any other action here
                } else if (ajax.status >= 200 && ajax.status < 300) {
                    // Success, handle the response
                    console.log('File uploaded successfully');
                } else {
                    // Handle other HTTP errors
                    console.error(`Error: ${ajax.status}`);
                }
            });
            ajax.open("POST", "/file");
            ajax.send(formData as XMLHttpRequestBodyInit);
        }
    }
}

/**
 * @description progress event handler
 * @param {typeFile} file current file
 * @param {ProgressEvent} e event
 * @param {upload} parent main class
 * @return void
 */
function uploadProgressHandler(file : typeFile, e : ProgressEvent, parent: Upload) : void {
    file.progress = Math.round((e.loaded / e.total) * 100);
    if (file.progress === 100 && !constants.enableBackend){
        file.completed = true;
    }
    functions.updateFileData(file, parent);
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
 * @description upload completed
 * @param {typeFile} file file object
 * @param {Upload} parent class
 * @return void
 */
function uploadLoadEndHandler(file : typeFile, parent: Upload): void {
    file.completed = true;
    if (parent) parent.component.dispatchEvent(customEvent(constants.uploadEvent, file));
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