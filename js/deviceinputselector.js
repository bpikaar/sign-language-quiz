//#region Template
const template = document.createElement('template')
template.innerHTML = `
<style>
#video-source {
    padding: 8px;
    border: 2px solid rgb(69, 69, 206);
    border-radius: 8px;
    cursor: pointer;
}
#video-source:focus {
    outline: none;
}
</style>
<label for="video-source">Video source: </label>
<select id="video-source">
    <option value="no selection" selected disabled>Select your input</option>
</select>
`

export class DeviceInputSelector extends HTMLElement {
    constructor() {
        super()
        .attachShadow({mode: 'open'});
        
        this.debug          = false
        this.deviceId       = 'no selection'
    }

    /**
     * @returns {string}
     */
    get DeviceId() {
        return this.deviceId
    }

    connectedCallback() {
        // create shadow dom root
        if(this.shadowRoot) {
            let temp = template.content.cloneNode(true)
            this.shadowRoot.appendChild(temp)    
        }
        this.videoSelect    = this.shadowRoot.querySelector('select')
        this.selectors      = [this.videoSelect] // if more selectors are needed (e.g. audio)
        this.videoSelect.addEventListener('change', event => {
            this.deviceId = event.target.value;
        })

        navigator.mediaDevices.enumerateDevices()
            .then((deviceInfos) => this.gotDevices(deviceInfos))
            .catch((e) => this.handleError(e))
    }
    
    gotDevices(deviceInfos) {
        // Handles being called several times to update labels. Preserve values.
        const values = this.selectors.map(select => select.value);

        // append options
        for (let i = 0; i !== deviceInfos.length; ++i) {
            const deviceInfo = deviceInfos[i];
            const option = document.createElement('option');
            
            option.value = deviceInfo.deviceId;
            
            if (deviceInfo.kind === 'videoinput') {
                option.text = deviceInfo.label || `camera ${this.videoSelect.length + 1}`;
                this.videoSelect.appendChild(option);
            } else {
                if (this.debug) console.log('Some other kind of source/device: ', deviceInfo);
            }
        }

        this.selectors.forEach((select, selectorIndex) => {
            if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
                select.value = values[selectorIndex];
            }
        })
    }

    handleError(error) {
        if (this.debug) console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
    }
}

window.customElements.define('device-input-selector', DeviceInputSelector);