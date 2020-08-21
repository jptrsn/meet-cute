import {BehaviorSubject} from 'rxjs';
export class MeetDetection {
    
    private tabs: any;
    private listeners: any;
    private status$: BehaviorSubject<string>;

    constructor() {
        console.log('MeetDetection constructor');
        this.tabs = {};
        this.listeners = {};
        this.status$ = new BehaviorSubject('offline');
        this.listenForTabRemove();
    }

    listenForTabRemove() {
        window.chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
            if (this.tabs[tabId]) {
                console.log('detected tab closed', this.tabs[tabId]);
                delete this.tabs[tabId];
                this.status$.next('offline');
            }
        });
    }

    handleStatus(request, tab) {
        const status = request.onAir ? 'on-air' : request.onHold ? 'on-hold' : 'idle';
        console.log('handleMeetStatus', status);
        this.tabs[tab.id] = status;
        this.status$.next(status);
        
    }

    handleTab(request, tab) {
        console.log('handleMeetTab', request, tab);
        this.tabs[tab.id] = 'idle';
        this.status$.next('idle');
    }

    getStatus() {
        return this.status$.asObservable();
    }
}