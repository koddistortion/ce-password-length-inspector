var Selectors = {};
Object.defineProperty(Selectors, "hasIndicator", {
	value: "pwl-has-password-indicator",
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

var PasswordLengthIndicator = function () {
	this.uniqueNumber = 0;
	this.observedIcons = [];
	this.url = undefined;
	this.loadOptions();
};

PasswordLengthIndicator.prototype.loadOptions = function () {
	var self = this;
	chrome.storage.sync.get(this.options, function ($options) {
		if ($options !== undefined) {
			self.options = $options;
		} else {
			self.options = new Options();
		}

		chrome.runtime.sendMessage({getCurrentlyActiveTab: true}, function(response) {
			self.url = response.tab ? response.tab.url : undefined;
			self.preparePasswordFields();
			self.startBindingInterval();
			self.waitForNewPasswordFields();
		});
	});
};

PasswordLengthIndicator.prototype.startBindingInterval = function () {
	var self = this;
	setInterval(function () {
		self.checkObservedElements();
	}, 400);
};

PasswordLengthIndicator.prototype.setIconPosition = function ($indicator, $field) {
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
};

PasswordLengthIndicator.prototype.getMaxLength = function ($field) {
	if (this.options.allowUrlOverride && this.url && this.options.overwrittenUrlMappings) {
		var mappings = this.options.overwrittenUrlMappings;
		for (var i=0; i< mappings.length; i++) {
			var mapping = mappings[i];
			if (mapping && mapping[OverrideUrlMapping.url] && mapping[OverrideUrlMapping.passwordLength]) {
				var length = mapping[OverrideUrlMapping.passwordLength];
				var url = mapping[OverrideUrlMapping.url];
				var isRegExp = mapping[OverrideUrlMapping.isRegularExpression];
				if(isRegExp) {
					try {
						if (new RegExp(url, "i").test(this.url)) {
							return length;
						}
					} catch (e) {
						console.error(e);
					}
				} else {
					if(this.url.toLowerCase().indexOf(url)) {
						return length;
					}
				}
			}
		}
	}
	return $field.attr('maxLength');
};

PasswordLengthIndicator.prototype.attachIcon = function ($field) {
	if ($field.data(Selectors.hasIndicator)) {
		return;
	}
	$field.data(Selectors.hasIndicator, true);
	var $maxLength = this.getMaxLength($field);
	var $text = $maxLength ? $maxLength : "&infin;";
	var $className = $maxLength ? "" : "large-font";
	var $zIndex = this.getZLevel($field);
	var $indicator = $("<div></div>")
		.addClass("pw-inspector-length")
		.addClass($className)
		.html($text)
		.css("zIndex", $zIndex)
		.data(Selectors.referencedFieldId, $field.data(Selectors.passwordFieldId));
	$('body').append($indicator);
	if (this.options.dragging) {
		$indicator.draggable({
			cursorAt: {
				top: 10,
				left: 10
			},
			start: function () {
				$(this).data(Selectors.wasDragged, true);
			}
		});
	}
	this.observedIcons.push($indicator);
	this.setIconPosition($indicator, $field);
};

PasswordLengthIndicator.prototype.getZLevel = function ($zIndexField) {
	var z;
	var $zIndex = 0;
	var $parents = $zIndexField.parentsUntil('body');
	$parents.each(function() {
		z = $zIndexField.css("z-index");
		if (!isNaN(z) && parseInt(z) > $zIndex) {
			$zIndex = parseInt(z);
		}
	});

	if (isNaN($zIndex) || $zIndex < 1) {
		$zIndex = 1;
	}
	$zIndex += 1;
	return $zIndex;
};

PasswordLengthIndicator.prototype.setUniqueId = function ($field) {
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

PasswordLengthIndicator.prototype.prepareId = function (id) {
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

PasswordLengthIndicator.prototype.preparePasswordFields = function () {
	var $fields = [];
	var self = this;
	$(Selectors.passwordInputType).each(function () {
		var $field = self.preparePasswordField($(this));
		if ($field) {
			$fields.push($field);
		}
	});
	return $fields;
};

PasswordLengthIndicator.prototype.preparePasswordField = function ($field) {
	if ($field.is(":visible") && $field.css("visibility") !== "hidden" && $field.css("visibility") !== "collapsed") {
		if ($.inArray($field, this.observedIcons)) {
			this.setUniqueId($field);
			this.attachIcon($field);
			return $field;
		}
	}
	return undefined;
};

PasswordLengthIndicator.prototype.checkObservedElements = function () {
	if (this.observingLock) {
		return;
	}
	this.observingLock = true;
	var self = this;
	$.each(this.observedIcons, function ($index, $iconField) {
		if ($iconField && $iconField.length === 1) {
			var $fieldId = $iconField.data(Selectors.referencedFieldId);
			var $selector = "input[data-" + Selectors.passwordFieldId + "='" + $fieldId + "']:first";
			var $field = $($selector);
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
};

PasswordLengthIndicator.prototype.waitForNewPasswordFields = function () {
	if (this.waitingLock) {
		return;
	}
	if (this.options.dynamic) {
		this.waitingLock = true;
		var self = this;
		$(document).arrive(Selectors.passwordInputType, function () {
			self.preparePasswordField($(this));
		});
	}
};

new PasswordLengthIndicator();