import {Req} from './request.module';
import {Storage} from './storage.module';

export class WledControl {
    ip: string;

    private req: Req;
    private vars: Storage;
    
    constructor(ip?: string) {
        this.req = new Req();
        this.vars = new Storage('local');
        if (ip) {
            this.ip = ip;
            this.vars.set('wled_ip', ip);
        } else {
            this.vars.get('wled_ip').then((ip) => {
                console.log('got wled_ip', ip);
                this.ip = ip;
            });
        }
    }

    setIp(ip: string): void {
        this.ip = ip;
        this.vars.set('wled_ip', ip);
    }

    async getState(): Promise<any> {
        if (!this.ip) {
            return {error: 'No address found for light'};
        }
        const url = `http://${this.ip}/json/state`;
        return this.req.send({method: 'GET', url}).then((state) => {
            return <State>JSON.parse(state);
        }).catch((err) => {
            return {error: err.message};
        })
    }

    setState(json: State) {
        const url = `http://${this.ip}/json/state`;
        return this.req.send({method: 'POST', url, body: json}).then((state) => {
            console.log('setState result', state);
            return state;
        }).catch((e) => {
            return {error: e.message};
        });
    }

    async saveState(name: string) {
        const state = await this.getState();
        this.vars.set(`state_${name}`, state);
    }

    async applySavedState(name: string) {
        const state = await this.vars.get(`state_${name}`);
        if (state) {
            this.setState(state);
        } else if (defaultStates[name]) {
            this.setState(defaultStates[name]);
        } else {
            console.error(`state ${name} not found`);
        }
    }

    async getDetails() {
        const state = await this.getState();
        const address = this.ip;
        return {state, address};
    }

    async getSavedStates() {
        const saved = await this.vars.get();
        let rtn = {};
        for (const k of Object.keys(defaultStates)) {
            if (saved[`state_${k}`]) {
                rtn[k] = saved[`state_${k}`];
            } else {
                rtn[k] = defaultStates[k];
            }
        }
        return rtn;
    }
}

const defaultStates = {
    'locked': <State>{
        "on": false
    },
    'idle': <State>{
        "on":true,"bri":150,"transition":7,"ps":-1,"pss":0,"pl":-1,"ccnf":{"min":1,"max":5,"time":12},"nl":{"on":false,"dur":60,"fade":true,"tbri":255},"udpn":{"send":false,"recv":true},"lor":0,"mainseg":0,"seg":[{"id":0,"start":0,"stop":29,"len":29,"grp":1,"spc":0,"on":true,"bri":255,"col":[[255,255,255],[128,128,255],[18,179,0]],"fx":17,"sx":48,"ix":193,"pal":21,"sel":true,"rev":false}]
    },
    'active': <State>{
        "on":true,"bri":255,"transition":7,"ps":-1,"pss":0,"pl":-1,"ccnf":{"min":1,"max":5,"time":12},"nl":{"on":false,"dur":60,"fade":true,"tbri":255},"udpn":{"send":false,"recv":true},"lor":0,"mainseg":0,"seg":[{"id":0,"start":0,"stop":29,"len":29,"grp":1,"spc":0,"on":true,"bri":255,"col":[[254,145,29],[128,128,255],[18,179,0]],"fx":80,"sx":128,"ix":193,"pal":50,"sel":true,"rev":false}]
    },
    'on-hold': <State>{
        "on":true,"bri":255,"transition":7,"ps":-1,"pss":0,"pl":-1,"ccnf":{"min":1,"max":5,"time":12},"nl":{"on":false,"dur":60,"fade":true,"tbri":255},"udpn":{"send":false,"recv":true},"lor":0,"mainseg":0,"seg":[{"id":0,"start":0,"stop":29,"len":29,"grp":1,"spc":0,"on":true,"bri":255,"col":[[254,145,29],[0,0,0],[18,179,0]],"fx":79,"sx":46,"ix":195,"pal":1,"sel":true,"rev":false}]
    },
    'on-air': <State>{
        "on":true,
        "bri":128,
        "transition":7,
        "ps":-1,
        "pss":0,
        "pl":-1,
        "ccnf":{
            "min":1,
            "max":5,
            "time":12
        },
        "nl":{
            "on":false,
            "dur":60,
            "fade":true,
            "tbri":255
        },
        "udpn":{
            "send":false,
            "recv":true
        },
        "lor":0,
        "mainseg":0,
        "seg":[{
            "id":0,
            "start":0,
            "stop":29,
            "len":29,
            "grp":1,
            "spc":0,
            "on":true,
            "bri":255,
            "col":[[255,0,0],[0,0,0],[0,0,0]],
            "fx":100,
            "sx":28,
            "ix":23,
            "pal":0,
            "sel":true,
            "rev":false
        }]
    }
}

interface Segment {
    id: number;
    start: number;
    stop: number;
    len: number;
    grp: number;
    spc: number;
    on: boolean;
    bri: number;
    col: any;
    fx: number;
    sx: number;
    ix: number;
    pal: number;
    sel: boolean;
    rev: false;
}

export interface State {
    on: boolean; // 1 - on, 0 - off
    bri?: number; // Brightness of the light. If on is false, contains last brightness when light was on (aka brightness when on is set to true). Setting bri to 0 is supported but it is recommended to use the range 1-255 and use on: false to turn off. The state response will never have the value 0 for bri.
    transition?: number; // transition
    ps?: number;
    pl?: number;
    nl?: {
        on: boolean;
        dur: number;
        fade: boolean;
        tbri: number;
    };
    updn?: {
        send: boolean;
        recv: boolean;
    },
    mainseg?: number;
    seg?: Segment[];
}

export interface Info {
    ver: string;
    name: string;
    udpport: number;
    mac: string;
    live: boolean;
    leds: {
        count: number;
        rgbw: boolean;        
    }
}