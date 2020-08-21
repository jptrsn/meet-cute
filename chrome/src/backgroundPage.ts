import { MeetDetection } from './modules/meet-detection.module'
import { HomeAssistant } from './modules/home-assistant.module'
import { WledControl } from './modules/wled-control.module';
// console.log('Background page');
const meetDetection = new MeetDetection();
const light = new WledControl({ip: 'meet-light.local'});

light.getState().then(console.log);

meetDetection.getStatus().subscribe((status) => {
  console.log('status', status);
  switch(status) {
    case 'offline': 
    case 'idle': 
    case 'on-hold':
    case 'on-air':
      light.applySavedState(status);
      break;
  }
});

window.chrome.runtime.onMessage.addListener((
    request,
    sender,
    sendResponse
  ) => {
    console.log('GOT req', request);
    switch (request.type) {
      case 'meetTab':
        meetDetection.handleTab(request, sender.tab);
        sendResponse();
        break;
      case 'meetStatus':
        meetDetection.handleStatus(request, sender.tab);
        sendResponse();
        break;
      case 'saveState':
        light.saveState(request.name, request.state, request.apply);
        sendResponse();
        break;
      case 'applyState':
        light.applySavedState(request.name);
        sendResponse();
        break;
      case 'getState':
        light.getState().then(sendResponse);
        return;
    }
    sendResponse();
  });