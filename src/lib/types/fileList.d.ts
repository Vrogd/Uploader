import {typeFile} from "$lib";
import type {Upload} from "./../library/class";
export type typeFileList = {
    list : typeFile[],
    callback : ((files : typeFile[]) =>  void)| null
    update: ((item : typeFile, upload : Upload) => void),
    find: ((id : string) => typeFile|undefined|null),
    delete: ((item : typeFile) => void)| null,
    queue: (files : typeFile[]) => void,
    timeout?: ReturnType<typeof setTimeout> | null,
}
