import { HandPose } from "../../js/handpose.js"
import { DeviceInputSelector } from "../../js/deviceinputselector.js"

export class Main {
    
    deviceInputSelector
    
    constructor() {
        this.deviceInputSelector    = new DeviceInputSelector() 
        document.querySelector('#select-wrapper').appendChild(this.deviceInputSelector)
        document.querySelector('#start').addEventListener('click', () => this.handleStart())
    }

    async handleStart() {
        document.querySelector('device-selection').remove()
        document.querySelector('main').style.display = 'block'

        new HandPose(this.deviceInputSelector.DeviceId)
        console.log('Init Handpose')
    }
}

new Main()