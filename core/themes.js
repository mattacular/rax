// RAX Themes Module - themes.js
var Themes = module.exports = {}
,	Rax = require('./rax')
,	Handlebars = require('handlebars')
,	fs = require('fs');

Themes.render = function (template) {
	var globals = [Rax.root + '/themes/foundation/htmlHead.handlebars'], glob, retVal, index, content, model;

	for (var i = 0; i < globals.length; i++) {
		glob = globals[i];

		content = fs.readFileSync(glob, 'utf8');
		Handlebars.registerHelper('htmlHead', function () {
			return content;
		});

	};

	model = {
		'welcome': 'Welcome to RAX!'
	}

	index = fs.readFileSync(Rax.root + '/themes/foundation/index.handlebars', 'utf8');
	index = Handlebars.compile(index);
	retVal = index(model);
	
	return retVal;
}