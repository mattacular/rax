/*jslint nomen: true, sloppy: true, devel: false, browser: true, maxerr: 50, indent: 4, white: true*/
/*global module: false, require: false, console: false, clearInterval: false, clearTimeout: false, setInterval: false, setTimeout: false */
// RAX Theme Module - theme.js
var Theme = module.exports = {},
	Rax = require('./rax'),
	fs = require('fs'),
	_ = require('underscore'),
	loadTheme,
	loadCfg,
	listEngines,
	loadEngine,
	getCoreTemplateManifest,
	engine,
	resolve,
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

resolve = function (vars) {
	_.each(vars, function (val, key) {
		// @TODO more filters to come ?
		if (val.indexOf('@parent') !== -1) {
			vars[key] = val.replace('@parent', '/themes/' + Theme.cfg.parent);
		}
	});

	return vars;
};

loadTheme = Theme.loadTheme = function (theme, options) {
	var templates = {},
		index, themeId, themeCfg, manifest, parentModule, moduleTemplate, moduleVars, pieces, i, login, extension;

	theme = theme || Rax.cfg.ACTIVE_THEME;

	// get theme config
	themeCfg = Rax.active.theme = Theme.cfg = loadCfg();
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
	index = Theme.engine.compile(index, 'index');

	login = fs.readFileSync(Rax.root + '/themes/' + themeId + '/login' + extension, 'utf8');
	login = Theme.engine.compile(login, 'login');

	// resolve variables
	Theme.cfg.variables = resolve(Theme.cfg.variables);

	Rax.log(Theme.cfg.variables);
	Rax.log(templates);

	// register all include templates (eg. as Handlebars helpers)
	_.each(templates, function (template, name) {
		Rax.logging.g('Registering theme template "' + name + '" (' + template.path + ')');
		registerInclude(name, template.path, options);
	});

	// return compiled templates
	return {
		'index': index,
		'login': login
	};
};

/**
 *	registerInclude() 
 *	@alias registerInclude()
 *		Registers a global template
 */
Theme.registerInclude = registerInclude = function (name, path, options) {
	var pieces, parentModule = false, context, themeCfg = Theme.cfg;

	if (path.match(/\/modules\//)) {
		pieces = path.split('/');
		parentModule = pieces[2];
		moduleTemplate = pieces[(pieces.length - 1)].replace(new RegExp('\\' + Theme.engine.extension), '');

		// ensure module that own's the requested include template is enabled
		if (Rax.isDef(Rax.modules, [parentModule, 'variables', moduleTemplate])) {
			context = Rax.modules[parentModule].variables;
		} else {
			context = themeCfg.variables;
		}
	} else {
		context = themeCfg.variables;
	}

	_.extend(context, options);

	fs.readFile(Rax.root + path, 'utf8', function (err, data) {
		if (!err) {

			Theme.engine.register({
				'templateId': name,
				'isModule': parentModule || false,
				'template': data,
				'context': context
			});

			Rax.logging.m('++ [' + Theme.cfg.name + '] template include loaded: ' + name);
		}
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

Theme.rcache = {} // render cache
Theme.render = function (type, options, cb) {
	var model;
	type = type || 'index';
	model = {
		// some global helpers for writing paths etc
		'_theme_': '/themes/' + Rax.cfg.ACTIVE_THEME,
		'_assets_': '/themes/' + Rax.cfg.ACTIVE_THEME + '/assets',
		'welcome': 'Welcome to RAX!',
		'user': Rax.active.user,
		'options': options
	};

	// setup _parent_ helper in the model?
	if (Theme.cfg.parent) {
		model._parent_ = '/themes/' + Theme.cfg.parent;
	}

	if (typeof Theme.rcache[type] === 'undefined') { //&& Theme.rcache[type].expires > Date.now())
		Theme.engine.render(type, model, function (err, rendered) {
			if (!err) {
				// cache the rendered page
				Theme.rcache[type] = rendered;
				// pass it along to the caller's cb
				cb(null, rendered);
			} else {
				cb(err, null);
			}
		});
	} else {
		cb(null, Theme.rcache[type]);
	}
};