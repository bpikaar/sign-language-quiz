import { HandPose } from "../../js/handpose.js"
import { DeviceInputSelector } from "../../js/deviceinputselector.js"
import { Database } from "../../js/database.js"

export class Main {
    
    deviceInputSelector
    handpose
    labeledHandposeData = []
    db
    knn

    constructor() {
        this.deviceInputSelector    = new DeviceInputSelector() 
        document.querySelector('#select-wrapper').appendChild(this.deviceInputSelector)
        
        this.db = new Database()
        this.knn = new kNear(3)

        document.querySelector('#start').addEventListener('click',      () => this.handleStart())
        document.querySelector('#store').addEventListener('click',      () => this.handleStore())
        document.querySelector('#save').addEventListener('click',       () => this.handleSave())
        document.querySelector('#clear').addEventListener('click',      () => this.handleClear())
        document.querySelector('#getdata').addEventListener('click',    () => this.handleGetData())
        document.querySelector('#train').addEventListener('click',      () => this.handleTrain())
        document.querySelector('#classify').addEventListener('click',      () => this.handleClassify())
        
        document.querySelector('main').style.display = 'none'

        // test data
        // let array = [{'label' : 'test', 'data' : [1, 2, 3]}, {'label' : 'test2', 'data' : [1, 2, 3]}]
        // console.log(array.find(item => item.label === 'test'))
        this.db.getData()
            .then((result) => {
                this.labeledHandposeData = result
                console.log('Start data ', this.labeledHandposeData)
                this.showData()
            })
    }

    async handleStart() {
        document.querySelector('device-selection').remove()
        
        this.handpose = new HandPose(this.deviceInputSelector.DeviceId)
        await this.handpose.init()
        console.log('Init Handpose')

        document.querySelector('main').style.display = 'block'
    }

    handleStore(oldData = []) {
        if(oldData.length > 0)
        console.log(this.handpose.data)
        const label = document.querySelector('#label').value
        if(this.handpose.data && label) {
            console.log('Label: ', label)
            let dataObject
            console.log('find result: ', this.labeledHandposeData.find(item => item.label == label))
            if(dataObject = this.labeledHandposeData.find(item => item.label === label)) {
                console.log('exists')
                console.log('dataBylabel: ', dataObject)
                console.log('plain data: ', dataObject.data)
                dataObject.data.push(this.handpose.data)
            } else {
                this.labeledHandposeData.push({'label':label, 'data':[this.handpose.data]})
            }
            console.log('Handpose data', this.labeledHandposeData)
            this.showData()
        } else {
            console.log('Error in handleStore. handpose data or label is empty')
        }
    }

    /**
     * Add the new data array to the existing data in IndexedDb
     */
    async handleSave() {
        console.log('Add data to IndexedDb')
        await this.db.addData(this.labeledHandposeData)
        console.log('Data added')
    }

    async handleClear() {
        await this.db.clear()
        this.labeledHandposeData = []
        this.showData()
        console.log('Db has been cleared')
    }

    async handleGetData() {
        const data = await this.db.getData()
        console.log('Data from db ', data)
    }

    handleTrain() {
        this.db.getData()
            .then((result) => {
                result.forEach(dataObject => {
                    dataObject.data.forEach(handposeData => {
                        this.knn.learn(handposeData, dataObject.label);
                    });
                });
                console.log('Model trained')
            })
    }

    handleClassify() {
        const result = this.knn.classify(this.handpose.data)
        console.log(result)
    }

    showData() {
        const result = document.querySelector('result')
        const ul     = document.createElement('ul')

        result.innerHTML = ''
        // result.appendChild(ul)

        for (const datapoint of this.labeledHandposeData) {
            const chip = document.createElement('chip')
            chip.innerHTML = datapoint.label

            const span = document.createElement('span')
            span.innerText = datapoint.data.length
            chip.appendChild(span)

            result.appendChild(chip)
        }
    }


}

new Main()