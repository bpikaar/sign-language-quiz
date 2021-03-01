export class TeachableMachine {
    
    /**
     * 
     * @param {string} deviceId the id of the video source
     */
    constructor(deviceId, size) {
        // the link to your model provided by Teachable Machine export panel
        const URL = "./my_model/"

        this.deviceId       = deviceId
        this.debug          = false
        this.videoSize      = size
        this.flip           = /Mobi/i.test(window.navigator.userAgent) ? false : true // TODO This is not working yet. on mobile do not flip camera 
        this.modelURL       = URL + "model.json"
        this.metadataURL    = URL + "metadata.json"
        this.labelContainer = document.getElementById("label-container")
        this.answer         = '' 
        this.previousAnswer = ''
    }

    /**
     * Returns the current prediction
     * @return {string} 
     */
    getAnswer() {
        return this.answer
    }

    /**
     * Status of the answer between two loops 
     * @return {boolean}
     */
    answerHasChanged() {
        return this.answerChanged
    }

    async init() {
        // load the model and metadata
        // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
        // or files from your local hard drive
        // Note: the pose library adds "tmImage" object to your window (window.tmImage)
        this.model = await tmImage.load(this.modelURL, this.metadataURL)
        this.maxPredictions = this.model.getTotalClasses()

        // Convenience function to setup a webcam
        this.webcam = new tmImage.Webcam(640, 480, this.flip) // width, height, flip
        
        await this.webcam.setup({
            deviceId    : this.deviceId, // select right input
            facingMode  : "user",  // enviroment for backface 
            aspectRatio : 1.0,
        }) // request access to the webcam
        
        // Google original snippet was .appendChild(this.webcam.canvas)
        document.getElementById("webcam-container").appendChild(this.webcam.webcam)
        
        if(this.debug) {
            for (let i = 0 ; i < this.maxPredictions ; i++) { // and class labels
                this.labelContainer.appendChild(document.createElement("div"))
            }
        }

        // for iphone
        let wc = document.getElementsByTagName('video')[0];
        wc.setAttribute("playsinline", true); // written with "setAttribute" bc. iOS buggs otherwise :-)
        wc.muted = "true"
        // wc.id = "webcamVideo";

        window.requestAnimationFrame(() => this.loop())

        // await the webcam to be loaded
        return await this.webcam.play()
    }

    async loop() {
        this.webcam.update() // update the webcam frame
        await this.predict()
        window.requestAnimationFrame(() => this.loop())
    }

    // run the webcam image through the image model
    async predict() {
        // predict can take in an image, video or canvas html element
        const prediction = await this.model.predict(this.webcam.canvas)
        
        let highestValue = -1
                
        for (let i = 0 ; i < this.maxPredictions ; i++) {
            if(this.debug) {
                const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2)
                this.labelContainer.childNodes[i].innerHTML = classPrediction
            }

            if (highestValue < prediction[i].probability.toFixed(2)) {
                highestValue = prediction[i].probability.toFixed(2)
                this.answer = prediction[i].className
            }
        }
        this.answerChanged = this.previousAnswer !== this.answer 
        this.previousAnswer = this.answer

        // document.querySelector("answer").innerHTML = this.answer
        // return this.answer
    }
}

