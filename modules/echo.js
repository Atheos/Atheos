//////////////////////////////////////////////////////////////////////////////80
// Echo
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Notes:
// Echo was built specifically for Atheos and as such may not be suitable for
// other uses, but Echo is incredibly versitile and configurable. I suggest
// looking at older versions of this file, or grabbing the original source that
// I used as a starter if you're looking to use this elsewhere.
// Source: https://github.com/WeideMo/miniAjax
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], function() {
			return factory(root);
		});
	} else if (typeof exports === 'object') {
		module.exports = factory(root);
	} else {
		root.echo = factory(root);
	}
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this, function(window) {

	'use strict';

	const echo = function(options) {
		options = options || {};

		options.type = options.type || ((options.data) ? 'POST' : 'GET');

		var data = [];
		if (options.data && typeof options.data === 'object') {
			for (var name in options.data) {
				data.push(encodeURIComponent(name) + '=' + encodeURIComponent(options.data[name]));
			}
			if (options.random) data.push(("v=" + Math.random()).replace(".", ""));
			data = data.join('&');
		} else {
			data = null;
		}

		var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');

		if (options.timeout) {
			xhr.timeout = options.timeout;
			xhr.ontimeout = options.failure;
		}

		xhr.onload = function() {
			var data = xhr.responseText;
			try {
				data = JSON.parse(data);
				if (typeof(data.debug) !== 'undefined') {
					console.log(data.debug);
					delete data.debug;
				}
			} catch (e) {}
			if (xhr.status >= 200 && xhr.status < 300) {
				if (options.success) {
					options.success(data, xhr.status);
				}
			} else {
				if (options.failure) {
					options.failure(data, xhr.status);
				}
			}
		};
		
		if (options.type === 'GET') {
			data = data ? '?' + data : '';
			xhr.open('GET', options.url + data, true);
			xhr.send(null);
		} else if (options.type === 'POST') {
			xhr.open('POST', options.url, true);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.send(data);
		}

		return xhr;

	};
	return echo;
});