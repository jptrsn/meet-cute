export class Storage {

    storage: chrome.storage.LocalStorageArea | chrome.storage.SyncStorageArea;
    values: any;
    constructor(storename?: 'local' | 'sync') {
        this.storage = storename ? chrome.storage[storename] : chrome.storage.local;
        this.loadStorage_();
    }

    private async loadStorage_() {
        const _this = this;
        return new Promise((resolve, reject) => {
            _this.storage.get((items) => {
                _this.values = Object.assign({}, _this.values, items);
                resolve(_this.values);
            });
        });
    }

    async get(key?: string) {
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
        this.values[key] = value;
        const d = {};
        d[key] = value;
        this.storage.set(d);
    }
}