import Upload from './Upload.svelte';

import { Upload as Class } from "./library/class";
import { functions } from "./library/functions";

export const library = {
   'upload': Class,
   'functions': functions,
};

// types
export type { typeFile as File } from "../types/file";
export type { Tabs as Tabs } from "../types/tabs";
export type { typeOptions as Options } from '../types/options';
export type { fileBlob as FileBlob } from '../types/fileBlob';
// component
export { Upload as Upload };
