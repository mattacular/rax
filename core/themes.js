/*jslint nomen: true, sloppy: true, devel: false, browser: true, maxerr: 50, indent: 4, white: true*/
/*global module: false, require: false, console: false, clearInterval: false, clearTimeout: false, setInterval: false, setTimeout: false */
// RAX Themes Module - themes.js
var Themes = module.exports = {},
	Rax = require('./rax'),
	Handlebars = require('handlebars'),
	fs = require('fs'),
	_ = require('underscore'),
	loadTheme,
	loadCfg;

loadTheme = Themes.loadTheme = function (theme) {
	var templates = {
			'contentHead': {
				'path': '/themes/foundation/contentHead.handlebars'
			},
			'htmlHead': { 
				'path': '/themes/foundation/htmlHead.handlebars'
			}
		}, 
		index, themeCfg, i;

	theme = theme || Rax.cfg.ACTIVE_THEME;

	// get theme config
	themeCfg = loadCfg();
	
	// add any custom templates defined in the theme config to the templates manifest
	for (i = 0; i < themeCfg.templates.length; i += 1) {
		templates[themeCfg.templates[i]] = { 'path': '/themes/foundation/' + themeCfg.templates[i] + '.handlebars' };
	}

	// compile top-level templates (aka pages)
	index = fs.readFileSync(Rax.root + '/themes/foundation/index.handlebars', 'utf8');
	index = Handlebars.compile(index);

	// register all templates as Handlebars helpers
	_.each(templates, function (glob, template) {
		Rax.log('register', glob.path, template);
		glob.content = fs.readFileSync(Rax.root + glob.path, 'utf8');

		glob.content = Handlebars.compile(glob.content);

		Handlebars.registerHelper(template, function () {
			return glob.content(themeCfg.variables);
		});
	});

	// return compiled templates
	return {
		'index': index
	};
};

loadCfg = function (theme) {
	var raw;

	theme = theme || Rax.cfg.ACTIVE_THEME;
	raw = fs.readFileSync(Rax.root + '/themes/foundation/theme.json');

	return JSON.parse(raw);
};

// @TODO move to 'boot' beacon
Rax.theme = loadTheme();	// load the active theme as soon as this module is enabled

Themes.render = function () {
	var model;

	model = {
		'welcome': 'Welcome to RAX!'
	};

	return Rax.theme.index(model);
};