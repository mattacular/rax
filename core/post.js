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
			}
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.write(JSON.stringify(someJSON));
			res.end();
		}
	}
};