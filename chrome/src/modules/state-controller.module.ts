import {Req} from './request.module';
import {Storage} from './storage.module';

export class StateController {
    private name: string;
    private protocol: 'http' | 'https';
    private addr: string;
    private uris: {
        [key: string]: string;
    }

    private disabled: boolean = false;
    private req: Req;
    private store: Storage;
    
    /**
     * 
     * @param name Name of controller, should be unique per instance
     * @param opts Optional defaults. Not required
     * @constructor
     * @returns StateController A state controller
     */
    constructor(name: string, opts?: {addr?: string, location?: 'local' | 'sync', protocol?: 'http' | 'https'}) {
        if (!name) {
            throw new Error('Name required');
        }
        this.name = name;
        this.req = new Req();
        const storeLocation = (opts && opts.location) ? opts.location : 'local'; // Default store config to device
        this.store = new Storage(storeLocation, this.name);
        const addrPropName = `${this.name}_addr`;
        if (opts && opts.addr) {
            this.addr = opts.addr;
            this.store.set(addrPropName, this.addr);
        } else {
            this.store.get(addrPropName).then((addr) => {
                this.addr = addr;
            });
        }
        const protocolPropName = `${this.name}_protocol`;
        if (opts && opts.protocol) {
            this.protocol = opts.protocol;
            this.store.set(protocolPropName, this.protocol);
        } else {
            this.store.get(protocolPropName).then((protocol) => {
                this.protocol = protocol || 'http';
            })
        }
        return this;
    }

    enable() {
        this.disabled = false;
    }

    disable() {
        this.disabled = true;
    }

    setAddress(address: string): void {
        this.addr = address;
        const addrPropName = `${this.name}_addr`;
        this.store.set(addrPropName, this.addr);
    }

    private validateRequestConditions_() {
        if (this.disabled) throw new Error('Controller disabled');
        if (!this.addr) throw new Error('No address found for control');
    }

    async get(uri?: string): Promise<any> {
        try {
            this.validateRequestConditions_();
            let url = `${this.protocol}://${this.addr}/`;
            if (uri) {
                if (uri.charAt(0) !== '/') {
                    uri = `/${uri}`;
                }
                url += encodeURI(uri);
            }
            return this.req.send({method: 'GET', url}).then((response) => {
                return response;
            }).catch((err) => {
                return err;
            });
        } catch(e) {
            return e;
        }
    }

    async post(body: any, uri?: string) {
        try {
            this.validateRequestConditions_();
            let url = `${this.protocol}://${this.addr}`;
            if (uri) {
                if (uri.charAt(0) !== '/') {
                    uri = `/${uri}`;
                }
                url += encodeURI(uri);
            }
            return this.req.send({method: 'POST', url, body}).then((response) => {
                return response;
            }).catch((err) => {
                return err;
            });
        } catch(e) {
            return e;
        }
        
    }

    
}
