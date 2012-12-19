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

// note you can also prototype core module methods onto the top level app object this way
Logs.log = global.rax.log = function () {
	if (Rax.cfg.ENABLE_LOGGING) {
		console.log.apply(null, arguments);
	}
}