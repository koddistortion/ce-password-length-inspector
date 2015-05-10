/*global chrome */
/*global Guid */
/*global UrlOverride*/
/*global Placement*/
/*global Position*/
/*global Settings*/
/*global Message*/

var SettingsPage = function () {
};

SettingsPage.prototype.addOverrideUrlRow = function (mapping) {
    "use strict";
    var deleteLabel = chrome.i18n.getMessage('btn_override_delete');
    var $newRow = jQuery(
        '<tr>' +
        '<td><input type="text" name="overrideUrls[]" class="url form-control input-sm"></td>' +
        '<td class="checkbox checkbox-styled text-center"><label><input type="checkbox" name="overrideRegExp[]" class="regExp"><span></span></label></td>' +
        '<td><input type="number" name="overrideLengths[]" class="length form-control input-sm" min="0" value="10"></td>' +
        '<td><a class="btn btn-danger btn-xs btn-flat delete">' + deleteLabel + '</a><input type="hidden" class="guid" value="' + Guid.raw() + '"/></td>' +
        '</tr>'
    );
    if (mapping && mapping[UrlOverride.url] && mapping[UrlOverride.passwordLength]) {
        $newRow.find('input.url').val(mapping[UrlOverride.url]);
        $newRow.find('input.regExp').prop('checked', mapping[UrlOverride.isRegularExpression]);
        $newRow.find('input.length').val(mapping[UrlOverride.passwordLength]);
        $newRow.find('input.guid').val(mapping[UrlOverride.guid]);
    }
    jQuery('#tbl_override_rows').append($newRow);
    $newRow.find('a.delete').on('click', function () {
        jQuery(this).closest('tr').remove();
    });
    return $newRow;
};

SettingsPage.prototype.populateSettingsForm = function (settings) {
    "use strict";
    var pos = settings.position !== undefined ? settings.position : Position.right;
    var pla = settings.placement !== undefined ? settings.placement : Placement.outside;
    var dyn = settings.dynamic || (settings.dynamic === undefined ? 'checked' : '');
    var drg = settings.dragging || (settings.dragging === undefined ? 'checked' : '');
    var map = settings.urlOverrides || {};
    var ovr = settings.urlOverridesEnabled === true ? 'checked' : '';
    var dom = settings.urlOverridesManipulateDOM === true ? 'checked' : '';

    jQuery('#position').val(pos);
    jQuery('#placement').val(pla);
    jQuery('#dynamic').prop('checked', dyn);
    jQuery('#dragging').prop('checked', drg);
    jQuery('#checkOverwrittenUrls').prop('checked', ovr);
    jQuery('#enableMaxLengthDomOverride').prop('checked', dom);

    jQuery('#tbl_override_rows').empty();
    var i;
    for (i = 0; i < map.length; i++) {
        this.addOverrideUrlRow(map[i]);
    }
};

SettingsPage.prototype.serializeUrlMappings = function () {
    "use strict";
    var $mappings = [];
    jQuery('#tbl_override_rows').find('tr').each(function () {
        var url = jQuery(this).find('input.url').val().trim();
        var length = jQuery(this).find('input.length').val();
        var isRegExp = jQuery(this).find('input.regExp').is(':checked');
        var guid = jQuery(this).find('input.guid').val();
        if (url && length) {
            var $fields = {};
            $fields[UrlOverride.url] = url;
            $fields[UrlOverride.passwordLength] = length;
            $fields[UrlOverride.isRegularExpression] = isRegExp;
            $fields[UrlOverride.guid] = guid;
            $mappings.push($fields);
        }
    });
    return $mappings;
};

SettingsPage.prototype.resetOptionsForm = function () {
    "use strict";
    if (confirm(chrome.i18n.getMessage('confirm_reset'))) {
        this.clearSettings();
        this.populateSettingsForm(new Settings());
    }
};

