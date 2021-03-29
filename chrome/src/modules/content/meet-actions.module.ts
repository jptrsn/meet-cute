

interface MeetControl {
    selector: string;
    element?: HTMLElement;
    children?: {
        [key: string]: MeetControl;
    }
}
export class MeetActions {
    
    private port: chrome.runtime.Port;
    private currentState: 'onHome' | 'onHold' | 'onAir';

    private readonly homeControls: {[key: string]: MeetControl} = {
        'newMeeting': {
            selector: 'c-wiz > div > div:nth-child(2) > div > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > div:nth-child(1) > div > button',
            element: null
        },
        'startInstant': {
            selector: 'c-wiz > div > div:nth-child(2) > div > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > div > ul > li[aria-label="Start an instant meeting"]',
            element: null
        }
    };

    private readonly holdControls: {[key: string]: MeetControl } = {};

    private readonly meetControls: {[key: string]: MeetControl } = {
        'raiseHand': {
            selector: '[aria-label="Raise hand"]',
            element: null
        },
        'toggleCaptions': {
            selector: 'c-wiz > div > div > div:nth-child(9) > div:nth-child(3) > div:nth-child(9) > div:nth-child(3) > div:nth-child(2) > div',
            element: null
        },
        'presentNow': {
            selector: 'c-wiz > div > div > div:nth-child(9) > div:nth-child(3) > div:nth-child(9) > div:nth-child(3) > div:nth-child(3) > div',
            element: null
        },
        'moreActions': {
            selector: 'c-wiz > div > div > div:nth-child(9) > div:nth-child(3) > div:nth-child(9) > div:nth-child(3) > div:nth-child(4) > div',
            children: {
                cast: {
                    selector: 'body > div.JPdR6b.e5Emjc.CIYi0d.jvUMfb.yOCuXd.qjTEB > div > div > span:nth-child(1)'
                },
                whiteboard: {
                    selector: 'body > div.JPdR6b.e5Emjc.CIYi0d.jvUMfb.yOCuXd.qjTEB > div > div > span:nth-child(2)'
                },
                changeLayout: {
                    selector: 'body > div.JPdR6b.e5Emjc.CIYi0d.jvUMfb.yOCuXd.qjTEB > div > div > span:nth-child(3)'
                },
                fullScreen: {
                    selector: 'body > div.JPdR6b.e5Emjc.CIYi0d.jvUMfb.yOCuXd.qjTEB > div > div > span:nth-child(4)'
                },
                changeBackground: {
                    selector: 'body > div.JPdR6b.e5Emjc.CIYi0d.jvUMfb.yOCuXd.qjTEB > div > div > span:nth-child(5)'
                },
                settings: {
                    selector: 'body > div.JPdR6b.e5Emjc.CIYi0d.jvUMfb.yOCuXd.qjTEB > div > div > span:nth-child(11)'
                },
            }
        },
        'chat': {
            selector: '[aria-label="Chat with everyone"]',
            element: null
        },
        'attendees': {
            selector: '[aria-label="Show everyone"]',
            element: null
        },
        'muteAudio': {
            selector: 'c-wiz > div > div > div:nth-child(9) > div:nth-child(3) > div:nth-child(9) > div:nth-child(2) > div:nth-child(1) > div',
            element: null
        },
        'hangup': {
            selector: 'c-wiz > div > div > div:nth-child(9) > div:nth-child(3) > div:nth-child(9) > div:nth-child(2) > div:nth-child(2) > div',
            element: null
        },
        'muteVideo': {
            selector: 'c-wiz > div > div > div:nth-child(9) > div:nth-child(3) > div:nth-child(9) > div:nth-child(2) > div:nth-child(3) > div',
            element: null
        }
    }

    constructor() {
        chrome.runtime.onConnect.addListener((port) => {
            console.log('onConnect');
            this.port = port;
            this.port.onMessage.addListener((message, port) => this.handleMessage_(message, port));
        });
        chrome.runtime.sendMessage({type: 'meetActions|connected'});
        console.log('MeetActions constructor');
    }

    private handleMessage_(message: any, port: chrome.runtime.Port) {
        console.log('message', message);
        switch (message) {
            case 'connect': {
                return {message, success: true};    
            }
            case 'listenerAdded': {
                return {message, success: true};
            }
            default: {
                let controls;
                switch (this.currentState) {
                    case 'onHome':
                        controls = this.homeControls;
                        break;
                    case 'onHold':
                        controls = this.holdControls;
                        break;
                    case 'onAir':
                        controls = this.meetControls;
                        break;
                }
                if (controls[message]?.element) {
                    console.log(controls[message].element);
                    controls[message]?.element.click();
                    port.postMessage({message, success: true});
                } else {
                    port.postMessage({message, success: false});
                }
            }
        }
    }

    configureForStatus(state: { videoOnHold: boolean; videoOnPage: boolean; }) {
        console.log('configureForState', this.currentState, state);
        if (state.videoOnHold && this.currentState !== 'onHold') {
            console.log('on hold');
            this.currentState = 'onHold';
            Object.entries(this.holdControls).forEach(([key, ctrl]) => {
                this.addElementDetector_(key, ctrl);
            });
        } else if (state.videoOnPage && this.currentState !== 'onAir') {
            console.log('on air');
            this.currentState = 'onAir';
            Object.entries(this.meetControls).forEach(([key, ctrl]) => {
                this.addElementDetector_(key, ctrl);
            });
        } else if (this.currentState !== 'onHome') {
            console.log('on home');
            this.currentState = 'onHome';
            Object.entries(this.homeControls).forEach(([key, ctrl]) => {
                this.addElementDetector_(key, ctrl);
            });
        }
    }

    addElementDetector_(key: string, control: MeetControl): MeetControl {
        const intervalId = setInterval(() => {
            const els = document.querySelectorAll(control.selector);
            if (els.length) {
                clearInterval(intervalId);
                control.element = els[0] as HTMLElement;
                console.log(`${key} element configured`);
                this.port.postMessage({message: 'listenerAdded', key, success: true});
                if (els.length > 1) {
                    console.warn('too broad selector', control.selector);
                    console.log(els);
                }
            }
        }, 500);
        return control;
    }



}