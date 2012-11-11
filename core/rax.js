/**
 *                        ________  ________
 *    _________ __  __   / ____/  |/  / ___/
 *   / ___/ __ `/ |/_/  / /   / /|_/ /\__ \ 
 *  / /  / /_/ />  <   / /___/ /  / /___/ / 
 * /_/   \__,_/_/|_|   \____/_/  /_//____/  
 *	rax.js - Rax CMS v0.0.1 Bootstrap
 *	created by: mstills
 */
var Rax								// main app object
,	connect = require('connect')	// libraries
,	fs = require('fs')
,	colors = require('colors')
,	connections = 0;

Rax = module.exports = {
	'connect': connect,
	'init': init
};

function boot() {
	// synchronous loading stuff
	loadCore();		// load enabled core modules
	loadModules();	// load enabled addon modules

	Rax.post.test();

	// start server
	Rax.connect(firstResponder)
		.listen(3000);
}

function loadModules() {
}

function loadModule(mid) {
	module = mid + '.js';

	console.log(('looking for ' + module).blue);

	if (fs.existsSync('core/' + module)) {
		console.log('found it');
		return require('./' + module);
	}

	return false;
}

function loadCore() {
	var modules = getActiveModules()
	,	module;

	for (i = 0; i < modules.length; i += 1) {
		module = modules[i];

		console.log(('loading ' + module).green);

		Rax[module] = loadModule(module);
	}

	return true;
}

function firstResponder(req, res) {
	connections++;
	console.log('connection #', connections, req.url);
	res.end('Hello');
}

function getActiveModules() {
	return ['post'];
}

function init(port, callback) {
	boot();
}