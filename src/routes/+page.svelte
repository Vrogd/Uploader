<script>
    import Upload from "./../lib/Upload.svelte";
    let options  = {
        maxAmountOfFiles: 10,
        backend: true,
        requestUrl: 'http://localhost:3000/api/content/files/temporary'
    }

    const uploadHandler = (file) => {
        console.log(file)
    }
</script>

<Upload options={options} customUpload={uploadHandler} />