chrome.runtime.onMessage.addListener((request, sender, respond) => {
  const handler = new Promise((resolve, reject) => {
    if (request) {
      resolve(`Hi from contentPage! You are currently on: ${window.location.href}`);
    } else {
      reject('request is empty.');
    }
  });

  handler.then(message => respond(message)).catch(error => respond(error));

  return true;
});

const url = location.href;
if (url.match("meet.google.com")) {
  chrome.runtime.sendMessage({
    type: 'meetTab'
  });
  let hasVideo = false;
  setInterval(() => {
    // Find the UI elements we need to modify. If they don't exist we haven't entered the meeting yet and will try again later
    const participantVideo = document.querySelector('[data-allocation-index]')
    const videoOnPage = !!(participantVideo && participantVideo.parentElement)
    if (videoOnPage !== hasVideo) {
      hasVideo = videoOnPage;
      chrome.runtime.sendMessage({
        type: 'meetStatus',
        videoOnPage
      });
    }
  }, 1000)
}