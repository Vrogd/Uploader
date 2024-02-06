import {typeFile} from "./file";

export type typeOptions =  {
    wrapper? : HTMLElement | Element,
    maxAmountOfFiles?: number,
    uploadCallback?: (file: typeFile) => void | boolean
    enableImage ?: boolean,
    enableVideo ?: boolean,
    enableOther ?: boolean
}
