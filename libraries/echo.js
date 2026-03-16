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
		globalDest = false,
		batchDest = 'batch.php',
		batchQueue = [],
		batchTimer = null,
		batchDelay = 50;

	let destinations = {};
	// destinations['ajax.php'] = { batch: 'batch.php', queue: [], timer: null }

	//////////////////////////////////////////////////////////////////////////80
	// Process Replies
	//////////////////////////////////////////////////////////////////////////80
	function processReply(opt, reply, status) {
		try {
			reply = JSON.parse(reply);

			if ('debug' in reply) {
				console.log(reply.debug);
				delete reply.debug;
			}
		} catch (e) {}

		if (isObject(reply) && 'status' in reply) {
			status = reply.status;
			delete reply.status;
		}

		// Call the relevant callback function
		if (opt.settled) {
			opt.settled(reply, status);
		} else if (opt.success && status >= 200 && status < 300) {
			opt.success(reply, status);
		} else if (opt.failure) {
			opt.failure(reply, status);
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Encode data for xhr requests
	//////////////////////////////////////////////////////////////////////////80
	function encodeData(data) {
		let payload = [];

		if (data && typeof data === 'object') {
			for (var key in data) {
				payload.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
			}
			if (data.rnd) payload.push(('v=' + Math.random()).replace('.', ''));
			payload = payload.join('&');
		}

		return payload;
	}

	//////////////////////////////////////////////////////////////////////////80
	// Send Request
	//////////////////////////////////////////////////////////////////////////80
	function sendRequest(opt) {
		var xhr = new XMLHttpRequest(),
			payload = opt.data ? [] : null;


		if (opt.timeout) {
			xhr.timeout = opt.timeout;
			xhr.ontimeout = opt.failure;
		}

		xhr.onreadystatechange = function() {
			if (xhr.readyState !== 4) return; // not complete

			// Try to parse JSON data
			let reply = processReply(opt, xhr.responseText, xhr.status);
		};

		if (opt.type === 'GET') {
			opt.url = opt.data ? opt.url + encodeData(opt.data) : opt.url;
			xhr.open('GET', opt.url, true);

		} else {

			let contentType = (opt.type === 'POST') ? 'application/JSON' : 'application/x-www-form-urlencoded';
			payload = (opt.type === 'POST') ? JSON.stringify(opt.data) : encodeData(opt.data);

			xhr.open('POST', opt.url, true);
			xhr.setRequestHeader('Content-Type', contentType);
		}

		for (const s in headers) xhr.setRequestHeader(s, headers[s]);
		xhr.send(payload);

		return xhr;
	}


	//////////////////////////////////////////////////////////////////////////80
	// Send Request Queue
	//////////////////////////////////////////////////////////////////////////80
	function sendQueue() {
		if (!batchQueue.length) return;

		const pending = batchQueue.splice(0);

		sendRequest({
			url: globalDest,
			data: {
				multiRequest: true,
				requests: pending.map(opt => opt.data)
			},
			type: 'POST',
			settled: function(reply, batStatus) {
				const responses = reply || {};
				pending.forEach((opt, i) => {
					const res = responses[i];
					if (!res) return;
					let resStatus = res.status || batStatus;
					const data = res.data || res;
					processReply(opt, data, resStatus);
				});
			}
		});
	}

	//////////////////////////////////////////////////////////////////////////80
	// Echo function
	//////////////////////////////////////////////////////////////////////////80
	function echo(opt) {
		if (!opt || !globalDest) return;
		if (!opt.url) opt.url = globalDest;

		opt.type = opt.type || ((opt.data) ? 'POST' : 'GET');

		// Queue non-urgent POST requests if batchDest is set
		if (opt.type === 'POST' && opt.url === globalDest) {
			batchQueue.push(opt);
			if (opt.sendNow) {
				sendQueue();
			} else {
				clearTimeout(batchTimer);
				batchTimer = setTimeout(sendQueue, batchDelay);
			}
		} else {
			sendRequest(opt);
		}
	}

	echo.setHeaders = (opt) => headers = opt;
	echo.setGlobalDest = (url) => globalDest = url;
	echo.setBatchDelay = (ms) => batchDelay = ms;
	echo.sendQueue = sendQueue;

	window.echo = echo;
})();