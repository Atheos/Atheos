//////////////////////////////////////////////////////////////////////////////80
// Global Functions
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';


	global.debounce = function(fn, delay) {
		// Source: https://remysharp.com/2010/07/21/throttling-function-calls
		var timer = null;
		return function() {
			var context = this,
				args = arguments;
			clearTimeout(timer);
			timer = setTimeout(function() {
				fn.apply(context, args);
			}, delay);
		};
	};

	global.throttle = function(fn, threshhold, scope) {
		// Source: https://remysharp.com/2010/07/21/throttling-function-calls
		threshhold = threshhold || 250;
		var defer = false;
		return function() {
			var context = scope || this;
			var args = arguments;

			if (defer === false) {
				defer = setTimeout(function() {
					defer = false;
					fn.apply(context, args);
				}, threshhold);
			}

		};
	};

	//////////////////////////////////////////////////////////////////////
	// Extend / Combine JS objects without modifying the source object
	//////////////////////////////////////////////////////////////////////
	global.extend = function(obj, src) {
		var temp = JSON.parse(JSON.stringify(obj));
		for (var key in src) {
			if (src.hasOwnProperty(key)) {
				temp[key] = src[key];
			}
		}
		return temp;
	};

	//////////////////////////////////////////////////////////////////////
	// Shorthand for sending to console
	//////////////////////////////////////////////////////////////////////
	window.log = Function.prototype.bind.call(console.log, console);
	window.trace = Function.prototype.bind.call(console.trace, console);


})(this);