/*global chrome*/
/*global Message*/
var InspectorBackendStorageHandler = function () {
    "use strict";

    this.settingsRetrieved = function (settings, local, sendResponse) {
        if (local) {
            this.localSettings = settings;
        } else {
            this.syncedSettings = settings;
        }

        if (this.localSettings !== undefined && this.syncedSettings !== undefined) {
            var latest = null;
            if (this.localSettings.lastUpdate && this.syncedSettings.lastUpdate) {
                latest = this.localSettings.lastUpdate > this.syncedSettings.lastUpdate ? this.localSettings : this.syncedSettings;
            } else {
                latest = this.syncedSettings;
            }
            var settingsResponse = {
                latest: latest,
                local: this.localSettings,
                synced: this.syncedSettings
            };
            sendResponse({type: Message.getSettingsResult, settings: settingsResponse});
        }
    };

    this.settingsStored = function (settings, local, sendResponse) {
        if (local) {
            this.localSettings = settings;
        } else {
            this.syncedSettings = settings;
        }
        if (this.localSettings !== undefined && this.syncedSettings !== undefined) {
            var settingsResponse = {
                local: true,
                synced: true
            };
            sendResponse({type: Message.setSettingsResult, result: settingsResponse});
        }
    };

    this.settingsCleared = function (local, sendResponse) {
        if (local) {
            this.local = true;
        } else {
            this.synced = true;
        }
        if (this.local !== undefined && this.synced !== undefined) {
            var settingsResponse = {
                local: true,
                synced: true
            };
            sendResponse({type: Message.clearSettingsResult, result: settingsResponse});
        }
    };
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    "use strict";
    var storageCollector = new InspectorBackendStorageHandler();
    if (request.type === Message.getCurrentTab) {
        sendResponse({tab: sender.tab});
    } else if (request.type === Message.setSettings) {
        chrome.storage.local.set(request.settings, function () {
            storageCollector.settingsStored(request.settings, true, sendResponse);
            //sendResponse({type: Message.setSettingsResult, local: true});
        });
        chrome.storage.sync.set(request.settings, function () {
            storageCollector.settingsStored(request.settings, false, sendResponse);
            //sendResponse({type: Message.setSettingsResult, sync: true});
        });
    } else if (request.type === Message.getSettings) {
        // try to get from sync
        chrome.storage.sync.get(null, function (syncedObject) {
            storageCollector.settingsRetrieved(syncedObject, false, sendResponse);
        });
        chrome.storage.local.get(null, function (localObject) {
            storageCollector.settingsRetrieved(localObject, true, sendResponse);
        });
    } else if (request.type === Message.clearSettings) {
        storageCollector.settingsCleared(true, sendResponse);
        storageCollector.settingsCleared(false, sendResponse);
    }

    return true;
});
