import {constants} from "./constants";
import {filesList} from "./files";
import {formatFileSize} from "./functions";
import type {typeFile} from "../../types/file";
import type {canvasSize} from "../../types/size";
import type {Tabs} from "../../types/tabs";
import {Upload} from "./class";

/**
 * @description update and create of files
 * @type {object} objectInstance
 */
export const objectInstance = {
    /**
     * @description create new instance
     * @param {File} file file upload or drag
     * @param {Tabs} tab active tab
     * @return {typeFile} new file object
     */
    new : function (file : File, tab: Tabs ) {
        return <typeFile> {
            'file': file,
            'progress': 0,
            'isPreviewAble' : false,
            'preview': null,
            'name': null,
            'size': null,
            'type' : tab
        }
    },
    update: function (){

    },
    /**
     * @description create new instance
     * @param {typeFile} file file object
     * @param {Upload} parent
     * @return void
     */
    updateFileData(file : typeFile, parent: Upload) : void {
        if (file.file instanceof File){
            file.size = formatFileSize(file.file.size, 2);
            file.name = file.file.name;
            if (file.file.type.includes('image') && !file.isPreviewAble){
                objectInstance.fileReader(file, parent).then(() => {
                    filesList.update(file);
                }).catch((e) => {
                    console.error(constants.prefixError + ' failed to set preview', e);
                })
            } else {
                filesList.update(file);
                parent.component.dispatchEvent(customEvent(constants.uploadEvent, file));
            }
        }
    },
    /**
     * @description read file / get preview
     * @param {typeFile} file file object
     * @param {Upload} parent
     * @return void
     */
    fileReader(file : typeFile, parent: Upload| undefined) : Promise<void> {
        return new Promise((resolve: any) => {
            if (file.file && file.file instanceof File){
                const request = new XMLHttpRequest();
                request.open('GET', URL.createObjectURL(file.file), true);
                request.responseType = 'blob';
                request.onload = function() {
                    if (request.status === 200) {
                        // todo store blob later
                    }
                    const reader = new FileReader();
                    const canvas = document.createElement('canvas');
                    reader.readAsDataURL(request.response);
                    reader.onload =  function(e: any){
                        file.isPreviewAble = true
                        file.preview = canvas;
                        const image = new Image();
                        image.src = e.target.result;
                        renderPreview(file, image, canvas).then(()=>{
                            file.url = e.target.result;
                            filesList.update(file);
                            if (parent) parent.component.dispatchEvent(customEvent(constants.uploadEvent, file));
                        })
                    };
                };
                request.onerror = function (){
                    console.log('error')
                    if (parent) parent.component.dispatchEvent(customEvent(constants.uploadEvent, file));
                }
                request.onabort = function (){
                    console.log('abort')
                    if (parent) parent.component.dispatchEvent(customEvent(constants.uploadEvent, file));
                }
                request.send();
                resolve();
            }
        })
    },
    /**
     * @description render dom element if available
     * @param {typeFile} file current file
     * @param {HTMLElement} node dom element
     * @return void
     */
    previewEvent(file : typeFile, node : HTMLElement): void{
        if(file.preview instanceof HTMLCanvasElement){
            node.appendChild(file.preview)
        }
    }
}

/**
 * @description show image in canvas
 * @param {typeFile} file current file
 * @param {HTMLImageElement} image
 * @param canvas
 * @return {Promise<unknown>}
 */
function renderPreview(file : typeFile, image: HTMLImageElement, canvas : HTMLCanvasElement) : Promise<unknown> {
    return new Promise(((resolve: unknown) => {
        image.addEventListener("load", function() {
            setTimeout(() => {
                const clientWidth = file.previewElement?.parentElement.clientWidth;
                const clientHeight = file.previewElement?.parentElement.clientHeight;
                const size = calculateCanvasSize(clientWidth, clientHeight, image.width, image.height);
                canvas.width = size.width;
                canvas.height = size.height;
                canvas.setAttribute('data-width', String(size.width));
                canvas.setAttribute('data-height', String(size.height))
                const ctx = canvas.getContext('2d');
                ctx.drawImage(image, size.left, size.top);
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
 * @description observe html changes size
 * @param {HTMLElement} dom
 * @param {typeFile[]} files
 * @return void
 */
export function observer(dom: HTMLElement, canvas : HTMLCanvasElement, image: HTMLImageElement) : void {
    const resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
        console.log(entries)
       for (const entry: ResizeObserverEntry of entries){
           const width : number = Math.round(entry.contentRect.width);
           const height: number = Math.round(entry.contentRect.height);
           const oldWidth: number = Math.round(canvas.width);
           const oldHeight : number = Math.round(canvas.height)

           if (width > constants.previewSizeLimit && height > constants.previewSizeLimit){
               const size:canvasSize = calculateCanvasSize(width, height, oldWidth, oldHeight);
               canvas.width = size.width;
               canvas.height = size.height;
               const ctx = canvas.getContext('2d');
               ctx.drawImage(image, size.left, size.top, size.height, size.width);
           }
       }
    });
    resizeObserver.observe(dom);
}

/**
 * @description calculate canvas size on resize
 * @param {number} domWidth current dom width
 * @param {number} domHeight current dom height
 * @param {number} width current image width
 * @param {number} height current image height
 * @return Promise<canvasSize|object>
 */
function calculateCanvasSize(domWidth : number, domHeight : number, width : number, height: number) : canvasSize {
    let newWidth, newHeight, newTop = 0, newLeft = 0;
    const testWidth = Math.abs(domWidth - width);
    const testHeight = Math.abs(domHeight - height);
    const testWidth2 = domWidth  < width;
    const testHeight2 = domHeight < height;
    if (testWidth  >= testHeight){
        if (testWidth2){
            console.log(1)
            newWidth = Math.floor(width * ((100 - constants.previewBorderSpace) / 100));
            newHeight = Math.floor(newWidth * (height/ width));
        } else {
            console.log(2)
            newHeight = Math.floor(domHeight * ((100 - constants.previewBorderSpace) / 100));
            newWidth = Math.floor(newHeight * (width / height));
        }
    } else {
        if (testHeight2) {
            console.log(4)
            newWidth = Math.floor(domWidth * ((100 - constants.previewBorderSpace) / 100));
            newHeight = Math.floor(newWidth * (height / width));
        } else {
            console.log(3, testWidth2, domWidth, testHeight2, domHeight)
            newWidth = Math.floor(domWidth * ((100 - constants.previewBorderSpace) / 100));
            newHeight = Math.floor(newWidth * (height / width));
        }
    }
    newLeft =  Math.ceil(((newWidth - width) / 2) / 2) * 2;
    newTop = Math.ceil(((newHeight - height) / 2) / 2) * 2;

    console.log({
        'width': newWidth,
        'height': newHeight,
        'top': newTop,
        'left': newLeft
    }, width, height, domWidth, domHeight)
    return {
        'width': newWidth,
        'height': newHeight,
        'top': newTop,
        'left': newLeft
    };
}

/**
 * @description generate custom event
 * @param {string} key
 * @param {any} detail
 * @return CustomEvent
 */
export function customEvent(key: string, detail: any) : CustomEvent{
    return new CustomEvent(key, {detail: detail});
}

export default objectInstance;