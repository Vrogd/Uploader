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
                    reader.onload =  function(e: any){
                        const image = new Image();
                        image.src = e.target.result;
                        resolve()
                        image.onload = function (){
                            const canvas = document.createElement('canvas');
                            canvas.width = image.width;
                            canvas.height = image.height;
                            const ctx = canvas.getContext('2d');
                            if (ctx instanceof CanvasRenderingContext2D){
                                ctx.drawImage(image,0,0);
                                file.preview = canvas;
                            }
                            if (file.previewElement instanceof HTMLElement){
                                file.previewElement.appendChild(canvas)
                            }
                            filesList.update(file);
                        }
                    };
                };
                request.send();
            }
        })
    }
}