import type {Tabs} from "./tabs";

export type typeFile = {
    id? : string,
    url? : string | null,
    file? : File | Blob | string,
    progress?: Number | null,
    completed? : boolean | null
    failed: boolean
    isPreviewAble: boolean
    preview: null | HTMLCanvasElement,
    previewElement ?: null | HTMLElement
    name: string | null,
    size: string | null | number
    type: Tabs | string
    external: boolean | null
}
