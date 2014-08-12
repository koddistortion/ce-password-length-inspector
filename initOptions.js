$(document).ready(function() {
    getOptions();
    $('#save').click(function() {
        chrome.storage.sync.set(retrieveForm(), function() {
            
        });
    });
    $('#reset').click(function() {
        resetForm();
    });
});