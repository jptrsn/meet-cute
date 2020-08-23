import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {

  constructor() { }

  sendMessage(payload): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(payload, resolve);
    });
  }
}
