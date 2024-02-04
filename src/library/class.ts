import {filesList} from "./files";
import {upload} from "./functions";
import type {typeOptions} from "../types/options";
import type {tabs} from "../types/tabs";
import {objectInstance} from "./events"

/**
 * @description upload class
 * @class Upload
 * @constructor {typeOptions} object
 */
export class Upload {
    private fallback: boolean = false;
    public maxAmountOfFiles : Number = 5;
    public input: null| HTMLElement = null;
    public files = filesList;
    public image : boolean = true;
    public video : boolean = true;
    public other : boolean = false
    public tabActive : string = 'image'
    constructor(object: typeOptions) {
        if (object.wrapper && object.wrapper instanceof HTMLElement){
            this.input = object.wrapper.querySelector('input[type="file"]');
            if (this.input instanceof HTMLElement){
                this.input.addEventListener('change', (e : Event) => { this.eventChange(e) });
            }
        }
    }
    /**
     * @description on change event file list
     * @param {Event} e upload event change
     * @return void
     */
    private eventChange = (e : Event) : void => {
        if (e.target instanceof HTMLInputElement && e.target.files instanceof FileList && Object.keys(e.target.files).length){
            for (const file of e.target.files){
                if (file instanceof File) upload(this, objectInstance.new(file));
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
                if (file instanceof File) upload(this, objectInstance.new(file));
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
     * @param {tabs} key tab name
     * @return void
     */
    public switch = (key : tabs) : void => {
        if (this.tabActive !== key) {
            this.tabActive = key;
            this.files.callback?.(this.files.list)
        }
    }
}