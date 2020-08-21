import {Req} from './request.module';
import {States} from './states.module';

export class WledControl {
    ip: string;
    req: Req;
    vars: States;
    currentState: any;
    constructor({ip}) {
        this.req = new Req();
        this.vars = new States();
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
            return new Error('No address set');
        }
        const url = `http://${this.ip}/json`;
        return this.req.send({method: 'GET', url}).then((state) => {
            this.currentState = JSON.parse(state);
            return this.currentState;
        }).catch((err) => {
            console.error('getState err:', err);
            return err;
        })
    }

    setState(json) {
        return this.req.send({method: 'POST', url, {body: json}}).then((state) => {

        })
    }
}