import type {typeFileList} from "../../types/fileList";
import {generateId} from "./events";
import type {typeFile} from "../../types/file";

/**
 * @description data object
 * @type {typeFileList} hold data of files
 */
export const filesList = {
    list: <typeFile[]>[],
    callback: <((files : typeFile[]) => void)| null> null,
    /**
     * @description add
     * @param {typeFile} item
     * @return void
     */
    update: function (item : typeFile) : void {
        if (item.hasOwnProperty('id') && typeof item.id === 'string'){
            const find = this.list.find((file : typeFile) => {
                if (item.id === file.id) return file;
            })
            if (find && find as typeFile){
                const index : number = this.list.indexOf(find);
                if (index > -1){
                    this.list[index] = item;
                    if (typeof this.callback === 'function') this.callback(this.list.filter((file: typeFile) => file.type === item.type));
                }
            }
        } else {
            item.id = generateId(30);
            this.list.push(item);
        }
    },
    delete: function (item : typeFile) : void {
        this.list = this.list.filter((file: typeFile) => file.id !== item.id)
        this.callback(this.list);
    }
}