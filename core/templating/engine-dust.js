// Dust templating engine for Rax
// provides all required methods to satisfy template engine API
var Engine = module.exports = {},
	Rax = require('../rax'),
	_ = require('underscore'),
	dust = require('dustjs-linkedin');

if (typeof dust.helpers === 'undefined' || dust.helpers === null) {
	dust.helpers = {};
}

Rax.clog('[Initialized templating engine -> Dust]');

Engine.extension = '.dust';
Engine.id = 'dust';

Engine.compile = function (raw, name) {
	dust.loadSource(dust.compile(raw, name));
};

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
};

Engine.register = function (include) {
	var templateId;

	templateId = (include.isModule && typeof dust.cache[include.templateId] === 'function') ? include.isModule.toLowerCase() + '_' + include.templateId : include.templateId;
	dust.loadSource(dust.compile(include.template, templateId));
};

Engine.registerForeign = function (include) {
	var foreignEngine = require(Rax.root + '/core/templating/engine-' + include.engine + '.js');

	dust.helpers[include.templateId] = function (chunk, context, bodies, params) {
		var compiled;

		// @TODO need to require a anonymousRender() method or something that compiles and renders without registration
		compiled = foreignEngine.compile(include.template);

		chunk.write(compiled(context.stack.head));

		return chunk;
	};
};

