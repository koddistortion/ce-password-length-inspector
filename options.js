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

var Options = function() {
    this.placement = Placement.outside;
    this.position = Position.right;
    this.dynamic = true;
    this.dragging = true;
	this.overwrittenUrlMappings = {};
};

var getOptions = function() {
    chrome.storage.sync.get(null, function($options) {
        fillForm($options);
    });
};

var fillForm = function(options) {
    var pos = options.position !== undefined ? options.position : Position.right;
    var pla = options.placement !== undefined ? options.placement : Placement.outside;
    var dyn = options.dynamic || options.dynamic === undefined ? 'checked' : '';
    var drg = options.dragging || options.dragging === undefined ? 'checked' : '';
	var map = options.overwrittenUrlMappings || {};
    $('#position').val(pos);
    $('#placement').val(pla);
    $('#dynamic').prop('checked', dyn);
    $('#dragging').prop('checked', drg);
	$('#url_length_mapping').val(JSON.stringify(map, null, '\t'));
};

var retrieveForm = function() {
    return {
        placement: $('#placement').val(),
        position: $('#position').val(),
        dynamic: $('#dynamic').is(':checked'),
        dragging: $('#dragging').is(':checked'),
		overwrittenUrlMappings: JSON.parse($('#url_length_mapping').val())
    };
};

var resetForm = function() {
    chrome.storage.sync.clear();
    fillForm(new Options());
};