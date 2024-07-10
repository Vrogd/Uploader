import {filesList} from "./files";
import {upload} from "./functions";
import type {typeOptions} from "../../types/options";
import type {Tabs} from "../../types/tabs";
import type {typeFile} from "../../types/file";
import {customEvent, objectInstance} from "./events"
import {constants} from "./constants";

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
    public image : boolean = true;
    public video : boolean = true;
    public other : boolean = false;
    public tabActive : Tabs = 'image'
    constructor(object: typeOptions = {}) {
        if (object.wrapper) this.dom(object.wrapper);
    }
    /**
     * @description on change event file list
     * @param {Event} e upload event change
     * @return void
     */
    private eventChange = (e : Event) : void => {
        if (e.target instanceof HTMLInputElement && e.target.files instanceof FileList && Object.keys(e.target.files).length){
            for (const file of e.target.files){
                if (file instanceof File) upload(this, objectInstance.new(file, this.tabActive));
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
                if (file instanceof File) upload(this, objectInstance.new(file, this.tabActive));
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
     * @param {typeFile} file
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
     * @param {typeFile} file
     * @return void
     */
    public delete = (file : typeFile) : void => {
        console.log(file, 'delete')
    }
}

export default Upload