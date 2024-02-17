export const constants = {
    previewExtensions : <string[]> ['png', 'jpg', 'jpeg', 'webp'],
    previewVideoExtensions : <string[]>  ['mp4'],
    imageDefaultExtensions : <string[]>  ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'],
    videoDefaultExtensions : <string[]>  ['mp4', 'mpg', 'webm', 'avi'],
    prefixError: <string> '[Upload]',
    customUpdateEvent: <string> 'fileUpdate',
    previewBorderSpace: <number> 2,
    previewSizeLimit: <number> 50
} as const