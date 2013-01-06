/*jslint nomen: true, sloppy: true, devel: false, browser: true, maxerr: 50, indent: 4, white: true*/
/*global module: false, process: false, require: false, console: false, clearInterval: false, clearTimeout: false, setInterval: false, setTimeout: false */
// Provides a MongoDB Session Store for Connect
var Rax = require('../rax'),
	mongoose = require('mongoose'),
	sessions = false;

/* beacon events */
Rax.once('coreLoaded', init);

/* init - setup session model etc */
function init() {
	/*
		Connect's session model ('session' field is a serialized cookie) - 
		{
			"_id" : "499RnRBMiGQNmh5rE3hWvpZC",
			"session" : "{\"cookie\":{\"originalMaxAge\":1800000,\"expires\":\"2013-01-05T20:24:23.633Z\",\"httpOnly\":true,\"path\":\"/\"}}",
			"expires" : ISODate("2013-01-05T20:24:23.633Z")
		}
	*/
	var sessionSchema = mongoose.Schema({
		'_id': String,
		'session': String,
		'expires': Date
	});

	sessions = mongoose.model('Session', sessionSchema, 'sessions');
}

/**
 *	Rax DB Session Storage Driver (RaxStore)
 *		Main component of this module. Satisfies Connect's Session middleware API 
 *		to utilize MongoDB for storage.
 *	
 *		This is a constructor that itself returns another constructor, which is 
 *		the finished driver, endowed with all off the necessary methods, and
 *		ready to feed to Connect's Session middleware for usage.
 */
module.exports = function (connect) {
	var Store = connect.session.Store,
		defaultCb = function () {};

	/**
	 *	Initialize RaxStore
	 */
	function RaxStore(options, callback) {
		var self = this, dbUrl;

		this.collection = sessions;
	}

	// IMPORTANT: inherit the Connect session middleware's store prototype 
	// (provides skeleton methods that don't need customizing)
	RaxStore.prototype.__proto__ = Store.prototype;

	/*
	 *	Implementation of Session.get()
	 */
	RaxStore.prototype.get = function (sid, cb) {
		var self = this;

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
						cb(null, JSON.parse(session.session));
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
	RaxStore.prototype.set = function (sid, session, cb) {
		var newSession;

		cb = cb || defaultCb;

		try {
			newSession = {
				'session': JSON.stringify(session)
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
	RaxStore.prototype.destroy = function (sid, cb) {
		cb = cb || defaultCb;

		this.collection.remove({ '_id': sid }, cb);
	};

	/*
	 *	Implementation of Session.length()
	 */
	RaxStore.prototype.length = function (cb) {
		cb = cb || defaultCb;

		this.collection.count({}, cb);
	};

	/*
	 *	Implementation of Session.clear()
	 */
	RaxStore.prototype.clear = function (cb) {
		cb = cb || defaultCb;

		this.collection.drop(cb);
	};

	return RaxStore;
};