const video = document.getElementById('videoInput')

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models') //heavier/accurate version of tiny face detector
]).then(start)

function start() {
    document.body.append('Models Loaded')

    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )

    //video.src = '../videos/speech.mp4'
    console.log('video added')
    recognizeFaces()
}

async function recognizeFaces() {

    await loadModels(ModelsLoaded)
    


}

function ModelsLoaded(labeledDescriptors)
{
    console.log("Label Descriptors: ",labeledDescriptors)
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.7)


    video.addEventListener('play', async () => {

        console.log('Playing')
        const canvas = faceapi.createCanvasFromMedia(video)
        document.body.append(canvas)

        const displaySize = { width: video.width, height: video.height }
        faceapi.matchDimensions(canvas, displaySize)



        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()

            const resizedDetections = faceapi.resizeResults(detections, displaySize)

            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

            const results = resizedDetections.map((d) => {
                return faceMatcher.findBestMatch(d.descriptor)
            })
            console.log("Faces Found:");
            results.forEach((result, i) => {
                const box = resizedDetections[i].detection.box
                const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
                drawBox.draw(canvas);
                // console.log(result.toString());
            })
        }, 100)


    })
}


function loadModels(callBackFunciton) {

    var dataModelsJSON = '../models_database/models.json';
    var dataToReturn=[]
    
    $.getJSON(dataModelsJSON, { get_param: 'value' }, function (data) {
        var rootDir = data.name;
        $.each(data.children, function (key, value) {
            var modelName = value.name;
            const descriptions = [];
            console.log("Model Name: ", modelName);
            if (value.type == "directory") {
                $.each(value.children, async function (key, value) {

                    var fileName = value.name;

                    console.log("File Name: ", fileName);

                    const img = await faceapi.fetchImage(`../${rootDir}/${modelName}/${fileName}`)
                    const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
                    // console.log(modelName + JSON.stringify(detections))
                    descriptions.push(detections.descriptor)
                });
                dataToReturn.push(new faceapi.LabeledFaceDescriptors(modelName, descriptions));
            }
        })
        
        callBackFunciton(dataToReturn);
        
    })

    return Promise.all(dataToReturn);


}