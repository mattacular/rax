// Dust templating engine for Rax
// provides all required methods to satisfy template engine API
var Engine = module.exports = {},
	Rax = require('../rax'),
	_ = require('underscore'),
	dust = require('dust');

Rax.clog('[Initialized templating engine -> Dust]');

Engine.extension = '.dust';