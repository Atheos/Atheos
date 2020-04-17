/*jshint esversion: 6 */

//////////////////////////////////////////////////////////////////////////////80
// SplitView Class
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80
// Notes: 
// The context menu should become an object stored within the filemanager, and
// constructed based on the fules specified therein. The OBJ is created, and then
// added to by each plugin based on it's requirements. The OBJ could even be 
// cached.
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80


(function(global) {

	//////////////////////////////////////////////////////////////////////////80
	// Collection of wrapper functions for depreciated calls.
	//////////////////////////////////////////////////////////////////////////80

	var atheos = global.atheos,
		amplify = global.amplify,
		oX = global.onyx;

	amplify.subscribe('system.loadExtra', () => atheos.splitview.init());

	var self = null;

	atheos.splitview = {

		splitMenuOpen: false,

		init: function() {
			self = this;

			atheos.common.initMenuHandler(oX('#split'), oX('#split-options-menu'));

			oX('#split-vertically').on('click', function(e) {
				atheos.editor.addInstance(atheos.editor.activeInstance.getSession(), 'bottom');
			});

			oX('#split-horizontally').on('click', function(e) {
				atheos.editor.addInstance(atheos.editor.activeInstance.getSession(), 'right');
			});

			oX('#merge-all').on('click', function(e) {
				var activeSession = atheos.editor.activeInstance.getSession();
				atheos.editor.exterminate();
				atheos.editor.addInstance(activeSession);
			});
		}
	};

})(this);

var separatorWidth = 5;

function SplitContainer(root, children, splitType) {
	var self = this,
		css = self.css;

	self.root = root;
	self.splitType = splitType;
	self.childContainers = {};
	self.childElements = {};
	self.splitProp = 0.5;

	var cMajor = self.cMajor = children[0];
	var cMinor = self.cMinor = children[1];
	var border = self.border = document.createElement('div');
	var rHeight = css(self.root).height();
	var rWidth = css(self.root).width();

	self.setChild(0, self.cMajor);
	self.setChild(1, self.cMinor);


	if (splitType === 'vertical') {
		border.classList.add('splitter', 'h-splitter');
		css(border).width(separatorWidth);
		css(border).height(rHeight);

	} else if (splitType === 'horizontal') {
		border.classList.add('splitter', 'v-splitter');
		css(border).height(separatorWidth);
		css(border).width(rWidth);
	}

	root.append(border);

	// You might be tempted in removing the arrow function here, but it would 
	// break scope on this/self down in the Drag function.
	css(border).on('mousedown', (e) => self.drag(e));

	css(self.root).on('h-resize', function(e) {

		if (self.splitType === 'vertical') {
			var w1 = rWidth * self.splitProp - separatorWidth / 2;
			var w2 = rWidth * (1 - self.splitProp) - separatorWidth / 2;

			css(cMajor).width(w1);
			css(cMinor).width(w2);
			css(cMinor).left(w1 + separatorWidth);
			// Border top might already be set by the drag.
			css(border).left(w1);


		} else if (self.splitType === 'horizontal') {
			css(cMajor).width(rWidth);
			css(cMinor).width(rWidth);
			css(border).width(rWidth);
		}

		css(cMajor).trigger('v-resize');
		css(cMinor).trigger('h-resize');

	});

	css(self.root).on('v-resize', function(e) {
		rHeight = css(self.root).height();

		if (self.splitType === 'vertical') {
			css(cMajor).height(rHeight);
			css(cMinor).height(rHeight);
			css(border).height(rHeight);

		} else if (self.splitType === 'horizontal') {
			var h1 = rHeight * self.splitProp - separatorWidth / 2;
			var h2 = rHeight * (1 - self.splitProp) - separatorWidth / 2;

			css(cMajor).height(h1);
			css(cMinor).height(h2);
			css(cMinor).top(h1 + separatorWidth);
			// Border top might already be set by the drag.
			css(border).top(h1);
		}

		css(cMajor).trigger('v-resize');
		css(cMinor).trigger('v-resize');
	});

	css(self.root).trigger('h-resize');
	css(self.root).trigger('v-resize');
}

