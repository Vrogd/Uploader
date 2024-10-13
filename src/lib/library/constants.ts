export const constants = {
    enableBackend : <boolean> false,
    booleanSettings : <string[]> [],
    previewExtensions : <string[]> ['png', 'jpg', 'jpeg', 'webp'],
    previewVideoExtensions : <string[]>  ['mp4'],
    imageDefaultExtensions : <string[]>  ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'],
    videoDefaultExtensions : <string[]>  ['mp4', 'mpg', 'webm', 'avi'],
    defaultCropEnabled : <boolean> false,
    timeoutEvents: <number> 100,
    prefixError: <string> '[Upload]',
    previewBorderSpace: <number> 2,
    previewHeight: <number> 7, // height of preview
    previewSizeLimit: <number> 50,
    uploadEvent: <string>'customUpload',
    deleteEvent: <string>'customDelete',
    downloadEvent: <string>'customDownload',
    cropEvent: <string>'customCrop',
    domLoadEvent: <string> 'customDomLoad'
} as const