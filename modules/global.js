//////////////////////////////////////////////////////////////////////////////80
// Global Functions
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';

	global.pathinfo = function(path) {
		var index = path.lastIndexOf('/');
		//////////////////////////////////////////////////////////////////////
		// Path helper functions
		//////////////////////////////////////////////////////////////////////
		let getBaseName = function(path) {
			//  discuss at: http://phpjs.org/functions/basename/
			return path.split('/').pop();
		};

		let getDirectory = function(path) {
			// discuss at: http://phpjs.org/functions/dirname/
			return path.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '');
		};

		let getType = function() {
			var element = document.querySelector('#file-manager a[data-path="' + path + '"]');
			return element ? element.getAttribute('data-type') : false;
		};

		return {
			directory: (path.indexOf('/') === 0) ? path.substring(1, index + 1) : path.substring(0, index + 1),
			extension: path.split('.').pop(),
			fileName: path.substring(index + 1),
			basename: path.split('/').pop(),
			type: getType()
		};
	};


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