SplitContainer.prototype = {
	setChild: function(splitID, element) {
		if (element instanceof SplitContainer) {
			if (splitID === 0) {
				this.cMajor = element.root;
			} else {
				this.cMinor = element.root;
			}
		trace(splitID);
			log(element);
			log(splitID);

			element.splitID = splitID;
			element = element.root;
			// this.childContainers[splitID] = element;
		}

		this.root.append(element);
		this.cssInit(splitID, element);

	},
	cssInit: function(splitID, element) {
		var self = this,
			css = self.css;
		var h1, h2, w1, w2;

		var rHeight = css(self.root).height();
		var rWidth = css(self.root).width();

		if (self.splitType === 'vertical') {

			w1 = rWidth * self.splitProp - (separatorWidth / 2);
			w2 = rWidth * (1 - self.splitProp) - (separatorWidth / 2);

			if (splitID === 0) {
				css(element).top(0);
				css(element).left(0);
				css(element).width(w1);
				css(element).height(rHeight);
			} else {
				css(element).top(0);
				css(element).left(w1 + separatorWidth);
				css(element).width(w2);
				css(element).height(rHeight);
			}

		} else if (self.splitType === 'horizontal') {

			h1 = rHeight * self.splitProp - (separatorWidth / 2);
			h2 = rHeight * (1 - self.splitProp) - (separatorWidth / 2);

			if (splitID === 0) {
				css(element).top(0);
				css(element).left(0);
				css(element).width(h1);
				css(element).height(rWidth);
			} else {
				css(element).top(h1 + separatorWidth);
				css(element).left(0);
				css(element).width(h2);
				css(element).height(rWidth);
			}

		}
	},
	drag: function(event) {
		//References: http://jsfiddle.net/8wtq17L8/ & https://jsfiddle.net/tovic/Xcb8d/
		var self = this,
			css = self.css;

		var border = event.target,
			mouseX = window.event.clientX,
			mouseY = window.event.clientY,
			splitX = border.offsetLeft,
			splitY = border.offsetTop;

		var rHeight = css(self.root).height();
		var rWidth = css(self.root).width();
		var timeout = false;

		function effectChange(top, left) {
			timeout = false;
			if (self.splitType === 'vertical') {

				// var w1 = left;
				// var w2 = rWidth - left;

				self.splitProp = left / rWidth;

				// css(self.cMajor).width(w1);
				// css(self.cMinor).width(w2);
				// css(self.cMinor).left(w1 + separatorWidth);

				css(self.root).trigger('h-resize');
				// css(self.cMinor).trigger('h-resize');

			} else {

				// var h1 = top - separatorWidth / 2;
				// var h2 = rWidth - top - separatorWidth / 2;
				self.splitProp = top / rHeight;

				// css(self.cMajor).height(h1);
				// css(self.cMinor).height(h2);
				// css(self.cMinor).top(h1 + separatorWidth);

				css(self.root).trigger('v-resize');
				// css(self.cMinor).trigger('v-resize');

			}
		}

		function moveElement(event) {
			var left = splitX + event.clientX - mouseX,
				top = splitY + event.clientY - mouseY;
			border.style.left = self.splitType === 'vertical' ? left + 'px' : '';
			border.style.top = self.splitType === 'horizontal' ? top + 'px' : '';
			if (timeout === false) {
				timeout = setTimeout(() => effectChange(top, left), 10);
			}
		}

		function disableSelect(event) {
			event.preventDefault();
		}

		// Destroy the object when we are done
		function removeListeners() {
			document.removeEventListener('mousemove', moveElement, false);
			document.removeEventListener('mouseup', removeListeners, false);
			window.removeEventListener('selectstart', disableSelect);
		}

		// document.onmousemove = _move_elem;
		document.addEventListener('mousemove', moveElement, false);
		document.addEventListener('mouseup', removeListeners, false);
		window.addEventListener('selectstart', disableSelect);
	},
	css: function(element) {

		let cssInit = {
			'display': element.style.display,
			'visibility': element.style.visibility,
			'opacity': element.style.opacity
		};

		let setCSS = (o) => {
			const entries = Object.entries(o);
			for (const [key, value] of entries) {
				element.style[key] = value;
			}
		};

		let setSize = (t, v) => {
			if (v) {
				element.style[t] = v + 'px';
			}
			setCSS({
				'display': 'block',
				'visibility': 'hidden',
				'opacity': 0
			});

			var computedStyle = window.getComputedStyle(element);
			var size = parseFloat(computedStyle[t].replace('px', ''));
			setCSS(cssInit);

			return size;
		};

		let triggerEvent = (type) => {
			return element.dispatchEvent(new CustomEvent(type, {
				bubbles: false,
				cancelable: true
			}));
		};

		return {
			top: (v) => element.style.top = v + 'px',
			left: (v) => element.style.left = v + 'px',
			right: (v) => element.style.right = v + 'px',
			bottom: (v) => element.style.bottom = v + 'px',
			width: (v) => setSize('width', v),
			height: (v) => setSize('height', v),
			on: (t, f) => element.addEventListener(t, f),
			off: (t, f) => element.removeEventListener(t, f),
			trigger: (t) => triggerEvent(t)
		};
	}

};