//////////////////////////////////////////////////////////////////////////////80
// Global Functions
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';

	//////////////////////////////////////////////////////////////////////////80
	// Generate unique IDs
	//////////////////////////////////////////////////////////////////////////80
	const randChar = (a) => (a ^ Math.random() * 16 >> a / 4).toString(16);
	window.genID = function(p) {
		let a = ([1e3] + -4e3 + -1e5).replace(/[018]/g, randChar);
		return p ? p + '-' + a : a;
	};

	//////////////////////////////////////////////////////////////////////////80
	// Path helper functions
	//////////////////////////////////////////////////////////////////////////80
	window.pathinfo = function(path) {
		let basename = path.split('/').pop(),
			fileNode = document.querySelector('#file-manager a[data-path="' + path + '"]');

		return {
			// discuss at: http://phpjs.org/functions/dirname/
			directory: path.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, ''),
			type: fileNode ? fileNode.getAttribute('data-type') : false,
			//  discuss at: http://phpjs.org/functions/basename/
			basename,
			extension: basename.split('.').pop(),
			fileName: basename.split('.').slice(0, -1).join('.') || basename,
		};
	};

	//////////////////////////////////////////////////////////////////////////80
	// Debounce and Throttle
	//////////////////////////////////////////////////////////////////////////80
	window.debounce = function(fn, delay) {
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

	window.throttle = function(fn, threshhold, scope) {
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


	//////////////////////////////////////////////////////////////////////////80
	// Open External Link
	//////////////////////////////////////////////////////////////////////////80
	window.openExternal = function(url) {
		window.open(url, '_newtab');
	};


	//////////////////////////////////////////////////////////////////////////80
	// Extend / Combine JS objects without modifying the source object
	//////////////////////////////////////////////////////////////////////////80
	window.extend = function(obj, src) {
		var temp = JSON.parse(JSON.stringify(obj));
		for (var key in src) {
			if (src.hasOwnProperty(key)) {
				temp[key] = src[key];
			}
		}
		return temp;
	};


	//////////////////////////////////////////////////////////////////////////80
	// SerializeForm
	//////////////////////////////////////////////////////////////////////////80
	window.serializeForm = function(form) {
		var field, l, s = [];
		var o = {};
		if (typeof form === 'object' && form.nodeName === 'FORM') {

			var len = form.elements.length;

			for (var i = 0; i < len; i++) {
				field = form.elements[i];
				// field.type === 'file' && field.type === 'reset' && field.type === 'submit' && field.type === 'button' &&
				if (!field.name || field.disabled || field.nodeName === 'BUTTON' || ['file', 'reset', 'submit', 'button'].indexOf(field.type) > -1) {
					continue;
				}

				if (field.type === 'select-multiple') {
					l = form.elements[i].options.length;
					for (var j = 0; j < l; j++) {
						if (field.options[j].selected) {
							o[field.name] = field.options[j].value;
						}
					}
				} else if (field.type !== 'checkbox' && field.type !== 'radio') {
					o[field.name] = field.value;
				} else if (field.checked) {
					if (o[field.name]) {
						o[field.name].push(field.value);
					} else {
						o[field.name] = [field.value];
					}
				}
			}
		}
		return o;
	};

	window.serialize = function(form) {
		const data = new FormData(form);
		return Object.fromEntries(data.entries());
	};

	//////////////////////////////////////////////////////////////////////////80
	// Methods for determining whether something is or isn't
	//////////////////////////////////////////////////////////////////////////80
	window.isArray = (value) => value && typeof value === 'object' && value.constructor === Array;
	window.isObject = (value) => value && typeof value === 'object' && value.constructor === Object;
	window.isRegExp = (value) => value && typeof value === 'object' && value.constructor === RegExp;
	window.isError = (value) => value instanceof Error && typeof value.message !== 'undefined';
	window.isString = (value) => typeof value === 'string' || value instanceof String;
	window.isNumber = (value) => typeof value === 'number' && isFinite(value);
	window.isUndefined = (value) => typeof value === 'undefined';
	window.isFunction = (value) => typeof value === 'function';
	window.isBoolean = (value) => typeof value === 'boolean';
	window.isSymbol = (value) => typeof value === 'symbol';
	window.isDate = (value) => value instanceof Date;
	window.isNull = (value) => value === null;

	//////////////////////////////////////////////////////////////////////////80
	// Shorthand for sending to console
	//////////////////////////////////////////////////////////////////////////80
	window.log = Function.prototype.bind.call(console.log, console);
	window.trace = Function.prototype.bind.call(console.trace, console);

	//////////////////////////////////////////////////////////////////////////80
	// Blackhole function
	//////////////////////////////////////////////////////////////////////////80
	window.blackhole = function(event) {
		if (event) event.preventDefault();
		return false;
	};

})();