// Handlebars templating engine for Rax
// provides all required methods to satisfy template engine API
var Engine = module.exports = {},
	Rax = require('../rax'),
	_ = require('underscore'),
	Handlebars = require('handlebars');

Rax.clog('[Initialized templating engine -> Handlebars]');

Engine.extension = '.handlebars'; // file extension this template engine expects
Engine.id = 'handlebars';

/*
 *	implementation of Engine.compile
 */
Engine.compile = function (raw) {
	return Handlebars.compile(raw);
}

Engine.render = function (type, model, cb) {
	if (typeof Rax.view[type] === 'function') {
		cb(null, Rax.view[type](model));
	} else {
		cb({ 'response': 'error', 'code': 3 }, null);
	}
};

/*
 *	implementation of Engine.register()
 *		Register an include/global template (eg. any non-"top level" template)
 */
Engine.register = function (include) {
	var template = Handlebars.compile(include.template),
		templateId,
		model;

	model = include.context || {};
	/*
	 *	if 'templateId' has already been registered in the system,
	 *	the duplicate will be registered as well and given the prefix
	 *	of its module or theme (eg. 'foundation_hero' if 'hero' already exists)
	 */
	templateId = (include.isModule && typeof Handlebars.helpers[include.templateId] === 'function') ? include.isModule.toLowerCase() + '_' + include.templateId : include.templateId;

	Handlebars.registerHelper(templateId, function () {
		model = _.extend(model, this);
		return template(model);
	});
};

Engine.registerForeign = function (include) {
	var foreignEngine = require(Rax.root + '/core/templating/engine-' + include.engine + '.js'),
		model = include.context || {},
		renderer,
		runtimeContext = {};

	foreignEngine.quickRender(include, function (err, rendered) {
		Handlebars.registerHelper(include.templateId, function () {
			return rendered;
		});
	});
};