<script>
    import Upload from "./../lib/Upload.svelte";
    let options  = {
        maxAmountOfFiles: 10,
        backend: false,
        requestUrl: 'http://localhost:3000/api/content/files/temporary'
    }

    const uploadHandler = (file) => {
        console.log(file)
    }
    const files = [
        {
            'id': 'b2aeeb8eb6caa116ec7fb8183a43f4',
            'name': 'steamusercontent(1)_040526232926.jpg',
            'type': 'image',
            'url': "http://localhost:3000/storage/content/templates/steamusercontent(1)_040526232926.jpg"
        }
    ]
    console.log(options)
</script>

<Upload files={files} options={options} customUpload={uploadHandler} />