//////////////////////////////////////////////////////////////////////
// PicoJS
//////////////////////////////////////////////////////////////////////
// Notes:
// Built from FemtoJS: https://github.com/vladocar/femtoJS
// Bioflux wasn't quite meeting my needs and I wanted something a little
// more thoughout, but still close enough to vanillaJS that it won't cause
// too many issues. PicoJS will work just like Fempto did, but only on
// single elements.
//												- Liam Siira
//////////////////////////////////////////////////////////////////////		

(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], function() {
			return factory(root);
		});
	} else if (typeof exports === 'object') {
		module.exports = factory(root);
	} else {
		root.pico = factory(root);
	}
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this, function(window) {

	'use strict';

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
			} else if (selector.isPicoJS) {
				console.trace();
				return selector.el;
			}
			throw new TypeError('Expected string | HTMLElement | picoJS; got ' + typeof selector);
		}
	};

	const pico = function(selector) {
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
				} else if ('isPicoJS' in sOrE) {
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
			on: function(t, fn) {
				// element.addEventListener(t, fn);
				events.on(t, element, fn);
				return this;
			},
			off: function(t, fn) {
				// element.removeEventListener(t, fn);
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
				element.setAttribute(k, v);
				return this;
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
				return pico(element.querySelector(s));
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
			style: element.style,
			el: element,

			isPicoJS: true
		};
	};

	pico.fragment = () => pico(document.createDocumentFragment());

	return pico;

});