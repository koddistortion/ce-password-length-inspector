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
    placement = Placement.outside;
    position = Position.right;
    dynamic = true;
};

var getOptions = function() {
    chrome.storage.sync.get('options', function(element) {
        fillForm(element.options);
    });
};

var fillForm = function(options) {
    console.trace(options);
    var pos = options.position !== undefined ? options.position : Position.right;
    var pla = options.placement !== undefined ? options.placement : Placement.outside;
    var chk = options.dynamic || options.dynamic === undefined ? 'checked' : '';
    $('#position').val(pos);
    $('#placement').val(pla);
    $('#dynamic').prop('checked', chk);
};

var retrieveForm = function() {
    return {
        placement: $('#placement').val(),
        position: $('#position').val(),
        dynamic: $('#dynamic').is(':checked')
    };
};