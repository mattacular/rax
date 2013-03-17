// Dust templating engine for Rax
// provides all required methods to satisfy template engine API
var Engine = module.exports = {},
	Rax = require('../rax'),
	_ = require('underscore'),
	dust = require('dustjs-linkedin');

Rax.clog('[Initialized templating engine -> Dust]');

Engine.extension = '.dust';

Engine.compile = function (raw, name) {
	dust.loadSource(dust.compile(raw, name));
}

Engine.render = function (type, model, cb) {
	// resolve theme-level variables and add them to the model (context)
	_.extend(model, Rax.active.theme.variables)

	if (typeof dust.cache[type] !== 'undefined') {
		dust.render(type, model, function (err, rendered) {
			if (!err) {
				cb(null, rendered);
			} else {
				Rax.log(err);
			}
		});
	} else {
		cb({ 'response': 'error', 'code': 3 }, null);
	}
}

Engine.register = function (include) {
	var templateId;

	templateId = (include.isModule && typeof dust.cache[include.templateId] === 'function') ? include.isModule.toLowerCase() + '_' + include.templateId : include.templateId;
	dust.loadSource(dust.compile(include.template, templateId));
}

