export const constants = {
    previewExtensions : <string[]> ['png', 'jpg', 'jpeg', 'webp'],
    previewVideoExtensions : <string[]>  ['mp4'],
    imageDefaultExtensions : <string[]>  ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'],
    videoDefaultExtensions : <string[]>  ['mp4', 'mpg', 'webm', 'avi'],
    defaultCropEnabled : <boolean> false,
    prefixError: <string> '[Upload]',
    previewBorderSpace: <number> 2,
    previewHeight: <number> 7, // height of preview
    previewSizeLimit: <number> 50,
    uploadEvent: <string>'customUpload',
    deleteEvent: <string>'customDelete',
    downloadEvent: <string>'customDownload',
    CropEvent: <string>'customCrop',
} as const