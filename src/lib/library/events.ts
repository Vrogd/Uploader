import type {Upload} from "./class";
import {formatFileSize} from "./functions";
import type {typeFile} from "../types/file";
import {constants} from "./constants";
import {library} from "../index";

/**
 * @description file upload function
 * track all data and update list
 * @param {upload} parent main class
 * @param {File} file file object
 * @return void
 */
export function upload(parent : Upload, file : typeFile) : void {
    library.functions.validateCorrectUploadType(file, parent.tabActive, parent).then((file : typeFile) => {
        if (file && file.file instanceof File) uploadFile(parent, file);
        else uploadExternal(parent, file);
    }).catch((err) => {
        console.error(library.constants.prefixError + ' failed to validate upload', err)
    });
}

/**
 * @description upload file
 * @param {upload} parent main class
 * @param {typeFile} file main file object
 * @return void
 */
function uploadFile(parent : Upload, file : typeFile) : void {
    const formData = new FormData();
    formData.append("file", file.file);
    const ajax = new XMLHttpRequest();
    if (ajax.upload){
        parent.files.update(file, parent.tabActive);
        library.functions.updateFileData(file, parent);
        ajax.upload.addEventListener("progress", (e : ProgressEvent<XMLHttpRequestEventTarget>) => {
            uploadProgressHandler(file, e, parent);
        }, false);
        ajax.upload.addEventListener("error", (e) => {
            file.failed = true;
            uploadErrorhandler(e);
        }, false);
        ajax.upload.addEventListener("abort", (e) => {
            uploadAbortHandler(e);
            file.failed = true;
        }, false);
        ajax.upload.addEventListener("timeout", (e) => {
            console.log(e, 'timeout')
        }, false);
        ajax.upload.addEventListener("loadend", () => {
            uploadLoadEndHandler(file, parent)
        });
        ajax.addEventListener("load", () => {
            library.functions.updateFileData(file, parent);
            if (ajax.status >= 400 && ajax.status < 600 && parent.options.enableBackend) {
                file.failed = true;
                console.error(library.constants.prefixError +  ' File upload failed (' + ajax.status + ')');
            }
            parent.files.update(file, parent.tabActive);
        });
        ajax.open("POST", "/file");
        ajax.send(formData as XMLHttpRequestBodyInit);
    }
}

/**
 * @description upload external
 * @param {upload} parent main class
 * @param {typeFile} file main file object
 * @return void
 */
function uploadExternal(parent : Upload, file : typeFile) : void {
    prefetchExternal(parent, file).then(() => {
        fetch(new URL(file.url)).then(response => {
            console.log(response)
            const contentType : string = response.headers.get('Content-Type');
            file.name = file.url;
            if (file.type === 'image' && contentType && contentType.startsWith('image/')){
                response.blob().then(blobResponse => {
                    file.size = formatFileSize(blobResponse.size, 2)
                    file.progress = 100;
                    file.completed = true;
                    const canvas = document.createElement('canvas');
                    library.functions.loadCache(file, parent, canvas, blobResponse).then(() =>{
                        console.log('test')
                    }).catch((err : Error) => {
                        console.error(library.constants.prefixError + ' failed to load preview from cache.', err);
                    });
                    parent.files.update(file, parent.tabActive);
                    console.log(response, blobResponse)
                })
            } else {
                console.log('error', response)
            }
        }).catch((error) => {
            file.failed = true;
            parent.files.update(file, parent.tabActive);
            console.error(error)
        });
    }).catch((error) => {
        console.error(library.constants.prefixError + ' Url is not available : ', error);
    })
}

/**
 * try options fetching if no cors error do main fetch
 * @param {upload} parent main class
 * @param {typeFile} file main file object
 * @return <Promise>
 */
function prefetchExternal(parent : Upload, file : typeFile) : Promise<unknown>{
    return new Promise((resolve : unknown, reject : unknown) => {
        fetch(new URL(file.url), {
            method: 'OPTIONS',
            headers: {
                'Access-Control-Allow-Origin' : '*',
                'mode': 'no-cors'
            }
        }).then(() => {
            console.log('passed')
            resolve();
        }).catch((error) => {
            reject(error)
        })
    })
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
    if (file.progress === 100 && !parent.options.enableBackend){
        file.completed = true;
    }
    parent.files.update(file, parent.tabActive);
}

/**
 * @description error event handler
 * @param {ProgressEvent} e event
 * @return void
 */
function uploadErrorhandler(e : Event) : void {
    console.error(library.constants.prefixError + ' failed to upload file ', e);
}

/**
 * @description progress event handler
 * @param {ProgressEvent} e event
 * @return void
 */
function uploadAbortHandler(e : Event): void {
    console.error(library.constants.prefixError + ' aborted file upload ', e);
}

/**
 * @description upload completed
 * @param {typeFile} file file object
 * @param {Upload} parent class
 * @return void
 */
function uploadLoadEndHandler(file : typeFile, parent : Upload): void {
    file.completed = true;
    if (parent) parent.component.dispatchEvent(library.functions.customEvent(library.constants.uploadEvent, file));
}