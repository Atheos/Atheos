//////////////////////////////////////////////////////////////////////////////80
// Flux Delegated Events
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2019 Go Make Things, LLC
// Source: https://github.com/cferdinandi/events
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';

	var cache = {};
	let alwaysRun = [
		'*',
		'window',
		'document',
		'document.documentElement',
		window,
		document,
		document.documentElement
	];

	var getIndex = function(arr, selector, callback) {
		let i = arr.length;

		while (i-- > 0) {
			if (arr[i].selector === selector) {
				if (!callback || arr[i].callback.toString() === callback.toString()) {
					return i;
				}
			}
		}
		return -1;
	};

	var activeMatch = function(target, selector) {
		if (alwaysRun.includes(selector)) return true;
		if (typeof selector !== 'string' && selector.contains) {
			return selector === target || selector.contains(target);
		}
		return target.closest(selector);
	};

	var eventHandler = function(event) {
		cache[event.type].forEach(function(listener) {
			if (!activeMatch(event.target, listener.selector)) {
				return;
			}
			listener.callback(event);
		});
	};

	let list = (s) => cache;

	let off = (types, selector, callback) => {

		if (types === '*' && selector && !callback) {
			for (var type in cache) {
				var index = getIndex(cache[type], selector);
				if (index === -1) continue;
				cache[type].splice(index, 1);
				if (cache[type].length === 0) {
					window.removeEventListener(type, eventHandler, true);
					delete cache[type];
				}
			}
			return;
		}


		types.split(',').forEach(function(type) {
			type = type.trim();
			if (!cache[type]) return;

			if (cache[type].length < 2) {
				delete cache[type];
				window.removeEventListener(type, eventHandler, true);
				return;
			}

			var index = getIndex(cache[type], selector, callback);
			if (index < 0) return;

			cache[type].splice(index, 1);
		});
	};

	let on = (types, selector, callback) => {
		if (!callback) return;

		types.split(',').forEach(function(type) {
			type = type.trim();
			if (!cache[type]) {
				cache[type] = [];
				window.addEventListener(type, eventHandler, true);
			}

			cache[type].push({
				selector,
				callback
			});

		});
	};

	let once = (types, selector, callback) => {
		on(types, selector, function temp(event) {
			callback(event);
			off(types, selector, temp);
		});
	};

	let reset = (selector, callback) => {
		for (var type in cache) {

			if (cache[type].length < 2) {
				delete cache[type];
				window.removeEventListener(type, eventHandler, true);
				return;
			}

			var index = getIndex(cache[type], selector);
			if (index < 0) return;
			cache[type].splice(index, 1);
		}
	};

	let trigger = function(selector, types) {
		let element = document.querySelector(selector);
		if (!element) return false;
		types.split(',').forEach(function(type) {
			type = type.trim();
			if (element && type) {
				var event = new CustomEvent(type, {
					bubbles: true,
					cancelable: true
				});
				return element.dispatchEvent(event);
			}

		});
	};

	window.Flux = {
		list,
		reset
	};

	const flux = function(s) {
		// s  => Selector
		// t  => EventType
		// fn => Functions
		// e  => Event
		// o  => Options

		if (s) return {
			list: () => list(s),
			off: (t, fn) => off(t, s, fn),
			on: (t, fn) => on(t, s, fn),
			once: (t, fn) => once(t, s, fn),
			reset: () => reset(s),
			trigger: (e, o) => trigger(s, e, o)
		};
	};

	window.fX = flux;
})();