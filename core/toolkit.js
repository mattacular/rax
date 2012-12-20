/*jslint nomen: true, sloppy: true, devel: false, browser: true, maxerr: 50, indent: 4, white: true*/
/*global module: false, require: false, console: false, clearInterval: false, clearTimeout: false, setInterval: false, setTimeout: false */
// RAX Toolkit Functions - toolkit.js
var	Toolkit = module.exports = {},
	Rax = require('./rax');

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