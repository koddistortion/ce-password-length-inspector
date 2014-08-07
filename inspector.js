var Selectors = {};
Object.defineProperty(Selectors, "hasIndicator", {
    value: "pwl-has-password-indicator",
    writable: false
});
Object.defineProperty(Selectors, "size", {
    value: "pwl-size",
    writable: false
});
Object.defineProperty(Selectors, "offset", {
    value: "pwl-offset",
    writable: false
});
Object.defineProperty(Selectors, "referencedFieldId", {
    value: "pwl-ref-id",
    writable: false
});
Object.defineProperty(Selectors, "passwordFieldId", {
    value: "pwl-field-id",
    writable: false
});
Object.defineProperty(Selectors, "passwordInputType", {
    value: "input[type='password']",
    writable: false
});
Object.defineProperty(Selectors, "wasDragged", {
    value: "pwl-was-dragged",
    writable: false
});

var options = {
    'placement': 'outside',
    'position': 'right',
    'dynamic': true
};

var PasswordLengthIndicator = function() {
    this.isActive = false;
    this.attachedFields = {};
    this.uniqueNumber = 0;
    this.observedIcons = [];
    this.options = this.loadOptions();
};

PasswordLengthIndicator.prototype.storeOptions = function($options) {
    if ($options === undefined) {
        $options = options;
    }
    chrome.storage.sync.set($options, function() {
        console.log('options persisted');
    });
};

PasswordLengthIndicator.prototype.loadOptions = function() {
    var $options = chrome.storage.sync.get('options', function() {
        console.log('options retrieved');
    });
    if ($options === undefined) {
        this.storeOptions();
    }
    return $options;
};

PasswordLengthIndicator.prototype.setIconPosition = function($indicator, $field) {
    if ($indicator.data(Selectors.wasDragged)) {
        return;
    }
    var $newTop = $field.offset().top + ($indicator.data(Selectors.offset));
    var $newLeft = $field.offset().left + $field.outerWidth() + ($indicator.data(Selectors.size) / 4);
    $indicator.css("top", $newTop);
    $indicator.css("left", $newLeft);
};

PasswordLengthIndicator.prototype.attachIcon = function($field) {
    if ($field.data(Selectors.hasIndicator)) {
        return;
    }
    $field.data(Selectors.hasIndicator, true);
    var $maxLength = $field.attr("maxLength");
    var $text = $maxLength ? $maxLength : "&infin;";
    var $className = $maxLength ? "" : "large-font";
    var $size = 20;
    var $offset = 0;
    var $zIndex = this.getZLevel($field);
    var $indicator = $("<div></div>")
            .addClass("pw-inspector-length")
            .addClass($className)
            .html($text)
            .css("zIndex", $zIndex)
            .data(Selectors.size, $size)
            .data(Selectors.referencedFieldId, $field.data(Selectors.passwordFieldId))
            .data(Selectors.offset, $offset);
    $('body').append($indicator);
    $indicator.draggable({
        cursorAt: {
            top: 10,
            left: 10
        },
        start: function() {
            $(this).data(Selectors.wasDragged, true);
        }
    });
    this.observedIcons.push($indicator);
    this.setIconPosition($indicator, $field);
};

PasswordLengthIndicator.prototype.getZLevel = function($zIndexField) {
    var z;
    var $zIndex = 0;
    var c = 0;
    while ($zIndexField.length > 0) {
        z = $zIndexField.css("z-index");
        if (!isNaN(z) && parseInt(z) > $zIndex) {
            $zIndex = parseInt(z);
        }
        $zIndexField = $zIndexField.parent();
        if (c > 100) {
            break;
        }
        c++;
    }
    if (isNaN($zIndex) || $zIndex < 1) {
        $zIndex = 1;
    }
    $zIndex += 1;
    return $zIndex;
};

PasswordLengthIndicator.prototype.setUniqueId = function($field) {
    if ($field && !$field.data(Selectors.passwordFieldId)) {
        var $fieldId = $field.attr("id");
        if ($fieldId) {
            var $foundIds = $("input#" + this.prepareId($fieldId));
            if ($foundIds.length === 1) {
                $field.attr("data-" + Selectors.passwordFieldId, $fieldId);
                return;
            }
        }
        this.uniqueNumber += 1;
        $field.attr("data-" + Selectors.passwordFieldId, "pwlId" + String(this.uniqueNumber));
    }
};

PasswordLengthIndicator.prototype.prepareId = function(id) {
    id = id.replace(":", "\\:")
            .replace("#", "\\#")
            .replace(".", "\\.")
            .replace(",", "\\,")
            .replace("[", "\\[")
            .replace("]", "\\]")
            .replace("(", "\\(")
            .replace(")", "\\)")
            .replace("'", "\\'")
            .replace(" ", "\\ ")
            .replace("\"", "\\\"");
    return id;
};

PasswordLengthIndicator.prototype.preparePasswordFields = function() {
    var $fields = [];
    var $self = this;
    $(Selectors.passwordInputType).each(function() {
        var $field = $self.preparePasswordField($(this));
        if ($field) {
            $fields.push($field);
        }
    });
    return $fields;
};

PasswordLengthIndicator.prototype.preparePasswordField = function($field) {
    if ($field.is(":visible") && $field.css("visibility") !== "hidden" && $field.css("visibility") !== "collapsed") {
        if ($.inArray($field, this.observedIcons)) {
            this.setUniqueId($field);
            this.attachIcon($field);
            return $field;
        }
    }
    return undefined;
};

PasswordLengthIndicator.prototype.checkObservedElements = function() {
    if (this.observingLock) {
        return;
    }
    this.observingLock = true;
    var $self = this;
    $.each(this.observedIcons, function($index, $iconField) {
        if ($iconField && $iconField.length === 1) {
            var $fieldId = $iconField.data(Selectors.referencedFieldId);
            var $selector = "input[data-" + Selectors.passwordFieldId + "='" + $fieldId + "']:first";
            var $field = $($selector);
            if (!$field || $field.length !== 1) {
                $iconField.remove();
                $self.observedIcons.splice($index, 1);
            } else if (!$field.is(":visible")) {
                $iconField.hide();
            } else if ($field.is(":visible")) {
                $iconField.show();
                $self.setIconPosition($iconField, $field);
                $field.data(Selectors.hasIndicator, true);
            }
        } else {
            $self.observedIcons.splice($index, 1);
        }
    });
    this.observingLock = false;
};

PasswordLengthIndicator.prototype.waitForNewPasswordFields = function() {
    if (this.waitingLock) {
        return;
    }
    this.waitingLock = true;
    var $self = this;
    $(document).arrive(Selectors.passwordInputType, function() {
        $self.preparePasswordField($(this));
    });
};

var pwIndicator = new PasswordLengthIndicator();
pwIndicator.preparePasswordFields();
pwIndicator.waitForNewPasswordFields();
$(function() {
    setInterval(function() {
        pwIndicator.checkObservedElements();
    }, 400);
});