/*jslint nomen: true, sloppy: true, devel: false, browser: true, maxerr: 50, indent: 4, white: true*/
/*global module: false, process: false, require: false, console: false, clearInterval: false, clearTimeout: false, setInterval: false, setTimeout: false */
// Rax User Module - user.js
var User = module.exports = {},
	Rax = require('./rax'),
	mongoose = require('mongoose'),
	bcrypt = require('bcrypt'),			// encryption module for safe password persistence
	SALT_WORK_FACTOR = 10;

User.routes = {
	'/logout': {
		'id': 'user:logout',
		'get': function (req, res) {
			if (Rax.active.user && Rax.active.user !== 'anon') {
				Rax.log('logging out', Rax.active.user);

				req.session.destroy(function () {
					res.writeHead(302, { 'Location': '/' });
					res.end();
				});
			} else {
				res.write('Already logged out');
				res.end();
			}
		}
	}
};

// User.db = provide schema and models

Rax.beacon.on('coreLoaded', function () {
	// define user schema
	var userSchema = Rax.schema = mongoose.Schema({
		'name': String,
		'pass': String,
		'mail': String,
		'last_access': Date,
		'session_id': String
	});

	// when preparing to save a new user, convert password to a salted hash
	userSchema.pre('save', function (next) {
		var user = this;

		// only hash the password if it has been modified (or is new)
		if (!user.isModified('password')) {
			return next();
		}

		// generate a salt
		bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
			if (err) {
				return next(err);
			}

			// hash the password using our new salt
			bcrypt.hash(user.password, salt, function(err, hash) {
				if (err) {
					return next(err);
				}

				// override the cleartext password with the hashed one
				user.password = hash;
				next();
			});
		});
	});

	userSchema.methods.comparePassword = function (candidatePassword, cb) {
		bcrypt.compare(candidatePassword, this.pass, function (err, isMatch) {
			if (err) {
				return cb(err);
			}
			cb(null, isMatch);
		});
	};

	User.model = mongoose.model('User', userSchema, 'users');
});

User.get = function (query, cb, doLoad) {
	doLoad = doLoad || false;
	if (!User.model) {
		Rax.log('no user model');
		return;
	}
	User.model.findOne(query, function (err, instance) {
		if (!err) {
			if (doLoad) {
				Rax.active.user = instance;
			}
			cb(err, instance);
		} else {
			throw err;
		}
	});
};

