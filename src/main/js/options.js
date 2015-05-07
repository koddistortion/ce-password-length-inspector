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

var OverrideUrlMapping = {};
Object.defineProperty(OverrideUrlMapping, "url", {
	value: "url",
	writable: false
});
Object.defineProperty(OverrideUrlMapping, "passwordLength", {
	value: "passwordLength",
	writable: false
});
Object.defineProperty(OverrideUrlMapping, "isRegularExpression", {
	value: "isRegularExpression",
	writable: false
});

var Options = function () {
	this.placement = Placement.outside;
	this.position = Position.right;
	this.dynamic = true;
	this.dragging = true;
	this.allowUrlOverride = false;
	this.overwrittenUrlMappings = {};
};

var getOptions = function () {
	chrome.storage.sync.get(null, function ($options) {
		console.log($options);
		populateOptionsForm($options);
	});
};

var populateOptionsForm = function (options) {
	var pos = options.position !== undefined ? options.position : Position.right;
	var pla = options.placement !== undefined ? options.placement : Placement.outside;
	var dyn = options.dynamic || options.dynamic === undefined ? 'checked' : '';
	var drg = options.dragging || options.dragging === undefined ? 'checked' : '';
	var map = options.overwrittenUrlMappings || {};
	var ovr = options.allowUrlOverride || options.allowUrlOverride === undefined ? 'checked' : '';

	$('#position').val(pos);
	$('#placement').val(pla);
	$('#dynamic').prop('checked', dyn);
	$('#dragging').prop('checked', drg);
	$('#checkOverwrittenUrls').prop('checked', ovr);

	jQuery('#tbl_override_rows').empty();
	for (var i = 0; i < map.length; i++) {
		addOverrideUrlRow(map[i]);
	}
};

var addOverrideUrlRow = function (mapping) {
	var deleteLabel = chrome.i18n.getMessage('btn_override_delete');
	var $newRow = jQuery(
		'<tr>' +
		'<td><input type="text" name="overrideUrls[]" class="url form-control"></td>' +
		'<td><input type="checkbox" name="overrideRegExp[]" class="regExp"></td>' +
		'<td><input type="number" name="overrideLengths[]" class="length form-control" min="0" value="10"></td>' +
		'<td><a class="btn btn-danger delete">' + deleteLabel + '</a></td>' +
		'</tr>'
	);
	if (mapping && mapping[OverrideUrlMapping.url] && mapping[OverrideUrlMapping.passwordLength]) {
		$newRow.find('input.url').val(mapping[OverrideUrlMapping.url]);
		$newRow.find('input.regExp').prop('checked', mapping[OverrideUrlMapping.isRegularExpression]);
		$newRow.find('input.length').val(mapping[OverrideUrlMapping.passwordLength]);
	}
	jQuery('#tbl_override_rows').append($newRow);
	$newRow.find('a.delete').on('click', function () {
		jQuery(this).closest('tr').remove();
	});
	return $newRow;
};

var serializeFormForStorage = function () {
	return {
		placement: $('#placement').val(),
		position: $('#position').val(),
		dynamic: $('#dynamic').is(':checked'),
		dragging: $('#dragging').is(':checked'),
		allowUrlOverride: $('#checkOverwrittenUrls').is(':checked'),
		overwrittenUrlMappings: serializeUrlMappings()
	};
};

var serializeUrlMappings = function () {
	var $mappings = [];
	$('#tbl_override_rows').find('tr').each(function () {
		var $url = $(this).find('input.url').val().trim();
		var $length = $(this).find('input.length').val();
		var $isRegExp = $(this).find('input.regExp').is(':checked');
		if ($url && $length) {
			var $fields = {};
			$fields[OverrideUrlMapping.url] = $url;
			$fields[OverrideUrlMapping.passwordLength] = $length;
			$fields[OverrideUrlMapping.isRegularExpression] = $isRegExp;
			$mappings.push($fields);
		}
	});
	return $mappings;
};

var resetOptionsForm = function () {
	populateOptionsForm(new Options());
};