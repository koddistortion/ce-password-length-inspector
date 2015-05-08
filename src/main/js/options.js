/*global chrome */
/*global Guid */
var Placement = {};
Object.defineProperty(Placement, "inside", {
    value: "inside",
    writable: false
});
Object.defineProperty(Placement, "outside", {
    value: "outside",
    writable: false
});

var Position = {};
Object.defineProperty(Position, "left", {
    value: "left",
    writable: false
});
Object.defineProperty(Position, "right", {
    value: "right",
    writable: false
});

var UrlOverride = {};
Object.defineProperty(UrlOverride, "url", {
    value: "url",
    writable: false
});
Object.defineProperty(UrlOverride, "passwordLength", {
    value: "passwordLength",
    writable: false
});
Object.defineProperty(UrlOverride, "isRegularExpression", {
    value: "isRegularExpression",
    writable: false
});
Object.defineProperty(UrlOverride, "guid", {
    value: "guid",
    writable: false
});

var Options = function () {
    "use strict";
    this.placement = Placement.outside;
    this.position = Position.right;
    this.dynamic = true;
    this.dragging = true;
    this.urlOverridesEnabled = false;
    this.urlOverrides = {};
};

var addOverrideUrlRow = function (mapping) {
    "use strict";
    var deleteLabel = chrome.i18n.getMessage('btn_override_delete');
    var $newRow = jQuery(
        '<tr>' +
        '<td><input type="text" name="overrideUrls[]" class="url form-control"></td>' +
		'<td class="checkbox checkbox-styled text-center"><label><input type="checkbox" name="overrideRegExp[]" class="regExp"><span></span></label></td>' +
        '<td><input type="number" name="overrideLengths[]" class="length form-control" min="0" value="10"></td>' +
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

var populateOptionsForm = function (options) {
    "use strict";
    var pos = options.position !== undefined ? options.position : Position.right;
    var pla = options.placement !== undefined ? options.placement : Placement.outside;
    var dyn = options.dynamic || options.dynamic === undefined ? 'checked' : '';
    var drg = options.dragging || options.dragging === undefined ? 'checked' : '';
    var map = options.urlOverrides || {};
    var ovr = options.urlOverridesEnabled || options.urlOverridesEnabled === undefined ? 'checked' : '';

    jQuery('#position').val(pos);
    jQuery('#placement').val(pla);
    jQuery('#dynamic').prop('checked', dyn);
    jQuery('#dragging').prop('checked', drg);
    jQuery('#checkOverwrittenUrls').prop('checked', ovr);

    jQuery('#tbl_override_rows').empty();
    var i;
    for (i = 0; i < map.length; i++) {
        addOverrideUrlRow(map[i]);
    }
};

var serializeUrlMappings = function () {
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

var resetOptionsForm = function () {
    "use strict";
    if(confirm(chrome.i18n.getMessage('confirm_reset'))) {
        populateOptionsForm(new Options());
    }
};

var serializeFormForStorage = function () {
    "use strict";
    return {
        placement: jQuery('#placement').val(),
        position: jQuery('#position').val(),
        dynamic: jQuery('#dynamic').is(':checked'),
        dragging: jQuery('#dragging').is(':checked'),
        urlOverridesEnabled: jQuery('#checkOverwrittenUrls').is(':checked'),
        urlOverrides: serializeUrlMappings()
    };
};

var getOptionsFromStorage = function () {
    "use strict";
    chrome.storage.sync.get(null, function ($options) {
        populateOptionsForm($options);
    });
};

var translateOptionsPage = function () {
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

var initializeEventHandlers = function() {
    "use strict";
    jQuery('#btn_save').on('click', function () {
        chrome.storage.sync.set(serializeFormForStorage(), function () {
            var $saveMessageField = jQuery('#save_message');
            $saveMessageField.show();
            $saveMessageField.text(chrome.i18n.getMessage('saved_successfully'));
            setTimeout(function() {
                $saveMessageField.fadeOut('slow');
            }, 5000);
        });
    });
    jQuery('#btn_reset').on('click', function () {
        chrome.storage.sync.clear();
        resetOptionsForm();
    });
    jQuery('#btn_override_add').on('click', function () {
        addOverrideUrlRow();
    });
    jQuery('#btn_export').on('click', function () {
        var $ioField = jQuery('#txt_io');
        $ioField.val(JSON.stringify(serializeFormForStorage(), null, '  '));
    });
    jQuery('#btn_import').on('click', function () {
        var $ioField = jQuery('#txt_io');
        if($ioField.val().trim() === "") {
            return;
        }
        var $ioMessageField = jQuery('#import_message');
        $ioMessageField.show();
        try {
            populateOptionsForm(JSON.parse($ioField.val()));
            $ioMessageField.removeClass('label-danger').addClass('label-success').text(chrome.i18n.getMessage('imported_but_unsaved'));
        } catch (e) {
            $ioMessageField.removeClass('label-success').addClass('label-danger').text(e);
        }
        setTimeout(function() {
            $ioMessageField.fadeOut('slow');
        }, 5000);
    });

    jQuery('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var $storageControls = jQuery('#storage_controls');
		var $ioControls = jQuery('#io_controls');
        if(e.target.id !== 'tab_toggle_io') {
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
    translateOptionsPage();
    getOptionsFromStorage();
    initializeEventHandlers();
});