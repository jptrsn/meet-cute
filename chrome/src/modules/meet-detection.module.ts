import {BehaviorSubject} from 'rxjs';
import {Storage} from '../modules/storage.module'

export class MeetDetection {
    
    private status: string;
    private status$: BehaviorSubject<string>;
    private store: Storage;
    private activityDetection: false;
    private meetTabs: number[];

    constructor() {
        this.store = new Storage('local');
        this.status$ = new BehaviorSubject(null);
        this.listenForTabRemove();
        this.configureForActivity();
        this.status$.subscribe((status) => {
            this.status = status;
        });
        this.meetTabs = [];
    }

    configureForActivity() {
        this.store.get('detect_activity').then((detectionActive) => {
            this.activityDetection = detectionActive || false;
            if (detectionActive) {
                console.log('adding activity listeners');
                chrome.idle.setDetectionInterval(15);
                chrome.idle.queryState(15, ((state) => this.idleStateListener(state)));
                chrome.idle.onStateChanged.addListener(((state) => this.idleStateListener(state)));
            } else {
                console.log('not configured to listen for activity');
                if (this.status === null) {
                    this.status$.next('idle');
                }
            }
        })
        
    }

    setActivityDetection(shouldDetect: boolean) {
        this.store.set('detect_activity', shouldDetect);
        this.configureForActivity();
    }

    idleStateListener(state) {
        console.log('idleStateListener', state, this.meetTabs);
        if (!this.meetTabs.length) {
            this.status$.next(state);
        }
    }

    listenForTabRemove() {
        window.chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
            if (this.meetTabs.indexOf(tabId) > -1) {
                console.log('tab removed!');
                this.meetTabs = this.meetTabs.filter((id) => id !== tabId);
                console.log(this.meetTabs);
                if (!this.meetTabs.length) {
                    if (this.activityDetection) {
                        this.status = null;
                        chrome.idle.queryState(15, ((state) => this.idleStateListener(state)));
                    } else {
                        this.status$.next('idle');
                    }
                }
            }
        });
    }

    handleStatus(request, tab) {
        console.log('handleStatus', tab.id);
        if (!request.onAir && !request.onHold && this.activityDetection) {
            return chrome.idle.queryState(15, (state) => {
                this.status = null;
                this.idleStateListener(state);
            });
        }
        const state = request.onAir ? 'on-air' : request.onHold ? 'on-hold' : 'idle';
        this.status$.next(state);
    }

    getConfig() {
        return {activityDetection: this.activityDetection}
    }

    handleTab(request, tab) {
        console.log('handleMeetTab', tab.id);
        this.meetTabs.push(tab.id);
        this.status$.next('on-hold');
    }

    getStatusObservable() {
        return this.status$.asObservable();
    }

    getStatus() {
        return this.status;
    }
}