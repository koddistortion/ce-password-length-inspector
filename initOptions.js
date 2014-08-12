$(document).ready(function() {
    initializeMessages();
    getOptions();
    $('#save').click(function() {
        chrome.storage.sync.set(retrieveForm(), function() {
            
        });
    });
    $('#reset').click(function() {
        resetForm();
    });
});

var initializeMessages = function() {
    $('#title').text(chrome.i18n.getMessage('title'));
    $('#headline').text(chrome.i18n.getMessage('title'));

    $('#lbl_placement').text(chrome.i18n.getMessage('lbl_placement'));
    $('#lbl_placement_inside').text(chrome.i18n.getMessage('lbl_placement_inside'));
    $('#lbl_placement_outside').text(chrome.i18n.getMessage('lbl_placement_outside'));

    $('#lbl_position').text(chrome.i18n.getMessage('lbl_position'));
    $('#lbl_position_left').text(chrome.i18n.getMessage('lbl_position_left'));
    $('#lbl_position_right').text(chrome.i18n.getMessage('lbl_position_right'));

    $('#lbl_dynamic').text(chrome.i18n.getMessage('lbl_dynamic'));
    $('#lbl_dragging').text(chrome.i18n.getMessage('lbl_dragging'));

    $('#save').text(chrome.i18n.getMessage('save'));
    $('#reset').text(chrome.i18n.getMessage('reset'));


}