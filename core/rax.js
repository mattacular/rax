/*jslint nomen: true, sloppy: true, devel: false, browser: true, maxerr: 50, indent: 4, white: true*/
/*global module: false, process: false, require: false, console: false, clearInterval: false, clearTimeout: false, setInterval: false, setTimeout: false */
/**
 *                        ________  ________
 *    _________ __  __   / ____/  |/  / ___/
 *   / ___/ __ `/ |/_/  / /   / /|_/ /\__ \ 
 *  / /  / /_/ />  <   / /___/ /  / /___/ / 
 * /_/   \__,_/_/|_|   \____/_/  /_//____/  
 *	rax.js - Rax CMS v0.0.1 Server Bootstrap
 *	created by: mstills
 */
var Rax,							// main app object (public)
	core = {},						// internal app object (private)
	connect = require('connect'),	// middleware
	escort = require('escort'),		// router
	fs = require('fs'),
	colors = require('colors'),
	connections = 0,
	modules, cfg,
	warn, error, info;

// expose core public methods and properties
Rax = module.exports = {
	'init': init,
	'router': escort,
	'cfg': {},
	'modules': {},	// addon module store
	'root': process.cwd()
};

// set an absolute reference to Rax core so other modules can require() it easily
global.rax_core = Rax.root + '/core/rax.js';

function init() {
	// load base modules (beacon API and database API)
	Rax.beacon = loadModule('beacon');
	Rax.db = loadModule('database/mongo');

	// as soon as Rax config has been loaded from DB, start main bootstrap
	Rax.beacon.once('dbHasConfig', function () {
		cfg = Rax.cfg;
		boot(cfg.PORT);	// load rest of core and boot server
	});

	// remove this method from the Rax app object so that it cannot accidentally be run again
	// after the app is already initialized
	delete Rax.init;
}

function boot(port) {
	loadCore();		// load enabled core modules
	Rax.beacon.emit('coreLoaded');

	// shortcuts for boot messaging
	info = Rax.logging.info;
	warn = Rax.logging.warn;
	error = Rax.logging.error;

	Rax.log(('[Rax] Core modules loaded.').cyan);
	Rax.log(('[Rax] Booting...').cyan);

	info('Loading addon modules...');
	loadAddons();	// load enabled addon modules
	Rax.beacon.emit('addonsLoaded');

	// start server
	info('Starting server...');
	core.server = connect.createServer();

	// connect middleware
	core.server.use(connect.favicon());
	core.server.use(connect.query());

	// @TODO session middleware for Rax (probably needs to be custom but maybe not)
	// @TODO user middleware for Rax (custom)

	if (cfg.ENABLE_REQUEST_LOGGING) {
		core.server.use(connect.logger());
	}

	// check: use static file server?
	if (cfg.USE_STATIC_FILESERVER) {
		// @TODO allow usage of built-in static fileserver
		info('Enabling static server @ ' + Rax.root + '/static');
		core.server.use(connect.static(Rax.root + '/static'));
	}

	// serve theme's static files
	core.server.use(connect.static(Rax.root + '/themes/' + cfg.ACTIVE_THEME, { maxAge: 1000 }));

	// lastly, connect router & the routes map
	core.server.use(Rax.router(core.routes));

	// listen!
	core.server.listen(port);

	// bootstrap complete, safe for other modules to init
	Rax.beacon.emit('init');
	Rax.logging.c('[Rax] Booting complete. Rax is listening on ' + port + '...');
}

function loadModule(mid, type) {
	var module = mid + '.js';

	type = (typeof type !== 'undefined' && type === 'addon') ? 'modules' : 'core';

	if (fs.existsSync(type + '/' + module)) {
		return (type === 'core') ? require('./' + module) : require('../modules/' + module);
	}

	return false;
}

/**
 *	loadCore()
 *		Load core modules
 */
function loadCore() {
	var modules = getActiveModules(),
		module, options, option, i;

	for (i = 0; i < modules.length; i += 1) {
		options = modules[i].split(':');

		if (options.length > 1) {
			module = options.shift();
		} else {
			module = options[0];
			options = false;
		}

		if (module.indexOf('/') !== -1) {
			if (!options || options[0].indexOf('alias') === -1) {
				continue; // complex requirements must provide an alias for themselves
			}

			alias = options[0].split('=')[1];
			Rax[alias] = loadModule(module);
		} else if (options && options[0].indexOf('private') !== -1) {
			core[module] = loadModule(module);
		} else {
			Rax[module] = loadModule(module);	// core modules are available at the top-level of the Rax object
		}
	}

	return true;
}

/**
 *	loadAddons()
 *		Load addon (3rd party) modules
 */
function loadAddons() {
	var modules = getActiveAddonModules(),
		module, options, option, i;

	for (i = 0; i < modules.length; i += 1) {
		options = modules[i].split(':');

		if (options.length > 1) {
			module = options.shift();
		} else {
			module = options[0];
		}

		if (options[0].indexOf('private') !== -1) {
			if (typeof core.modules !== 'object') {
				core.modules = {};
			}
			core.modules[module] = loadModule(module + '/' + module, 'addon');
		} else {
			Rax.log('loading addon module...', module);
			Rax.modules[module] = loadModule(module + '/' + module, 'addon');
		}
	}

}
/*
	module entry doc struct - replace these temp funcs
	on 3rd party modules, entry is provided via module.json
	array of objects (each obj is an entry):

	{
		'name': 'Logging',
		'version': '0.1',
		'description': 'API for both console and *.log-file logging control'
		'type': 'core',
		'required': true,
		'alias': 'logging'	// Rax.logging (core) || Rax.module.logging (3rd party)
		'options': {
			'private': false
			'deferLoad': false	// defer loading til after server boot
		}
	}
*/
// @TODO temp function
function getActiveAddonModules() {
	return ['glados'];
}

// @TODO temp function
function getActiveModules() {
	return ['logging', 'post', 'toolkit', 'theme', 'routes:private'];	// note that private modules cannot expose routes etc. to the app
}