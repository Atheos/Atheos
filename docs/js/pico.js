	//////////////////////////////////////////////////////////////////////
	// PicoJS
	//////////////////////////////////////////////////////////////////////
	// Notes:
	// Built from FemtoJS: https://github.com/vladocar/femtoJS
	// Buiflux wasn't quite meeting my needs and I wanted something a little
	// more thoughout, but still close enough to vanillaJS that it won't cause
	// too many issues. PicoJS will work just like Fempto did, but only on
	// single elements.
	//												- Liam Siira
	//////////////////////////////////////////////////////////////////////		

const func = (() => {
	let argToElements = function(src) {
		if (typeof src === 'string') {
			const tagName = /^<(\w+)>$/.exec(src);

			if (tagName !== null) {
				return [document.createElement(tagName[1])];
			} else {
				return document.querySelector(src);
			}
		} else if (src instanceof HTMLElement) {
			return src;
		} else if (src.isPicoJS) {
			return src;
		}
		
		throw TypeError('Expected string | HTMLElement | Array | femtoJS,' +
		                ' got ' + typeof src);
	};

	const pico = function(src) {
		let sel = argToElements(src);
		if (!sel) return;

		let insertToAdjacent =
			(s) => function(e) {
				iter((j, i) => i === 0
				               ? e instanceof HTMLElement
				                 ? e.insertAdjacentElement(s, j)
				                 : e.sel.insertAdjacentElement(s, j)
				               : sel.insertAdjacentElement('afterend', j));

				return this;
			};

		let insertAdjacent =
			(s) => function(sOrE) {
				if (typeof sOrE !== 'string') {
					if (sOrE instanceof HTMLElement) {
						sel.insertAdjacentElement(s, sOrE);
					} else if ('isFemtoJS' in sOrE) {
						const osel = sOrE.sel;

						sel.insertAdjacentElement(s, osel);

						for (let i = 1; i < osel.length; i++) {
							osel.insertAdjacentElement('afterend', osel[i]);
						}
					}
				} else {
					sel.insertAdjacentHTML(s, sOrE);
				}

				return this;
			};
			
		let findChild = function(s) {
			results = Array.prototype.filter.call(sel.children, function (c) {
				return c.matches(s);
				});
				return results.length ? pico(results[0]) : null;
			};
			

		return {
			on:				function(t, fn, b) { sel.addEventListener(t, fn,b);		return this; },
			off:			function(t, fn, b) { sel.removeEventListener(t, fn,b);	return this; },
			css:			function(s) { sel.style.cssText += s;				return this; },
			html:			function(h) { sel.innerHTML = h;					return this; },
			text:			function(t) { sel.innerText = t;					return this; },
			addClass:		function(t) { sel.classList.add(t);					return this; },
			toggleClass:	function(t) { sel.classList.toggle(t);				return this; },
			removeClass:	function(t) { sel.classList.remove(t);				return this; },
			empty:			function() { sel.innerHTML = '';					return this; },
			attr:			function(k, v) { if(v) {sel.setAttribute(k, v);}    return sel.getAttribute(k); },
			removeAttr:		function(k) { sel.removeAttribute(k);				return this; },
			parent:			function() {										return sel.parentNode; },
			children:		function() {										return sel.childNodes; },
			remove:			function() { sel.remove();							return this; },
			focus:			function() { sel.focus();							return this; },

			before:			insertAdjacent('beforebegin'),
			after:			insertAdjacent('afterend'),
			first:			insertAdjacent('afterbegin'),
			last:			insertAdjacent('beforeend'),
			insertBefore:	insertToAdjacent('beforebegin'),
			insertAfter:	insertToAdjacent('afterend'),
			insertFirst:	insertToAdjacent('afterbegin'),
			insertLast:		insertToAdjacent('beforeend'),
			
			// find:			findChild,
			find:			function(s) {										return sel.querySelector(s); },

			prepend:		insertAdjacent('afterbegin'),
			append:			insertAdjacent('beforeend'),

			getAttr: v => sel.getAttribute(v),
			offset: () => sel.getBoundingClientRect(),
			style: sel.style,
			sel:    sel,

			isPicoJS: true
		};
	};

	pico.fragment = () => pico(document.createDocumentFragment());

	return pico;
});

if (typeof module === 'object' && module.exports) {
	module.exports = func();
} else if (typeof define === 'function' && define.amd) {
	const singleton = func();

	define('picoJS', [], () => singleton);
} else {
	window.P = func();
}