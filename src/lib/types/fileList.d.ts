import {type Tabs, typeFile} from "$lib";

export type typeFileList = {
    list : typeFile[],
    callback : ((files : typeFile[]) => void)| null
    update: ((item : typeFile, tabActive : Tabs) => void),
    find: ((id : string) => typeFile|undefined|null),
    delete: ((item : typeFile) => void)| null,
}
