/* Imports */
import bluebird from 'bluebird';

/* Constants */
const targetUrls = ['https?://www.messenger.com', 'https?://www.facebook.com/messages'];
// revisit this (and manifest.json) later to see which APIs are actually needed
const chromeApis = ['tabs', 'windows', 'contextMenus'];

/* Helper functions */

/**
 * turns an async method that handles asynchronous execution with callbacks to one that handles it with promises
 * @param {function} method - an async method that takes in a callback as its last argument as a way of specifying what to execute following the completion of the method's async action
 * @return {function} a promisified version of the method, i.e an async method that takes in the same arguments as @param method minus the callback function and returns a Promise object. Specifying what code to run following the async action of the function is handled by calling the 'then' function of the returned Promise object
 */
function promisifier(method) {
  return function promisified(...args) {
    return new Promise((resolve) => {
      args.push(resolve);
      // pass in the resolve method as the callback function argument of @param method
      method.apply(this, args);
    });
  };
}

/**
 * checks the value of the browser variable window.contentInjected to see if the content script has already been injected; if not set window.contentInjected to true so that further calls of this function will not result in the content being injected twice
 * @param {integer} tabId - the id of a Chrome tab
 * @return {promise} a promise which resolves to an array of a single boolean representing the value of the window.contentInjected variable
 */
function hasContentBeenInjected(tabId) {
  return chrome.tabs.executeScriptAsync(tabId, {
    code: 'var injected = window.contentInjected; window.contentInjected = true; injected;',
    runAt: 'document_start',
  });
}

/**
 * injects the content script into the page
 * @param {integer} tabId - the id of a Chrome tab
 */
function injectContent(tabId) {
  return chrome.tabs.executeScriptAsync(tabId, { file: 'contentScript.bundle.js', runAt: 'document_end' });
}

/* Main function */

// promisify all necessary Chrome APIs
chromeApis.forEach(api => bluebird.promisifyAll(chrome[api], { promisifier }));

// check if a tab has been updated and inject the content script on this tab if it hasn't been injected with content
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'loading' || !tab.url.match(targetUrls.join('|'))) return;

  hasContentBeenInjected(tabId)
    .then((res) => {
      const hasBeenInjected = res[0];
      if (chrome.runtime.lastError || hasBeenInjected) {
        throw new Error('Content injected already');
      }

      return injectContent(tabId);
    })
    .then(() => {
      console.log('Content injected');
    })
    .catch(err => console.error(err));
});
