import Upload from './Upload.svelte';

import {Upload as Class} from "./library/class";
import {objectInstance} from "./library/events";

export const library = {
   'upload' : Class,
   'objectInstance': objectInstance,
}
// remove when debugging
export default Upload;

export { Upload as Upload };