/*jslint nomen: true, sloppy: true, devel: false, browser: true, maxerr: 50, indent: 4, white: true*/
/*global module: false, require: false, console: false, clearInterval: false, clearTimeout: false, setInterval: false, setTimeout: false */
// RAX Theme Module - theme.js
var Theme = module.exports = {},
	Rax = require('./rax'),
	Handlebars = require('handlebars'),
	fs = require('fs'),
	_ = require('underscore'),
	loadTheme,
	loadCfg;

loadTheme = Theme.loadTheme = function (theme) {
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
		Rax.logging.g('Registering theme template "' + name + '" (' + template.path + ')');
		// read in and compile each template
		template.content = fs.readFileSync(Rax.root + template.path, 'utf8');
		template.content = Handlebars.compile(template.content);

		// if module template, compile against module source
		if (template.path.match(/\/modules\//)) {
			// @TODO replace with a regex cap...
			pieces = template.path.split('/');
			parentModule = pieces[2];
			moduleTemplate = pieces[(pieces.length - 1)].replace(/\.handlebars/, '');

			Rax.log('Checking addon template...', pieces, moduleTemplate, parentModule);

			// ensure that module is enabled otherwise it needs to be enabled
			if (Rax.isDef(Rax.modules, [parentModule, 'variables', moduleTemplate])) {
				moduleVars = Rax.modules[parentModule].variables;
			} else {
				moduleVars = themeCfg.variables;
			}

			if (typeof Handlebars.helpers[name] === 'function') {
				Rax.log('Helper already registered, possibly by the module itself...');
				return true;
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
	Rax.log('returning...', typeof index);
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
Rax.view = loadTheme();	// load the active theme as soon as this module is enabled
Rax.log('loaded theme', Rax.view);
Theme.render = function () {
	var model;

	model = {
		'welcome': 'Welcome to RAX!'
	};

	return Rax.view.index(model);
};