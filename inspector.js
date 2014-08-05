function PasswordLengthIndicator() {
	this.isActive = false;
}

PasswordLengthIndicator.prototype.setIconPosition = function($indicator, $field) {
	$indicator.css("top", $field.offset().top + $indicator.data("offset"))
		.css("left", $field.offset().left + $field.outerWidth() + ($indicator.data("size") / 4))
}

PasswordLengthIndicator.prototype.attachIcon = function($field) {
	$field.data("hasPasswordIndicator", "1");
	var $maxLength = $field.attr("maxLength");
	var $text = $maxLength ? $maxLength : "&infin;";
	var $className = $maxLength ? "" : "large-font";
	var $size = 20;
	var $offset = Math.floor(($field.outerHeight() - $size) / 2);
	var $zIndex = this.getZLevel($field);
	
	var $indicator = $("<div></div>")
        .addClass("pw-inspector-length")
		.addClass($className)
		.html($text)
		.css("z-index", $zIndex)
		.data("size", $size)
		.data("offset", $offset);
	$('body').append($indicator);
	$indicator.draggable({ cursorAt: { top: 10, left: 10 } });
	this.setIconPosition($indicator, $field);
}

PasswordLengthIndicator.prototype.getZLevel = function($zIndexField) {
    var z;
    var $zIndex = 0;
	var c = 0;
	while($zIndexField.length > 0) {
		z = $zIndexField.css("z-index");
		if(!isNaN(z) && parseInt(z) > $zIndex) {
			$zIndex = parseInt(z);
		}
		$zIndexField = $zIndexField.parent();
		if(c > 100) {
			break;
		}
		c++;
	}
	if(isNaN($zIndex) || $zIndex < 1) {
		$zIndex = 1;
	}
	$zIndex += 1;
}

PasswordLengthIndicator.prototype.preparePasswordFields = function() {
	if (this.isActive) {
		return;
	}
	try {
		this.isActive = true;
        var $self = this;
		$("input[type='password']").each(function() {
			var $field = $(this);
			if(!$field.data("hasPasswordIndicator")) {
                if($self.fieldIsEligible($field)) {
                    $self.attachIcon($field);
                }
			}
		});
		setTimeout(this.preparePasswordFields(), 400);
	} catch(e) {
		console.trace(e);
	} finally {
		this.isActive = false;
	}
};

PasswordLengthIndicator.prototype.fieldIsEligible = function($field) {
    return $field.css("visibility") != "hidden" && $field.is(":visible");
}

var pwIndicator = new PasswordLengthIndicator();
$(function() {
/*
document.addEventListener('DOMSubtreeModified', function() {
    pwIndicator.attachPWFields();
  }, true);*/
  setTimeout(pwIndicator.preparePasswordFields(), 400);
});