import { Upload as Class } from "./library/class";
import {Functions} from "./library/functions";
import { constants } from "./library/constants";

/**
 * @description one object for all useful / required data
 * @const library
 */
export const library = {
   'upload': Class,
   'functions': Functions,
   'constants': constants
};


// types
export type { typeFile } from "./types/file";
export type { Tabs } from "./types/tabs";
export type { typeOptions } from './types/options';
export type { fileBlob } from './types/fileBlob';
// component
export { default as Upload } from './Upload.svelte';
