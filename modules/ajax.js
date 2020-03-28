//////////////////////////////////////////////////////////////////////////////80
// Ajax
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Notes:
// The Ajax library is built specifically for Atheos, meaning that some of it's
// features are geared towards use in Atheos and may not be suitable towards
// other uses, but those features are easily modified. I suggest looking at
// older versions of this file, or grabbing the original source that I used as
// a starter if you're looking to use this elsewhere.
//
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
		root.ajax = factory(root);
	}
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this, function(window) {

	'use strict';

	function formatParams(data) {
		var arr = [];
		if (data && typeof data === 'object') {
			for (var name in data) {
				arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
			}
		}
		return arr.join('&');
	}

	const ajax = function(options) {
		options = options || {};
		options.type = options.type || ((options.data) ? 'POST' : 'GET');

		var params = formatParams(options.data);
		var xhr;

		if (window.XMLHttpRequest) {
			xhr = new XMLHttpRequest();
		} else {
			xhr = new ActiveXObject('Microsoft.XMLHTTP');
		}

		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				var data = xhr.responseText;
				try {
					data = JSON.parse(data);
					if (data.debug) {
						console.log(data.debug);
						delete data.debug;
					}
				} catch (e) {}
				if (xhr.status >= 200 && xhr.status < 300) {
					if (options.success) {
						options.success(data, xhr.status);
					}
				} else {
					if (options.fail) {
						options.fail(data, xhr.status);
					}
				}
			}
		};

		if (options.type === 'GET') {
			params = params ? '?' + params : '';
			xhr.open('GET', options.url + params, true);
			xhr.send(null);
		} else if (options.type === 'POST') {
			xhr.open('POST', options.url, true);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.send(params);
		}
	};
	return ajax;
});