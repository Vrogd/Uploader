import {filesList} from "./files";
import {Events} from "./events";
import type {Tabs} from "$lib";
import type {typeFile} from "$lib";
import type {fileBlob} from "$lib";
import type {adjustOptions} from "../types/adjustOptions";
import {library} from "$lib";

/**
 * @description upload class
 * @class Upload
 * @constructor {typeOptions} object
 */
export class Upload {
    private fallback: boolean = false;
    public maxAmountOfFiles : number = 5;
    public component : null|HTMLElement = null;
    public input: null| HTMLElement = null;
    public files = filesList;
    public backend : boolean = false; // enable file request if not add ad callback event
    public tabActive : Tabs = 'image';
    public windowBlobList : string = 'UploadBlobs';
    public options : adjustOptions  = {
        requestUrl: '/file',
        enableExternal : true,
        enableImage: true,
        enableVideo : true,
        enableCrop: false,
        enableOther : true,
        enableBackend: true,
        imageExtensions: [],
        videoExtensions: [],
        otherExtensions: []
    }
    constructor(object: unknown | undefined, fallback : boolean = false) {
        this.setSettings(object);
        this.fallback = fallback;
    }
    /**
     * @description set files
     * @param {typeFile[]} files new files
     * @return void
     */
    public setFiles(files : typeFile[]) : void {
        this.files.list = files;
    }
    /**
     * @description set settings
     * @param {typeOptions} options all options
     * @return void
     */
    private setSettings = (options : any | undefined) : void => {
        if (options.requestUrl) this.options.requestUrl = options.requestUrl;
        if (options.wrapper) this.dom(options.wrapper);
        if (options.blobList) this.windowBlobList = options.blobList;
        if (typeof options.backend === 'boolean') this.options.enableBackend = options.backend
        else this.options.enableBackend = library.constants.enableBackend;
        if (typeof options.enableImage === 'boolean') this.options.enableImage = options.enableImage;
        if (typeof options.enableVideo === 'boolean') this.options.enableVideo = options.enableVideo;
        if (typeof options.enableOther === 'boolean') this.options.enableOther = options.enableOther;
        if (typeof options.enableCrop === 'boolean') this.options.enableCrop = options.enableCrop;
        this.options.imageExtensions = Array.isArray(options.imageExtensions) ? options.imageExtensions : library.constants.imageDefaultExtensions;
        this.options.videoExtensions = Array.isArray(options.videoExtensions) ? options.videoExtensions : library.constants.videoDefaultExtensions;
        if (Array.isArray(options.otherExtensions)) this.options.otherExtensions = options.otherExtensions;
        if (typeof options.maxFiles === 'number') this.maxAmountOfFiles = options.maxFiles;
    }
    /**
     * @description on change event file list
     * @param {Event} e upload event change
     * @return void
     */
    private eventChange = (e : Event) : void => {
        if (e.target instanceof HTMLInputElement && e.target.files instanceof FileList && Object.keys(e.target.files).length){
            for (const file of e.target.files){
                if (file instanceof File) Events.upload(this, library.functions.new(file, this.tabActive));
            }
        }
    }
    /**
     * @description default event upload
     * @return void
     */
    public eventUpload = () : void => {
        if (this.input instanceof HTMLInputElement) this.input.click();
    }
    /**
     * @description drop file inside block
     * @param {DragEvent} e event from dragging
     * @return void
     */
    public eventDrop = (e : DragEvent) : void => {
        if (e.dataTransfer && "files" in e.dataTransfer) {
            const files = e.dataTransfer.files;
            for (const file of files){
                if (file instanceof File) Events.upload(this, library.functions.new(file, this.tabActive));
            }
        }
    }
    /**
     * @description prevent default event
     * @param {event} e event
     * @return void
     */
    public eventPrevent = (e : Event) : void => {
        e.preventDefault();
    }
    /**
     * @description switch tabs
     * @param {Tabs} key tab name
     * @return void
     */
    public switch = (key : Tabs) : void => {
        if (this.tabActive !== key) {
            this.tabActive = key;
            this.files.queue(this.files.list.filter((file: typeFile) => file.type === this.tabActive));
        }
    }
    /**
     * @description add event listeners
     * @info function is set on mount if triggered multiple times retrigger list
     * @param {HTMLElement | Element} wrapper dom element
     * @return void
     */
    public dom = (wrapper? : HTMLElement | Element) : void  => {
        if (wrapper && wrapper instanceof HTMLElement && !this.component){
            this.component = wrapper;
            this.input = wrapper.querySelector('input[type="file"]');
            if (this.input instanceof HTMLElement){
                this.input.addEventListener('change', (e : Event) : void => this.eventChange(e));
            }
            const controller = new AbortController();
            const { signal } = controller;

            const preventDefault: (e:Event) => void  = (e: Event) => {
                e.preventDefault();
                e.stopPropagation();
            };

            // Attach listeners with AbortController signal
            window.addEventListener('dragover', preventDefault, { signal });
            window.addEventListener('drop', preventDefault, { signal });
        }
    }
    /**
     * @description download file
     * @param {typeFile} file file object
     * @return void
     */
    public download : (file : typeFile) => void = (file : typeFile) : void => {
        try {
            if (file.url){
                const link: HTMLAnchorElement = document.createElement("a");
                if (typeof file.name === "string") link.download = file.name;
                link.href = file.url;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                if (this.component) this.component.dispatchEvent(library.functions.customEvent(library.constants.downloadEvent, file));
            }
        } catch (e){
            console.error(library.constants.prefixError + ' failed to download file image');
        }
    }
    /**
     * @description delete file
     * @param {typeFile} file file object
     * @return void
     */
    public delete : (file : typeFile) => void = (file : typeFile) : void => {
        if (typeof this.files.delete === 'function') this.files.delete(file);
        if(this.component) this.component.dispatchEvent(library.functions.customEvent(library.constants.deleteEvent, file));
    }
    /**
     * @description check if crop can be shown
     * @param {typeFile} file file object
     * @return boolean
     */
    public hasCrop : (file : typeFile) => boolean = (file : typeFile) : boolean => {
        return (this.options.enableImage && file.type === 'image' && !file.external && this.options.enableCrop);
    }
    /**
     * @description check if it needs to show on top
     * @return {boolean} show or not
     */
    public showButtons :() => boolean = () : boolean => {
        return [this.options.enableImage, this.options.enableVideo,this.options.enableOther].filter(Boolean).length > 1;
    }

