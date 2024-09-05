import {constants} from "./constants";
import {filesList} from "./files";
import {formatFileSize} from "./events";
import type {typeFile} from "../../types/file";
import type {canvasSize} from "../../types/size";
import type {Tabs} from "../../types/tabs";
import {Upload} from "./class";

/**
 * @description update and create of files
 * @type {object} objectInstance
 */
export const functions = {
    /**
     * @description create new instance
     * @param {File} file file upload or drag
     * @param {Tabs} tab active tab
     * @return {typeFile} new file object
     */
    new : function (file: File | string, tab: Tabs) {
        const main = {
            'progress': 0,
            'isPreviewAble' : false,
            'preview': null,
            'name': null,
            'size': null,
            'type' : tab
        }
        if (file instanceof File) {
            return <typeFile> Object.assign({
                'file': file,
            }, main);
        } else {
            return <typeFile> Object.assign({
                'url': file,
                'external' : true
            }, main);
        }
    },
    /**
     * @description create new instance
     * @param {typeFile} file file object
     * @param {Upload} parent parent class
     * @return void
     */
    updateFileData(file: typeFile, parent: Upload) : void {
        if (file.file instanceof File){
            file.size = formatFileSize(file.file.size, 2);
            file.name = file.file.name;
            if (file.file.type.includes('image') && !file.isPreviewAble){
                functions.fileReader(file, parent).then(() => {
                    filesList.update(file);
                }).catch((err : Error) => {
                    console.error(constants.prefixError + ' failed to set preview', err);
                })
            } else {
                filesList.update(file);
            }
        }
    },
    /**
     * @description read file / get preview
     * @param {typeFile} file file object
     * @param {Upload} parent parent class
     * @return {Promise<void>}
     */
    fileReader(file : typeFile, parent: Upload|undefined) : Promise<void> {
        return new Promise((resolve: any) => {
            if (file.file && file.file instanceof File){
                const canvas = document.createElement('canvas');
                const blob = <Blob>parent.blob(file.file.name, file.file.lastModified);
                if (blob){
                    functions.loadCache(file, parent, canvas, blob).then(() => resolve()).catch((err : Error) => {
                        console.error(constants.prefixError + ' failed to load preview from cache.', err);
                    });
                } else {
                    functions.loadPreview(file, parent, canvas).then(() => resolve()).catch((err : Error) => {
                        console.error(constants.prefixError + ' failed to load preview.', err);
                    });
                }
            }
        })
    },
    /**
     * @description load preview from request / not stored yet
     * @param {typeFile} file file
     * @param {Upload | null} parent main class
     * @param {HTMLCanvasElement} canvas html canvas
     * @return {Promise<void>}
     */
    loadPreview(file: typeFile, parent: Upload|undefined, canvas: HTMLCanvasElement) : Promise<void>{
        return new Promise((resolve: any) => {
            if (file.file && file.file instanceof File) {
                const request = new XMLHttpRequest();
                request.open('GET', URL.createObjectURL(file.file), true);
                request.responseType = 'blob';
                request.onload = function () {
                    const reader = new FileReader();
                    reader.readAsDataURL(request.response);
                    reader.onload = function (e: any) {
                        if (file.file instanceof File) {
                            const blob = request.response;
                            if (blob instanceof Blob) parent.blob(file.file.name, file.file.lastModified, blob);
                        }
                        file.isPreviewAble = true
                        file.preview = canvas;
                        file.url = e.target?.result;
                        const image = new Image();
                        image.src = e.target.result;
                        renderPreview(file, image, canvas).then(() => {
                            filesList.update(file);
                        })
                    };
                };
                request.onerror = function () {
                    console.error(constants.prefixError + ' error failed to load file');
                }
                request.onabort = function () {
                    console.error(constants.prefixError + ' abort file load');
                }
                request.send();
            }
            resolve();
        });
    },
    /**
     * @description load image from cache / blob
     * @param {typeFile} file
     * @param {Upload} parent parent class
     * @param {HTMLCanvasElement} canvas
     * @param {Blob} blob blob stored in js
     * @return {Promise<void>}
     */
    loadCache(file: typeFile, parent: Upload|undefined, canvas: HTMLCanvasElement, blob: Blob) : Promise<unknown> {
        return new Promise((resolve : any) => {
            const url :string =  URL.createObjectURL(blob)
            file.isPreviewAble = true
            file.preview = canvas;
            file.url = url;
            const image = new Image();
            image.src = url;
            renderPreview(file, image, canvas).then(()=>{
                filesList.update(file);
            })
            resolve();
        })
    },
    /**
     * @description render dom element if available
     * @param {typeFile} file current file
     * @param {HTMLElement} node dom element
     * @return void
     */
    previewEvent(file: typeFile, node: HTMLElement): void {
        if(file.preview instanceof HTMLCanvasElement){
            node.appendChild(file.preview)
        }
    },
    /**
     * @description validate url
     * @param {string} url url to validate
     * @return {boolean}
     */
    validateUrl(url :string) : boolean {
        const pattern = /^(https?:\/\/)?((([a-zA-Z\d]([a-zA-Z\d-]*[a-zA-Z\d])*)\.)+[a-zA-Z]{2,})(:\d+)?(\/[-a-zA-Z\d%_.~+()]*)*(\?[;&a-zA-Z\d%_.~+=-]*)?(#[-a-zA-Z\d_]*)?$/;
        return pattern.test(url);
    },
    /**
     * @description validate if correct type of file is upload / external otherwise throw error
     * @param {typeFile} file
     * @return {Promise} void
     */
    validateCorrectUploadType(file: typeFile, activeTab : Tabs) : Promise<void> {
        return new Promise((resolve: any, reject: any) => {

        })
    }
}

/**
 * @description show image in canvas
 * @param {typeFile} file current file
 * @param {HTMLImageElement} image image
 * @param {HTMLCanvasElement} canvas canvas element
 * @return {Promise<unknown>}
 */
function renderPreview(file: typeFile, image: HTMLImageElement, canvas: HTMLCanvasElement) : Promise<unknown> {
    return new Promise(((resolve: unknown) => {
        image.addEventListener("load", function() {
            setTimeout(() => {
                const clientWidth = file.previewElement?.clientWidth;
                const clientHeight = constants.previewHeight * parseFloat(getComputedStyle(document.documentElement).fontSize);
                if (clientHeight && clientWidth) {
                    const size : canvasSize = calculateCanvasSize(clientWidth, clientHeight, image.width, image.height);
                    canvas.width = size.width;
                    canvas.height = size.height;
                    canvas.setAttribute('data-width', String(size.width));
                    canvas.setAttribute('data-height', String(size.height))
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(image, size.left, size.top, size.width, size.height);
                } else {
                    console.error(constants.prefixError + ' dom missing width / height');
                }
                resolve();
            }, 0)
        }, false);
        image.addEventListener("error", function() {
            console.error(constants.prefixError + ' failed to load image');
            resolve();
        }, false)
    }))
}

/**
 * @description calculate canvas size on resize
 * @param {number} domWidth current dom width
 * @param {number} domHeight current dom height
 * @param {number} width current image width
 * @param {number} height current image height
 * @return Promise<canvasSize|object>
 */
function calculateCanvasSize(domWidth: number, domHeight: number, width: number, height: number) : canvasSize {
    let newWidth, newHeight, newTop, newLeft;
    newWidth = Math.ceil(domWidth);
    newHeight = Math.ceil(newWidth * (height/ width));
    if (newHeight < (domHeight * (100 - constants.previewBorderSpace) / 100)){
        newHeight = Math.ceil(domHeight);
        newWidth = Math.ceil(newHeight * (width / height));
    }
    newLeft = Math.round(((domWidth - newWidth) / 2));
    newTop = Math.round(((domHeight- newHeight) / 2));

    return {
        'width': newWidth,
        'height': newHeight,
        'top': newTop,
        'left': newLeft
    };
}

/**
 * @description generate custom event
 * @param {string} key string value
 * @param {any} detail data
 * @return {CustomEvent} CustomEvent
 */
export function customEvent(key: string, detail: any) : CustomEvent{
    return new CustomEvent(key, {detail: detail});
}

export default functions;