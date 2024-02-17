import type {Tabs} from "./tabs";

export type typeFile = {
    id ? : string
    file? : File | Blob | string,
    progress?: Number | null,
    failed: boolean
    isPreviewAble: boolean
    preview: null | HTMLCanvasElement,
    previewElement ?: null | HTMLElement
    name: string | null,
    size: string | null | number
    type: Tabs|string
}
