<script lang="ts">
    import type {typeFile} from "../types/file";
    import {library} from "./index";
    import {onMount, tick} from "svelte";

    export let file : typeFile
    export let upload;
    export let previewElement
    const renderPreview = (node, file) => library.functions.previewEvent(file, node);

    onMount(async () => {
        await tick();
        file.previewElement = previewElement;
    });
</script>
<div class="uploader-item" class:uploader-item-image="{file.preview != null && !upload.isCompact()}" bind:this={previewElement}>
    <div class="info">
        <span class="text">
             <span data-upload-name>{file.name}</span>
             <span data-upload-size>{file.size}</span>
        </span>
        <span class="actions">
            {#if upload.hasCrop(file) && file.completed && !upload.isCompact()}
                 <button class="spin" data-upload-crop on:click="{() => upload.crop(file)}">
                       <i class="fa-solid fa-crop"></i>
                 </button>
            {/if}
            {#if file.completed }
                 <button class="spin" data-upload-download on:click="{() => upload.download(file)}">
                       <i class="fa-solid fa-cloud-arrow-down"></i>
                 </button>
            {/if}
            <button class="spin" data-upload-delete on:click="{() => upload.delete(file)}">
                 <i class="fa-solid fa-trash"></i>
            </button>
        </span>
        {#if !upload.isCompact()}
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