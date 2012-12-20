/*jslint nomen: true, sloppy: true, devel: false, browser: true, maxerr: 50, indent: 4, white: true*/
/*global module: false, process: false, require: false, console: false, clearInterval: false, clearTimeout: false, setInterval: false, setTimeout: false */
// RAX Mongo DB Driver - mongo.js
var Database = module.exports = {},
	Rax = require('../rax');

Database.identify = function () {
	Rax.log('hello I am mongo!');
};