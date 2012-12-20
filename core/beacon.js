// RAX Beacon API - safe app wrapper for CMS events
var Rax = ('./rax'),
	Emitter = require('events').EventEmitter,
	emitter = new Emitter();
	Beacon = module.exports = {};

Beacon.on = function (event, callback) {
	emitter.on('rax:' + event, callback);
};

Beacon.emit = function (event) {
	emitter.emit('rax:' + event);
}