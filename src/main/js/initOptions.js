$(document).ready(function () {
	translateOptionsPage();
	getOptions();
	$('#save').click(function () {
		chrome.storage.sync.set(serializeFormForStorage(), function () {
		});
	});
	$('#reset').click(function () {
		chrome.storage.sync.clear();
		resetOptionsForm();
	});
	$('#btn_override_add').click(function () {
		addOverrideUrlRow();
	});
});

var translateOptionsPage = function () {
	$('[data-translate]').each(function () {
		var $element = jQuery(this);
		var translationId = $element.data('translate');
		var translatedText = chrome.i18n.getMessage(translationId);
		if (translatedText) {
			$element.html(translatedText);
		} else {
			$element.text('!!!' + $element.text());
		}
	});
};