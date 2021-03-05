// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

import { TeachableMachine }     from './teachablemachine.js'
import { DeviceInputSelector }  from './deviceinputselector.js'
import { ProgressRing }         from './progressring.js'
import { Database }             from './database.js'
import { HandPose }             from './handpose.js'

export class Main {

    deviceInputSelector
    progressRing       
    alphabet           
    db                 
    knn     
    handpose           
    teachableMachine
    currentAnswer = ''

    constructor() {
        this.deviceInputSelector    = new DeviceInputSelector()
        this.progressRing           = new ProgressRing(45, 125)
        this.alphabet               = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
        this.db                     = new Database()
        this.knn                    = new kNear(5)
        
        document.querySelector('main').style.display    = 'none'
        document.querySelector('success').style.display = 'none'
        document.querySelector('failed').style.display  = 'none'
        document.querySelector('#select-wrapper').appendChild(this.deviceInputSelector)
        document.querySelector('#webcam-container').appendChild(this.progressRing)
        document.querySelector('#start').addEventListener('click', () => this.handleStart())

        this.trainKNNmodel()
            .then(() => console.log('test'))
    }

    async trainKNNmodel() {
        return new Promise((resolve, reject) => {
            this.db.getData()
                .then((result) => {
                    result.forEach(dataObject => {
                        dataObject.data.forEach(handposeData => {
                            this.knn.learn(handposeData, dataObject.label);
                        });
                    });
                    console.log('Model trained')
                    resolve()
            })
        })
    }

    async handleStart() {
        // Load the image model and setup the webcam
        // this.teachableMachine = new TeachableMachine(this.deviceInputSelector.DeviceId, 250)
        this.handpose = new HandPose(this.deviceInputSelector.DeviceId)
        console.log('Init handpose')
        document.querySelector('device-selection').remove()
        document.querySelector('main').style.display = 'block'

        // await this.teachableMachine.init()
        // console.log('Init teachable machine')

        await this.handpose.init()
        console.log('Init Handpose')

        this.newRound()
    }

    newAssignment() {
        const letter = this.alphabet[Math.floor(Math.random() * this.alphabet.length)]
        document.querySelector('assignment').innerHTML = letter
        return letter
    }

    async countDown(counter) {
        return await new Promise(resolve => {
            let el = document.querySelector('answer')
            el.innerHTML = counter
    
            const interval = setInterval(() => {
                counter--
                el.innerHTML = counter
                
                if (counter == 0) {
                    resolve()
                    clearInterval(interval)
                }
            }, 1000)
        })
    }
    
    async start() {
        return await new Promise(resolve => {
            let progress   = 0
            const elAnswer = document.querySelector('answer')
    
            this.currentAnswer = this.getNewAnswer()
            const interval = setInterval(() => {
                let newAnswer = this.getNewAnswer()
                elAnswer.innerHTML = newAnswer
    
                if (newAnswer != this.currentAnswer) progress = 0
                else progress += 10
                
                console.log(progress)
    
                if (progress > 100) {
                    clearInterval(interval)
                    progress = 0
                    resolve()
                }
                this.progressRing.setProgress(progress)

                this.currentAnswer = this.getNewAnswer()
            }, 200)
        })
    }
    
    getNewAnswer() {
        return this.knn.classify(this.handpose.data)
    }

    async newRound() {
        let success = document.querySelector('success')
        let failed  = document.querySelector('failed')
        success.style.display  = 'none'
        failed.style.display  = 'none'
    
        let assignment = this.newAssignment()
        console.log('New Assignment')
        
        await this.countDown(3)
        console.log('Countdown ended')
    
        await this.start()
        
        if(assignment === this.currentAnswer) {
            console.log('You did it')
            success.style.display  = 'block'
        } else {
            console.log('Not the same')
            failed.style.display  = 'block'
        }
    
        setTimeout(() => {
            this.newRound()
        }, 2000);
    }
}

new Main()