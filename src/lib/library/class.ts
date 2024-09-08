import {filesList} from "./files";
import {upload} from "./events";
import type {typeOptions} from "../../types/options";
import type {Tabs} from "../../types/tabs";
import type {typeFile} from "../../types/file";
import {customEvent, functions} from "./functions"
import {constants} from "./constants";
import type {fileBlob} from "../../types/fileBlob";

/**
 * @description upload class
 * @class Upload
 * @constructor {typeOptions} object
 */
export class Upload {
    private fallback: boolean = false;
    public maxAmountOfFiles : Number = 5;
    public component : null|HTMLElement = null;
    public input: null| HTMLElement = null;
    public files = filesList;
    public backend : boolean = false; // enable file request if not add ad callback event
    public tabActive : Tabs = 'image';
    public windowBlobList : string = 'UploadBlobs';
    public external : boolean = false; // when clicked open external
    public options : any  = {
        enableExternal : true,
        enableImage: true,
        enableVideo : true,
        enableOther : true,
        enableBackend: true,
        imageExtensions: [],
        videoExtensions: [],
        otherExtensions: []
    }
    constructor(object: unknown | undefined) {
       this.setSettings(object)
    }
    /**
     * @description set settings
     * @param {typeOptions} options all options
     * @return void
     */
    private setSettings = (options : unknown | undefined) : void => {
        if (options.wrapper) this.dom(options.wrapper);
        if (options.blobList) this.windowBlobList = options.blobList;
        if (typeof options.backend === 'boolean') this.options.enableBackend = options.backend;
        if (typeof options.enableImage === 'boolean') this.options.enableImage = options.enableImage;
        if (typeof options.enableVideo === 'boolean') this.options.enableVideo = options.enableVideo;
        if (typeof options.enableOther === 'boolean') this.options.enableOther = options.enableOther;
        this.options.imageExtensions = Array.isArray(options.imageExtensions) ? options.imageExtensions : constants.imageDefaultExtensions;
        this.options.videoExtensions = Array.isArray(options.videoExtensions) ? options.videoExtensions : constants.videoDefaultExtensions;
        if (Array.isArray(options.otherExtensions)) this.options.otherExtensions = options.otherExtensions;
    }
    /**
     * @description on change event file list
     * @param {Event} e upload event change
     * @return void
     */
    private eventChange = (e : Event) : void => {
        if (e.target instanceof HTMLInputElement && e.target.files instanceof FileList && Object.keys(e.target.files).length){
            for (const file of e.target.files){
                if (file instanceof File) upload(this, functions.new(file, this.tabActive));
            }
        }
    }
    /**
     * @description default event upload
     * @return void
     */
    public eventUpload = () : void => {
        if (!this.isExternal()){
            if (this.input instanceof HTMLInputElement) this.input.click();
        } else {
            const element = this.component.querySelector('.uploader-external input');
            if (element instanceof HTMLInputElement){
                const string = element.value;
                if (string && string.length > 5 && functions.validateUrl(string)){
                    upload(this, functions.new(string, this.tabActive));
                    this.external = false;
                }
            }
        }
    }
    /**
     * @description drop file inside block
     * @param {DragEvent} e event from dragging
     * @return void
     */
    public eventDrop = (e : DragEvent) : void => {
        if (!this.isExternal){
            if (e.dataTransfer && "files" in e.dataTransfer) {
                const files = e.dataTransfer.files;
                for (const file of files){
                    if (file instanceof File) upload(this, functions.new(file, this.tabActive));
                }
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
            this.external = false;
            this.files.callback?.(this.files.list.filter((file: typeFile) => file.type === this.tabActive));
        }
    }
    /**
     * @description add event listeners
     * @param {HTMLElement | Element} wrapper dom element
     * @return void
     */
    public dom = (wrapper? : HTMLElement | Element) : void  => {
        if (wrapper && wrapper instanceof HTMLElement){
            this.component = wrapper;
            this.input = wrapper.querySelector('input[type="file"]');
            if (this.input instanceof HTMLElement){
                this.input.addEventListener('change', (e : Event) => this.eventChange(e));
            }
        }
    }
    /**
     * @description download file
     * @param {typeFile} file file object
     * @return void
     */
    public download = (file : typeFile) : void => {
        try {
            if (file.url){
                const link = document.createElement("a");
                link.download = file.name;
                link.href = file.url;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                this.component.dispatchEvent(customEvent(constants.downloadEvent, file));
            }
        } catch (e){
            console.error(constants.prefixError + ' failed to download file image');
        }
    }
    /**
     * @description delete file
     * @param {typeFile} file file object
     * @return void
     */
    public delete = (file : typeFile) : void => {
        this.files.delete(file);
        this.component.dispatchEvent(customEvent(constants.deleteEvent, file));
    }
    /**
     * @description check if crop can be shown
     * @param {typeFile} file file object
     * @return boolean
     */
    public hasCrop = (file : typeFile) : boolean => {
        return (this.options.enableImage && file.type === 'image' && !file.external);
    }
    /**
     * @description check if crop can be shown
     * @param {typeFile} file file object
     * @return void
     */
    public crop = (file: typeFile) : void => {
        this.component.dispatchEvent(customEvent(constants.cropEvent, file));
    }
    /**
     * @description save / get blob to window list / based on change date
     * @param {string} url current file url / name
     * @param {Blob} blob blob element
     * @param {number} modified date of file creation on people pc
     * @return {Blob|void}
     */
    public blob = (url: string, modified : number, blob : Blob|null = null) : Blob | void => {
        if (!Array.isArray(window[this.windowBlobList])){
            window[this.windowBlobList] = [];
        }
        if (blob instanceof Blob){
            const newObject: fileBlob = {
                'url' : url,
                'blob' : blob,
                'modified' : modified
            }
            window[this.windowBlobList].push(newObject);
        } else if (Object.keys(window[this.windowBlobList]).length){
            const hasObject = (window[this.windowBlobList].find((item) => {
                if (item.url === url && item.modified === modified) return item;
            }));
            if (hasObject) return hasObject.blob;
        }
    }
    /**
     * @description decide when to show external input
     * @return void
     */
    public isExternal = () : boolean => {
        return this.options.enableExternal && (this.tabActive === 'image' || this.tabActive === 'video') && this.external;
    }
    /**
     * @description if other tab show different dat / no preview / compact
     * @return {boolean}
     */
    public isCompact = () : boolean => {
        return this.tabActive === 'other';
    }
    /**
     * @description toggle external window
     * @return void
     */
    public toggleExternal = () : void => {
        this.external = !(this.external)
        this.files.callback(this.files.list.filter((file: typeFile) => file.type === this.tabActive));
    }
}

export default Upload