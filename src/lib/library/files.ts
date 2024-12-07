import type {Tabs, typeFile} from "$lib";
import type {typeFileList} from "$lib/types/fileList";
import {generateId} from "$lib/library/functions";

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
     * @param {Tabs} tabActive active tab
     * @return void
     */
    update: function (item : typeFile, tabActive : Tabs) : void {
        const find = this.list.find((file: typeFile) => {
            return item.hasOwnProperty('id') && item.id === file.id;
        });
        if (find && find as typeFile){
            const index : number = this.list.indexOf(find);
            if (index > -1){
                if (typeof item.failed === 'boolean' && !item.failed) item.completed = false
                if (item.completed) item.failed = false;
                this.list[index] = merge(this.list[index], item);
                this.queue(this.list.filter((file: typeFile) => file.type === tabActive));
            }
        } else {
            if (!item.id){
                item.id = generateId(40);
            }
            this.list.push(item);
            this.queue(this.list.filter((file: typeFile) => file.type === tabActive));
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
     * @param {typeFile} item
     * @return {void}
     */
    delete: function (item : typeFile) : void {
        this.queue(this.list.filter((file: typeFile) => file.id !== item.id));
    },
    timeout: null,
    /**
     * @description use callback to update list
     * @param {typeFile[]} files
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
