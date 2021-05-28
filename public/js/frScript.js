const video = document.getElementById('videoInput')
var $root = $('html, body');

// Data tables 
var trackerTable = $('#AttendenceTrackerTable').DataTable({
    dom: 'Bfrtip',
    buttons: [

        {
            extend: 'copy',
            text: 'Copy data to clipboard',
            className: 'btn btn-primary me-3'
        },
        {
            extend: 'excel',
            text: 'Export to Excel',
            className: 'btn btn-primary me-3'
        },
        {
            extend: 'csv',
            text: 'Export to CSV',
            className: 'btn btn-primary me-3'
        }
    ]

});


$('.linkToSection').on('click', function (event) {
    event.preventDefault();

    $('.linkToSection').removeClass('btn-primary').addClass('btn-warning text-dark')

    $(this).removeClass('btn-warning text-dark').addClass('btn-primary')

    $root.animate({
        scrollTop: $($.attr(this, 'href')).offset().top - 70
    }, 500);

    return false;
});


Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models') //heavier/accurate version of tiny face detector
]).then(start)

function start() {


    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )

    //video.src = '../videos/speech.mp4'
    //console.log('video added')
    recognizeFaces()
}

async function recognizeFaces() {

    await loadModels(ModelsLoaded)



}


function AddRowToTracker(userToAdd) {
    var userName = userToAdd.toString().split('(')[0];
    console.log(userName);
    if ($('#AttendenceTrackerTable').has('.' + userName).length > 0) {

    }
    else {
        trackerTable.row.add([
            userName.toString(),
            new Date().toLocaleString()
        ]).draw(false)
            .nodes()
            .to$()
            .addClass(userName);
    }

}


function ModelsLoaded(labeledDescriptors) {
    //console.log("Label Descriptors: ", labeledDescriptors)
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.7)


    video.addEventListener('play', async () => {

        //console.log('Playing')
        // const canvas = faceapi.createCanvasFromMedia(video)
        const canvas = $('#discriptor').get(0);

        // $("#videoInput").closest('.col').append(canvas)

        const displaySize = { width: video.width, height: video.height }
        faceapi.matchDimensions(canvas, displaySize)


        var counter = 0;
        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()

            const resizedDetections = faceapi.resizeResults(detections, displaySize)

            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

            const results = resizedDetections.map((d) => {
                return faceMatcher.findBestMatch(d.descriptor)
            })
            //console.log("Faces Found:");
            results.forEach((result, i) => {
                const box = resizedDetections[i].detection.box
                const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
                drawBox.draw(canvas);
                // //console.log(result.toString());
                AddRowToTracker(result);
            })
        }, 100)


    })
}


function loadModels(callBackFunciton) {

    var dataModelsJSON = '../models_database/models.json';
    var dataToReturn = []

    $.getJSON(dataModelsJSON, { get_param: 'value' }, function (data) {
        var rootDir = data.name;
        $.each(data.children, function (key, value) {
            var modelName = value.name;
            const descriptions = [];
            //console.log("Model Name: ", modelName);
            if (value.type == "directory") {
                $.each(value.children, async function (key, value) {

                    var fileName = value.name;

                    //console.log("File Name: ", fileName);

                    const img = await faceapi.fetchImage(`../${rootDir}/${modelName}/${fileName}`)
                    const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
                    // //console.log(modelName + JSON.stringify(detections))
                    descriptions.push(detections.descriptor)
                });
                dataToReturn.push(new faceapi.LabeledFaceDescriptors(modelName, descriptions));
            }
        })

        callBackFunciton(dataToReturn);

    })

    return Promise.all(dataToReturn);


}

