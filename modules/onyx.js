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
			if (arr[i].selector === selector) {
				if (!callback) {
					return i;
				} else if (arr[i].callback.toString() === callback.toString()) {
					return i;
				}
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
			].indexOf(selector) > -1) {
			return true;
		}
		if (typeof selector !== 'string' && selector.contains) {
			return selector === target || selector.contains(target);
		}
		return target.closest(selector);
	};

	var eventHandler = function(event) {
		if (!activeEvents[event.type]) {
			return;
		}
		activeEvents[event.type].forEach(function(listener) {
			if (!doRun(event.target, listener.selector)) {
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



	let argToElement = function(selector) {
		if (selector) {
			if (typeof selector === 'string') {
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

				// var element = document.querySelector(selector);
				// if (element) {
				// 	return element;
				// } else {
				// 	element = document.createElement(selector);
				// 	if(element.toString() !== '[object HTMLUnknownElement') {
				// 		return element;
				// 	} else {
				// 		throw new TypeError('Invalid String for Element Construction; got ' + selector);
				// 	}
				// }
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

		let triggerEvent = function(type) {
			if (element && type) {
				
				var event = new CustomEvent(type,{
					bubbles: true,
					cancelable: true
				});
				return element.dispatchEvent(event);
			}
		};


		return {
			focus: () => element.focus(),
			show: function() {
				element.style.display = 'block';
			},
			hide: function() {
				element.style.display = 'none';
			},
			trigger: function(e) {
				triggerEvent(e);
			},
			once: function(t, fn) {
				events.once(t, element, fn);
			},
			on: function(t, fn) {
				events.on(t, element, fn);
			},
			off: function(t, fn) {
				events.off(t, element, fn);
			},
			css: function(a, v) {
				if (typeof a === 'string') {
					if (typeof(v) !== 'undefined') {
						if ((['height', 'width', 'top', 'left', 'right', 'bottom'].indexOf(a) > -1) && isFinite(v)) {
							v = v + 'px';
						}
						element.style[a] = v;
					}
					return element.style[a] || null;
				} else if (typeof a === 'object') {
					const entries = Object.entries(a);
					for (const [key, value] of entries) {
						element.style[key] = value;
					}
				}
			},
			data: (d) => {
				if (d) element.data = d;
				return element.data;
			},
			html: (h) => {
				if (h) element.innerHTML = h;
				return element.innerHTML;
			},
			text: (t) => {
				if (t) element.innerText = t;
				return element.innerText;
			},
			value: (v) => {
				if (v) element.value = v;
				return element.value;
			},
			addClass: function(c) {
				element.classList.add(...c.split(' '));
			},
			removeClass: function(c) {
				if (c) {
					element.classList.remove(...c.split(' '));
				} else {
					element.className = '';
				}
			},
			hasClass: function(c) {
				return element.classList.contains(c);
			},
			replaceClass: function(c, n) {
				this.removeClass(c);
				this.addClass(n);
			},
			toggleClass: function(t) {
				return element.classList.toggle(t);
			},

			empty: () => {
				element.innerHTML = '';
				element.value = '';
			},

			exists: function() {
				return (element && element.nodeType);
			},
			attr: function(k, v) {
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
			},
			removeAttr: (k) => element.removeAttribute(k),
			parent: function(s) {
				var parent = element;
				if (s) {
					while ((parent = parent.parentElement) && !((parent.matches || parent.matchesSelector).call(parent, s)));
				} else {
					parent = element.parentElement;
				}
				return onyx(parent);
			},

			siblings: function(s) {
				var siblings = [];
				var sibling = element.parentNode.firstElementChild;

				do {
					if (!s || sibling.matches(s)) {
						siblings.push(onyx(sibling));
					}
					sibling = sibling.nextElementSibling;
				} while (sibling);

				return siblings;
			},
			children: function(s) {
				var children = [];
				var child = element.firstElementChild;
				do {
					if (!s || child.matches(s)) {
						children.push(onyx(child));
					}
					child = child.nextElementSibling;
				} while (child);

				return children;
			},
			find: function(s, q) {
				var node = element.querySelector(s);
				return onyx(node);

			},
			findAll: function(s, q) {
				var nodes = element.querySelectorAll(s),
					results = [];
				for (var i = 0; i < nodes.length; i++) {
					results.push(onyx(nodes[i]));
				}
				return results;

			},
			remove: function() {
				element.remove();
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

			offset: () => element.getBoundingClientRect(),
			clientHeight: () => element.clientHeight,
			height: function(outerHeight) {
				var init = {
					'display': element.style.display,
					'visibility': element.style.visibility,
					'opacity': element.style.opacity
				};

				this.css({
					'display': 'block',
					'visibility': 'hidden',
					'opacity': 0
				});

				var computedStyle = window.getComputedStyle(element);

				var height = parseFloat(computedStyle.height.replace('px', ''));
				if (outerWidth) {
					height += parseFloat(computedStyle.marginTop.replace('px', ''));
					height += parseFloat(computedStyle.marginBottom.replace('px', ''));
					height += parseFloat(computedStyle.borderTopWidth.replace('px', ''));
					height += parseFloat(computedStyle.borderBottomWidth.replace('px', ''));
				}
				this.css(init);

				return height;
			},
			clientWidth: () => element.clientWidth,
			width: function(outerWidth) {
				var init = {
					'display': element.style.display,
					'visibility': element.style.visibility,
					'opacity': element.style.opacity
				};

				this.css({
					'display': 'block',
					'visibility': 'hidden',
					'opacity': 0
				});

				var computedStyle = window.getComputedStyle(element);

				var width = parseFloat(computedStyle.width.replace('px', ''));
				if (outerWidth) {
					width += parseFloat(computedStyle.marginLeft.replace('px', ''));
					width += parseFloat(computedStyle.marginRight.replace('px', ''));
					width += parseFloat(computedStyle.borderLeftWidth.replace('px', ''));
					width += parseFloat(computedStyle.borderRightWidth.replace('px', ''));
				}

				this.css(init);

				return width;
			},
			style: () => element.style,
			el: element,

			isOnyx: true
		};
	};
	return onyx;

});