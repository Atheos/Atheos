//////////////////////////////////////////////////////////////////////////////80
// Zed
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80

(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], function() {
			return factory(root);
		});
	} else if (typeof exports === 'object') {
		module.exports = factory(root);
	} else {
		root.zed = factory(root);
	}
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this, function(window) {
	'use strict';

	const zed = {

		debounce: function(fn, delay) {
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
		},

		throttleOG: function(fn, threshhold, scope) {
			// Source: https://remysharp.com/2010/07/21/throttling-function-calls
			threshhold || (threshhold = 250);
			var last, deferTimer;
			return function() {
				var context = scope || this;

				var now = +new Date,
					args = arguments;
				if (last && now < last + threshhold) {
					// hold on to it
					clearTimeout(deferTimer);
					deferTimer = setTimeout(function() {
						last = now;
						fn.apply(context, args);
					}, threshhold);
				} else {
					last = now;
					fn.apply(context, args);
				}
			};
		},

		throttle: function(fn, threshhold, scope) {
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
		}




	};
	return zed;
});