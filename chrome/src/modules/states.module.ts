export class States {

    values: any;
    constructor() {
        this.loadStorage_();
    }

    private async loadStorage_() {
        const _this = this;
        return new Promise((resolve, reject) => {
            chrome.storage.local.get((items) => {
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
                console.log(`getting ${key} from local storage`);
                return chrome.storage.local.get([key],(items) => {
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
        chrome.storage.local.set(d);
    }
}