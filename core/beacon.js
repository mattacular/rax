/*jslint nomen: true, sloppy: true, devel: false, browser: true, maxerr: 50, indent: 4, white: true*/
/*global module: false, process: false, require: false, console: false, clearInterval: false, clearTimeout: false, setInterval: false, setTimeout: false */
// RAX Beacon API - safe app wrapper for CMS events
var Rax = ('./rax'),
	Emitter = require('events').EventEmitter,
	emitter = new Emitter();
	Beacon = module.exports = {};

Beacon.on = function (event, callback) {
	emitter.on('rax:' + event, callback);
};

Beacon.once = function (event, callback) {
	emitter.once('rax:' + event, callback);
};

Beacon.emit = function (event) {
	emitter.emit('rax:' + event);
}