import { MeetDetection } from './modules/meet-detection.module'
import { HomeAssistant } from './modules/home-assistant.module'
import { WledControl } from './modules/wled-control.module';
// console.log('Background page');
const meetDetection = new MeetDetection();
const light = new WledControl();

meetDetection.getStatusObservable().subscribe((status) => {
  // console.log('status', status);
  if (status) {
    light.applySavedState(status);
    chrome.browserAction.setTitle({title: titleCase(status)});
    switch (status) {
      case 'idle':
        chrome.browserAction.setIcon({path: './assets/phone_disabled.png'});
        break;
      case 'active':
        chrome.browserAction.setIcon({path: './assets/call_end.png'});
      case 'on-hold':
        chrome.browserAction.setIcon({path: './assets/add_ic_call.png'});
        break;
      case 'on-air':
        chrome.browserAction.setIcon({path: './assets/call.png'});
        break;
      default:
        console.log('unhandled state icon', status);
        chrome.browserAction.setIcon({path: './assets/batch_prediction.png'});
        break;
      
    }
  }
});

window.chrome.runtime.onMessage.addListener((
    request,
    sender,
    sendResponse
  ) => {
    // console.log('GOT req', request);
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
        return true;
      case 'getLightIp':
        sendResponse(light.ip);
        return;
      case 'getLightDetails':
        light.getDetails().then(sendResponse);
        return true;
      case 'getMeetDetectionConfig': 
        sendResponse(meetDetection.getConfig());
        return false;
      case 'setActivityDetection':
        meetDetection.setActivityDetection(request.shouldDetect);
        break;
      case 'setLightIp':
        light.setIp(request.address);
        light.getState().then(sendResponse);
        return true;
      case 'getStatus':
        sendResponse(meetDetection.getStatus());
        return true;
      default:
        console.error(`unhandled request type ${request.type}`, request);
        break;
    }
    sendResponse();
    return false;
  });

const titleCase = (str: string) => {
  return str.toLowerCase().split('-').map((word) => (word.charAt(0).toUpperCase() + word.slice(1))).join(' ');
}