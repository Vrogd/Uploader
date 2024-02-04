import {generateId} from "./functions";
import type {typeFile} from "../types/file";

export const filesList = {
    list: <typeFile[]>[],
    callback: <((files : typeFile[]) => void)| null> null,
    update: function (item : typeFile){
        if (item.hasOwnProperty('id') && typeof item.id === 'string'){
            const find = this.list.find((file : typeFile) => {
                if (item.id === file.id) return file;
            })
            if (find && find as typeFile){
                const index : number = this.list.indexOf(find);
                if (index > -1){
                    this.list[index] = item;
                    if (typeof this.callback === 'function') this.callback(this.list);
                }
            }
        } else {
            item.id = generateId(30);
            this.list.push(item);
            if (typeof this.callback === 'function') this.callback(this.list);
        }
    }
}