    /**
     * @description check if crop can be shown
     * @param {typeFile} file file object
     * @return void
     */
    public crop : (file : typeFile) => void = (file: typeFile) : void => {
        if (this.component) this.component.dispatchEvent(library.functions.customEvent(library.constants.cropEvent, file));
    }
    /**
     * @description save / get blob to window list / based on change date
     * @param {string} url current file url / name
     * @param {string|Number} id id
     * @param {Blob} blob blob element
     * @return {Blob|void}
     */
    public blob = (url: string, id : string|number, blob : Blob|null = null) : Blob | null => {
        const blobListKey = this.windowBlobList as keyof typeof window;
        if (!Array.isArray(window[blobListKey])){
            (window[blobListKey] as any[]) = [];
        }
        if (blob instanceof Blob){
            const newObject: fileBlob = {
                'url' : url,
                'blob' : blob,
                'id' : id
            }
            window[blobListKey].push(newObject);
        } else if (Object.keys(window[blobListKey]).length){
            const hasObject = (window[blobListKey].find((item : any) => {
                if (item.url === url) return item;
            }));
            if (hasObject) return hasObject.blob;
        }
        return null;
    }
    /**
     * @description if other tab show different dat / no preview / compact
     * @return {boolean}
     */
    public isCompact = () : boolean => {
        return this.tabActive === 'other' && this.options.enableExternal;
    }
}

export default Upload