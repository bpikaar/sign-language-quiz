export class DeviceInputSelector extends HTMLElement {
    constructor() {
        super()
        
        const template = document.getElementById('video-template').content;
        this.appendChild(template.cloneNode(true));
        
        this.debug          = false
        this.videoSelect    = this.querySelector('select#video-source')
        this.selectors      = [this.videoSelect] // if more selectors are needed (e.g. audio)
        this.deviceId       = 'no selection'
        
        this.videoSelect.addEventListener('change', event => {
            this.deviceId = event.target.value;
        });
    }

    /**
     * @returns {string}
     */
    get DeviceId() {
        return this.deviceId
    }

    connectedCallback() {
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