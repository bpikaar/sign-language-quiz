// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

import { TeachableMachine }     from './teachablemachine.js'
import { DeviceInputSelector }  from './deviceinputselector.js'
import { ProgressRing }         from './progressring.js'

export class Main {

    deviceInputSelector
    progressRing       
    alphabet 
    teachableMachine

    constructor() {
        this.deviceInputSelector    = new DeviceInputSelector()
        this.progressRing           = new ProgressRing(45, 125)
        this.alphabet               = ['A', 'B', 'C', 'D', 'E', 'F', 'G']        

        document.querySelector('main').style.display    = 'none'
        document.querySelector('success').style.display = 'none'
        document.querySelector('failed').style.display  = 'none'
        document.querySelector('#select-wrapper').appendChild(this.deviceInputSelector)
        document.querySelector('#webcam-container').appendChild(this.progressRing)
        document.querySelector('#start').addEventListener('click', () => this.handleStart())
    }

    async handleStart() {
        // Load the image model and setup the webcam
        this.teachableMachine = new TeachableMachine(this.deviceInputSelector.DeviceId, 250)

        document.querySelector('device-selection').remove()
        document.querySelector('main').style.display = 'block'

        await this.teachableMachine.init()
        console.log('Init teachable machine')

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
    
            const interval = setInterval(() => {
                elAnswer.innerHTML = this.teachableMachine.getAnswer()
    
                if (this.teachableMachine.answerHasChanged()) progress = 0
                else progress += 10
                
                console.log(progress)
    
                if (progress > 100) {
                    clearInterval(interval)
                    progress = 0
                    resolve()
                }
                this.progressRing.setProgress(progress)
            }, 200)
        })
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
        
        if(assignment === this.teachableMachine.getAnswer()) {
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