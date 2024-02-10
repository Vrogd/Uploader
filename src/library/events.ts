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
    fileReader(file : typeFile) : Promise<void> {
        return new Promise((resolve: any) => {
            if (file.file && file.file instanceof File){
                const request = new XMLHttpRequest();
                request.open('GET', URL.createObjectURL(file.file), true);
                request.responseType = 'blob';
                request.onload = function() {
                    const reader = new FileReader();
                    reader.readAsDataURL(request.response);
                    reader.onload = (e: any) => renderPreview(file, e.target.result);
                };
                request.send();
                resolve();
            }
        })
    },
    previewEvent(file : typeFile): void{

    }
}

/**
 * @description show image in canvas
 * @param {typeFile} file
 * @param {string} src
 * @return void
 */
function renderPreview(file : typeFile, src: string){
    const canvas = document.createElement('canvas');
    const image = new Image();
    image.src = src;
    image.onload = function (){
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        file.preview = canvas;
        setTimeout(() => {
            ctx.drawImage(image,0,0);
            file.previewElement.querySelector('.preview').appendChild(canvas);
        }, 0)
        filesList.update(file);
    }
}
