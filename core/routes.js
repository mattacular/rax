var Rax = require('./rax');

// routes map
module.exports = function () {
	this.get('/test', function (req, res) {
		Rax.log(req.query);
		res.end('test');
	});

	this.get('/', function (req, res) {
		if (typeof req.query.secret !== 'undefined' && req.query.secret) {
			res.end('Yay!');
		} else {
			res.end('Welcome to RAX.');
		}
	});
}