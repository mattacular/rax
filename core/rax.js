/**
 *                        ________  ________
 *    _________ __  __   / ____/  |/  / ___/
 *   / ___/ __ `/ |/_/  / /   / /|_/ /\__ \ 
 *  / /  / /_/ />  <   / /___/ /  / /___/ / 
 * /_/   \__,_/_/|_|   \____/_/  /_//____/  
 *	rax.js - Rax CMS v0.0.1 Server Bootstrap
 *	created by: mstills
 */
var Rax								// main app object (public)
,	core = {}						// internal app object (private)
,	connect = require('connect')	// middleware
,	escort = require('escort')		// router
,	fs = require('fs')
,	colors = require('colors')
,	connections = 0
,	modules 						// shortcut to modules

var cfg = {
	'USE_STATIC_FILESERVER': true,
	'ENABLE_APP_LOGGING': true,
	'ENABLE_REQUEST_LOGGING': true
}

// expose globals
Rax = module.exports = {
	'init': init,
	'router': escort,
	'cfg': cfg,
	'root': process.cwd()
};

// global.rax = {};
// global.rax.cfg = cfg;

function boot(port) {
	// synchronous loading stuff
	loadCore();		// load enabled core modules
	loadModules();	// load enabled addon modules

	Rax.log('The RAX Logging method can be used like this...', [1, 2, 3], ('Check it out!').green);

	// start server
	core.server = connect.createServer();

	// connect middleware
	core.server.use(connect.favicon());
	// core.server.use(connect.vhost('local.rax', connect.createServer(function (req, res) {
	// 	res.end('Welcome to admin interface');
	// }).listen(8080)));
	core.server.use(connect.query());
	// @TODO session middleware for Rax (probably needs to be custom but maybe not)
	// @TODO user middleware for Rax (custom)

	if (cfg.ENABLE_REQUEST_LOGGING) {
		core.server.use(connect.logger());
	}

	// check: use static file server?
	if (cfg.USE_STATIC_FILESERVER) {
		// @TODO allow usage of built-in static fileserver
		Rax.log(('enabling static server:' + Rax.root + '/static').blue);
		core.server.use(connect.static(Rax.root + '/static'));
	}

	// lastly, connect router & the routes map
	core.server.use(Rax.router(core.routes));

	// listen!
	core.server.listen(port);
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

		if (options.length > 1) {
			option = options[1];
			module = options[0];
		} else {
			option = false;
			module = modules[i];
		}

		if (option !== 'private') {
			Rax[module] = loadModule(module);	// core modules are available at the top-level of the Rax object
		} else {
			core[module] = loadModule(module);
		}
	}

	return true;
}

function firstResponder(req, res) {
	connections++;
	Rax.log('connection #', connections, req.url);
}

function getActiveModules() {
	return ['post', 'logging', 'toolkit', 'routes:private'];	// note that private modules cannot expose routes etc. to the app
}

function init(port, callback) {
	boot(port || 3000);
}