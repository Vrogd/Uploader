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
     * @return void
     */
    updateFileData(file : typeFile, parent: Upload) : void {
        if (file.file instanceof File){
            file.size = formatFileSize(file.file.size, 2);
            file.name = file.file.name;
            if (file.file.type.includes('image') && !file.isPreviewAble){
                objectInstance.fileReader(file).then(() => {
                    filesList.update(file);
                    parent.component.dispatchEvent(customEvent(constants.uploadEvent, file));
                    console.log(parent, 'class')
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
     * @return void
     */
    fileReader(file : typeFile) : Promise<void> {
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
                        file.url = image.src;
                        renderPreview(file, image, canvas).then(()=>{
                            filesList.update(file);
                        })
                    };
                };
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
 * @return void
 */
function renderPreview(file : typeFile, image: HTMLImageElement, canvas : HTMLCanvasElement) : Promise<unknown> {
    return new Promise(((resolve: unknown) => {
        image.onload = function (){
            calculateCanvasSize(file.previewElement.clientWidth, file.previewElement.clientHeight, image.width, image.height).then((size) => {
                canvas.width = size.width;
                canvas.height = size.height;
                canvas.setAttribute('data-width', String(size.width));
                canvas.setAttribute('data-height', String(size.height))
                const ctx = canvas.getContext('2d');
                //observer(file, canvas, image);
                ctx.drawImage(image, 0, 0, size.height, size.width);
            })
            resolve();
        }
        image.onerror = function (){
            console.error(constants.prefixError + ' failed to load image');
            resolve();
        }
    }))

}

/**
 * @description observe html changes size
 * @param {typeFile} file current file
 * @param {HTMLCanvasElement} canvas html element of canvas
 * @param {HTMLImageElement} image current image
 * @return void
 */
function observer(file:typeFile, canvas : HTMLCanvasElement, image: HTMLImageElement) : void {
    const resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
       for (const entry: ResizeObserverEntry of entries){
           const width : number = Math.round(entry.contentRect.width);
           const height: number = Math.round(entry.contentRect.height);
           const oldWidth: number = Math.round(canvas.width);
           const oldHeight : number = Math.round(canvas.height)

           if (width > constants.previewSizeLimit || height > constants.previewSizeLimit){
               calculateCanvasSize(width, height, oldWidth, oldHeight).then((size: canvasSize) => {
                   canvas.width = size.width;
                   canvas.height = size.height;
                   const ctx = canvas.getContext('2d');
                   ctx.drawImage(image, size.left, size.top, size.height, size.width);
               });
           }
       }
    });
    resizeObserver.observe(file.previewElement);
}

/**
 * @description calculate canvas size on resize
 * @param {number} domWidth current dom width
 * @param {number} domHeight current dom height
 * @param {number} width current image width
 * @param {number} height current image height
 * @return Promise<canvasSize|object>
 */
function calculateCanvasSize(domWidth : number, domHeight : number, width : number, height: number) : Promise<canvasSize> {
    return new Promise((resolve: unknown) => {
        let newWidth, newHeight, newTop = 0, newLeft = 0;
        const widthBigger = domWidth > domHeight;
        if (widthBigger){
            newWidth = Math.round(domWidth * ((100 - constants.previewBorderSpace) / 100));
            newHeight = Math.round(newWidth * (width/ height));
        } else {
            newHeight = Math.round(domHeight * ((100 - constants.previewBorderSpace) / 100));
            newWidth = Math.round(newHeight * (height / width));
        }

        if (width >= height){
            newTop = Math.round((domHeight - height) / 2);
        } else {
            newLeft = Math.round((domWidth - width) / 2);
        }
        resolve({
            'width': newWidth,
            'height': newHeight,
            'top': newTop,
            'left': newLeft
        });
    })
}

/**
 * @description generate custom event
 * @param {string} key
 * @param detail
 */
function customEvent(key: string, detail: any){
    return new CustomEvent(key, {detail: detail});
}

export default objectInstance;