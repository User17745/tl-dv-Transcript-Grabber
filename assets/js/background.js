// Background service worker for tl;dv Transcript Grabber
// Currently used for extension lifecycle management and testing assistance

chrome.runtime.onInstalled.addListener(() => {
  console.log('tl;dv Transcript Grabber extension installed');
});
