//////////////////////////////////////////////////////////////////////////////80
// Echo
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';

	const echo = function(opts) {
		opts = opts || {};
		opts.url = opts.url || atheos.controller;

		opts.type = opts.type || ((opts.data) ? 'POST' : 'GET');

		// const serialize = obj => Object.keys(obj).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key])).join('&');

		var data = [];
		if (opts.data && typeof opts.data === 'object') {
			for (var name in opts.data) {
				data.push(encodeURIComponent(name) + '=' + encodeURIComponent(opts.data[name]));
			}
			data = data.join('&');
		} else {
			data = null;
		}

		var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');

		if (opts.timeout) {
			xhr.timeout = opts.timeout;
			xhr.ontimeout = opts.failure;
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

			if (opts.settled && typeof opts.settled === 'function') {

				let status = 'success';
				if (isObject(data)) {
					status = data.status;
					delete data.status;
				}


				opts.settled(status, data);
			} else if (xhr.status >= 200 && xhr.status < 300) {
				if (opts.success && typeof opts.success === 'function') {
					opts.success(data, xhr.status);
				}
			} else {
				if (opts.failure && typeof opts.failure === 'function') {
					opts.failure(data, xhr.status);
				}
			}
		};

		if (opts.type === 'GET') {
			data = data ? '?' + data : '';
			xhr.open('GET', opts.url + data, true);
			xhr.send(null);
		} else if (opts.type === 'POST') {
			xhr.open('POST', opts.url, true);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.send(data);
		}

		return xhr;

	};

	window.echo = echo;

})(this);