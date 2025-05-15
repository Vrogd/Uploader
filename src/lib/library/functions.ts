import type {typeFile} from "$lib";
import type {canvasSize} from "../types/size";
import type {Tabs} from "$lib";
import {Upload} from "./class";
import {library} from "$lib";

export class Functions {
    /**
     * @description create new instance
     * @param {File} file file upload or drag
     * @param {Tabs} tab active tab
     * @return {typeFile} new file object
     */
    static new (file: File | string, tab: Tabs): typeFile {
        const main = <object>{
            'progress': 0,
            'isPreviewAble': false,
            'preview': null,
            'name': null,
            'size': null,
            'type': tab,
            'id': generateId(30),
        }
        if (file instanceof File) {
            return <typeFile>Object.assign({
                'file': file,
            }, main);
        } else {
            return <typeFile>Object.assign({
                'url': file,
                'external': true
            }, main);
        }
    }
    /**
     * @description read file from upload
     * @param {typeFile} file file object
     * @param {Upload} parent parent class
     * @return void
     */
    static updateFileData(file: typeFile, parent: Upload) : void {
        if (file.file instanceof File){
            const condImg = this.isPreviewAbleImage(file);
            const condVideo = this.isPreviewAbleVideo(file);
            parent.files.update({
                'id' : file.id,
                'size' : formatFileSize(file.file.size, 2),
                'name' : file.file.name,
                'isPreviewAble' : condImg || condVideo,
            } as typeFile, parent);
        }
    }
    /**
     * @description image is previewAble
     * @param {typeFile} file current file
     * @return {boolean}
     */
    static isPreviewAbleImage(file: typeFile) : boolean {
        return file.file instanceof File && file.file.type.includes('image');
    }
    /**
     * @description video is previewAble
     * @param {typeFile} file current file
     * @return {boolean}
     */
    static isPreviewAbleVideo(file: typeFile) : boolean {
        return file.file instanceof File && (file.file.type.includes('video/mp4') || file.file.type.includes('video/webm') || file.file.type.includes('video/ogg'));
    }
    /**
     * @description render dom element if available
     * @param {typeFile} file current file
     * @param {Upload} parent
     * @return void
     */
    static previewEvent(file: typeFile, parent: Upload): void {
       this.fileReader(file, parent).catch((err : Error) => {
            console.error(library.constants.prefixError + ' failed to set preview', err);
        })
    }
    /**
     * @description read file / get preview
     * @param {typeFile} file file object
     * @param {Upload} parent parent class
     * @return {Promise<void>}
     */
    static fileReader(file : typeFile, parent: Upload) : Promise<void> {
        return new Promise((resolve: any) => {
            const startCheck = !!((file.file && file.file instanceof File && parent)) as boolean;
            const repeatCheck = !!(file.url && parent) as boolean;
            if (startCheck || repeatCheck && file.isPreviewAble) {
                const canvas : HTMLCanvasElement = document.createElement('canvas');
                const blob : Blob|null = parent.blob(<string>((file.file instanceof File) ? file.file.name : file.name), file.id);
                if (blob instanceof Blob){
                    this.loadCache(file, parent, canvas, blob).then(() => resolve()).catch((err : Error) => {
                        console.error(library.constants.prefixError + ' failed to load preview from cache.', err);
                    });
                } else {
                    this.loadPreview(file, parent, canvas).then(() => resolve()).catch((err : Error) => {
                        console.error(library.constants.prefixError + ' failed to load preview.', err);
                        resolve();
                    });
                }
            }
        })
    }
    /**
     * @description load preview from request / not stored yet
     * @param {typeFile} file file
     * @param {Upload | null} parent main class
     * @param {HTMLCanvasElement} canvas html canvas
     * @return {Promise<void>}
     */
    static loadPreview(file: typeFile, parent: Upload, canvas: HTMLCanvasElement) : Promise<void>{
        return new Promise((resolve: any) => {
            if (file.file instanceof File){
                console.log(library.functions.isPreviewAbleImage(file))
                if (library.functions.isPreviewAbleVideo(file)) {
                    renderVideoThumb(file, canvas).then(() => {

                    }).catch(() => {
                        console.error(library.constants.prefixError + ' failed to load preview');
                    });
                } else if(library.functions.isPreviewAbleImage(file)) {
                    const request = new XMLHttpRequest();
                    request.open('GET', URL.createObjectURL(file.file), true);
                    request.responseType = 'blob';
                    request.onload = function () {
                        const reader = new FileReader();
                        reader.readAsDataURL(request.response);
                        reader.onload = function (e: any) {
                            const blob = request.response;
                            if (blob instanceof Blob){
                                if(file.file instanceof File) parent.blob(file.file.name, file.id, blob)
                                else if (file.name) parent.blob(file.name, file.id, blob)
                            }
                            const image = new Image();
                            image.src = e.target.result;
                            const updatedFile : typeFile|null = parent.files.update({
                                'id' : file.id,
                                'url' : e.target?.result,
                                'isPreviewAble': true,
                                'preview': canvas
                            } as typeFile, parent);
                            if (updatedFile) {
                                renderPreview(updatedFile, image, canvas).then(() => {
                                    parent.files.load(updatedFile);
                                }).catch(() => {
                                    console.error(library.constants.prefixError + ' failed to load preview');
                                })
                            }
                            resolve();
                        };
                    };
                    request.onerror = function () {
                        console.error(library.constants.prefixError + ' error failed to load file');
                        resolve();
                    }
                    request.onabort = function () {
                        console.error(library.constants.prefixError + ' abort file load');
                        resolve();
                    }
                    request.send();
                }
            } else {
                resolve();
            }
        });
    }
    /**
     * @description load image from cache / blob
     * @param {typeFile} file
     * @param {Upload} parent parent class
     * @param {HTMLCanvasElement} canvas
     * @param {Blob} blob blob stored in js
     * @return {Promise<void>}
     */
    static loadCache(file: typeFile, parent: Upload, canvas: HTMLCanvasElement, blob: Blob) : Promise<unknown> {
        return new Promise((resolve : any) => {
            const url :string =  URL.createObjectURL(blob)
            const image = new Image();
            image.src = url;
            const updatedFile : typeFile|null = parent.files.update({
                'id' : file.id,
                'preview' : canvas,
                'isPreviewAble': true,
            } as typeFile, parent)
            if (updatedFile) {
                renderPreview(updatedFile, image, canvas).then(()=> {
                    parent.files.load(updatedFile)
                    resolve();
                }).catch(() => {
                    resolve();
                })
            }
        })
    }
    /**
     * @description validate url
     * @param {string} url url to validate
     * @return {boolean} is valid url
     */
    static validateUrl(url :string) : boolean {
        const pattern = /^(https?:\/\/)?((([a-zA-Z\d]([a-zA-Z\d-]*[a-zA-Z\d])*)\.)+[a-zA-Z]{2,})(:\d+)?(\/[-a-zA-Z\d%_.~+()/:=]*)*(\?[;&a-zA-Z\d%_.~+=-]*)?(#[-a-zA-Z\d_]*)?$/;
        return pattern.test(url);
    }
    /**
     * @description check if url is on same domain as current
     * @param {string|null} url external url
     * @return boolean
     */
    static isSameDomain(url: string|null = null) : boolean {
        if (typeof url !== 'string') return false
        const parsedUrl = new URL(url);
        const currentOrigin = window.location.origin;
        return (
            parsedUrl.origin === currentOrigin ||
            parsedUrl.hostname === 'localhost'
        );
    }
    /**
     * @description check if url is youtube
     * @param {string|null} url
     * @return boolean
     */
    static isYouTubeURl(url : string| null) : boolean {
        const parsedUrl = new URL(url ? url : '');
        return (
            parsedUrl.hostname === 'www.youtube.com' ||
            parsedUrl.hostname === 'youtube.com' ||
            parsedUrl.hostname === 'youtu.be'
        );
    }
    /**
     * @description generate custom event
     * @param {string} key string value
     * @param {any} detail data
     * @return {CustomEvent} CustomEvent
     */
    static customEvent(key: string, detail: any) : CustomEvent{
        return new CustomEvent(key, {detail: detail});
    }
    /**
     * @description validate if correct type of file is upload / external otherwise throw error
     * @param {typeFile} file
     * @param {Tabs} activeTab
     * @param {Upload} parent main class
     * @return {Promise} void
     */
    static validateCorrectUploadType(file: typeFile, activeTab : Tabs, parent : Upload) : Promise<typeFile> {
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
    /**
     * @description clean up url
     * @param {string} url string params clean up after ?
     * @return string should be clear url
     */
    static cleanUrl(url : string){
        const index = url.indexOf('?');
        if (index !== -1) {
            return url.substring(0, index);
        }
        return url;
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
            setTimeout(() => {
                const clientWidth = file.previewElement?.clientWidth;
                const clientHeight = library.constants.previewHeight * parseFloat(getComputedStyle(document.documentElement).fontSize);
                if (clientHeight && clientWidth) {
                    const size : canvasSize = calculateCanvasSize(clientWidth, clientHeight, image.width, image.height);
                    canvas.width = size.width;
                    canvas.height = size.height;
                    canvas.setAttribute('data-width', String(size.width));
                    canvas.setAttribute('data-height', String(size.height))
                    const ctx : CanvasRenderingContext2D | null = canvas.getContext('2d');
                    if (ctx) ctx.drawImage(image, size.left, size.top, size.width, size.height);
                } else {
                    console.dir(file.previewElement, clientHeight)
                    console.error(library.constants.prefixError + ' dom missing width / height');
                }
                resolve();
            }, 0)
        }, false);
        image.addEventListener("error", function() {
            console.error(library.constants.prefixError + ' failed to load image');
            resolve();
        }, false)
    }))
}
/**
 * @description render thumbnail of video if possible else not
 * @param {typeFile} file active file
 * @param {HTMLCanvasElement} canvas element to render thumbnail on
 * @return {Promise}
 */
function renderVideoThumb(file : typeFile, canvas: HTMLCanvasElement) : Promise<unknown> {
    return new Promise((resolve: any) => {
        console.log('preview video')
        const video = document.createElement("video");
        //video.src = URL.createObjectURL(file);
        video.preload = "metadata";
        video.muted = true;
    });
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
 * @description match user agent
 * @param {RegExp} pattern
 * @return {boolean}
 */
export function userAgent(pattern : RegExp) : boolean {
    if (typeof window !== 'undefined' && window.navigator) {
        return !!(navigator.userAgent.match(pattern));
    }
    return false;
}