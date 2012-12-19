// Logging Suite

Logs = module.exports = {}

var Rax = global.rax;

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

// note you can also prototype core module methods onto the top level app object this way
Logs.log = global.rax.log = function () {
	if (Rax.cfg.ENABLE_LOGGING) {
		console.log.apply(null, arguments);
	}
}