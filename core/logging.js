/*jslint nomen: true, sloppy: true, devel: false, browser: true, maxerr: 50, indent: 4, white: true*/
/*global module: false, require: false, console: false, clearInterval: false, clearTimeout: false, setInterval: false, setTimeout: false */
// RAX Core - logging.js
// Logging Suite
var	Logs = module.exports = {}
,	Rax = require('./rax');

function cLog(msg, color) {
	if (Rax.cfg.ENABLE_APP_LOGGING) {
		console.log((msg)[color]);
	}
}

// color logging shortcuts
Logs.g = function (msg) { cLog(msg, 'green'); };
Logs.r = Logs.error = function (msg) { cLog(msg, 'red'); };
Logs.y = Logs.warn = function (msg) { cLog(msg, 'yellow'); };
Logs.c = function (msg) { cLog(msg, 'cyan'); };
Logs.w = function (msg) { cLog(msg, 'white'); };
Logs.b = Logs.info = function (msg) { cLog(msg, 'blue'); };
Logs.m = function (msg) { cLog(msg, 'magenta'); };
Logs.em = function (msg) { cLog(msg, 'bold'); };
Logs.u = function (msg) { cLog(msg, 'underline'); };

// @experimental you can also prototype core module methods onto the top level app object this way
// this is guaranteed by the bootstrap procedure.
// this will not be allowed in 3rd party modules
Logs.log = Rax.log = function () {
	if (Rax.cfg.ENABLE_APP_LOGGING) {
		console.log.apply(null, arguments);
	}
};