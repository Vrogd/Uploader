import {adjustOptions} from "./adjustOptions";

export type typeOptions =  {
    wrapper? : HTMLElement | Element,
    maxAmountOfFiles?: number,
    imageExtensions ?: string[],
    videoExtensions ?: string[],
    crop ?:boolean
    blobList?: string
    backend: boolean,
    options : adjustOptions
}
