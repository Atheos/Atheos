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
		if (selector) {
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
		}
	};

	let pxStyles = ['height', 'width', 'top', 'left', 'right', 'bottom'];
	// let classTypes = ['add', 'contains', 'toggle', 'remove', 'replace'];
	let domTypes = ['data', 'innerHTML', 'innerText', 'value'];


	const onyx = function(selector) {
		let element = argToElement(selector);
		if (!element) {
			return;
		}

		let insertToAdjacent = (location) => function(target) {
			if (target instanceof HTMLElement) {
				target.insertAdjacentElement(location, element);
			} else if ('isOnyx' in target) {
				target = target.el;
				target.insertAdjacentElement(location, element);
			}
		};

		let insertAdjacent = (location) => function(addition) {
			if (typeof addition === 'string') {
				element.insertAdjacentHTML(location, addition);
			} else if (addition instanceof HTMLElement) {
				element.insertAdjacentElement(location, addition);
			} else if ('isOnyx' in addition) {
				addition = addition.el;
				element.insertAdjacentElement(location, addition);
			}
		};

		let triggerEvent = function(types) {
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

		let setStyle = function(k, v) {
			if (typeof k === 'string') {
				if (typeof(v) !== 'undefined') {
					if (pxStyles.includes(k) && isFinite(v) && v !== '') {
						v = v + 'px';
					}
					element.style[k] = v;
				}
				return element.style[k] || null;
			} else if (typeof k === 'object') {
				const entries = Object.entries(k);
				for (const [key, value] of entries) {
					element.style[key] = value;
				}
			}
		};

		let setClass = function(t, c, n) {
			if (t === 'replace') {
				setClass('remove', c);
				setClass('add', n);
				return;
			}

			// if (c) {
			// 	c = ...c.split(' ');
			// }
			// addClass: (c) => element.classList.add(...c.split(' ')),

			if (t === 'remove') {
				if (c) {
					element.classList.remove(...c.split(' '));
				} else {
					element.className = '';
				}
			} else {
				// add, contains, toggle
				return element.classList[t](...c.split(' '));
			}
		};

		let search = (t, s) => {
			var matches = [];
			if (t === 'find') {
				var nodes = element.querySelectorAll(s);
				for (var i = 0; i < nodes.length; i++) {
					matches.push(onyx(nodes[i]));
				}
			} else {
				var match = t === 'children' ? element.firstElementChild : element.parentNode.firstElementChild;

				while (match) {
					if (!s || match.matches(s)) {
						matches.push(onyx(match));
					}
					match = match.nextElementSibling;
				}
			}
			return matches;
		};

		let getSize = (t, v, o) => {
			var init = {
				'display': element.style.display,
				'visibility': element.style.visibility,
				'opacity': element.style.opacity
			};


			if (v) {
				element.style[t] = v + 'px';
			}

			setStyle({
				'display': 'block',
				'visibility': 'hidden',
				'opacity': 0
			});

			var computedStyle = window.getComputedStyle(element);
			var size = parseFloat(computedStyle[t].replace('px', ''));
			if (o) { //OuterHeight or OuterWidth
				if (t === 'height') {
					size += parseFloat(computedStyle.marginTop.replace('px', ''));
					size += parseFloat(computedStyle.marginBottom.replace('px', ''));
					size += parseFloat(computedStyle.borderTopWidth.replace('px', ''));
					size += parseFloat(computedStyle.borderBottomWidth.replace('px', ''));
				} else if (t === 'width') {
					size += parseFloat(computedStyle.marginLeft.replace('px', ''));
					size += parseFloat(computedStyle.marginRight.replace('px', ''));
					size += parseFloat(computedStyle.borderLeftWidth.replace('px', ''));
					size += parseFloat(computedStyle.borderRightWidth.replace('px', ''));
				}
			}
			setStyle(init);

			return size;
		};

		let IO = (t, v, k) => {
			if (domTypes.includes(t)) {
				if (v) element[t] = v;
				return element[t];
			} else if (t === 'attr') {
				if (typeof k === 'string') {
					if (v) {
						element.setAttribute(k, v);
					}
					return element.getAttribute(k);
				} else if (typeof k === 'object') {
					const entries = Object.entries(k);
					for (const [key, value] of entries) {
						element.setAttribute(key, value);
					}
				}
			}
		};

		return {

			focus: () => element.focus(),
			show: () => element.style.display = 'block',
			hide: () => element.style.display = 'none',
			trigger: (e) => triggerEvent(e),

			once: (t, fn) => events.once(t, element, fn),
			on: (t, fn) => events.on(t, element, fn),
			off: (t, fn) => events.off(t, element, fn),
			
			// once: (t, fn) => events.once(t, selector, fn),
			// on: (t, fn) => events.on(t, selector, fn),
			// off: (t, fn) => events.off(t, selector, fn),

			css: (k, v) => setStyle(k, v),
			data: (v) => IO('data', v),
			html: (v) => IO('innerHTML', v),
			text: (v) => IO('innerText', v),
			value: (v) => IO('value', v),
			empty: () => element.innerHTML = element.value = '',

			attr: (k, v) => IO('attr', v, k),
			removeAttr: (k) => element.removeAttribute(k),

			addClass: (c) => setClass('add', c),
			hasClass: (c) => setClass('contains', c),
			removeClass: (c) => setClass('remove', c),
			toggleClass: (c) => setClass('toggle', c),
			replaceClass: (c, n) => setClass('replace', c, n),

			find: (s) => onyx(element.querySelector(s)),
			parent: (s) => s ? onyx(element.closest(s)) : onyx(element.parentElement),
			findAll: (s) => search('find', s),
			siblings: (s) => search('siblings', s),
			children: (s) => search('children', s),

			before: insertAdjacent('beforebegin'),
			after: insertAdjacent('afterend'),
			first: insertAdjacent('afterbegin'),
			last: insertAdjacent('beforeend'),

			insertBefore: insertToAdjacent('beforebegin'),
			insertAfter: insertToAdjacent('afterend'),
			insertFirst: insertToAdjacent('afterbegin'),
			insertLast: insertToAdjacent('beforeend'),

			prepend: insertAdjacent('afterbegin'),
			append: insertAdjacent('beforeend'),
			remove: () => element.remove(),

			offset: () => element.getBoundingClientRect(),
			clientHeight: () => element.clientHeight,
			clientWidth: () => element.clientWidth,
			height: (o) => getSize('height', false, o),
			width: (o) => getSize('width', false, o),

			style: () => element.style,
			el: element,
			exists: () => (element && element.nodeType),
			isOnyx: true
		};
	};
	return onyx;

});