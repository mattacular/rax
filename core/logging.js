// Logging Suite

Logs = module.exports = {}

var Rax = global.rax;

// global.rax.log = Logs.log;

function check(msg, color) {
	if (Rax.cfg.ENABLE_LOGGING) {
		console.log((msg)[color]);
	}
}

Logs.g = function (msg) { check(msg, 'green'); }
Logs.r = function (msg) { check(msg, 'red'); }
Logs.y = function (msg) { check(msg, 'yellow'); }
Logs.c = function (msg) { check(msg, 'cyan'); }
Logs.w = function (msg) { check(msg, 'white'); }
Logs.b = function (msg) { check(msg, 'blue'); }
Logs.m = function (msg) { check(msg, 'magenta'); }
Logs.em = function (msg) { check(msg, 'bold'); }
Logs.u = function (msg) { check(msg, 'underline'); }

// note you can also prototype core module methods onto the top level app object this way
Logs.log = global.rax.log = function () {
	if (Rax.cfg.ENABLE_LOGGING) {
		console.log.apply(null, arguments);
	}
}