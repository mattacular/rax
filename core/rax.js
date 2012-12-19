/**
 *                        ________  ________
 *    _________ __  __   / ____/  |/  / ___/
 *   / ___/ __ `/ |/_/  / /   / /|_/ /\__ \ 
 *  / /  / /_/ />  <   / /___/ /  / /___/ / 
 * /_/   \__,_/_/|_|   \____/_/  /_//____/  
 *	rax.js - Rax CMS v0.0.1 Server Bootstrap
 *	created by: mstills
 */
var Rax								// main app object
,	connect = require('connect')	// libraries
,	escort = require('escort')		// router
,	fs = require('fs')
,	colors = require('colors')
,	connections = 0
,	modules 						// shortcut to modules

var cfg = {
	'USE_STATIC_FILESERVER': true,
	'ENABLE_LOGGING': true
}

// expose globals
Rax = module.exports = {
	'connect': connect,
	'router': escort,
	'cfg': cfg,
	'root': process.cwd(),
	'init': init
};

// global.rax = {};
// global.rax.cfg = cfg;

function boot(port) {
	// @TODO session ?

	// synchronous loading stuff
	loadCore();		// load enabled core modules
	loadModules();	// load enabled addon modules

	//Rax.post.test();

	Rax.log('The RAX Logging method can be used like this...', [1, 2, 3], ('Check it out!').green);

	// start server
	Rax.server = Rax.connect.createServer();

	// connect middleware
	Rax.server.use(connect.query());

	// check: use static file server?
	if (cfg.USE_STATIC_FILESERVER) {
		// @TODO allow usage of built-in static fileserver
		Rax.log(('enabling static server:' + Rax.root + '/static').blue);
		Rax.server.use(connect.static(Rax.root + '/static'));
	}

	// lastly, connect router
	Rax.server.use(Rax.router(function () {
		this.get('/test', function (req, res) {
			Rax.log(req.query);
			res.end('test');
		});

		this.get('/', function (req, res) {
			if (typeof req.query.secret !== 'undefined' && req.query.secret) {
				res.end('Yay!');
			} else {
				res.end('Welcome to RAX.');
			}
		});
	}));

	// listen!
	Rax.server.listen(port);
}

function loadModules() {
}

function loadModule(mid) {
	module = mid + '.js';

	if (fs.existsSync('core/' + module)) {
		return require('./' + module);
	}

	return false;
}

function loadCore() {
	var modules = getActiveModules()
	,	module
	,	options
	,	option;

	for (i = 0; i < modules.length; i += 1) {
		options = modules[i].split(':');

		if (options.length) {
			option = options[1];
			module = options[0];
		} else {
			module = modules[i];
		}
		
		Rax[module] = loadModule(module);	// core modules are available at the top-level of the Rax object
	}

	return true;
}

function firstResponder(req, res) {
	connections++;
	Rax.log('connection #', connections, req.url);
}

function getActiveModules() {
	return ['post', 'logging', 'routes:private'];
}

function init(port, callback) {
	boot(port || 3000);
}