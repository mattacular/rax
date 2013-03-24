/*jslint nomen: true, sloppy: true, devel: false, browser: true, maxerr: 50, indent: 4, white: true*/
/*global module: false, process: false, require: false, console: false, clearInterval: false, clearTimeout: false, setInterval: false, setTimeout: false */
// Rax User Module - user.js
var User = module.exports = {},
	Rax = require('./rax'),
	mongoose = require('mongoose'),
	bcrypt = require('bcrypt'),			// encryption module for safe password persistence
	nodemailer = require('nodemailer'),
	SALT_WORK_FACTOR = 10;

User.routes = {
	'/logout': {
		'id': 'user:logout',
		'get': function (req, res) {
			if (Rax.active.user && Rax.active.user !== 'anon') {
				Rax.log('logging out', Rax.active.user);

				// a user logged out... flush the render cache for the page we're sending them to?
				Rax.theme.flush('index');

				req.session.destroy(function () {
					res.writeHead(302, { 'Location': '/' });
					res.end();
				});
			} else {
				res.write('Already logged out');
				res.end();
			}
		}
	},
	'/json/me': {
		'id': 'user:api:getActive',
		'get': function (req, res) {
			res.writeHead(200, { 
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			});

			if (Rax.active.user !== 'anon') {
				res.write(JSON.stringify({
					'_id': Rax.active.user._id,
					'last_access': Rax.active.user.last_access,
					'mail': Rax.active.user.mail,
					'name': Rax.active.user.name
				}));
			} else {
				res.write(JSON.stringify({ 'error': { 'status': 'You must be logged in to use this API call.', 'code': 0 } }));
			}
			res.end();
		}
	},
	'/signup': {
		'id': 'user:signup',
		'get': function (req, res) {
			if (Rax.active.user && Rax.active.user !== 'anon') {
				res.writeHead(302, { 'Location': '/' });
				res.end();
			} else {
				res.writeHead(200, {"Content-Type": "text/html"});

				// Theme.render() is async, regardless of whether the engine supports it
				Rax.theme.render('signup', { 'route': '/signup' }, function (err, html) {
					if (!err) {
						res.write(html);
					} else {
						Rax.log(err);
						res.write('Houston, we have a problem.');
					}
					res.end();
				});
			}
		},
		'post': function (req, res) {
			var body = req.body;

			// @TODO what validation?
			if (body.newUser.acceptTerms && 
				body.newUser.acceptTerms === 'on' &&
				body.newUser.email && body.newUser.password) {

				newUser = User.model.create({
					'name': body.newUser.email,
					'pass': body.newUser.password,
					'mail': body.newUser.email,
					'last_access': ( new Date() )
				}, function (err, newb) {
					if (!err) {
						res.writeHead(302, { 'Location': '/' });
					} else {
						res.writeHead(302, { 'Location': '/signup' });
					}

					res.end();
				});
			}
		}
	}
};

// Rax.on('init', function () {
// 	// create reusable transport method (opens pool of SMTP connections)
// 	var smtpTransport = nodemailer.createTransport("SMTP",{
// 	    service: "Gmail",
// 	    auth: {
// 	        user: ""
// 	        pass: ""
// 	    }
// 	});

// 	// setup e-mail data with unicode symbols
// 	var mailOptions = {
// 	    from: "Rax <rax@gmail.com>", // sender address
// 	    to: "mattacular@gmail.com", // list of receivers
// 	    subject: "Hello, this is Rax", // Subject line
// 	    text: "Wasup dog", // plaintext body
// 	    html: "<b>Wasup doggy</b>" // html body
// 	}

// 	// send mail with defined transport object
// 	smtpTransport.sendMail(mailOptions, function(error, response){
// 	    if(error){
// 	        console.log(error);
// 	    }else{
// 	        console.log("Message sent: " + response.message);
// 	    }

// 	    // if you don't want to use this transport object anymore, uncomment following line
// 	    smtpTransport.close(); // shut down the connection pool, no more messages
// 	});
// });

// User.db = provide schema and models

Rax.on('coreLoaded', function () {
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
		if (!user.isModified('pass')) {
			return next();
		}

		// generate a salt
		bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
			if (err) {
				return next(err);
			}

			// hash the password using our new salt
			bcrypt.hash(user.pass, salt, function (err, hash) {
				if (err) {
					return next(err);
				}

				// override the cleartext password with the hashed one
				user.pass = hash;
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

