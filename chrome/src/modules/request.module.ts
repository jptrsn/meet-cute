export class Req {
    constructor() {

    }

    send(request: {url: string, method: 'GET' | 'POST'}) {
        return new Promise((resolve, reject) => {
            try {
                let r = new XMLHttpRequest();
                r.open(request.method, request.url, true);
                r.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        resolve(r.responseText);
                    } else {
                        console.log('readyState', this.readyState);
                    }
                };
                r.onerror = function() {
                    console.error('request error');
                    console.log(r);
                    reject();
                }
                r.send();
            } catch(e) {
                console.error(e);
                reject(e);
            }
        })
    }
}