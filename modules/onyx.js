/*jshint esversion: 6 */

//////////////////////////////////////////////////////////////////////////////80
// OnyxJS 
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Liam Siira (Siira.us), distributed as-is and without warranty
// under the modified MIT License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Notes:
// Built from FemtoJS: https://github.com/vladocar/femtoJS
// Bioflux wasn't quite meeting my needs and I wanted something a little
// more thoughout, but still close enough to vanillaJS that it won't cause
// too many issues. Onyx has similar functions to FemtoJS, but only on
// single elements.
// 
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

// https://github.com/finom/balalaika/blob/master/balalaika.umd.js
// https://github.com/vladocar/nanoJS/blob/master/src/nanoJS.js
// https://vladocar.github.io/femtoJS/

(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], function() {
			return factory(root);
		});
	} else if (typeof exports === 'object') {
		module.exports = factory(root);
	} else {
		root.onyx = factory(root);
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
		if (alwaysRun.includes(selector)) {
			return true;
		}
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

	var events = {
		on: function(types, selector, callback) {

			if (!selector || !callback) {
				return;
			}

			types.split(',').forEach(function(type) {

				type = type.trim();

				if (!activeEvents[type]) {
					activeEvents[type] = [];
					window.addEventListener(type, eventHandler, true);
				}

				activeEvents[type].push({
					selector: selector,
					callback: callback
				});

			});

		},

		off: function(types, selector, callback) {
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
					if (!activeEvents[type]) {
						return;
					}

					if (activeEvents[type].length < 2 || !selector) {
						delete activeEvents[type];
						window.removeEventListener(type, eventHandler, true);
						return;
					}

					var index = getIndex(activeEvents[type], selector, callback);
					if (index < 0) {
						return;
					}
					activeEvents[type].splice(index, 1);

				});
			}
		},

		once: function(types, selector, callback) {
			events.on(types, selector, function temp(event) {
				callback(event);
				events.off(types, selector, temp);
			});
		}
	};


	// Lazy method to list currently active listeners in events, useful for debugging.
	window.events = {
		list: function() {
			var obj = {};
			for (var type in activeEvents) {
				if (activeEvents.hasOwnProperty(type)) {
					obj[type] = activeEvents[type];
				}
			}
			return obj;
		}
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

	let argToElements = function(selector) {
		if (!selector) {
			trace();
			console.warn('No selector provided to OnyxJS');
			return [];
		}

		if (alwaysReturn.includes(selector)) {
			return [selector]; //This could cause a problem later
		} else if (typeof selector === 'string') {
			const tagName = /^<(.+)>$/.exec(selector);

			if (tagName !== null) {
				// https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
				var template = document.createElement('template');
				selector = selector.trim(); // Never return a text node of whitespace as the result
				template.innerHTML = selector;
				return [template.content.firstChild];

			} else {
				return [...document.querySelectorAll(selector)];
			}
		} else if (selector instanceof HTMLElement) {
			return [selector];

		} else if (Array.isArray(selector)) {
			const elems = [];
			src.forEach(i => elems.push(...argToElement(i)));
			return elems;

		} else if (selector.isOnyx) {
			return [selector.el];
		}

		throw new TypeError('Expected String | HTMLElement | OnyxJS; got ' + typeof selector);
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
			return;
		}

		if (type === 'remove') {
			if (cls) {
				element.classList.remove(...cls.split(' '));
			} else {
				element.className = '';
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
		if (target instanceof HTMLElement) {
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
			if (value) element[type] = value;
			return element[type];
		} else if (type === 'prop') {
			if (value) element[key] = value;
			return element[key];
		} else if (type === 'attr') {
			if (typeof key === 'string') {
				if (value) {
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

	const onyx = function(selector) {
		let element = argToElement(selector);

		selector = isSelectorValid(selector) ? selector : element;

		if (!element) return;

		// let elements = argToElements(selector);
		// let iterator = elements.forEach.bind(elements);

		return {

			focus: () => element.focus(),
			show: () => element.style.display = 'block',
			hide: () => element.style.display = 'none',
			trigger: (event) => triggerEvent(element, event),

			once: (t, fn) => events.once(t, selector, fn),
			on: (t, fn) => events.on(t, selector, fn),
			off: (t, fn) => events.off(t, selector, fn),

			// on: (t, s, fn) => attach('on', t, s, fn),
			// off: (t, s, fn) => attach('off', s, fn),
			// once: (t, s, fn) => attach('once', t, s, fn),

			css: (k, v) => setStyle(element, k, v),

			data: (v) => IO(element, 'data', v),
			prop: (k, v) => IO(element, 'prop', v, k),
			html: (v) => IO(element, 'innerHTML', v),
			text: (v) => IO(element, 'innerText', v),
			value: (v) => IO(element, 'value', v),

			empty: () => element.innerHTML = element.value = '',

			attr: (k, v) => IO(element, 'attr', v, k),
			removeAttr: (k) => element.removeAttribute(k),

			addClass: (c) => setClass(element, 'add', c),
			hasClass: (c) => setClass(element, 'contains', c),
			removeClass: (c) => setClass(element, 'remove', c),
			toggleClass: (c) => setClass(element, 'toggle', c),
			replaceClass: (c, n) => setClass(element, 'replace', c, n),

			// addClass: (c) => iterator(i => setClass(i, 'add', c)),
			// hasClass: (c) => iterator(i => setClass(i, 'contains', c)),
			// removeClass: (c) => iterator(i => setClass(i, 'remove', c)),
			// toggleClass: (c) => iterator(i => setClass(i, 'toggle', c)),
			// replaceClass: (c, n) => iterator(i => setClass(i, 'replace', c, n)),

			find: (s) => onyx(element.querySelector(s)),
			parent: (s) => s ? onyx(element.closest(s)) : onyx(element.parentElement),
			findAll: (s) => search(element, 'find', s),
			sibling: (s) => search(element, 'siblings', s, true),
			siblings: (s) => search(element, 'siblings', s),
			children: (s) => search(element, 'children', s),

			before: insertAdjacent('beforebegin', element),
			after: insertAdjacent('afterend', element),
			first: insertAdjacent('afterbegin', element),
			last: insertAdjacent('beforeend', element),

			insertBefore: insertToAdjacent('beforebegin', element),
			insertAfter: insertToAdjacent('afterend', element),
			insertFirst: insertToAdjacent('afterbegin', element),
			insertLast: insertToAdjacent('beforeend', element),

			prepend: insertAdjacent('afterbegin', element),
			append: insertAdjacent('beforeend', element),

			remove: () => element.remove(),
			// remove: () => iterator(i => i.remove()),

			offset: () => element.getBoundingClientRect(),
			clientHeight: () => element.clientHeight,
			clientWidth: () => element.clientWidth,
			height: (o) => getSize(element, 'height', false, o),
			width: (o) => getSize(element, 'width', false, o),

			style: () => element.style,
			el: element,
			exists: () => (element && element.nodeType),
			isOnyx: true
		};
	};
	return onyx;

});