/*jslint nomen: true, sloppy: true, devel: false, browser: true, maxerr: 50, indent: 4, white: true*/
/*global module: false, process: false, require: false, console: false, clearInterval: false, clearTimeout: false, setInterval: false, setTimeout: false */
// RAX Beacon API - safe app wrapper for CMS events
var Rax = ('./rax'),
	Emitter = require('events').EventEmitter,
	emitter = new Emitter(),
	Beacon = module.exports = {},
	eventMap;

/*
Event names follow this format:

<category>:<temporal prefix>-<action>

*/
emitter.setMaxListeners(0);
eventMap = {
	'core': ['core:pre-start', 'core:pre-boot', 'core:post-start', 'core:post-init', 'core:db'],
	'theme': ['theme:pre-load']
}

//emitter.on('newListener', function (event, cb) {});

// emitter wrappers
Beacon.on = function (event, callback) {
	emitter.on(event, callback);
};

Beacon.once = function (event, callback) {
	emitter.once(event, callback);
};

Beacon.emit = function (event) {
	emitter.emit(event);
}
