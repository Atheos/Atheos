//////////////////////////////////////////////////////////////////////////////80
// Echo: Concentrated (ES6) library for Ajax requests
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/license.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2018 Weide
// Source: https://github.com/WeideMo/miniAjax
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
			if (options.random) {
				data.push(('v=' + Math.random()).replace('.', ''));
			}
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
			if (options.settled && typeof options.settled === 'function') {
				options.settled(data, xhr.status);
			} else if (xhr.status >= 200 && xhr.status < 300) {
				if (options.success && typeof options.success === 'function') {
					options.success(data, xhr.status);
				}
			} else {
				if (options.failure && typeof options.failure === 'function') {
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