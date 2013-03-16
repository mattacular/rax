// Handlebars templating engine for Rax
// provides all required methods to satisfy template engine API
var Engine = module.exports = {},
	Handlebars = require('handlebars');

Engine.extension = ".handlebars"; // file extension this template engine expects
Engine.compile = Handlebars.compile;

console.log('hello');
// compile()
// 