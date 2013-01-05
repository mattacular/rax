/*jslint nomen: true, sloppy: true, devel: false, browser: true, maxerr: 50, indent: 4, white: true*/
/*global module: false, process: false, require: false, console: false, clearInterval: false, clearTimeout: false, setInterval: false, setTimeout: false */
// Provides a MongoDB Session Store for Connect
var Rax = require('../rax'),
	mongoose = require('mongoose'),
	sessions = false;

/*
	Connect's session model ('session' field is a serialized cookie) - 
	{
		"_id" : "499RnRBMiGQNmh5rE3hWvpZC",
		"session" : "{\"cookie\":{\"originalMaxAge\":1800000,\"expires\":\"2013-01-05T20:24:23.633Z\",\"httpOnly\":true,\"path\":\"/\"}}",
		"expires" : ISODate("2013-01-05T20:24:23.633Z")
	}
*/

/* beacon events */
Rax.beacon.once('coreLoaded', init);

/* init - setup session model etc */
function init() {
	var sessionSchema = mongoose.Schema({
		'_id': String,
		'session': String,
		'expires': Date
	});

	sessions = mongoose.model('Session', sessionSchema, 'sessions');
}

module.exports = function (connect) {
	var Store = connect.session.Store,
		defaultCb = function () {};

		console.log(typeof Store.prototype);

	/**
	 *	Initialize MongoStore
	 */
	function MongoStore(options, callback) {
		var self = this,
			dbUrl, mongoosePs;

		options = options || { 'db': 'test' };
		callback = callback || function () {};

		Store.call(this, options);

		this.collection = sessions;

		if (typeof options.stringify === 'undefined' || options.stringify) {
			this.serializeSession = JSON.stringify;
			this.unserializeSession = JSON.parse;
		} else {
			this.serializeSession = this.unserializeSession = function(x) { return x; };
		}
	}

	// inherit the Connect session store's prototype
	MongoStore.prototype.__proto__ = Store.prototype;

	/*
	 *	Implementation of Session.get()
	 */
	MongoStore.prototype.get = function (sid, cb) {
		var self = this;

		console.log('get sess?', sid);

		cb = cb || defaultCb;

		this.collection.findOne({ '_id': sid }, function (err, session) {
			try {
				// no session found, terminate with callback
				if (err) {
					cb(err, null);
					return;
				} 

				// session found! check expiration
				if (session) {

					if (!session.expires || new Date() < session.expires) {
						cb(null, self.unserializeSession(session.session));
					} else {
						self.destroy(sid, cb);
					}

					return;
				}

				// otherwise just callback
				cb();
			} catch (err) {
				cb(err);
			}
		});
	};

	/*
	 *	Implementation of Session.set()
	 */
	MongoStore.prototype.set = function (sid, session, cb) {
		var newSession;

		cb = cb || defaultCb;

		try {
			newSession = {
				'session': this.serializeSession(session)
			};

			if (session && session.cookie && session.cookie._expires) {
				newSession.expires = new Date(session.cookie._expires);
			}

			this.collection.update({ '_id' : sid }, newSession, { 'upsert': true, 'safe': true }, cb);
		} catch (err) {
			cb(err);
		};
	};

	/*
	 *	Implementation of Session.destroy()
	 */
	MongoStore.prototype.destroy = function (sid, cb) {
		cb = cb || defaultCb;

		this.collection.remove({ '_id': sid }, cb);
	};

	/*
	 *	Implementation of Session.length()
	 */
	MongoStore.prototype.length = function (cb) {
		cb = cb || defaultCb;

		this.collection.count({}, cb);
	};

	/*
	 *	Implementation of Session.clear()
	 */
	MongoStore.prototype.clear = function (cb) {
		cb = cb || defaultCb;

		this.collection.drop(cb);
	};

	return MongoStore;
};