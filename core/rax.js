/*jslint nomen: true, sloppy: true, devel: false, browser: true, maxerr: 50, indent: 4, white: true*/
/*global global: false, module: false, process: false, require: false, console: false, clearInterval: false, clearTimeout: false, setInterval: false, setTimeout: false */
/**
 *    _________ __  __ 
 *   / ___/ __ `/ |/_/ 
 *  / /  / /_/ />  <   
 * /_/   \__,_/_/|_|   
 *	rax.js - Rax v0.0.1 Server Bootstrap
 *	created by: mstills
 */
var Rax,							// main app object (public)
	core = {},						// internal app object (private)
	connect = require('connect'),	// middleware
	escort = require('escort'),		// router
	fs = require('fs'),
	colors = require('colors'),
	async = require('async'),
	RaxStore,
	connections = 0,
	modules, cfg,
	warn, error, info;

// expose core public methods and properties
Rax = module.exports = {
	'init': init,
	'router': escort,
	'async': async,
	'cfg': {},
	'active': {	// some of these are per-request ???
		'theme': false,
		'session': false,
		'user': false,
		'req': false,
		'res': false
	},
	'modules': {},	// addon module store
	'root': process.cwd()
};

/*
	Rax.pipeline spec - render pipeline can be altered anytime before res.end(). Contains
		models that will be run against templates at response-time.

		Rax.pipeline.posts[0].headline = "LATEST:" + headline	// altering the first post's headline in the pipeline

		Somewhat based on Drupal render arrays-ish?

	Rax.active spec - property store of 'active' objects within the Rax system

	eg. Rax.active.user - current user object (always exists, even if no user is logged in - returns anonymous user)
		Rax.active.theme - current theme.json is available here
		Rax.active.session - current session
*/

// set an absolute reference to Rax core so other modules can require() it easily
global.RAX = Rax.root + '/core/rax.js';

function init() {
	// *REMEMBER* not safe to use Rax logging module yet (ONLY IN THIS FUNC!)
	console.log('[Rax] Init'.cyan);

	// load base modules (beacon API and database API)
	Rax.beacon = loadModule('beacon');
	console.log('[Rax] Connecting to database...'.cyan);
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
	var sessionStore; // will hold instance of the DB session storage class

	loadCore();		// load enabled core modules that are not deferred
	Rax.beacon.emit('coreLoaded');

	// shortcuts for boot messaging
	info = Rax.logging.info;
	warn = Rax.logging.warn;
	error = Rax.logging.error;
	Rax.log(('[Rax] Core modules loaded').cyan);
	Rax.log(('[Rax] Booting...').cyan);

	info('Loading addon modules...');
	loadAddons();	// load enabled addon modules that are not deferred
	Rax.beacon.emit('addonsLoaded');

	// begin server
	info('Starting server...');
	Rax.server = connect.createServer();

	// connect middleware
	// check: use static file server?
	if (cfg.USE_STATIC_FILESERVER) {
		// @TODO allow usage of built-in static fileserver
		info('Enabling static server @ ' + Rax.root + '/static');
		Rax.server.use(connect.static(Rax.root + '/static'));
	}

	// serve theme's static files
	Rax.server.use(connect.static(Rax.root + '/themes/' + cfg.ACTIVE_THEME, { maxAge: 1000 }));

	// register other helper middleware
	Rax.server.use(connect.favicon());	// provide favicon
	Rax.server.use(connect.query());	// parse query string into req obj

	if (cfg.ENABLE_REQUEST_LOGGING) {
		Rax.server.use(connect.logger());
	}

	// this returns a constructor for Rax's DB session store that connect's own session middleware will utilize
	sessionStore = new RaxStore(connect);	

	// session middleware (@TODO this should be optional, not ALL sites need session-tracking)
	Rax.server.use(connect.cookieParser());
	Rax.server.use(connect.session({
		'secret': 'RaxOnRaxOnRax',	// @TODO replace with session secret through admin dash/db cfg
		'store': new sessionStore({ 'db': 'test' }),
		'cookie': { 
			'maxAge': 60000 * 30 // idle sessions are good for 30 minutes
		}
	}));

	// @DEV user/session test middleware
	//Rax.server.use(Rax.middleware.checkSessionUser());
	Rax.server.use(function (req, res, next) {
		Rax.active.req = req;
		Rax.active.res = res;
		
		// if session exists, see if a user is associated
		if (req.session && req.session.user && req.session.user !== 'anonymous') {
			Rax.user.get({ 'name': req.session.user }, function (err, instance) {
				Rax.active.user = instance;
				next();
			});
		} else {
			Rax.log('no session cookie for this user... login');
			Rax.active.user = 'anon';
			next();
		}
	});

	// lastly, connect router & the routes map
	Rax.server.use(connect.bodyParser());
	Rax.server.use(Rax.router(core.routes));

	// listen!
	Rax.server.listen(port);

	// after bootstrap is done, save a private reference to the server and remove it from the public app object
	// so that it can't be damaged by rogue modules etc
	core.server = Rax.server;
	delete Rax.server;

	// bootstrap complete, safe for other modules to init
	Rax.beacon.emit('init');
	Rax.logging.c('[Rax] Booting complete. Rax is listening on ' + port + '...');
	Rax.logging.c('[Rax] Active theme = ' + Rax.active.theme.name);
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
		module, options, option, i, alias;

	// load Rax's session storage class separately. it is so low level that it does not
	// need to be exposed to the core objects in any way
	RaxStore = loadModule('database/session');

	// load rest of core modules
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
/*
options - private (module will not be publicly available on the Rax app obj)
deferLoad - this module can be loaded after the server has booted

*/
function getActiveModules() {
	return ['logging', 'user', 'post', 'toolkit', 'theme', 'routes:private'];	// note that private modules cannot expose routes etc. to the app
}