import {typeFile} from "./file";

export type typeFileList = {
    list : typeFile[],
    callback : ((files : typeFile[]) => void)| null
    update: ((item : typeFile) => void)
}
