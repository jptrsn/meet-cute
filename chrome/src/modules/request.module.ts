export interface RequestSpec {
    url: string;
    method: 'GET' | 'POST';
    body?: {
        [key: string]: any;
    };
    query?: {
        [key:string]: string;
    }
}

export class Req {
    constructor() {}

    private formatParams_( params: {[key:string]: string} ): string {
        return "?" + Object
              .keys(params)
              .map(function(key){
                return key+"="+encodeURIComponent(params[key])
              })
              .join("&");
      }

    send(request: RequestSpec): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                let r = new XMLHttpRequest();
                let url = request.url;
                if (request.query) {
                    // TODO: Add query parameter handling
                    throw new Error("Method not yet implemented");
                }
                r.open(request.method, url, true);
                r.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        resolve(r.responseText);
                    }
                };
                r.onerror = function() {
                    reject({message: 'Address unavailable'});
                }
                if (request.body) {
                    r.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                    r.send(JSON.stringify(request.body));
                } else {
                    r.send();
                }
            } catch(e) {
                console.error(e);
                reject(e);
            }
        })
    }
}