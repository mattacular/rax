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
		index, themeCfg, parentModule, moduleTemplate, moduleVars, pieces, i;


	theme = theme || Rax.cfg.ACTIVE_THEME;

	// get theme config
	themeCfg = loadCfg();

	Rax.logging.g('Loading active theme "' + theme.name + '"');
	
	// add any custom templates defined in the theme config to the templates manifest
	_.each(themeCfg.templates, function (path, name) {
		// if no path is explicitly defined, assume the template resides in the base theme dir
		templates[name] = (typeof path !== 'string') ? { 'path': '/themes/foundation/' + name + '.handlebars' } : { 'path': path };
	});

	// compile top-level templates (aka pages)
	index = fs.readFileSync(Rax.root + '/themes/foundation/index.handlebars', 'utf8');
	index = Handlebars.compile(index);

	// register all templates as Handlebars helpers
	_.each(templates, function (template, name) {
		if (template.path.match(/\/modules\//gi)) {
			Rax.logging.r('Skipping addon module template @TODO');
			return true;
		}
		Rax.logging.g('Registering theme template "' + name + '" (' + template.path + ')');
		// read in and compile each template
		template.content = fs.readFileSync(Rax.root + template.path, 'utf8');
		template.content = Handlebars.compile(template.content);

		// if module template, compile against module source
		if (template.path.match(/\/modules\//)) {
			// @TODO replace with a regex cap...
			pieces = name.split('/');
			parentModule = pieces[2];
			moduleTemplate = pieces[(pieces.length - 1)].replace(/\.handlebars/, '');

			// ensure that module is enabled otherwise it needs to be enabled
			if (Rax.isDef(Rax.modules, [parentModule, 'variables', moduleTemplate])) {
				moduleVars = Rax.modules[parentModule].variables;
			} else {
				moduleVars = themeCfg.variables;
			}

			Handlebars.registerHelper(name, function () {
				return template.content(moduleVars);
			});
		} else {
			Handlebars.registerHelper(name, function () {
				return template.content(themeCfg.variables);
			});
		}
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