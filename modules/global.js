//////////////////////////////////////////////////////////////////////////////80
// Global Functions
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';


	//////////////////////////////////////////////////////////////////////
	// Path helper functions
	//////////////////////////////////////////////////////////////////////
	global.pathinfo = function(path) {
		var index = path.lastIndexOf('/');

		let getBaseName = function(path) {
			return path.split('/').pop();
		};

		let getDirectory = function(path) {
			return path.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '');
		};

		let getType = function() {
			var element = document.querySelector('#file-manager a[data-path="' + path + '"]');
			return element ? element.getAttribute('data-type') : false;
		};

		return {
			// discuss at: http://phpjs.org/functions/dirname/
			directory: path.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, ''),
			extension: path.split('.').pop(),
			fileName: path.substring(index + 1),
			//  discuss at: http://phpjs.org/functions/basename/
			basename: path.split('/').pop(),
			type: getType()
		};
	};

	//////////////////////////////////////////////////////////////////////
	// Debounce and Throttle
	//////////////////////////////////////////////////////////////////////
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
	// Open External Link
	//////////////////////////////////////////////////////////////////////
	global.openExternal = function(url) {
		window.open(addon.url, '_newtab');
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


	//////////////////////////////////////////////////////////////////////80
	// SerializeForm
	//////////////////////////////////////////////////////////////////////80
	global.serializeForm = function(form) {
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

	global.serialize = function(form) {
		const data = new FormData(form);
		return Object.fromEntries(data.entries());
	};

	//////////////////////////////////////////////////////////////////////////80
	// Methods for determining whether something is or isn't
	//////////////////////////////////////////////////////////////////////////80
	global.isArray = (value) => value && typeof value === 'object' && value.constructor === Array;
	global.isObject = (value) => value && typeof value === 'object' && value.constructor === Object;
	global.isRegExp = (value) => value && typeof value === 'object' && value.constructor === RegExp;
	global.isError = (value) => value instanceof Error && typeof value.message !== 'undefined';
	global.isString = (value) => typeof value === 'string' || value instanceof String;
	global.isNumber = (value) => typeof value === 'number' && isFinite(value);
	global.isUndefined = (value) => typeof value === 'undefined';
	global.isFunction = (value) => typeof value === 'function';
	global.isBoolean = (value) => typeof value === 'boolean';
	global.isSymbol = (value) => typeof value === 'symbol';
	global.isDate = (value) => value instanceof Date;
	global.isNull = (value) => value === null;

	//////////////////////////////////////////////////////////////////////
	// Shorthand for sending to console
	//////////////////////////////////////////////////////////////////////
	window.log = Function.prototype.bind.call(console.log, console);
	window.trace = Function.prototype.bind.call(console.trace, console);


})(this);