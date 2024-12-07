<script lang="ts">
    import {onDestroy, onMount, tick} from 'svelte';
    import type {typeFile} from "./types/file";
    import {library} from "./index";
    import constants from "./library/constants";
    import File from "./File.svelte";

    let { component = $bindable(null), options = {}, files = [], ...other} = $props();
    // custom events
    const uploadHandler = other[constants.uploadEvent] ? other[constants.uploadEvent] as EventListener : null;
    const deleteHandler = other[constants.deleteEvent] ? other[constants.deleteEvent] as EventListener : null;
    const cropHandler = other[constants.cropEvent] ? other[constants.cropEvent] as EventListener : null;

    // create class
    let upload = $state(new library.upload(options, files));
    let updater = $state(0);

    // callback
    upload.files.callback = function (list: typeFile[]) {
        fileList = list;
        console.log('list file list')
        updater++;
    }

    // init
    let fileList = <typeFile[]> $state();
    onMount(async () => {
        await tick();
        if (component instanceof HTMLElement) {
            upload.dom(component);
            fileList = files;
            let timeout : any[] = [];
            component.addEventListener(constants.uploadEvent, function (e : CustomEvent){
                clearTimeout(timeout[e.detail.id]);
                timeout[e.detail.id] = setTimeout(() => {
                    if (typeof uploadHandler === "function") uploadHandler(e.detail);
                }, constants.timeoutEvents)
            } as EventListener);
            // delete event
            component.addEventListener(constants.deleteEvent, function (e: CustomEvent){
                if (typeof deleteHandler === "function") deleteHandler(e.detail);
            } as EventListener)
            // crop event
            component.addEventListener(constants.cropEvent, function (e: CustomEvent){
                if (typeof cropHandler === "function") cropHandler(e.detail);
            } as EventListener)
            // loaded dom event // load preview if clicked on tab
            component.addEventListener(constants.domLoadEvent, function (e : CustomEvent){
                upload.files.update(e.detail, upload.tabActive);
            } as EventListener)
        }
    });

    onDestroy(() => {
        fileList = [];
    })
</script>
<div class="uploader" bind:this={component}>
    <div class="uploader-wrapper">
        {#if upload}
            <div class="uploader-tabs">
                {#key updater}
                    {#if upload.options.enableImage}
                        <button type="button" class="uploader-tab-image tab" class:show={upload.tabActive === 'image'} onclick={() => upload.switch('image')}>Image</button>
                    {/if}
                    {#if upload.options.enableVideo}
                        <button type="button" class="uploader-tab-video tab" class:show={upload.tabActive === 'video'} onclick={() => upload.switch('video')}>Video</button>
                    {/if}
                    {#if upload.options.enableOther}
                        <button type="button" class="uploader-tab-other tab" class:show={upload.tabActive === 'other'} onclick={() => upload.switch('other')}>Other</button>
                    {/if}
                {/key}
            </div>
            <div class="uploader-preview">
                {#if fileList && Object.keys(fileList).length}
                    {#each fileList as file}
                        {#key file.id}
                            <File file={file} upload={upload} component={component}/>
                        {/key}
                    {/each}
                {/if}
            </div>
        {/if}
        {#key updater}
            {#if upload.isExternal()}
                <div class="uploader-external">
                    <div class="row">
                        <label for="external-input-link">link : </label>
                        <input id="external-input-link" type="text" placeholder="http(s)://">
                    </div>
                </div>
            {/if}
        {/key}
        <div class="uploader-actions">
            <div class="uploader-submit" role="button" tabindex="0"
                 onclick={() => {upload.eventUpload()}}
                 onkeydown={() => {upload.eventUpload()}}
                 ondrop={(e) => {upload.eventDrop(e)}}
                 ondragover={(e) => {upload.eventPrevent(e)}}>
                <input type="file" multiple name="files">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 489.4 489.4"><path d="M382.4 422.75H277.4v-106.1h34.7c8.8 0 14-10 8.8-17.2l-67.5-93.4c-4.3-6-13.2-6-17.5 0l-67.5 93.4c-5.2 7.2-.1 17.2 8.8 17.2h34.7v106.1H94.3c-52.5-2.9-94.3-52-94.3-105.2 0-36.7 19.9-68.7 49.4-86-2.7-7.3-4.1-15.1-4.1-23.3 0-37.5 30.3-67.8 67.8-67.8 8.1 0 15.9 1.4 23.2 4.1 21.7-46 68.5-77.9 122.9-77.9 70.4.1 128.4 54 135 122.7 54.1 9.3 95.2 59.4 95.2 116.1 0 60.6-47.2 113.1-107 117.3z"/></svg>
                <label for="files" id="files"></label> upload
            </div>
            {#key updater}
                {#if !upload.isCompact()}
                    <div class="uploader-submit-external" role="button" tabindex="0"
                         onclick={() => {upload.toggleExternal()}}
                         onkeydown={() => {upload.toggleExternal()}}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M364.2 83.8c-24.4-24.4-64-24.4-88.4 0l-184 184c-42.1 42.1-42.1 110.3 0 152.4s110.3 42.1 152.4 0l152-152c10.9-10.9 28.7-10.9 39.6 0s10.9 28.7 0 39.6l-152 152c-64 64-167.6 64-231.6 0s-64-167.6 0-231.6l184-184c46.3-46.3 121.3-46.3 167.6 0s46.3 121.3 0 167.6l-176 176c-28.6 28.6-75 28.6-103.6 0s-28.6-75 0-103.6l144-144c10.9-10.9 28.7-10.9 39.6 0s10.9 28.7 0 39.6l-144 144c-6.7 6.7-6.7 17.7 0 24.4s17.7 6.7 24.4 0l176-176c24.4-24.4 24.4-64 0-88.4z"/></svg>
                    </div>
                {/if}
            {/key}
        </div>
    </div>
</div>