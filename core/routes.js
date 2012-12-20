var Rax = require('./rax')
,	_ = require('underscore')

// routes map
module.exports = function () {
	var self = this,
		map = {};

	// first create a unique map of all routes

	// @TODO enable routes from 3rd party modules first

	// enable core routes last. core routes cannot be overwritten
	// by 3rd party modules. if any 3rd party module registered a core
	// route, it will be replaced at this juncture.
	_.each(Rax, function (module, moduleName) {
		if (typeof module.routes === 'object') {
			_.each(module.routes, function (actions, route) {
				if (typeof map[route] !== 'undefined') {
					Rax.logging.r('Warning! Overwriting 3rd party route with core route: ' + route);
				}

				map[route] = actions;
			});
		}
	});

	// pass 'this' (router) reference to the enabler
	enableRoutes.call(self, map);

	// protected routes (ie. cannot be violated by 3rd party modules)
	this.get('index', '/', function (req, res) {
		res.writeHeader(200, {"Content-Type": "text/html"});
		res.write(Rax.themes.render('index'));
		res.end();
	});

	// (404) not found - the Rax router is the end of the middleware chain, so
	// we will handle a 'not found' case here. The option to extend the middleware
	// chain beyond the router is left open though via the next() function.
	this.notFound(function (req, res, next) {
		res.writeHead(400);
		res.end('Sorry, your request cannot be found. - Rax');
	});
};

function enableRoutes(routes) {
	var self = this,
		acceptedActions = [
			'get',
			'post',
			'put',
			'delete'
		],
		validate = function (key) {
			return (acceptedActions.indexOf(key) === -1) ? false : true;
		},
		reject, routeId;

	_.each(routes, function (actions, route) {
		reject = false;
		routeId = false;

		if (typeof actions.id !== 'string') {
			Rax.log('rejecting route due to no routeId', route);
			return true; // continue
		} else if (typeof self.url[actions.id] === 'function') {
			Rax.log('rejecting route due to duplicate routeId', route);
			return true; // continue
		} else if (route.charAt(0) !== '/') {
			Rax.log('rejecting route due to invalid pattern', route);
			return true; // continue;
		}

		// pull the routeId out and remove its key from the actions map
		routeId = actions.id;
		delete actions.id;

		if (_.isEmpty(actions)) {
			Rax.log('rejecting route due to no actions to bind', route);
			return true; // continue;
		}

		// validate the actions map
		Object.keys(actions).forEach(function (key) {
			if (!validate(key)) {
				reject = true;
			}
		});

		// if validation was passed, bind the actions to the router
		if (!reject) {
			self.bind(routeId, route, actions);
		} else {
			Rax.log('route rejected', route);
		}
	});
}