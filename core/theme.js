/*jslint nomen: true, sloppy: true, devel: false, browser: true, maxerr: 50, indent: 4, white: true*/
/*global module: false, require: false, console: false, clearInterval: false, clearTimeout: false, setInterval: false, setTimeout: false */
// RAX Theme Module - theme.js
var Theme = module.exports = {},
	Rax = require('./rax'),
	Handlebars = require('handlebars'),
	fs = require('fs'),
	_ = require('underscore'),
	loadTheme,
	loadCfg,
	listEngines,
	loadEngine,
	getCoreTemplateManifest,
	engine,
	register;

listEngines = Theme.listEngines = function () {
	var engineFiles = fs.readdirSync(Rax.root + '/core/templating'),
		engineIds = [],
		i;

	for (i = 0; i < engineFiles.length; i += 1) {
		engineIds.push(engineFiles[i].split('engine-')[1].replace(/\.js/, ''));
	}

	return engineIds;
};

loadEngine = function (engineId) {
	return require(Rax.root + '/core/templating/engine-' + engineId + '.js');
};

getCoreTemplateManifest = function () {
	return [
		'contentHead',
		'htmlHead'
	]
};

loadTheme = Theme.loadTheme = function (theme, options) {
	var templates = {},
		index, themeId, themeCfg, manifest, parentModule, moduleTemplate, moduleVars, pieces, i, login, extension;

	theme = theme || Rax.cfg.ACTIVE_THEME;

	// get theme config
	themeCfg = Rax.active.theme = loadCfg();
	themeId = themeCfg.name.toLowerCase();

	if (_.indexOf(listEngines(), themeCfg.engine) === -1) {
		Rax.clog('fail!', 'red');
		return 2; // return error code 2: unsupported engine
	} else {
		Theme.engine = engine = loadEngine(themeCfg.engine);
		extension = engine.extension;
	}

	Rax.clog('Loading active theme "' + themeCfg.name + '" using the [' + themeCfg.engine + '] engine...');

	// establish 'core templates' loading manifest for this theme
	manifest = getCoreTemplateManifest();

	for (i = 0; i < manifest.length; i += 1) {
		templates[manifest[i]] = {
			'path': '/themes/' + themeId + '/' + manifest[i] + extension
		}
	}
	
	// add any custom templates defined in the theme config to the templates manifest
	_.each(themeCfg.templates, function (path, name) {
		// if no path is explicitly defined, we assume the template resides in the base theme dir
		templates[name] = (typeof path !== 'string') ? { 'path': '/themes/' + themeId + '/' + name + extension } : { 'path': path };
	});

	// compile top-level templates (aka pages)
	index = fs.readFileSync(Rax.root + '/themes/' + themeId + '/index' + extension, 'utf8');
	index = Theme.engine.compile(index);

	login = fs.readFileSync(Rax.root + '/themes/' + themeId + '/login' + extension, 'utf8');
	login = Theme.engine.compile(login);

	// register all include templates (eg. as Handlebars helpers)
	_.each(templates, function (template, name) {
		Rax.logging.g('Registering theme template "' + name + '" (' + template.path + ')');
		registerInclude(name, templatePath);
	});

	// return compiled templates
	return {
		'index': index,
		'login': login
	};
};

/**
 *	register() 
 *	@alias addGlobal()
 *		Registers a global template
 */
Theme.registerInclude = registerInclude = function (name, path) {
	var pieces, parentModule, modulesVars;

	if (template.path.match(/\/modules\//)) {
		pieces = template.path.split('/');
		parentModule = pieces[2];
		moduleTemplate = pieces[(pieces.length - 1)].replace(new RegExp('\\' + Theme.engine.extension), '');

		// ensure module that own's the requested include template is enabled
		if (Rax.isDef(Rax.modules, [parentModule, 'variables', moduleTemplate])) {
			moduleVars = Rax.modules[parentModule].variables;
		} else {
			moduleVars = themeCfg.variables;
		}
	} else {
		moduleVars = themeCfg.variables;
	}

	_.extend(moduleVars, options);

	fs.readFile(Rax.root + path, 'utf8', function (err, data) {
		Theme.engine.register(name, data, moduleVars);
	});


	/*
	 *	if 'templateId' has already been registered in the system,
	 *	the duplicate will be registered as well and given the prefix
	 *	of its module or theme (eg. 'foundation_hero' if 'hero' already exists)
	 */
	templateId = (typeof Handlebars.helpers[templateId] === 'function') ? dependentId.toLowerCase() + '_' + templateId : templateId;

	Rax.logging.m('++ global: ' + templateId);

	Handlebars.registerHelper(templateId, function () {
		model = _.extend(model, this);
		return template(model);
	});
};

loadCfg = function (theme) {
	var raw;

	theme = theme || Rax.cfg.ACTIVE_THEME;
	raw = fs.readFileSync(Rax.root + '/themes/' + theme + '/theme.json');

	return JSON.parse(raw);
};

// implementation of 'errors' reserved prop
Theme.errors = {
	2: 'Active theme ("' + Rax.cfg.ACTIVE_THEME + '") requested an engine that is not supported.'
};

Rax.once('init', function () {
	Rax.view = loadTheme(Rax.cfg.ACTIVE_THEME, {});	// load the active theme as soon as this module is enabled
});

Theme.render = function (type, options) {
	var model;
	type = type || 'index';
	model = {
		'welcome': 'Welcome to RAX!',
		'user': Rax.active.user,
		'options': options
	};

	if (typeof Rax.view[type] === 'function') {
		return Rax.view[type](model);
	}
};