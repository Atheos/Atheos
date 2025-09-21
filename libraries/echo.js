//////////////////////////////////////////////////////////////////////////////80
// Echo
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Notes:
// Echo was built specifically for Atheos and as such may not be suitable for
// other uses, but Echo is incredibly versitile and configurable. I suggest
// looking at older versions of this file, or grabbing the original source that
// I used as a starter if you're looking to use this elsewhere.
// Source: https://github.com/WeideMo/miniAjax
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';

	let headers = {},
		globalDest = false;

	function echo(opt) {
		if (!opt || !globalDest) return;
		if (!opt.url) opt.url = globalDest;

		opt.type = opt.type || ((opt.data) ? 'POST' : 'GET');

		var xhr = new XMLHttpRequest(),
			data = opt.data ? [] : null;

		if (opt.data && typeof opt.data === 'object') {
			for (var name in opt.data) {
				data.push(encodeURIComponent(name) + '=' + encodeURIComponent(opt.data[name]));
			}
			if (opt.rnd) data.push(('v=' + Math.random()).replace('.', ''));
			data = data.join('&');
		}

		if (opt.settled && typeof opt.settled === 'function') {
			opt.success = opt.settled;
			opt.failure = opt.settled;
		}

		if (opt.timeout) {
			xhr.timeout = opt.timeout;
			xhr.ontimeout = opt.failure;
		}

		xhr.onreadystatechange = function() {
			if (xhr.readyState !== 4) return; // not complete

			// Try to parse JSON data
			var reply = xhr.responseText;
			try {
				reply = JSON.parse(reply);

				if ('debug' in reply) {
					console.log(reply.debug);
					delete reply.debug;
				}
			} catch (e) {}

			let status = xhr.status;
			if (isObject(reply)) {
				status = reply.status;
				delete reply.status;
			}

			// Call the relevant callback function
			if (opt.success && xhr.status >= 200 && xhr.status < 300) {
				opt.success(reply, status);
			} else if (opt.failure) {
				opt.failure(reply, status);
			}
		};

		if (opt.type === 'GET') {
			data = data ? '?' + data : '';
			xhr.open('GET', opt.url + data, true);
		} else if (opt.type === 'POST') {
			xhr.open('POST', opt.url, true);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		}

		for (const s in headers) {
			xhr.setRequestHeader(s, headers[s]);
		}

		xhr.send(data);
		return xhr;
	}

	echo.setHeaders = (opt) => headers = opt;
	echo.setGlobalDest = (url) => globalDest = url;

	window.echo = echo;
})();