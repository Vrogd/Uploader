import Upload from './Upload.svelte';
export default Upload;

export const library = {
   'upload' : import("./library/class"),
   'objectInstance': import('./library/events'),
}

export { Upload as Upload };