<script lang="ts">
    import type {typeFile} from "./types/file";
    import {library} from "./index";
    import {constants} from "./library/constants";
    import {onMount, tick} from "svelte";

    export let file : typeFile
    export let upload;
    export let component;
    export let previewElement
    const renderPreview = (node, file) => library.functions.previewEvent(file, node);

    onMount(async () => {
        await tick();
        file.previewElement = previewElement;
        component.dispatchEvent(new CustomEvent(constants.domLoadEvent, {
            detail: file
        }));
    });
</script>

<div class="uploader-item" class:uploader-item-image="{file.preview != null && !upload.isCompact()}" class:uploader-item-error="{file.failed}" bind:this={previewElement}>
    <div class="info">
        <span class="text">
             <span data-upload-name>{file.name}</span>
             <span data-upload-size>{file.size}</span>
        </span>
        <span class="actions">
            {#if upload.hasCrop(file) && file.completed && !file.failed  && !upload.isCompact()}
                 <button class="spin" data-upload-crop on:click="{() => upload.crop(file)}">
                       <i class="fa-solid fa-crop"></i>
                 </button>
            {/if}
            {#if file.completed && !file.failed && file.url }
                 <button class="spin" data-upload-download on:click="{() => upload.download(file)}">
                       <i class="fa-solid fa-cloud-arrow-down"></i>
                 </button>
            {/if}
            <button class="spin" data-upload-delete on:click="{() => upload.delete(file)}">
                 <i class="fa-solid fa-trash"></i>
            </button>
        </span>
        {#if !upload.isCompact() && !file.failed}
            <span data-upload-percentage class="percentage">{file.progress} %</span>
        {/if}
    </div>
    {#if !(file.external)}
        <div class="progress">
            <span class="bar" style="width: {file.progress}%"></span>
        </div>
    {/if}
    {#if file.isPreviewAble && !upload.isCompact()}
        <div class="preview" use:renderPreview={file}>
            <div class="wrapper"></div>
        </div>
    {/if}
</div>