/*global chrome*/
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

var Message = {};
Object.defineProperty(Message, "getCurrentTab", {
    value: "getCurrentTab",
    writable: false
});
Object.defineProperty(Message, "getSettings", {
    value: "getSettings",
    writable: false
});
Object.defineProperty(Message, "getSettingsResult", {
    value: "getSettingsResult",
    writable: false
});
Object.defineProperty(Message, "setSettings", {
    value: "setSettings",
    writable: false
});
Object.defineProperty(Message, "setSettingsResult", {
    value: "setSettingsResult",
    writable: false
});
Object.defineProperty(Message, "clearSettings", {
    value: "clearSettings",
    writable: false
});
Object.defineProperty(Message, "clearSettingsResult", {
    value: "clearSettingsResult",
    writable: false
});


var Settings = function () {
    "use strict";
    this.placement = Placement.outside;
    this.position = Position.right;
    this.dynamic = true;
    this.dragging = true;
    this.urlOverridesEnabled = false;
    this.urlOverridesManipulateDOM = false;
    this.urlOverrides = {};
    this.lastUpdate = new Date();
    this.version = chrome.runtime.getManifest().version;
};