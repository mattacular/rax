/*jslint nomen: true, sloppy: true, devel: false, browser: true, maxerr: 50, indent: 4, white: true*/
/*global module: false, process: false, require: false, console: false, clearInterval: false, clearTimeout: false, setInterval: false, setTimeout: false */
// Provides a MongoDB Session Store for Connect
var Rax = require('../rax'),
	mongoose = require('mongoose'),
	url = require('url');

module.exports = function(connect) {
	var Store = connect.session.Store;

	/**
	 *	Initialize MongoStore
	 */
	function MongoStore(options, callback) {
		options = options || {};
		callback = callback || function () {};
		Store.call(this, options);
	}
};