export type adjustOptions =  {
    requestUrl: string
    timeout: number
    enableExternal : boolean,
    enableImage: boolean,
    enableVideo : boolean,
    enableOther : boolean,
    enableBackend: boolean,
    enableCrop: boolean,
    imageExtensions: string[],
    videoExtensions: string[],
    otherExtensions: string[]
}
