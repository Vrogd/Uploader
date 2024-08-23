import Upload from './Upload.svelte';

import { Upload as Class } from "./library/class";
import { functions } from "./library/events";

export const library = {
   'upload': Class,
   'functions': functions,
};

// types
export type { typeFile as File } from "../types/file";
export type { Tabs as Tabs } from "../types/tabs";
export type { typeOptions as Options } from '../types/options';
// component
export { Upload as Upload };
