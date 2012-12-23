/*jslint nomen: true, sloppy: true, devel: false, browser: true, maxerr: 50, indent: 4, white: true*/
/*global module: false, process: false, require: false, console: false, clearInterval: false, clearTimeout: false, setInterval: false, setTimeout: false */
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
	sessionStore = require('connect-mongo')(connect),
	connections = 0,
	modules, cfg,
	warn, error, info;

// expose core public methods and properties
Rax = module.exports = {
	'init': init,
	'router': escort,
	'cfg': {},
	'active': {
		'theme': false,
		'session': false,
		'user': false
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
	Rax.server.use(connect.favicon());
	Rax.server.use(connect.query());

	// @TODO session middleware for Rax (probably needs to be custom but maybe not)
	Rax.server.use(connect.cookieParser());
	Rax.server.use(connect.session({
		'cookie': { 'maxAge': 60000 * 60 },	// soft login (session based) lasts 60 min (always require a hard login for sensitive tasks)
		'secret': 'RaxOnRaxOnRax',
		'store': new sessionStore({'db': 'test'})
	}));

	// @DEV user test
	Rax.server.use(function (req, res, next) {
		Rax.log(req.method);
		req.rax = {};
		// if session exists, see if a user is associated
		if (req.session && req.session.user && req.session.user !== 'anonymous') {
			Rax.log('logging in...', req.session.user);

			Rax.user.get({ 'name': req.session.user }, function (err, instance) {
				Rax.active.user = instance;
				next();
			});

			// Rax.log('session meth', typeof req.session.save);
			// Rax.user.get({ 'session_id': req.sessionID }, function (err, instance) {
			// 	if (!err && instance) {
			// 		Rax.active.user = instance;
			// 		req.session.user = instance.name;
			// 		req.session.save();
			// 		Rax.log('logged in', instance.name);
			// 	} else if (!instance) {
			// 		Rax.log('session belongs to another user... log out');
			// 		req.session.user = 'anonymous';
			// 		req.session.save();
			// 	}

			// 	Rax.active.session = req.session;
			// 	next();
			// });
		} else {
			Rax.log('no session cookie for this user... login');
			Rax.active.user = 'anon';
			next();
		}
	});
	// @TODO user middleware for Rax (custom)

	if (cfg.ENABLE_REQUEST_LOGGING) {
		Rax.server.use(connect.logger());
	}

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
	return ['logging', 'user', 'post', 'toolkit', 'theme', 'routes:private'];	// note that private modules cannot expose routes etc. to the app
}