/*global chrome*/
/*global Message*/
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    "use strict";
    if (request.type === Message.getCurrentTab) {
        sendResponse({tab: sender.tab});
    }

    if(request.type === Message.setSettings) {
        chrome.storage.local.set(request.settings, function(){
            sendResponse({type: Message.setSettingsResult, local: true});
        });
        chrome.storage.sync.set(request.settings, function(){
            sendResponse({type: Message.setSettingsResult, sync: true});
        });
    }

    if(request.type === Message.getSettings) {
        // try to get from sync
        chrome.storage.sync.get(null, function(syncedObject){
            if(Object.keys(syncedObject).length === 0) {
                // no synced items found, try local storage
                chrome.storage.sync.get(null, function(localObject) {
                    sendResponse({type: Message.getSettingsResult, settings: localObject});
                });
            } else {
                // object found, return it
                sendResponse({type: Message.getSettingsResult, settings: syncedObject});
            }
        });
    }

});