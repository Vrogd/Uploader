import {constants} from "./constants";
import {filesList} from "./files";
import {formatFileSize} from "./functions";
import type {typeFile} from "../types/file";

/**
 * @description update and create of files
 * @type {object} objectInstance
 */
export const objectInstance = {
    /**
     * @description create new instance
     * @param {File} file file upload or drag
     * @return {typeFile} new file object
     */
    new : function (file : File) {
        return <typeFile> {
            'file': file,
            'progress': 0,
            'isPreviewAble' : false,
            'preview': null,
            'name': null,
            'size': null
        }
    },
    update: function (){

    },
    /**
     * @description create new instance
     * @param {typeFile} file file object
     * @return void
     */
    updateFileData(file : typeFile) : void {
        if (file.file instanceof File){
            file.size = formatFileSize(file.file.size, 2);
            file.name = file.file.name;
            if (file.file.type.includes('image') && !file.isPreviewAble){
                file.isPreviewAble = true
                objectInstance.fileReader(file).then(() => {
                    console.dir('update')
                    filesList.update(file);
                }).catch(() => {
                    console.error(constants.prefixError + ' failed to set preview');
                })
            } else {
                filesList.update(file);
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
                    const reader = new FileReader();
                    const canvas = document.createElement('canvas');
                    reader.readAsDataURL(request.response);
                    reader.onload =  function(e: any){
                        file.preview = canvas;
                        const image = new Image();
                        image.src = e.target.result;
                        renderPreview(file, image, canvas)
                        filesList.update(file);
                    };
                };
                request.send();
                resolve();
            }
        })
    },
    previewEvent(file : typeFile): void{
        //add resize observer to change preview size
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
                const ctx = canvas.getContext('2d');
                const preview = file.previewElement.querySelector('.preview');
                observer(file, canvas, image);
                if (preview instanceof HTMLElement){
                    ctx.drawImage(image, 0, 0, size.height, size.width);
                    preview.appendChild(canvas);
                }
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
           calculateCanvasSize(width, height, oldWidth, oldHeight).then((size) => {
               canvas.width = size.width;
               canvas.height = size.height;
               const ctx = canvas.getContext('2d');
               ctx.drawImage(image,0,0, size.height, size.width);
           });
       }
    });
    resizeObserver.observe(file.previewElement);
}

/**
 * @description calculate canvas size on resize
 * @param {number} domWidth
 * @param {number} domHeight
 * @param {number} width
 * @param {number} height
 * @return Object
 */
function calculateCanvasSize(domWidth : number, domHeight : number, width : number, height: number) : Promise<object> {
    return new Promise((resolve: unknown) => {
        let newWidth, newHeight;
        const widthBigger = domWidth > domHeight;
        const ratio = width/ height;
        if (widthBigger){
            newWidth = Math.round(domWidth * .98);
            newHeight = newWidth * ratio;
        } else {
            newHeight = Math.round(domHeight * .98);
            newWidth = newHeight * ratio;
        }
        resolve({
            'width': newWidth,
            'height': newHeight
        })
    })
}