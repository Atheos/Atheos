//////////////////////////////////////////////////////////////////////////////80
// Onyx / Singularity
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/license.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2019 Go Make Things, LLC
// Source: https://github.com/cferdinandi/events
// Copyright (c) 2019 Vladimir Carrer
// Source: https://github.com/vladocar/femtoJS
//////////////////////////////////////////////////////////////////////////////80

// https://github.com/finom/balalaika/blob/master/balalaika.umd.js
// https://github.com/vladocar/nanoJS/blob/master/src/nanoJS.js

(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], function() {
			return factory(root);
		});
	} else if (typeof exports === 'object') {
		module.exports = factory(root);
	} else {
		let temp = factory(root);
		root.Onyx = root.oX = temp[0];
		root.Singularity = root.sY = temp[1];
	}
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this, function(window) {

	'use strict';

	var activeEvents = {};
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
		for (var i = 0; i < arr.length; i++) {
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
		activeEvents[event.type].forEach(function(listener) {
			if (!activeMatch(event.target, listener.selector)) {
				return;
			}
			listener.callback(event);
		});
	};

	let eOn = (types, selector, callback) => {
		if (!selector || !callback) return;

		types.split(',').forEach(function(type) {
			type = type.trim();
			if (!activeEvents[type]) {
				activeEvents[type] = [];
				window.addEventListener(type, eventHandler, true);
			}

			activeEvents[type].push({
				selector,
				callback
			});

		});
	};

	let eOff = (types, selector, callback) => {
		if (types === '*' && selector && !callback) {
			for (var type in activeEvents) {
				var index = getIndex(activeEvents[type], selector);
				if (index > -1) {
					activeEvents[type].splice(index, 1);
					if (activeEvents[type].length === 0) {
						delete activeEvents[type];
					}
				}
			}
		} else {
			types.split(',').forEach(function(type) {
				type = type.trim();
				if (!activeEvents[type]) return;


				if (activeEvents[type].length < 2 || !selector) {
					delete activeEvents[type];
					window.removeEventListener(type, eventHandler, true);
					return;
				}

				var index = getIndex(activeEvents[type], selector, callback);
				if (index < 0) return;
				activeEvents[type].splice(index, 1);
			});
		}
	};

	let eOnce = (types, selector, callback) => {
		eOn(types, selector, function temp(event) {
			callback(event);
			eOff(types, selector, temp);
		});
	};

	let eList = (s) => {
		var obj = {};
		for (var type in activeEvents) {
			if (activeEvents.hasOwnProperty(type)) obj[type] = activeEvents[type];
		}
		return obj;
	};

	let exists = (s) => document.querySelector(s) ? true : false;

	const singularity = function(s) {
		// s  => Selector
		// t  => EventType
		// fn => Functions
		// e  => Event
		// o  => Options

		let api = {
			on: (t, fn) => eOn(t, s, fn),
			off: (t, fn) => eOff(t, s, fn),
			once: (t, fn) => eOnce(t, s, fn),
			list: () => eList(s),
			exists: (s) => exists(s),
			trigger: (e, o) => eTrigger(s, e, o)
		};

		return api;
	};

	let alwaysReturn = [
		window,
		document,
		document.documentElement
	];

	let argToElement = function(selector) {
		if (!selector) {
			return false;
		}

		if (alwaysReturn.includes(selector)) {
			return selector;
		} else if (typeof selector === 'string') {
			const tagName = /^<(.+)>$/.exec(selector);

			if (tagName !== null) {
				// https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
				var template = document.createElement('template');
				selector = selector.trim(); // Never return a text node of whitespace as the result
				template.innerHTML = selector;
				return template.content.firstChild;
				// return document.createElement(tagName[1]);
			} else {
				return document.querySelector(selector);
			}
		} else if (selector instanceof HTMLElement) {
			return selector;
		} else if (selector.isOnyx) {
			return selector.el;
		}

		throw new TypeError('Expected String | HTMLElement | OnyxJS; got ' + typeof selector);

	};

	const isSelectorValid = function(selector) {
		try {
			document.createDocumentFragment().querySelector(selector);
		} catch (e) {
			return false;
		}
		return true;
	};

	let pxStyles = ['height', 'width', 'top', 'left', 'right', 'bottom'];
	// let classTypes = ['add', 'contains', 'toggle', 'remove', 'replace'];
	let domTypes = ['data', 'innerHTML', 'innerText', 'value'];

	// This attach function will probably be removed as it's honestly
	// more of an overcomplication than a helper, but it also just need
	// optimization. The goal is to allow you to add child selectors to
	// the event handler.
	let attach = (element, action, type, children, fn) => {
		//https://stackoverflow.com/questions/2068272/getting-a-jquery-selector-for-an-element
		let sel = children;
		if (typeof(selector) === 'function') {
			fn = selector;
			children = null;
		} else {
			sel = element + ' ' + children;
		}
		events[action](type, sel, fn);
	};

	let setClass = function(element, type, cls, nCls) {
		if (type === 'replace') {
			setClass(element, 'remove', cls);
			setClass(element, 'add', nCls);
		} else if (type === 'remove') {
			if (cls) {
				element.classList.remove(...cls.split(' '));
			} else {
				element.className = '';
			}
		} else if (type === 'switch') {
			if (element.classList.contains(cls)) {
				setClass(element, 'remove', cls);
				setClass(element, 'add', nCls);
			} else {
				setClass(element, 'add', cls);
				setClass(element, 'remove', nCls);
			}
		} else {
			// add, contains, toggle
			return element.classList[type](...cls.split(' '));
		}
	};

	let setStyle = function(element, key, value) {
		if (typeof key === 'string') {
			if (typeof(value) !== 'undefined') {
				if (pxStyles.includes(key) && isFinite(value) && value !== '') {
					value = value + 'px';
				}
				element.style[key] = value;
			}
			return element.style[key] || null;
		} else if (typeof key === 'object') {
			const entries = Object.entries(key);
			for (const [key, value] of entries) {
				element.style[key] = value;
			}
		}
	};

	let getSize = (element, type, value, outer) => {
		var init = {
			'display': element.style.display,
			'visibility': element.style.visibility,
			'opacity': element.style.opacity
		};


		if (value) {
			element.style[type] = value + 'px';
		}

		setStyle(element, {
			'display': 'block',
			'visibility': 'hidden',
			'opacity': 0
		});

		var computedStyle = window.getComputedStyle(element);
		var size = parseFloat(computedStyle[type].replace('px', ''));
		if (outer) { //OuterHeight or OuterWidth
			if (type === 'height') {
				size += parseFloat(computedStyle.marginTop.replace('px', ''));
				size += parseFloat(computedStyle.marginBottom.replace('px', ''));
				size += parseFloat(computedStyle.borderTopWidth.replace('px', ''));
				size += parseFloat(computedStyle.borderBottomWidth.replace('px', ''));
			} else if (type === 'width') {
				size += parseFloat(computedStyle.marginLeft.replace('px', ''));
				size += parseFloat(computedStyle.marginRight.replace('px', ''));
				size += parseFloat(computedStyle.borderLeftWidth.replace('px', ''));
				size += parseFloat(computedStyle.borderRightWidth.replace('px', ''));
			}
		}
		setStyle(element, init);

		return size;
	};

	let insertToAdjacent = (location, element) => function(target) {
		if (typeof target === 'string') {
			target = argToElement(target);
			target.insertAdjacentElement(location, element);
		} else if (target instanceof HTMLElement) {
			target.insertAdjacentElement(location, element);
		} else if ('isOnyx' in target) {
			target = target.el;
			target.insertAdjacentElement(location, element);
		}
	};

	let insertAdjacent = (location, element) => function(addition) {
		if (typeof addition === 'string') {
			element.insertAdjacentHTML(location, addition);
		} else if (addition instanceof HTMLElement) {
			element.insertAdjacentElement(location, addition);
		} else if ('isOnyx' in addition) {
			addition = addition.el;
			element.insertAdjacentElement(location, addition);
		}
	};

	let IO = (element, type, value, key) => {
		if (domTypes.includes(type)) {
			if (typeof(value) !== 'undefined') {
				element[type] = value;
			}
			return element[type];
		} else if (type === 'prop') {
			if (typeof(value) !== 'undefined') {
				element[key] = value;
			}
			return element[key];
		} else if (type === 'attr') {
			if (typeof key === 'string') {
				if (typeof(value) !== 'undefined') {
					element.setAttribute(key, value);
				}
				return element.getAttribute(key);
			} else if (typeof key === 'object') {
				const entries = Object.entries(key);
				for (const [key, value] of entries) {
					element.setAttribute(key, value);
				}
			}
		}
	};

	let search = (element, type, selector, all) => {
		var matches = [];
		if (type === 'find') {
			var nodes = element.querySelectorAll(selector);
			for (var i = 0; i < nodes.length; i++) {
				matches.push(onyx(nodes[i]));
			}
		} else {
			var match = type === 'children' ? element.firstElementChild : element.parentNode.firstElementChild;

			while (match) {
				if ((!selector || match.matches(selector)) && match !== element) {
					matches.push(onyx(match));
				}
				match = match.nextElementSibling;
			}
		}
		if (all) {
			return matches[0] || false;
		} else {
			return matches;
		}
	};

	let triggerEvent = function(element, types) {
		types = types.split(',');
		types.forEach(function(type) {
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

	const onyx = function(selector, eventsOnly) {
		let element = argToElement(selector);
		selector = isSelectorValid(selector) ? selector : element;

		let api = {
			// once: (t, fn) => singularity.once(t, selector, fn),
			// on: (t, fn) => singularity.on(t, selector, fn),
			// off: (t, fn) => singularity.off(t, selector, fn)

			on: (t, fn) => singularity(selector).on(t, fn),
			off: (t, fn) => singularity(selector).off(t, fn),
			once: (t, fn) => singularity(selector).once(t, fn)

		};

		if (!element && !eventsOnly) {
			return;
		} else if (!element && eventsOnly) {
			return api;
		}

		api.focus = () => element.focus();
		api.show = (d) => element.style.display = d || 'block';
		api.hide = (d) => element.style.display = d || 'none';
		api.trigger = (event) => triggerEvent(element, event);

		api.css = (k, v) => setStyle(element, k, v);

		api.data = (v) => IO(element, 'data', v);
		api.prop = (k, v) => IO(element, 'prop', v, k);
		api.html = (v) => IO(element, 'innerHTML', v);
		api.text = (v) => IO(element, 'innerText', v);
		api.value = (v) => IO(element, 'value', v);

		api.empty = () => element.innerHTML = element.value = '';

		api.attr = (k, v) => IO(element, 'attr', v, k);
		api.removeAttr = (k) => element.removeAttribute(k);

		api.addClass = (c) => setClass(element, 'add', c);
		api.hasClass = (c) => setClass(element, 'contains', c);
		api.removeClass = (c) => setClass(element, 'remove', c);
		api.switchClass = (c, n) => setClass(element, 'switch', c, n);
		api.toggleClass = (c) => setClass(element, 'toggle', c);
		api.replaceClass = (c, n) => setClass(element, 'replace', c, n);

		api.find = (s) => onyx(element.querySelector(s));
		api.parent = (s) => s ? onyx(element.closest(s)) : onyx(element.parentElement);
		api.findAll = (s) => search(element, 'find', s);
		api.sibling = (s) => search(element, 'siblings', s, true);
		api.siblings = (s) => search(element, 'siblings', s);
		api.children = (s) => search(element, 'children', s);

		api.before = insertAdjacent('beforebegin', element);
		api.after = insertAdjacent('afterend', element);
		api.first = insertAdjacent('afterbegin', element);
		api.last = insertAdjacent('beforeend', element);

		api.insertBefore = insertToAdjacent('beforebegin', element);
		api.insertAfter = insertToAdjacent('afterend', element);
		api.insertFirst = insertToAdjacent('afterbegin', element);
		api.insertLast = insertToAdjacent('beforeend', element);

		api.prepend = insertAdjacent('afterbegin', element);
		api.append = insertAdjacent('beforeend', element);
		api.replaceWith = (el) => element.replaceWith(el);

		api.remove = () => element.remove();

		api.offset = () => element.getBoundingClientRect();
		api.clientHeight = () => element.clientHeight;
		api.clientWidth = () => element.clientWidth;
		api.height = (o) => getSize(element, 'height', false, o);
		api.width = (o) => getSize(element, 'width', false, o);

		api.style = () => element.style;
		api.tagName = element.tagName;
		api.type = element.type;
		api.node = () => element;
		api.el = element;
		api.exists = () => (element && element.nodeType);
		api.isOnyx = true;


		return api;
	};
	return [onyx, singularity];

});