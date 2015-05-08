/*global chrome */
/*global UrlOverride*/
/*global Placement*/
/*global Position*/
/*global Settings*/
/*global Selectors*/
/*global Message*/

var PasswordLengthIndicator = function () {
    "use strict";
    this.uniqueNumber = 0;
    this.observedIcons = [];
    this.url = undefined;
    this.loadSettings();
};

PasswordLengthIndicator.prototype = {
    constructor: PasswordLengthIndicator,

    loadSettings: function () {
        "use strict";

        var self = this;
        chrome.storage.sync.get(this.options, function ($settings) {
            if ($settings !== undefined) {
                self.options = $settings;
            } else {
                self.options = new Settings();
            }

            chrome.runtime.sendMessage({type: Message.getCurrentTab}, function (response) {
                self.url = response.tab ? response.tab.url : undefined;
                self.preparePasswordFields();
                self.startBindingInterval();
                self.waitForNewPasswordFields();
            });
        });
    },

    startBindingInterval: function () {
        "use strict";
        var self = this;
        setInterval(function () {
            self.checkObservedElements();
        }, 400);
    },

    setIconPosition: function ($indicator, $field) {
        "use strict";
        if ($indicator.data(Selectors.wasDragged)) {
            return;
        }
        var $indicatorWidth = $indicator.outerWidth();
        var $indicatorHeight = $indicator.outerHeight();
        var $verticalOffset = ($field.outerHeight() - $indicatorHeight) / 2;
        var $horizontalOffset = 3;

        var $newTop, $newLeft;
        if (this.options.position === Position.right) {
            if (this.options.placement === Placement.inside) {
                $newLeft = $field.offset().left + $field.outerWidth() - $indicatorWidth - $horizontalOffset;
            } else {
                $newLeft = $field.offset().left + $field.outerWidth() + $horizontalOffset;
            }
        } else {
            if (this.options.placement === Placement.inside) {
                $newLeft = $field.offset().left + $horizontalOffset;
            } else {
                $newLeft = $field.offset().left - $indicatorWidth - $horizontalOffset;
            }
        }
        $newTop = $field.offset().top + $verticalOffset;
        $indicator.css("top", $newTop);
        $indicator.css("left", $newLeft);
    },

    getMaxLength: function ($field) {
        "use strict";
        if (this.options.urlOverridesEnabled && this.url && this.options.urlOverrides) {
            var mappings = this.options.urlOverrides, i, mapping, url, length, isRegExp;
            for (i = 0; i < mappings.length; i++) {
                mapping = mappings[i];
                if (mapping && mapping[UrlOverride.url] && mapping[UrlOverride.passwordLength]) {
                    length = mapping[UrlOverride.passwordLength];
                    url = mapping[UrlOverride.url];
                    isRegExp = mapping[UrlOverride.isRegularExpression];
                    if (isRegExp) {
                        try {
                            if (new RegExp(url, "i").test(this.url)) {
                                return length;
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    } else {
                        if (this.url.toLowerCase().indexOf(url) >= 0) {
                            return length;
                        }
                    }
                }
            }
        }
        return $field.attr('maxLength');
    },

    attachIcon: function ($field) {
        "use strict";
        if ($field.data(Selectors.hasIndicator)) {
            return;
        }
        $field.data(Selectors.hasIndicator, true);
        var $maxLength = this.getMaxLength($field);
        var $text = $maxLength || "&infin;";
        var $className = $maxLength ? "" : "large-font";
        var $zIndex = this.getZLevel($field);
        var $indicator = jQuery("<div></div>")
            .addClass("pw-inspector-length")
            .addClass($className)
            .html($text)
            .css("zIndex", $zIndex)
            .data(Selectors.referencedFieldId, $field.data(Selectors.passwordFieldId));
        jQuery('body').append($indicator);
        if (this.options.dragging) {
            $indicator.draggable({
                cursorAt: {
                    top: 10,
                    left: 10
                },
                start: function () {
                    jQuery(this).data(Selectors.wasDragged, true);
                }
            });
        }
        this.observedIcons.push($indicator);
        this.setIconPosition($indicator, $field);
    },

    getZLevel: function ($zIndexField) {
        "use strict";
        var z;
        var $zIndex = 0;
        var $parents = $zIndexField.parentsUntil('body');
        $parents.each(function () {
            z = $zIndexField.css("z-index");
            if (!isNaN(z) && parseInt(z, 10) > $zIndex) {
                $zIndex = parseInt(z, 10);
            }
        });

        if (isNaN($zIndex) || $zIndex < 1) {
            $zIndex = 1;
        }
        $zIndex += 1;
        return $zIndex;
    },

    setUniqueId: function ($field) {
        "use strict";
        if ($field && !$field.data(Selectors.passwordFieldId)) {
            var $fieldId = $field.attr("id");
            if ($fieldId) {
                var $foundIds = jQuery("input#" + this.prepareId($fieldId));
                if ($foundIds.length === 1) {
                    $field.attr("data-" + Selectors.passwordFieldId, $fieldId);
                    return;
                }
            }
            this.uniqueNumber += 1;
            $field.attr("data-" + Selectors.passwordFieldId, "pwlId" + String(this.uniqueNumber));
        }
    },

    prepareId: function (id) {
        "use strict";
        return id
            .replace(":", "\\:")
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
    },

    preparePasswordFields: function () {
        "use strict";
        var $fields = [], self = this;
        jQuery(Selectors.passwordInputType).each(function () {
            var $field = self.preparePasswordField(jQuery(this));
            if ($field) {
                $fields.push($field);
            }
        });
        return $fields;
    },

    preparePasswordField: function ($field) {
        "use strict";
        if ($field.is(":visible") && $field.css("visibility") !== "hidden" && $field.css("visibility") !== "collapsed") {
            if (jQuery.inArray($field, this.observedIcons)) {
                this.setUniqueId($field);
                this.attachIcon($field);
                return $field;
            }
        }
        return undefined;
    },

    checkObservedElements: function () {
        "use strict";
        if (this.observingLock) {
            return;
        }
        this.observingLock = true;
        var self = this;
        jQuery.each(this.observedIcons, function ($index, $iconField) {
            if ($iconField && $iconField.length === 1) {
                var $fieldId = $iconField.data(Selectors.referencedFieldId);
                var $selector = "input[data-" + Selectors.passwordFieldId + "='" + $fieldId + "']:first";
                var $field = jQuery($selector);
                if (!$field || $field.length !== 1) {
                    $iconField.remove();
                    self.observedIcons.splice($index, 1);
                } else if (!$field.is(":visible")) {
                    $iconField.hide();
                } else if ($field.is(":visible")) {
                    $iconField.show();
                    self.setIconPosition($iconField, $field);
                    $field.data(Selectors.hasIndicator, true);
                }
            } else {
                self.observedIcons.splice($index, 1);
            }
        });
        this.observingLock = false;
    },

    waitForNewPasswordFields: function () {
        "use strict";
        if (this.waitingLock) {
            return;
        }
        if (this.options.dynamic) {
            this.waitingLock = true;
            var self = this;
            jQuery(document).arrive(Selectors.passwordInputType, function () {
                self.preparePasswordField(jQuery(this));
            });
        }
    }

};
new PasswordLengthIndicator();