$(document).ready(function() {
    getOptions();
    $('#save').click(function() {
        chrome.storage.sync.set({'options' : retrieveForm()}, function() {
            
        });
    });
});