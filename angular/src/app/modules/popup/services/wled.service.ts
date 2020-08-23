import { Injectable } from '@angular/core';
import { MessagingService } from 'src/app/services/messaging.service';

@Injectable({
  providedIn: 'root'
})
export class WledService {

  constructor(private messaging: MessagingService) { }

  getLightDetails() {
    return this.messaging.sendMessage({type: 'getLightDetails'});
  }

  getSavedStates() {
    return this.messaging.sendMessage({type: 'getLightSavedStates'});
  }

  viewState(stateName) {
    return this.messaging.sendMessage({type: 'applyState', name: stateName})
  }

  saveState(stateName) {
    return this.messaging.sendMessage({type: 'saveState', name: stateName});
  }
}
