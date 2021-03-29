import { MeetActions } from "./modules/content/meet-actions.module";

const url = location.href;

if (document.querySelector('body').classList.contains('__mDlS__')) {
  console.warn('already exists');
} else {
  
  

  document.onreadystatechange = (ev: Event) => {
    console.log('onreadystatechange', document.readyState);
    if (document.readyState === 'complete') {
      chrome.runtime.sendMessage({
        type: 'meetTab',
        url
      });

      const meetActions = new MeetActions();
      meetActions.configureForStatus({videoOnHold: false, videoOnPage: false});

      let onHoldSelector, onPageSelector;
      if (url.match('meet.google.com')) {
        onHoldSelector = '#yDmH0d > c-wiz > div > div > div:nth-child(4) > div.crqnQb > div > div.vgJExf > div > div > div.oORaUb.NONs6c';
        onPageSelector = '[data-allocation-index]';
      } else if (url.match('hangouts.google.com/call')) {
        onHoldSelector = '#yDmH0d > div.WOi1Wb > div.GhN39b > div > div > div.ECPdDc > div.F1FBvf > div > span > span';
        // TODO: Improve onPageSelector to differentiate between when you are alone and when other users are in the hangout.
        onPageSelector = '#yDmH0d > div.WOi1Wb > div.qMwJZe > div';
      }

      let onAir = false;
      let onHold = false;
      
      setInterval(() => {
        const videoOnHold = !!(document.querySelector(onHoldSelector));
        const videoOnPage = !!(document.querySelector(onPageSelector));
        
        if (videoOnHold !== onHold || videoOnPage !== onAir) {
          onAir = videoOnPage;
          onHold = videoOnHold;
          console.log({videoOnHold, videoOnPage});
          meetActions.configureForStatus({videoOnHold, videoOnPage});
          chrome.runtime.sendMessage({
            type: 'meetStatus',
            onAir,
            onHold
          });
        }
      }, 1000);
    }
  }

  document.querySelector('body').classList.add('__mDlS__');
}

