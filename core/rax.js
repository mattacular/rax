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

Rax = module.exports = {
	'connect': connect,
	'router': escort,
	'init': init
};

function boot() {
	var cfg = { 
		'USE_STATIC_FILESERVER': true
	}; // @TODO load config
	// @TODO session ?

	// synchronous loading stuff
	loadCore();		// load enabled core modules
	loadModules();	// load enabled addon modules

	Rax.post.test();
	Rax.root = process.cwd();
	console.log(__filename);
	// start server
	Rax.server = Rax.connect.createServer();

	// connect middleware
	Rax.server.use(connect.query());

	if (cfg.USE_STATIC_FILESERVER) {
		// @TODO allow usage of built-in static fileserver
		console.log(('enabling static server:' + Rax.root + '/static').blue);
		Rax.server.use(connect.static(Rax.root + '/static'));
	}

	// finally, connect router
	Rax.server.use(Rax.router(function () {
		this.get('/test', function (req, res) {
			console.log(req.query);
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

	// listen
	Rax.server.listen(3000);
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

		Rax[module] = loadModule(module);	// core modules are available at the top-level of the Rax object
	}

	return true;
}

function firstResponder(req, res) {
	connections++;
	console.log('connection #', connections, req.url);
}

function getActiveModules() {
	return ['post'];
}

function init(port, callback) {
	boot();
}