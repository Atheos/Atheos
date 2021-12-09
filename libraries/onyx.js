//////////////////////////////////////////////////////////////////////////////80
// Onyx
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Sources/Inspirations:
//	https://github.com/vladocar/femtoJS
//	https://github.com/fabiospampinato/cash
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';

	const genSelector = (element) => {
		if (element.id) return ('#' + element.id);

		let path = [],
			parent,
			siblings,
			node,
			tag;

		while (parent = element.parentNode) {
			tag = element.tagName;
			if (element.id) {
				path.unshift('#' + element.id);
				break;
			} else {
				siblings = [].filter.call(parent.children, sibling => sibling.tagName === tag);
				if (siblings.length === 1) {
					node = tag;
				} else {
					node = `${tag}:nth-child(${1+[].indexOf.call(siblings, element)})`;
				}
				node = node.toLowerCase();
			}
			path.unshift(node);
			element = parent;
		}

		return path.join(' > ');
	};

	// const checkHTML = function(html) {
	// 	var doc = document.createElement('div');
	// 	doc.innerHTML = html;
	// 	return (doc.innerHTML === html);
	// };

	const parseHTML = function(str) {
		if (!window.DOMParser) return false;
		try {
			var parser = new DOMParser();
			var doc = parser.parseFromString(str, 'text/html');
			return doc.body.firstChild;
		} catch (err) {
			return false;
		}
	};

	const genElement = function(str) {
		try {
			let element = document.createElement(str);
			return (element.toString() !== '[object HTMLUnknownElement]') ? element : false;
		} catch (err) {
			return false;
		}
	};


	const pxStyles = ['height', 'width', 'top', 'left', 'right', 'bottom'];
	// let classTypes = ['add', 'contains', 'toggle', 'remove', 'replace'];
	const domTypes = ['data', 'innerHTML', 'innerText', 'value'];

	const setClass = function(element, type, cls, nCls) {
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

	const setStyle = function(element, key, value) {
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

	const getSize = (element, type, outer) => {
		var init = {
			'display': element.style.display,
			'visibility': element.style.visibility,
			'opacity': element.style.opacity
		};

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

	const IO = (element, type, value, key) => {
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

	const search = (element, type, selector, all) => {
		var matches = [];
		if (type === 'find') {
			var nodes = element.querySelectorAll(selector);
			for (var i = 0; i < nodes.length; i++) {
				matches.push(init(nodes[i]));
			}
		} else {
			var match = type === 'children' ? element.firstElementChild : element.parentNode.firstElementChild;

			while (match) {
				if ((!selector || match.matches(selector)) && match !== element) {
					matches.push(init(match));
				}
				match = match.nextElementSibling;
			}
		}
		if (all) {
			return matches;
		} else {
			return matches[0] || null;
		}
	};

	const insertToAdjacent = function(location, element, target) {
		if (typeof target === 'string') {
			target = init(target).element;
			target.insertAdjacentElement(location, element);
		} else if (target instanceof HTMLElement) {
			target.insertAdjacentElement(location, element);
		} else if (target instanceof Onyx) {
			target = target.element;
			target.insertAdjacentElement(location, element);
		}
	};

	const insertAdjacent = function(location, element, addition) {
		if (typeof addition === 'string') {
			element.insertAdjacentHTML(location, addition);
		} else if (addition instanceof HTMLElement) {
			element.insertAdjacentElement(location, addition);
		} else if (addition instanceof Onyx) {
			addition = addition.element;
			element.insertAdjacentElement(location, addition);
		}
	};

	// Nifty and potentially viable HTML Parse function
	const idRegex = /^#(?:[\w-]|\\.|[^\x00-\xa0])*$/,
		fragmentRegex = /^\s*<(\w+)[^>]*>/,
		singleTagRegex = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;

	const classRe = /^\.(?:[\w-]|\\.|[^\x00-\xa0])*$/,
		htmlRegex = /<.+>/,
		tagRe = /^\w+$/;

	let alwaysReturn = [
		window,
		document,
		document.documentElement
	];

	/** Class */
	function Onyx(selector, context) {
		if (!selector) return false;

		context = context || document;

		if (selector instanceof Onyx) {
			return selector;
		} else if (alwaysReturn.includes(selector)) {
			this.element = selector;
			this.selector = 'document';

		} else if (typeof selector === 'string') {
			if (idRegex.test(selector)) {
				this.element = context.getElementById(selector.slice(1));
			} else if (htmlRegex.test(selector)) {
				this.element = parseHTML(selector);
			} else {
				this.element = context.querySelector(selector);
			}


			this.selector = selector;


		} else if (selector instanceof HTMLElement) {
			this.selector = genSelector(selector);
			this.element = selector;
		} else {
			throw new TypeError('Expected String | HTMLElement | Onyx; got ' + typeof selector);
		}

		if (!this.element) return false;

		this.tagName = this.element.tagName;
		this.type = this.element.type;
		// if (this.element) {
		// 	log(genSelector(this.element));
		// }
	}

	Onyx.prototype.init = function(selector) {
		return new Onyx(selector);
	};

	Onyx.prototype.create = function(str) {
		let element = htmlRegex.test(str) ? parseHTML(str) : genElement(str);
		return element ? new Onyx(element) : false;
	};

	let fnc = Onyx.prototype,
		init = fnc.init,
		create = fnc.create;

	fnc.isOnyx = true;

	fnc.on = function(t, fn) {
		console.log(`%cForceEventCapture: ${this.selector}`, 'color:#F42;');
		if (this.element) return this.element.addEventListener(t, fn);
	};
	fnc.off = function(t, fn) {
		console.log(`%cForceEventCapture: ${this.selector}`, 'color:#F42;');
		if (this.element) return this.element.addEventListener(t, fn);
	};

	fnc.focus = function() {
		if (this.element) return this.element.focus();
	};
	fnc.click = function() {
		if (this.element) return this.element.click();
	};
	fnc.remove = function() {
		if (this.element) return this.element.remove();
	};
	fnc.clone = function() {
		if (this.element) return this.element.cloneNode(true);
	};

	fnc.show = function(d) {
		if (this.element) return (this.element.style.display = d || 'block');
	};
	fnc.hide = function(d) {
		if (this.element) return (this.element.style.display = d || 'none');
	};

	fnc.css = function(k, v) {
		if (this.element) return setStyle(this.element, k, v);
	};

	fnc.data = function(k, v) {
		if (this.element) return IO(this.element, 'data', v, k);
	};
	fnc.prop = function(k, v) {
		if (this.element) return IO(this.element, 'prop', v, k);
	};
	fnc.html = function(v) {
		if (this.element) return IO(this.element, 'innerHTML', v);
	};
	fnc.text = function(v) {
		if (this.element) return IO(this.element, 'innerText', v);
	};
	fnc.value = function(v) {
		if (this.element) return IO(this.element, 'value', v);
	};
	fnc.attr = function(k, v) {
		if (this.element) return IO(this.element, 'attr', v, k);
	};
	fnc.removeAttr = function(k) {
		if (this.element) return this.element.removeAttribute(k);
	};

	fnc.empty = function(k, v) {
		if (this.element) return (this.element.innerHTML = this.element.value = '');
	};


	fnc.addClass = function(c) {
		if (this.element) return setClass(this.element, 'add', c);
	};
	fnc.hasClass = function(c) {
		if (this.element) return setClass(this.element, 'contains', c);
	};
	fnc.removeClass = function(c) {
		if (this.element) return setClass(this.element, 'remove', c);
	};
	fnc.switchClass = function(c, n) {
		if (this.element) return setClass(this.element, 'switch', c, n);
	};
	fnc.toggleClass = function(c) {
		if (this.element) return setClass(this.element, 'toggle', c);
	};
	fnc.replaceClass = function(c, n) {
		if (this.element) return setClass(this.element, 'replace', c, n);
	};

	fnc.index = function(s) {
		if (this.element) return [].indexOf.call(this.parentNode.children, element);
	};
	fnc.parent = function(s) {
		if (this.element) return (s ? init(this.element.closest(s)) : init(this.element.parentElement));
	};
	fnc.find = function(s) {
		if (this.element) return init(this.element.querySelector(s));
	};
	fnc.findAll = function(s) {
		if (this.element) return search(this.element, 'find', s, true);
	};
	fnc.sibling = function(s) {
		if (this.element) return search(this.element, 'siblings', s);
	};
	fnc.siblings = function(s) {
		if (this.element) return search(this.element, 'siblings', s, true);
	};
	fnc.children = function(s) {
		if (this.element) return search(this.element, 'children', s, true);
	};

	fnc.prev = function(s) {
		if (this.element) return this.element.previousSibling;
	};

	fnc.next = function(s) {
		if (this.element) return this.element.nextSibling;
	};


	fnc.append = function(addition) {
		if (this.element) return insertAdjacent('beforeend', this.element, addition);
	};
	fnc.prepend = function(addition) {
		if (this.element) return insertAdjacent('afterbegin', this.element, addition);
	};
	fnc.before = function(addition) {
		if (this.element) return insertAdjacent('beforebegin', this.element, addition);
	};
	fnc.after = function(addition) {
		if (this.element) return insertAdjacent('afterend', this.element, addition);
	};

	fnc.insertLast = function(target) {
		if (this.element) return insertToAdjacent('beforeend', this.element, target);
	};
	fnc.insertFirst = function(target) {
		if (this.element) return insertToAdjacent('afterbegin', this.element, target);
	};
	fnc.insertBefore = function(target) {
		if (this.element) return insertToAdjacent('beforebegin', this.element, target);
	};
	fnc.insertAfter = function(target) {
		if (this.element) return insertToAdjacent('afterend', this.element, target);
	};

	fnc.replaceWith = function(newElement) {
		if (this.element) {
			this.element.replaceWith(newElement);
			this.element = newElement;
			return true;
		}
	};

	// fnc.offset = function() {
	// 	if (this.element) return this.element.getBoundingClientRect();
	// };
	fnc.offset = function() {
		if (!this.element) return;

		let rect = this.element.getBoundingClientRect();
		return {
			top: rect.top + window.pageYOffset,
			left: rect.left + window.pageXOffset
		};
	};

	fnc.clientHeight = function() {
		if (this.element) return this.element.clientHeight;
	};
	fnc.clientWidth = function() {
		if (this.element) return this.element.clientWidth;
	};
	fnc.height = function(o) {
		if (this.element) return getSize(this.element, 'height', o);
	};
	fnc.width = function(o) {
		if (this.element) return getSize(this.element, 'width', o);
	};

	fnc.style = function() {
		if (this.element) return this.element.style;
	};

	fnc.exists = function() {
		return (this.element && this.element.nodeType) ? this : false;
	};

	window.oX = window.$ = init;
	window.$$ = create;
})();