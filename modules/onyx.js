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

	var getIndex = function(arr, selector, callback) {
		for (var i = 0; i < arr.length; i++) {
			if (
				arr[i].selector === selector &&
				arr[i].callback.toString() === callback.toString()
			) {
				return i;
			}
		}
		return -1;
	};

	var doRun = function(target, selector) {
		if ([
				'*',
				'window',
				'document',
				'document.documentElement',
				window,
				document,
				document.documentElement
			].indexOf(selector) > -1) return true;
		if (typeof selector !== 'string' && selector.contains) {
			return selector === target || selector.contains(target);
		}
		return target.closest(selector);
	};

	var eventHandler = function(event) {
		if (!activeEvents[event.type]) return;
		activeEvents[event.type].forEach(function(listener) {
			if (!doRun(event.target, listener.selector)) return;
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
		},

		once: function(types, selector, callback) {
			events.on(types, selector, function temp(event) {
				callback(event);
				events.off(types, selector, temp);
			});
		},

		get: function() {
			var obj = {};
			for (var type in activeEvents) {
				if (activeEvents.hasOwnProperty(type)) {
					obj[type] = activeEvents[type];
				}
			}
			return obj;
		}
	};

	// return events;


	let argToElement = function(selector) {
		if (selector) {
			if (typeof selector === 'string') {
				const tagName = /^<(\w+)>$/.exec(selector);

				if (tagName !== null) {
					return document.createElement(tagName[1]);
				} else {
					return document.querySelector(selector);
				}
			} else if (selector instanceof HTMLElement) {
				return selector;
			} else if (selector.isOnyx) {
				return selector.el;
			}
			throw new TypeError('Expected string | HTMLElement | OnyxJS; got ' + typeof selector);
		}
	};

	const onyx = function(selector) {
		let element = argToElement(selector);
		if (!element) return;

		let insertToAdjacent = (s) => function(e) {
			iter((j, i) => i === 0 ?
				e instanceof HTMLElement ?
				e.insertAdjacentElement(s, j) :
				e.element.insertAdjacentElement(s, j) :
				element.insertAdjacentElement('afterend', j));

			return this;
		};

		let insertAdjacent = (s) => function(sOrE) {
			if (typeof sOrE !== 'string') {
				if (sOrE instanceof HTMLElement) {
					element.insertAdjacentElement(s, sOrE);
				} else if ('isOnyx' in sOrE) {
					const osel = sOrE.el;

					element.insertAdjacentElement(s, osel);

					for (let i = 1; i < osel.length; i++) {
						osel.insertAdjacentElement('afterend', osel[i]);
					}
				}
			} else {
				element.insertAdjacentHTML(s, sOrE);
			}

			return this;
		};

		let triggerEvent = function(event) {
			if (!event) return;
			if (element) {
				var e;
				if ('createEvent' in document) {
					// modern browsers, IE9+
					e = document.createEvent('HTMLEvents');
					e.initEvent(event, false, true);
					element.dispatchEvent(e);
				} else {
					// IE 8
					e = document.createEventObject();
					e.eventType = event;
					event.fireEvent('on' + e.eventType, e);
				}
			}
		};


		return {
			focus: function() {
				element.focus();
				return this;
			},
			trigger: function(e) {
				triggerEvent(e);
			},
			once: function(t, fn) {
				events.once(t, element, fn);
				return this;
			},			
			on: function(t, fn) {
				events.on(t, element, fn);
				return this;
			},
			off: function(t, fn) {
				events.off(t, element, fn);
				return this;
			},
			css: function(s) {
				if (typeof s === 'string') {
					return element.style[s] || null;
				} else if (typeof s === 'object') {
					const entries = Object.entries(s);
					for (const [key, value] of entries) {
						element.style[key] = value;
					}
				}
				// element.style.cssText += s;
				return this;
			},
			data: function(d) {
				if (d) {
					element.data = d;
				}
				return element.data;
			},
			html: function(h) {
				if (h) {
					element.innerHTML = h;
				}
				return element.innerHTML;
			},
			text: function(t) {
				if (t) {
					element.innerText = t;
				}
				return element.innerText;
			},
			addClass: function(t) {
				element.classList.add(t);
				return this;
			},
			removeClass: function(t) {
				element.classList.remove(t);
				return this;
			},
			hasClass: function(c) {
				return element.classList.contains(c);
			},
			replaceClass: function(c, n) {
				element.classList.remove(c);
				element.classList.add(n);
				return this;
			},
			toggleClass: function(t) {
				element.classList.toggle(t);
				return this;
			},
			empty: function() {
				element.innerHTML = '';
				return this;
			},
			attr: function(k, v) {
				if (v) {
					element.setAttribute(k, v);
				}
				return element.getAttribute(k);
			},
			removeAttr: function(k) {
				element.removeAttribute(k);
				return this;
			},
			parent: function() {
				return element.parentNode;
			},
			children: function() {
				return element.childNodes;
			},
			find: function(s) {
				return onyx(element.querySelector(s));
			},
			remove: function() {
				element.remove();
				return this;
			},

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

			getAttr: v => element.getAttribute(v),
			offset: () => element.getBoundingClientRect(),
			outerHeight: element.outerHeight,
			outerWidth: element.outerWidth,
			clientHeight: function() {
				return element.clientHeight;
			},
			clientWidth: function() {
				return element.clientWidth;
			},
			style: element.style,
			el: element,

			isOnyx: true
		};
	};
	return onyx;

});