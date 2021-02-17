export class TeachableMachine {
    
    /**
     * 
     * @param {string} deviceId the id of the video source
     */
    constructor(deviceId) {
        // the link to your model provided by Teachable Machine export panel
        const URL = "./my_model/"

        this.deviceId       = deviceId
        this.debug          = false
        this.videoSize      = 300
        this.flip           = true // whether to flip the webcam
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
        this.webcam = new tmImage.Webcam(this.videoSize, this.videoSize, this.flip) // width, height, flip
        
        await this.webcam.setup({
            "deviceId" : this.deviceId // select right input
        }) // request access to the webcam
        
        document.getElementById("webcam-container").appendChild(this.webcam.canvas)
        
        if(this.debug) {
            for (let i = 0 ; i < this.maxPredictions ; i++) { // and class labels
                this.labelContainer.appendChild(document.createElement("div"))
            }
        }

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

