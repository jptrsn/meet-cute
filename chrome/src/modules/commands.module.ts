import { Subject } from "rxjs";
import { take, map, filter } from "rxjs/operators";

export class ShortcutsControl {
    
    private ports: {[key: string]: chrome.runtime.Port} = {};
    portMessage$: Subject<{message: any, port: chrome.runtime.Port}> = new Subject<{message: any, port: chrome.runtime.Port}>();
    constructor() {
        
    }

    tabListenerAdded(tab: chrome.tabs.Tab) {
        const port = chrome.tabs.connect(tab.id);
        this.ports[tab.id] = port;
        port.onMessage.addListener(this.messageCallback_);
        port.onDisconnect.addListener((port) => {
            port.onMessage.removeListener(this.messageCallback_);
            delete this.ports[tab.id];
        })
        console.log('port listener added');
    }

    private messageCallback_ = (message, port: chrome.runtime.Port) => {
        console.log('message from port', message);
        if (!message.success) {
            this.portMessage$.error({message, port});
        } else {
            this.portMessage$.next({message, port});
        }
    }

    private addMeetTab_(command) {
        const tab = chrome.tabs.create({
            url: 'https://meet.google.com',
            active: true
        }, (tab) => {
            this.portMessage$.pipe(
                filter(({message, port}) => (message.message === 'listenerAdded' && message.key === command && message.success)),
                take(1)
            ).subscribe(({message, port}) => {
                if (command) {
                    port.postMessage(command);
                    if (command === 'newMeeting') {
                        this.portMessage$.pipe(
                            take(1)).subscribe((value) => {
                            console.log('starting instant')
                            port.postMessage('startInstant');
                        })
                    }
                }
            });
        });
    }

    sendCommand(command) {
        console.log('send command', command);
        if (!Object.keys(this.ports).length) {
            const meetExp = new RegExp('https://meet.google.com');
            chrome.tabs.query({}, (tabs) => {
                for (const tab of tabs) {
                    if (meetExp.test(tab.url)) {
                        this.tabListenerAdded(tab);
                        chrome.tabs.update(tab.id, {active: true, highlighted: true});
                        return true;
                    }
                }
                this.addMeetTab_(command);
            });
        } else {
            Object.entries(this.ports).forEach(([tabId, port]) => {
                chrome.tabs.update(Number(tabId), {active: true});
                port.postMessage(command);
            });
        }
        
    }

}