SettingsPage.prototype.serializeFormForStorage = function () {
    "use strict";
    return {
        placement: jQuery('#placement').val(),
        position: jQuery('#position').val(),
        dynamic: jQuery('#dynamic').is(':checked'),
        dragging: jQuery('#dragging').is(':checked'),
        urlOverridesManipulateDOM: jQuery('#enableMaxLengthDomOverride').is(':checked'),
        urlOverridesEnabled: jQuery('#checkOverwrittenUrls').is(':checked'),
        urlOverrides: this.serializeUrlMappings(),
        lastUpdate: new Date(),
        version: chrome.runtime.getManifest().version
    };
};

SettingsPage.prototype.loadSettings = function () {
    "use strict";
    var self = this;

    chrome.runtime.sendMessage({type: Message.getSettings}, function (response) {
        var settings = response.settings.latest;
        if(!settings) {
            settings = new Settings();
        }
        self.populateSettingsForm(settings);
        self.updateDomOverrideCheckBox();
    });
};

SettingsPage.prototype.saveSettings = function(settings) {
    "use strict";
    var self = this;

    chrome.runtime.sendMessage({type: Message.setSettings, settings: settings}, function (response) {
        console.log(response);
        var $saveMessageField = jQuery('#save_message');
        $saveMessageField.slideDown();
        $saveMessageField.text(chrome.i18n.getMessage('saved_successfully'));
        setTimeout(function () {
            $saveMessageField.slideUp();
        }, 5000);
    });
};

SettingsPage.prototype.clearSettings = function() {
    "use strict";
    chrome.runtime.sendMessage({type: Message.clearSettings}, function (response) {
    });
};

SettingsPage.prototype.translateOptionsPage = function () {
    "use strict";
    jQuery('[data-translate]').each(function () {
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


SettingsPage.prototype.updateDomOverrideCheckBox = function () {
    "use strict";
    var $enableOverrideBox = jQuery('#checkOverwrittenUrls');
    if ($enableOverrideBox.is(':checked')) {
        jQuery('#enableMaxLengthDomOverride').removeAttr('disabled');
    } else {
        jQuery('#enableMaxLengthDomOverride').attr('disabled', 'disabled');
    }
};

SettingsPage.prototype.initializeEventHandlers = function () {
    "use strict";
    var self = this;
    jQuery('#btn_save').on('click', function () {
        self.saveSettings(self.serializeFormForStorage());
    });
    jQuery('#btn_reset').on('click', function () {
        self.resetOptionsForm();
    });
    jQuery('#btn_override_add').on('click', function () {
        self.addOverrideUrlRow();
    });
    jQuery('#btn_export').on('click', function () {
        var $ioField = jQuery('#txt_io');
        $ioField.val(JSON.stringify(self.serializeFormForStorage(), null, '  '));
    });
    jQuery('#btn_import').on('click', function () {
        var $ioField = jQuery('#txt_io');
        if ($ioField.val().trim() === "") {
            return;
        }
        var $ioMessageField = jQuery('#import_message');
        $ioMessageField.slideDown();
        try {
            self.populateSettingsForm(JSON.parse($ioField.val()));
            $ioMessageField.removeClass('text-danger').addClass('text-success').text(chrome.i18n.getMessage('imported_but_unsaved'));
        } catch (e) {
            $ioMessageField.removeClass('text-success').addClass('text-danger').text(e);
        }
        setTimeout(function () {
            $ioMessageField.slideUp();
        }, 5000);
    });

    var $enableOverrideBox = jQuery('#checkOverwrittenUrls');
    $enableOverrideBox.on('change', function () {
        self.updateDomOverrideCheckBox();
    });

    jQuery('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var $storageControls = jQuery('#storage_controls');
        var $ioControls = jQuery('#io_controls');
        if (e.target.id !== 'tab_toggle_io') {
            $storageControls.show();
            $ioControls.hide();
        } else {
            $storageControls.hide();
            $ioControls.show();
        }
    });
};


jQuery(document).ready(function () {
    "use strict";
    var settingsPage = new SettingsPage();
    settingsPage.translateOptionsPage();
    settingsPage.initializeEventHandlers();
    settingsPage.loadSettings();
});