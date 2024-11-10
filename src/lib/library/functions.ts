import type {typeFile} from "$lib";
import type {canvasSize} from "../types/size";
import type {Tabs} from "$lib";
import {Upload} from "./class";
import {library} from "$lib";

/**
 * @description update and create of files
 * @type {object} objectInstance
 */
export const functions: any = {
    /**
     * @description create new instance
     * @param {File} file file upload or drag
     * @param {Tabs} tab active tab
     * @return {typeFile} new file object
     */
    new : function (file: File | string, tab: Tabs): typeFile {
        const main = <object> {
            'progress': 0,
            'isPreviewAble' : false,
            'preview': null,
            'name': null,
            'size': null,
            'type' : tab,
            'id' : generateId(30),
        }
        if (file instanceof File) {
            return <typeFile>Object.assign({
                'file': file,
            }, main);
        } else {
            return $state(<typeFile>Object.assign({
                'url': file,
                'external': true
            }, main));
        }
    },
    /**
     * @description read file from upload
     * @param {typeFile} file file object
     * @param {Upload} parent parent class
     * @return void
     */
    updateFileData(file: typeFile, parent: Upload) : void {
        const current = <typeFile|null> parent.files.find(<string>file.id);
        if (current){
            const correctTab : boolean = parent.tabActive === current.type;
            if (current.file instanceof File){
                current.size = formatFileSize(current.file.size, 2);
                current.name = current.file.name;
                parent.files.update(current, parent.tabActive);
                if (current.file.type.includes('image') && !current.isPreviewAble && !current.preview && correctTab){
                    functions.fileReader(current, parent).catch((err : Error) => {
                        console.error(library.constants.prefixError + ' failed to set preview', err);
                    })
                } else {
                    console.dir(8)
                    parent.files.update(current, parent.tabActive);
                }
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
            if ((file.file && file.file instanceof File && parent)){
                const canvas : HTMLCanvasElement = document.createElement('canvas');
                const blob = <Blob>parent.blob(file.file.name, file.file.lastModified);
                if (blob){
                    functions.loadCache(file, parent, canvas, blob).then(() => resolve()).catch((err : Error) => {
                        console.error(library.constants.prefixError + ' failed to load preview from cache.', err);
                    });
                } else {
                    functions.loadPreview(file, parent, canvas).then(() => resolve()).catch((err : Error) => {
                        console.error(library.constants.prefixError + ' failed to load preview.', err);
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
    loadPreview(file: typeFile, parent: Upload, canvas: HTMLCanvasElement) : Promise<void>{
        return new Promise((resolve: any) => {
            const current = <typeFile|null> parent.files.find(<string>file.id);
            if (current && current.file instanceof File) {
                const request = new XMLHttpRequest();
                request.open('GET', URL.createObjectURL(current.file), true);
                request.responseType = 'blob';
                request.onload = function () {
                    const reader = new FileReader();
                    reader.readAsDataURL(request.response);
                    reader.onload = function (e: any) {
                        const currentLoaded = <typeFile|null> parent.files.find(<string>file.id);
                        if (currentLoaded && currentLoaded.file instanceof File) {
                            const blob = request.response;
                            if (blob instanceof Blob) parent.blob(currentLoaded.file.name, currentLoaded.file.lastModified, blob);
                            currentLoaded.url = e.target?.result;
                            const image = new Image();
                            image.src = e.target.result;
                            currentLoaded.isPreviewAble = true
                            currentLoaded.preview = canvas;
                            parent.files.update(currentLoaded, parent.tabActive);
                            renderPreview(currentLoaded, image, canvas).then(() => {
                                parent.files.update(currentLoaded, parent.tabActive);
                            }).catch(() => {
                                console.error(library.constants.prefixError + ' failed to load preview');
                            })
                        }
                    };
                };
                request.onerror = function () {
                    console.error(library.constants.prefixError + ' error failed to load file');
                }
                request.onabort = function () {
                    console.error(library.constants.prefixError + ' abort file load');
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
                if (parent) parent.files.update(file, parent.tabActive);
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
        const pattern = /^(https?:\/\/)?((([a-zA-Z\d]([a-zA-Z\d-]*[a-zA-Z\d])*)\.)+[a-zA-Z]{2,})(:\d+)?(\/[-a-zA-Z\d%_.~+()/:=]*)*(\?[;&a-zA-Z\d%_.~+=-]*)?(#[-a-zA-Z\d_]*)?$/;
        return pattern.test(url);
    },
    /**
     * @description check if url is on same domain as current
     * @param {string|null} url
     * @return boolean
     */
    isSameDomain(url: string|null = null) : boolean {
        if (typeof url !== 'string') return false
        const parsedUrl = new URL(url);
        const currentOrigin = window.location.origin;
        return (
            parsedUrl.origin === currentOrigin ||
            parsedUrl.hostname === 'localhost'
        );
    },
    /**
     * @description check if url is youtube
     * @param {string|null} url
     * @return boolean
     */
    isYouTubeURl(url : string| null) : boolean {
        const parsedUrl = new URL(url ? url : '');
        return (
            parsedUrl.hostname === 'www.youtube.com' ||
            parsedUrl.hostname === 'youtube.com' ||
            parsedUrl.hostname === 'youtu.be'
        );
    },
    /**
     * @description generate custom event
     * @param {string} key string value
     * @param {any} detail data
     * @return {CustomEvent} CustomEvent
     */
     customEvent(key: string, detail: any) : CustomEvent{
        return new CustomEvent(key, {detail: detail});
     },
    /**
     * @description validate if correct type of file is upload / external otherwise throw error
     * @param {typeFile} file
     * @param {Tabs} activeTab
     * @param {Upload} parent main class
     * @return {Promise} void
     */
    validateCorrectUploadType(file: typeFile, activeTab : Tabs, parent : Upload) : Promise<typeFile> {
        return new Promise((resolve, reject) => {
            let extension;
            if (file.file instanceof File){
                extension = file.file.name.split('.').pop();
            } else if (file.url){
                extension = file.url.split('.').pop();
            }
            if (extension){
                const isImage = <boolean> (parent.options.imageExtensions.indexOf(extension) > -1);
                const isVideo = <boolean> (parent.options.videoExtensions.indexOf(extension) > -1);
                const isOther  = <boolean> ((Object.keys(parent.options.otherExtensions).length) ? parent.options.otherExtensions.indexOf(extension) : true);
                const activeImage = <boolean> ((activeTab === 'image') && isImage && parent.options.enableImage);
                const activeImageCorrection = <boolean> (!(activeTab === 'image') && isImage && parent.options.enableImage);
                const activeVideo = <boolean> (activeTab === 'video' && isVideo &&  parent.options.enableVideo);
                const activeVideoCorrection = <boolean> (!(activeTab === 'video') && isVideo && parent.options.enableVideo);
                const activeOther = <boolean> (activeTab === 'other' && isOther && parent.options.enableOther);
                const activeOtherCorrection = <boolean> (!(activeTab === 'other') && isOther && parent.options.enableOther);

                if ((activeImageCorrection || activeImage) && isImage) file.type = 'image';
                else if ((activeVideoCorrection || activeVideo) && isVideo) file.type = 'video';
                else if ((activeOtherCorrection || activeOther) && isOther) file.type = 'other';

                if (activeImage || activeImageCorrection || activeVideo || activeVideoCorrection || activeOther || activeOtherCorrection){
                    resolve(file);
                }
            }
            reject();
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
    return new Promise(((resolve: any) => {
        image.addEventListener("load", function() {
            const clientWidth = file.previewElement?.clientWidth;
            const clientHeight = library.constants.previewHeight * parseFloat(getComputedStyle(document.documentElement).fontSize);
            console.dir({'width' : clientWidth, 'height' : clientHeight});
            if (clientHeight && clientWidth) {
                const size : canvasSize = calculateCanvasSize(clientWidth, clientHeight, image.width, image.height);
                canvas.width = size.width;
                canvas.height = size.height;
                canvas.setAttribute('data-width', String(size.width));
                canvas.setAttribute('data-height', String(size.height))
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(image, size.left, size.top, size.width, size.height);
                }
            } else {
                console.error(library.constants.prefixError + ' dom missing width / height');
            }
            resolve();
        }, false);
        image.addEventListener("error", function() {
            console.error(library.constants.prefixError + ' failed to load image');
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
    if (newHeight < (domHeight * (100 - library.constants.previewBorderSpace) / 100)){
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

/**
 * @description clean up url
 * @param {string} url string params clean up after ?
 * @return string should be clear url
 */
export function cleanUrl(url : string){
    const index = url.indexOf('?');
    if (index !== -1) {
        return url.substring(0, index);
    }
    return url;
}

/**
 * @description format file size
 * @param {number} bytes
 * @param {number} decimalPoint
 * @return {string}
 */
export function formatFileSize(bytes : number, decimalPoint : number = 2): string{
    if(bytes == 0) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(decimalPoint)) + ' ' + sizes[i];
}

/**
 * @description deep merge
 * @param {any} target
 * @param {any[]} sources
 * @return {Object}
 */
export function deepMerge(target : any, ...sources:any[]) : any {
    if (!sources.length) return target;
    const source = sources.shift();
    if (typeof target === 'object' && typeof source === 'object') {
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (typeof source[key] === 'object' && source[key] !== null) {
                    if (!target[key]) target[key] = {};
                    deepMerge(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
    }

    return deepMerge(target, ...sources);
}

export default functions;