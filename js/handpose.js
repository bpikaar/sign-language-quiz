export class HandPose {
    model
    videoWidth
    videoHeight
    ctx
    canvas
    deviceId
    video
    predictions // hand data
    log             = document.querySelector("#array")
    VIDEO_WIDTH     = 250
    VIDEO_HEIGHT    = 250

    // array posities van de vingerkootjes
    fingerLookupIndices = {
        thumb:          [0, 1,  2,  3,  4],
        indexFinger:    [0, 5,  6,  7,  8],
        middleFinger:   [0, 9,  10, 11, 12],
        ringFinger:     [0, 13, 14, 15, 16],
        pinky:          [0, 17, 18, 19, 20]
    }

    get data() {
        if(this.predictions) {
            let result = []
            for (const landmark of this.predictions[0].landmarks) {
                for (const datapoint of landmark) {
                    result.push(datapoint)    
                }
            }
            return result
        } else {
            return []
        }
    }

    constructor(deviceId) {
        this.deviceId = deviceId
        // video fallback
        navigator.getUserMedia = navigator.getUserMedia ||navigator.webkitGetUserMedia || navigator.mozGetUserMedia
    }

    /**
     * Start the app
     */
    async init() {
        this.model = await handpose.load()
        this.video = await this.setupCamera()
        this.video.play()
        this.startLandmarkDetection(this.video)
        // this.startLandmarkDetection()
    }

    /**
     * Start the Webcam
     */
    async setupCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error(
                "Webcam not available"
            )
        }

        const video     = document.getElementsByTagName('video')[0]
        const stream    = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode  : "user",
                deviceId    : this.deviceId, // select right input
                width       : this.VIDEO_WIDTH,
                height      : this.VIDEO_HEIGHT
            }
        })
        video.srcObject = stream

        return new Promise(resolve => {
            video.onloadedmetadata = () => {
                resolve(video)
            }
        })
    }
    
    /**
     * predict de vinger posities in de video stream
     * @param {HTMLVideoElement} video 
     */
    async startLandmarkDetection(video) {
        // video = document.getElementsByTagName("video")[0]
        this.videoWidth  = video.videoWidth
        this.videoHeight = video.videoHeight

        this.canvas = document.getElementById("output")

        this.canvas.width    = this.videoWidth
        this.canvas.height   = this.videoHeight

        this.ctx = this.canvas.getContext("2d")

        video.width = this.videoWidth
        video.height = this.videoHeight

        this.ctx.clearRect(0, 0, this.videoWidth, this.videoHeight)
        this.ctx.strokeStyle = "red"
        this.ctx.fillStyle = "red"

        this.ctx.translate(this.canvas.width, 0)
        this.ctx.scale(-1, 1) // video omdraaien omdat webcam in spiegelbeeld is

        this.predictLandmarks(video)
    }

    /**
     * predict de locatie van de vingers met het model
     * @param {HTMLVideoElement} video 
     */
    async predictLandmarks(video) {
        this.ctx.drawImage(video, 0, 0, this.videoWidth, this.videoHeight, 0, 0, this.canvas.width, this.canvas.height)
        // prediction!
        const predictions = await this.model.estimateHands(video)
        if (predictions.length > 0) {
            const result = predictions[0].landmarks
            this.drawKeypoints(this.ctx, result, predictions[0].annotations)
            // this.logData(predictions)
            this.predictions = predictions
        }

        // 60 keer per seconde is veel, gebruik setTimeout om minder vaak te predicten
        requestAnimationFrame(() => this.predictLandmarks(video))

        // setTimeout(()=>this.predictLandmarks(), 1000)
    }

    /**
     * toon de eerste 20 waarden in een log - elk punt heeft een X, Y, Z waarde
     * @param {*} predictions 
     */
    logData(predictions) {
        let str = ""
        // console.log(predictions[0].landmarks)
        for (let i = 0; i < 20; i++) {
            str += predictions[0].landmarks[i][0] + ", " + predictions[0].landmarks[i][1] + ", " + predictions[0].landmarks[i][2] + ", "
        }
        this.log.innerText = str
    }

    /**
     * teken hand en vingers
     * @param {*} ctx 
     * @param {*} keypoints 
     */
    drawKeypoints(ctx, keypoints) {
        const keypointsArray = keypoints;

        for (let i = 0; i < keypointsArray.length; i++) {
            const y = keypointsArray[i][0]
            const x = keypointsArray[i][1]
            this.drawPoint(ctx, x - 2, y - 2, 3)
        }

        const fingers = Object.keys(this.fingerLookupIndices)
        for (let i = 0; i < fingers.length; i++) {
            const finger = fingers[i]
            const points = this.fingerLookupIndices[finger].map(idx => keypoints[idx])
            this.drawPath(ctx, points, false)
        }
    }

    /**
     * teken een punt
     * @param {*} ctx 
     * @param {*} y 
     * @param {*} x 
     * @param {*} r 
     */
    drawPoint(ctx, y, x, r) {
        ctx.beginPath()
        ctx.arc(x, y, r, 0, 2 * Math.PI)
        ctx.fill()
    }
    
    /**
     * teken een lijn
     * @param {*} ctx 
     * @param {*} points 
     * @param {*} closePath 
     */
    drawPath(ctx, points, closePath) {
        const region = new Path2D()
        region.moveTo(points[0][0], points[0][1])
        for (let i = 1; i < points.length; i++) {
            const point = points[i]
            region.lineTo(point[0], point[1])
        }

        if (closePath) {
            region.closePath()
        }
        ctx.stroke(region)
    }
}