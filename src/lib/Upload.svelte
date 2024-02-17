<script lang="ts">
    import {onMount} from 'svelte';
    import {Upload} from "../library/class";
    import {objectInstance} from "../library/events";
    import type {typeFile} from "../types/file";
    export let component = null;
    let upload = new Upload();
    let updater = 0;

    // callback
    upload.files.callback = function (list: typeFile[]) {
        fileList = list;
        updater++;
        console.log(list)
    }
    let fileList;
    const renderPreview = (node, file) => objectInstance.previewEvent(file, node);
    onMount(() => upload.dom(component));
</script>
<div class="uploader" bind:this={component} style="max-width: 300px">
    <div class="uploader-wrapper">
        {#if upload}
            <div class="uploader-tabs">
                {#key updater}
                    {#if upload.image}
                        <button type="button" class="uploader-tab-image tab" class:show={upload.tabActive === 'image'} on:click="{() => upload.switch('image')}">Image</button>
                    {/if}
                    {#if upload.video}
                        <button type="button" class="uploader-tab-video tab" class:show={upload.tabActive === 'video'} on:click="{() => upload.switch('video')}">Video</button>
                    {/if}
                    {#if upload.other}
                        <button type="button" class="uploader-tab-other tab" class:show={upload.tabActive === 'other'} on:click="{() => upload.switch('other')}">Other</button>
                    {/if}
                {/key}
            </div>
            <div class="uploader-preview">
                    {#if fileList && Object.keys(fileList).length}
                        {#each fileList as file}
                            {#if 'id' in file && file.id}
                                <div class="uploader-item" class:uploader-item-image="{file.preview != null}" bind:this={file.previewElement}>
                                    <div class="info">
                                        <span class="text">
                                            <span>{file.name}</span>
                                            <span>{file.size}</span>
                                        </span>
                                        <span class="actions">
                                            <button>
                                                <i class="fa-solid fa-cloud-arrow-down"></i>
                                            </button>
                                            <button>
                                                <i class="fa-solid fa-trash"></i>
                                            </button>
                                        </span>
                                        <span class="percentage">{file.progress} %</span>
                                    </div>
                                    <div class="progress">
                                        <span class="bar" style="width: {file.progress}%"></span>
                                    </div>
                                    {#if file.isPreviewAble}
                                        <div class="preview" use:renderPreview={file}>
                                        </div>
                                    {/if}
                                </div>
                            {/if}
                        {/each}
                    {/if}
                {#if true}
                    <div class="uploader-item">
                        <div class="info">
                                <span class="text">
                                    <span>filename.jpg</span>
                                    <span>128 kb</span>
                                </span>
                            <span class="actions">
                                    <button>
                                        <i class="fa-solid fa-cloud-arrow-down"></i>
                                    </button>
                                    <button>
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                            </span>
                        </div>
                    </div>
                {/if}
            </div>
        {/if}
        <div class="uploader-submit" role="button" tabindex="0"
             on:click="{() => {upload.eventUpload()}}"
             on:keydown="{() => {upload.eventUpload()}}"
             on:drop={(e) => {upload.eventDrop(e)}}
             on:dragover={(e) => {upload.eventPrevent(e)}}>
            <input type="file" name="files">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 489.4 489.4"><path d="M382.4 422.75H277.4v-106.1h34.7c8.8 0 14-10 8.8-17.2l-67.5-93.4c-4.3-6-13.2-6-17.5 0l-67.5 93.4c-5.2 7.2-.1 17.2 8.8 17.2h34.7v106.1H94.3c-52.5-2.9-94.3-52-94.3-105.2 0-36.7 19.9-68.7 49.4-86-2.7-7.3-4.1-15.1-4.1-23.3 0-37.5 30.3-67.8 67.8-67.8 8.1 0 15.9 1.4 23.2 4.1 21.7-46 68.5-77.9 122.9-77.9 70.4.1 128.4 54 135 122.7 54.1 9.3 95.2 59.4 95.2 116.1 0 60.6-47.2 113.1-107 117.3z"/></svg>
            <label for="files" id="files"></label> upload
        </div>
    </div>
</div>