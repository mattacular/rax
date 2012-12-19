// RAX Core - logging.js
// Logging Suite
var	Logs = module.exports = {}
,	Rax = require('./rax');

// global.rax.log = Logs.log;

function cLog(msg, color) {
	if (Rax.cfg.ENABLE_LOGGING) {
		console.log((msg)[color]);
	}
}

// color logging shortcuts
Logs.g = function (msg) { cLog(msg, 'green'); }
Logs.r = function (msg) { cLog(msg, 'red'); }
Logs.y = function (msg) { cLog(msg, 'yellow'); }
Logs.c = function (msg) { cLog(msg, 'cyan'); }
Logs.w = function (msg) { cLog(msg, 'white'); }
Logs.b = function (msg) { cLog(msg, 'blue'); }
Logs.m = function (msg) { cLog(msg, 'magenta'); }
Logs.em = function (msg) { cLog(msg, 'bold'); }
Logs.u = function (msg) { cLog(msg, 'underline'); }

// @experimental you can also prototype core module methods onto the top level app object this way
// this is guaranteed by the bootstrap procedure.
// this will not be allowed in 3rd party modules
Logs.log = Rax.log = function () {
	if (Rax.cfg.ENABLE_LOGGING) {
		console.log.apply(null, arguments);
	}
}