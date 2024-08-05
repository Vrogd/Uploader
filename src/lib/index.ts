import Upload from './Upload.svelte';

import {Upload as Class} from "./library/class";
import {objectInstance} from "./library/events";

export const library = {
   'upload' : Class,
   'objectInstance': objectInstance,
}

export { Upload as Upload };
// remove when debugging
export default Upload;

