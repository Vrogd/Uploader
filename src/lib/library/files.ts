import {type typeFile} from "$lib";
import type {typeFileList} from "$lib/types/fileList";
import {generateId} from "$lib/library/functions";
import type Upload from "./class";

/**
 * @description data object
 * @type {typeFileList} hold data of files
 */
export const filesList: typeFileList = {
    list: <typeFile[]>[],
    callback: <((files : typeFile[]) =>  typeFile[])| null> null,
    /**
     * @description add data / item
     * @param {typeFile} item current item
     * @param {Upload} parent
     * @return void
     */
    update: function (item : typeFile, parent: Upload) : typeFile|null {
        const find : typeFile|undefined = this.list.find((file: typeFile) => {
            return item.hasOwnProperty('id') && item.id === file.id;
        });
        if (find && find as typeFile){
            const index : number = this.list.indexOf(find);
            if (index > -1){
                if (typeof item.failed === 'boolean' && !item.failed) item.completed = false
                if (item.completed) item.failed = false;
                this.list[index] = merge(this.list[index], item);
                console.log(item)
                this.queue(this.list.filter((file: typeFile) => file.type === parent.tabActive));
                return this.list[index] as typeFile;
            }
        } else {
            if (!item.id){
                item.id = generateId(40);
            }
            this.list.push(item);
            this.queue(this.list.filter((file: typeFile) => file.type === parent.tabActive));
            return item;
        }
        return null;
    },
    load: function (item : typeFile) : void {
        if (item.preview instanceof HTMLCanvasElement && item.previewElement){
            const wrapper = item.previewElement.querySelector('.preview .wrapper');
            if (wrapper instanceof HTMLDivElement){
                if (wrapper.firstChild !== item.preview) {
                    wrapper.replaceChildren(item.preview)
                }
            }
        }
    },
    /**
     * @description find object before every update
     * @param {string} id id of file
     * @return {typeFile|null}
     */
    find: function (id : string): typeFile | null {
        return <typeFile | null>this.list.find((file: typeFile) => {
            return id === file.id;
        });
    },
    /**
     * @description delete file from list
     * @param {typeFile} item current file to remove
     * @return {void}
     */
    delete: function (item : typeFile) : void {
        this.list = this.list.filter((file: typeFile) => file.id !== item.id);
        this.queue(this.list);
    },
    timeout: null,
    /**
     * @description use callback to update list
     * @param {typeFile[]} files new list of files
     * @return void
     */
    queue: function (files : typeFile[]) : void {
        if (typeof this.callback === 'function') this.callback(files);
    }
}

/**
 * overwrite first with second object
 * @param {typeFile} obj1
 * @param {typeFile} obj2
 */
function merge(obj1 : any, obj2 : any) {
    for (let key in obj2) {
        obj1[key] = obj2[key];
    }
    return obj1;
}
