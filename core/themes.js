// RAX Themes Module - themes.js
var Themes = module.exports = {}
,	Rax = require('./rax')
,	Handlebars = require('handlebars')
,	fs = require('fs')
,	loadTheme;

loadTheme = Themes.loadTheme = function (theme) {
	var globals = [Rax.root + '/themes/foundation/htmlHead.handlebars'], glob, retVal, index, content, model;

	theme = theme || Rax.cfg.ACTIVE_THEME;

	index = fs.readFileSync(Rax.root + '/themes/foundation/index.handlebars', 'utf8');
	index = Handlebars.compile(index);

	for (var i = 0; i < globals.length; i++) {
		glob = globals[i];

		content = fs.readFileSync(glob, 'utf8');
		Handlebars.registerHelper('htmlHead', function () {
			return content;
		});

	};

	return {
		'index': index
	}
}

Rax.theme = loadTheme();	// load the active theme as soon as this module is enabled

Themes.render = function () {
	var model;
	
	model = {
		'welcome': 'Welcome to RAX!'
	}

	return Rax.theme.index(model);
}