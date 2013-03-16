// Handlebars templating engine for Rax
// provides all required methods to satisfy template engine API
var Engine = module.exports = {},
	Rax = require('../rax'),
	_ = require('underscore'),
	Handlebars = require('handlebars');

Rax.clog('[Initialized templating engine -> Handlebars]');

Engine.extension = ".handlebars"; // file extension this template engine expects

/*
 *	implementation of Engine.compile
 */
Engine.compile = Handlebars.compile;

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