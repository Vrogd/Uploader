<script lang="ts">
    import {onMount, createEventDispatcher} from 'svelte';
    import type {typeFile} from "../types/file";
    import {library} from "./index";
    import {constants} from "./library/constants";
    import type {typeOptions} from "../types/options";

    // options
    export let component = null;
    export let crop : boolean = constants.defaultCropEnabled;

    // create class
    let upload = new library.upload(<typeOptions>{crop: crop});
    let updater = 0;
    const dispatch = createEventDispatcher();

    // callback
    upload.files.callback = function (list: typeFile[]) {
        fileList = list;
        updater++;
    }

    // init
    let fileList;
    const renderPreview = (node, file) => library.functions.previewEvent(file, node);
    onMount(() => {
        upload.dom(component);
        let timeout : any[] = [];
        component.addEventListener(constants.uploadEvent, function (e : CustomEvent){
            clearTimeout(timeout[e.detail.id]);
            timeout[e.detail.id] = setTimeout(() => {
                dispatch(constants.uploadEvent, e.detail);
            }, constants.timeoutEvents)
        })
        // delete event
        component.addEventListener(constants.deleteEvent, function (e: CustomEvent){
            dispatch(constants.deleteEvent, e.detail);
        })
        // crop event
        component.addEventListener(constants.cropEvent, function (e: CustomEvent){
            dispatch(constants.cropEvent, e.detail);
        })
    });
</script>
<div class="uploader" bind:this={component}>
    <div class="uploader-wrapper">
        {#if upload}
            <div class="uploader-tabs">
                {#key updater}
                    {#if upload.options.enableImage}
                        <button type="button" class="uploader-tab-image tab" class:show={upload.tabActive === 'image'} on:click="{() => upload.switch('image')}">Image</button>
                    {/if}
                    {#if upload.options.enableVideo}
                        <button type="button" class="uploader-tab-video tab" class:show={upload.tabActive === 'video'} on:click="{() => upload.switch('video')}">Video</button>
                    {/if}
                    {#if upload.options.enableOther}
                        <button type="button" class="uploader-tab-other tab" class:show={upload.tabActive === 'other'} on:click="{() => upload.switch('other')}">Other</button>
                    {/if}
                {/key}
            </div>
            <div class="uploader-preview">
                 {#if fileList && Object.keys(fileList).length}
                      {#each fileList as file}
                           {#if 'id' in file && file.id}
                                 <div class="uploader-item" class:uploader-item-image="{file.preview != null && !upload.isCompact()}" bind:this={file.previewElement}>
                                       <div class="info">
                                            <span class="text">
                                                <span data-upload-name>{file.name}</span>
                                                <span data-upload-size>{file.size}</span>
                                            </span>
                                            <span class="actions">
                                                {#if upload.hasCrop(file) && file.completed && !upload.isCompact()}
                                                    <button data-upload-crop on:click="{() => upload.crop(file)}">
                                                        <i class="fa-solid fa-crop"></i>
                                                    </button>
                                                {/if}
                                                {#if file.completed }
                                                    <button data-upload-download on:click="{() => upload.download(file)}">
                                                        <i class="fa-solid fa-cloud-arrow-down"></i>
                                                    </button>
                                                {/if}
                                                <button data-upload-delete on:click="{() => upload.delete(file)}">
                                                    <i class="fa-solid fa-trash"></i>
                                                </button>
                                            </span>
                                            {#if !upload.isCompact()}
                                                <span data-upload-percentage class="percentage">{file.progress} %</span>
                                            {/if}
                                       </div>
                                       <div class="progress">
                                            <span class="bar" style="width: {file.progress}%"></span>
                                       </div>
                                       {#if file.isPreviewAble && !upload.isCompact()}
                                            <div class="preview" use:renderPreview={file}>
                                                <div class="wrapper"></div>
                                            </div>
                                       {/if}
                                 </div>
                           {/if}
                      {/each}
                 {/if}
            </div>
        {/if}
        {#key updater}
            {#if upload.isExternal()}
                <div class="uploader-external">
                    <div class="row">
                        <label class="form-label" for="external-input-link">link : </label>
                        <input class="form-field" id="external-input-link" type="text" placeholder="http(s)://">
                    </div>
                </div>
            {/if}
        {/key}
        <div class="uploader-actions" style="display: flex">
            <div class="uploader-submit" role="button" tabindex="0"
                 on:click="{() => {upload.eventUpload()}}"
                 on:keydown="{() => {upload.eventUpload()}}"
                 on:drop={(e) => {upload.eventDrop(e)}}
                 on:dragover={(e) => {upload.eventPrevent(e)}}>
                <input type="file" multiple name="files">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 489.4 489.4"><path d="M382.4 422.75H277.4v-106.1h34.7c8.8 0 14-10 8.8-17.2l-67.5-93.4c-4.3-6-13.2-6-17.5 0l-67.5 93.4c-5.2 7.2-.1 17.2 8.8 17.2h34.7v106.1H94.3c-52.5-2.9-94.3-52-94.3-105.2 0-36.7 19.9-68.7 49.4-86-2.7-7.3-4.1-15.1-4.1-23.3 0-37.5 30.3-67.8 67.8-67.8 8.1 0 15.9 1.4 23.2 4.1 21.7-46 68.5-77.9 122.9-77.9 70.4.1 128.4 54 135 122.7 54.1 9.3 95.2 59.4 95.2 116.1 0 60.6-47.2 113.1-107 117.3z"/></svg>
                <label for="files" id="files"></label> upload
            </div>
            {#key updater}
                {#if !upload.isCompact()}
                    <div class="uploader-submit-external" role="button" tabindex="0"
                         on:click="{() => {upload.toggleExternal()}}"
                         on:keydown="{() => {upload.toggleExternal()}}">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M364.2 83.8c-24.4-24.4-64-24.4-88.4 0l-184 184c-42.1 42.1-42.1 110.3 0 152.4s110.3 42.1 152.4 0l152-152c10.9-10.9 28.7-10.9 39.6 0s10.9 28.7 0 39.6l-152 152c-64 64-167.6 64-231.6 0s-64-167.6 0-231.6l184-184c46.3-46.3 121.3-46.3 167.6 0s46.3 121.3 0 167.6l-176 176c-28.6 28.6-75 28.6-103.6 0s-28.6-75 0-103.6l144-144c10.9-10.9 28.7-10.9 39.6 0s10.9 28.7 0 39.6l-144 144c-6.7 6.7-6.7 17.7 0 24.4s17.7 6.7 24.4 0l176-176c24.4-24.4 24.4-64 0-88.4z"/></svg>
                    </div>
                {/if}
            {/key}
        </div>
    </div>
</div>