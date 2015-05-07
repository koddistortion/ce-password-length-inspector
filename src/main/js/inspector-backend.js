/*global chrome*/
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    "use strict";
    if (request.getCurrentlyActiveTab === true) {
        sendResponse({tab: sender.tab});
    }
});