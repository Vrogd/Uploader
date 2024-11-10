<script lang="ts">
    import type {typeFile} from "./types/file";
    import {library} from "./index";
    import {constants} from "./library/constants";
    import {onMount} from "svelte";

    interface Props {
        file: typeFile;
        upload: any;
        component: any;
    }
    let previewElement : HTMLElement|null = null;

    let {
        file = <typeFile>$bindable(),
        upload,
        component,
    } : Props = $props();

    const renderPreview = (node : HTMLElement, file : typeFile) => library.functions.previewEvent(file, node);

    onMount(() => {
        if (previewElement instanceof HTMLElement) {
            file.previewElement = previewElement;
            component.dispatchEvent(library.functions.customEvent(constants.domLoadEvent, file));
        } else  {
            console.error(library.constants.prefixError + ' failed to check preview dom');
        }
    });
</script>

<div class="uploader-item" class:uploader-item-image="{file.preview !== null && !upload.isCompact()}" class:uploader-item-error="{file.failed}" bind:this={previewElement}>
    <div class="info">
        <span class="text">
             <span data-upload-name>{file.name}</span>
             <span data-upload-size>{file.size}</span>
        </span>
        <span class="actions">
            {#if upload.hasCrop(file) && file.completed && !file.failed  && !upload.isCompact()}
                 <button class="spin" aria-label="crop" data-upload-crop onclick={() => upload.crop(file)}>
                       <i class="fa-solid fa-crop"></i>
                 </button>
            {/if}
            {#if file.completed && !file.failed && file.url }
                 <button class="spin" aria-label="download" data-upload-download onclick={() => upload.download(file)}>
                       <i class="fa-solid fa-cloud-arrow-down"></i>
                 </button>
            {/if}
            <button class="spin" aria-label="delete" data-upload-delete onclick={() => upload.delete(file)}>
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