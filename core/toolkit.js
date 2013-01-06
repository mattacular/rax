/*jslint nomen: true, sloppy: true, devel: false, browser: true, maxerr: 50, indent: 4, white: true*/
/*global module: false, require: false, console: false, clearInterval: false, clearTimeout: false, setInterval: false, setTimeout: false */
// RAX Toolkit Functions - toolkit.js
var	Toolkit = module.exports = {},
	Rax = require('./rax'),
	fs = require('fs')

/**
 *  isDef()
 *  Created by: Brian Martin & Matt Stills
 *    Safe object property check
 *  @param object (object)
 *    The object you are checking properties on
 *  @param depths (array)
 *    Depths is an array of strings representing the appropriate depth you want to check
 *
 *    Recommended: an array of properties
 *    Example: If you want to check the existence of "data.pbp.gameState.clock",
 *             
 *             isDef(data, ['pbp', 'gameState', 'clock']);
 *
 *             Variables can be used the same way,
 *
 *             var idx = 0;
 *             var prop = 'away';
 *             // to check "data.pbp.plays[idx].team[prop]"
 *             var myPlay = (!isDef(data, ['pbp', 'plays', idx, 'team', prop])) ? false : data.pbp.plays[idx].team[prop];
 *
 *	@param retVal (optional)
 *	  Pass 'prop' to instruct isDef() to return the property being checked if it exists
 *  @returns
 *    Default:
 *      (bool)true if property exists, (bool)false if not
 *    Case: 'retVal' === 'prop'
 *      Returns requested property if it exists, (bool) false if not
 */
Toolkit.isDef = Rax.isDef = function (obj, depths, retVal) {
	var x;

	retVal = (typeof retVal !== 'undefined' && retVal === 'prop') ? 'prop' : 'bool';

	if (typeof obj === 'undefined' || obj === null) {
		throw ("Object is not defined in isDef() function!");
	} else if (typeof depths === 'undefined' || depths === null) {
		throw ("Depth is not defined in isDef() function!");
	} else if (depths.length === 0) {
		throw ("Depths is empty in isDef() function!");
	}

	for (x = 0; x < depths.length; x += 1) {
		if (typeof obj[depths[x]] !== 'undefined' && obj[depths[x]] !== null) {
			obj = obj[depths[x]];
		} else {
			return false;
		}

	}
	
	return (retVal === 'prop') ? obj : true;
};

/**
 *	seek()
 *		Rax file seek
 */
Toolkit.seek = Rax.seek = function (input) {
	// supply hints about the whereabouts/type of the file you want to read via the 'input' string
	/*
	example:
		Static searches (very fast) -
		Rax.seek('themes/index');	<-- load active theme's index.handlebars
		Rax.seek('themes/foundation/index'); <-- load a specific theme's index.handlebars
		Rax.seek('module/glados'); = Rax.seek('addon/glados')	<-- load addon module's main js (eponymous *.js) 
		Rax.seek('routes'); <-- top-level assumes core module (either without extension or with *.js extension)

		Rax.seek('/core/post.js') <-- absolute reference (Rax process dir is always root /)

		Dynamic searches (not as fast) -
		Rax.seek('template>testing'); <-- '>' = query symbol. search all known template sources for 'testing.handlebars'
		Rax.seek('addon/glados/*.json'); <-- read main JSON file (rax module identifier) associated with the glados addon

		Reads contents of file if exists
	*/
};

Toolkit.goto = Toolkit.redirect = function (dest) {
	var res;

	dest = dest || '/';

	if (!Rax.active.res) {
		return false;
	} else {
		res = Rax.active.res;
	}

	res.writeHead(302, { 'Location': dest });
	res.end();
};

/**
 *	stripTags()
 *		Strips HTML tags from a given string
 */
Toolkit.stripTags = function (input) {
	return (typeof input === 'string') ? input.replace(/<(?:.|\n)*?>/gm, '') : false;
};

// How to store RTF on posts in DB? Is it cheaper to store marked up bodies? Or come up with some sort of extraction/re-application of element scheme
// like below:

// OR! Internal vs. External content DBs. Internal DB 

/*
takes a 'body' and applies a 'map' to it
@return formatted body
*/
Toolkit.applyFormat = function (body, map) {
};

/* ingests a post and creates a formatting map of all of its HTML tags for storage in the DB. 
@returns (object)
'body': stripped body
'map': format map obj
*/
Toolkit.extractFormat = function () {
	// would use npm 'html-parser' to assist
};

/*

Format maps -

Consider this post:

<p>This is some <strong>sample text</strong>. You are using <a href="http://ckeditor.com/">CKEditor</a>.</p>

Format map would decode to:

Body:
This is some sample text. You are using CKEditor.

Cols map:
1: {	// beginCol is key
	't': 'p'
	'e': 50
}
14: {
	't': 'strong',
	'e': 25
}
41: {
	't': 'a href="#"',
	'e': 49
}