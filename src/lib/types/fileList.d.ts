import {type Tabs, typeFile} from "$lib";

export type typeFileList = {
    list : typeFile[],
    callback : ((files : typeFile[]) => void)| null
    update: ((item : typeFile, tabActive : Tabs) => void),
    delete: ((item : typeFile) => void)| null,
}
