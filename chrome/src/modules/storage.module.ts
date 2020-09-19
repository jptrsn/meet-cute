export class Storage {

    storage: chrome.storage.LocalStorageArea | chrome.storage.SyncStorageArea;
    values: any;
    storeName: string;
    
    constructor(storename?: 'local' | 'sync', optName?: string) {
        this.storage = storename ? chrome.storage[storename] : chrome.storage.local;
        if (optName) {
            this.storeName = optName;
        }
        this.loadStorage_();
    }

    private async loadStorage_() {
        const _this = this;
        return new Promise((resolve, reject) => {
            if (this.storeName) {
                _this.storage.get([this.storeName], (items) => {
                    if (items[this.storeName]) {
                        _this.values = Object.assign({}, _this.values, JSON.parse(items[this.storeName]));
                    } else {
                        _this.values = Object.assign({}, _this.values);
                    }
                    resolve(_this.values);
                });
            } else {
                _this.storage.get((items) => {
                    _this.values = Object.assign({}, _this.values, items);
                    resolve(_this.values);
                });
            }
        });
    }

    async get(key?: string) {
        if (this.storeName) {
            key = `${this.storeName}_${key}`;
        }
        if (!this.values) {
            await this.loadStorage_();
        }
        if (key) {
            if (this.values[key]) {
                return this.values[key];
            } else {
                return this.storage.get([key],(items) => {
                    return items[key];
                });
            }
        }
        return this.values;
    }

    async set(key, value) {
        if (!this.values) {
            await this.loadStorage_();
        }
        if (this.storeName) {
            key = `${this.storeName}_${key}`;
        }
        if (typeof value === 'object' && this.values[key]) {
            this.values[key] = Object.assign(this.values[key], value);
        } else {
            this.values[key] = value;
        }
        const d = {};
        d[key] = this.values[key];
        this.storage.set(d);
    }
}