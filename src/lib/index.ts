import { Upload as Class } from "./library/class";
import { functions } from "./library/functions";

export const library = {
   'upload': Class,
   'functions': functions,
};

// types
export type { typeFile } from "./types/file";
export type { Tabs } from "./types/tabs";
export type { typeOptions } from './types/options';
export type { fileBlob } from './types/fileBlob';
// component
export { default as Upload } from './Upload.svelte';
