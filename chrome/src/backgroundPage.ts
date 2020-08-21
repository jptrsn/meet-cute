import { MeetDetection } from './modules/meet-detection.module'
import { HomeAssistant } from './modules/home-assistant.module'
import { WledControl } from './modules/wled-control.module';
// console.log('Background page');
const meetDetection = new MeetDetection();
// const homeAssistant = new HomeAssistant();
const light = new WledControl({ip: 'wled-meet.local'});

light.getState().then(console.log);

meetDetection.getStatus().subscribe((status) => {
  switch(status) {
    case 'idle': 
      break;
      case 'on-hold':
        break;
        case 'on-air':
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
            break;
        case 'meetStatus':
            meetDetection.handleStatus(request, sender.tab);
            break;
    }
    sendResponse();
  });