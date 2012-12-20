/*jslint nomen: true, sloppy: true, devel: false, browser: true, maxerr: 50, indent: 4, white: true*/
/*global module: false, require: false, console: false, clearInterval: false, clearTimeout: false, setInterval: false, setTimeout: false */
// RAX Core - post.js
// Posting Content Class
var Post = module.exports = {}
,	Rax = require('./rax');

Post.routes = {
	'/post': {
		'id': 'post',	// if routeId is missing, entry will be ignored
		'get': function (req, res) {
			res.end('write a post here in the future...');
		},
		'post': function (req, res) {
			res.end('form posted');
		}
	},
	'/json/post': {
		'id': 'post:json',
		'get': function (req, res) {
			var someJSON = {
				"one": "1",
				"two": 2
			};
			
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.write(JSON.stringify(someJSON));
			res.end();
		}
	}
};