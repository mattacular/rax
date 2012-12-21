/*jslint nomen: true, sloppy: true, devel: false, browser: true, maxerr: 50, indent: 4, white: true*/
/*global module: false, process: false, require: false, console: false, clearInterval: false, clearTimeout: false, setInterval: false, setTimeout: false */
// RAX Mongo DB Driver - mongo.js
var Database = module.exports = {},
	Rax = require('../rax'),
	mongoose = require('mongoose');

Database.identify = function () {
	Rax.log('hello I am mongo!');
};

Rax.beacon.once('dbLive', function () {
	var cfgSchema = mongoose.Schema({
		'_id': String,
		'USE_STATIC_FILESERVER': Boolean,
		'ENABLE_APP_LOGGING': Boolean,
		'ENABLE_REQUEST_LOGGING': Boolean,
		'ACTIVE_THEME': String,
		'PORT': Number
	});

	var cfg = mongoose.model('Config', cfgSchema, 'configs');

	// first pull the default configuration from the configs collection
	cfg.findOne({ '_id': 'rax_cfg_default' }, function (err, instance) {
		if (!instance) {
			// create default config file
			var defaultCfg = new cfg({
				'_id': 'rax_cfg_default',
				'USE_STATIC_FILESERVER': true,
				'ENABLE_APP_LOGGING': true,
				'ENABLE_REQUEST_LOGGING': true,
				'PORT': 3000,
				'ACTIVE_THEME': 'foundation'
			});

			defaultCfg.save(function () {
				Rax.log('done saving cfg default');
			});
		} else {
			Rax.cfg = instance;
		}

		Rax.beacon.emit('dbHasConfig');
	});

});

mongoose.connect('mongodb://localhost/test');

Database.ps = mongoose.connection;

Database.ps.once('open', function () {
	Rax.beacon.emit('dbLive');
});

