import { MeetDetection } from './modules/meet-detection.module'
// console.log('Background page');
const meetDetection = new MeetDetection();

meetDetection.getStatus().subscribe(console.log);

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