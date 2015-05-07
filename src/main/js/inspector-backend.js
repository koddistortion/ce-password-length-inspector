chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.getCurrentlyActiveTab == true)
		sendResponse({tab: sender.tab});
});