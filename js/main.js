// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

import { TeachableMachine }     from './teachablemachine.js'
import { DeviceInputSelector }  from './deviceinputselector.js'
import { ProgressRing }         from './progressring.js'

const deviceInputSelector   = new DeviceInputSelector()
const alphabet              = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

let teachableMachine

document.querySelector('main').style.display    = 'none'
document.querySelector('success').style.display = 'none'
document.querySelector('failed').style.display  = 'none'
document.querySelector('#select-wrapper').appendChild(deviceInputSelector)

document.querySelector('#start').addEventListener('click', async () => {
    // Load the image model and setup the webcam
    console.log('Device id')
    console.log(deviceInputSelector.DeviceId)
    teachableMachine = new TeachableMachine(deviceInputSelector.DeviceId)

    document.querySelector('device-selection').remove()
    document.querySelector('main').style.display = 'block'

    await teachableMachine.init()
    console.log('Init teachable machine')

    newRound()
})

function newAssignment() {
    const letter = alphabet[Math.floor(Math.random() * alphabet.length)]
    document.querySelector('assignment letter').innerHTML = letter
    return letter
}

async function countDown(counter) {
    return await new Promise(resolve => {
        let el = document.querySelector('answer')
        el.innerHTML = counter

        const interval = setInterval(() => {
            counter--
            el.innerHTML = counter
            console.log(counter)
            if (counter == 0) {
                resolve()
                clearInterval(interval)
            }
        }, 1000)
    })
}

async function start(teachableMachine) {
    return await new Promise(resolve => {
        let progress    = 0
        let answer      = teachableMachine.getAnswer()
        
        const elProgress = document.querySelector('progress-ring')
        const elAnswer   = document.querySelector('answer')

        const interval = setInterval(() => {
            elAnswer.innerHTML = teachableMachine.getAnswer()

            if (teachableMachine.answerHasChanged()) progress = 0
            else progress += 10
            
            console.log(progress)

            if (progress > 100) {
                clearInterval(interval)
                progress = 0
                resolve()
            }
            elProgress.setAttribute('progress', progress)
        }, 200)
    })
}

async function newRound() {
    let success = document.querySelector('success')
    let failed  = document.querySelector('failed')
    success.style.display  = 'none'
    failed.style.display  = 'none'

    let assignment = newAssignment()
    console.log('New Assignment')
    
    await countDown(3)
    console.log('Countdown ended')

    await start(teachableMachine)
    
    if(assignment === teachableMachine.getAnswer()) {
        console.log('You did it')
        success.style.display  = 'block'
    } else {
        console.log('Not the same')
        failed.style.display  = 'block'
    }

    setTimeout(() => {
        newRound()
    }, 2000);
}





