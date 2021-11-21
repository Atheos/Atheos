//////////////////////////////////////////////////////////////////////////////80
// SplitView Module
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';

	const node = {

		splitMenuOpen: false,

		init: function() {
			atheos.common.initMenuHandler('#split', '#split_menu');

			fX('#split-vertically').on('click', function(e) {
				atheos.editor.addInstance(atheos.editor.activeInstance.getSession(), 'bottom');
			});

			fX('#split-horizontally').on('click', function(e) {
				atheos.editor.addInstance(atheos.editor.activeInstance.getSession(), 'right');
			});

			fX('#merge-all').on('click', function(e) {
				var activeSession = atheos.editor.activeInstance.getSession();
				atheos.editor.exterminate();
				atheos.editor.addInstance(activeSession);
			});
		}
	};

	carbon.subscribe('system.loadMinor', () => node.init());
	atheos.splitview = node;

})();

var separatorWidth = 5;


//////////////////////////////////////////////////////////////////////////////80
// SplitView Class
//////////////////////////////////////////////////////////////////////////////80
// Notes:
// Getting rid of self and moving all the functions inside of Split Container
// might clean up the code a little more.
//
// I've thought about pushing the mini CSS library into a global scope to make
// the code a little cleaner as well, but am worried that someone might try to 
// use it instead of Onyx, which while it's not a problem to do so, it goes
// against what I consider best practices. I might add it to Onyx in a sort of
// high performance little brother type deal for Onyx later.
//
// The cMajor, cMinor, and Borders are are held miniCSS objects, while the
// Parent is still a raw dom element. It added a bit of a headache to try to
// turn it into a handler so I left it as it is.
//
// The performance side of the SplitContainer I consider to be pretty much done
// with little left to improve as far as I can tell, the readability leaves a
// lot to desire. I tried to do a lot of CodeGolf with this one in order to
// challenge myself a little bit and will probably use this module as a sandbox
// for non-best practices / CodeGolf.
//
// There is room for improvement I'm pretty sure in using Right/Bottom as well
// as Left/Top for each child in that you'd no longer have to set those values
// after you initially did so, only having to change all the widths. Or even 
// switching the magical FlexBox container, but I'm not super familiar with
// FlexBox, and rewriting this to use Right/Bottom seems like a very low 
// priority to me right now. I'm happy where SplitContainer is currently.
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

function SplitContainer(parent, children, splitType) {
	var self = this,
		Q = self.helper;

	self.parent = parent;
	self.splitType = splitType;
	self.splitProp = 0.5;

	self.border = Q(document.createElement('div'));

	if (splitType === 'horizontal') {
		self.border.dom.classList.add('splitter', 'h-splitter');
		self.border.width(separatorWidth);
		self.border.height(Q(self.parent).height());

	} else if (splitType === 'vertical') {
		self.border.dom.classList.add('splitter', 'v-splitter');
		self.border.height(separatorWidth);
		self.border.width(Q(self.parent).width());
	}

	self.parent.append(self.border.dom);
	self.setChild(0, children[0]);
	self.setChild(1, children[1]);


	// You might be tempted in removing the arrow function here, but it would 
	// break scope on this/self down in the Drag function.
	self.border.on('mousedown', (e) => self.drag(e));
	Q(self.parent).on('h-resize', (e) => self.resize(e, 'width'));
	Q(self.parent).on('v-resize', (e) => self.resize(e, 'height'));

	Q(self.parent).trigger('h-resize');
	Q(self.parent).trigger('v-resize');
}

SplitContainer.prototype = {
	setChild: function(splitID, element) {
		var self = this,
			Q = self.helper;

		if (element instanceof SplitContainer) {
			element.splitID = splitID;
			element = element.parent;
		}
		if (splitID === 0) {
			self.cMajor = Q(element);
		} else {
			self.cMinor = Q(element);
		}


		self.parent.append(element);

		Q(element).top(0);
		Q(element).left(0);
		Q(self.parent).trigger('h-resize');
		Q(self.parent).trigger('v-resize');
	},

	resize: function(event, type) {
		var self = this;

		var s0, s1, s2;

		s0 = self.helper(self.parent)[type]();
		s1 = s0 * self.splitProp - separatorWidth / 2;
		s2 = s0 * (1 - self.splitProp) - separatorWidth / 2;

		if (self.splitType === 'horizontal' && type === 'width') {
			self.cMajor.width(s1);
			self.cMinor.width(s2);
			self.cMinor.left(s1 + separatorWidth);
			self.border.left(s1);

		} else if (self.splitType === 'vertical' && type === 'height') {
			self.cMajor.height(s1);
			self.cMinor.height(s2);
			self.cMinor.top(s1 + separatorWidth);
			self.border.top(s1);

		} else {
			self.cMajor[type](s0);
			self.cMinor[type](s0);
			self.border[type](s0);
		}

		self.cMajor.trigger(event.type);
		self.cMinor.trigger(event.type);
	},

	drag: function(event) {
		//References: http://jsfiddle.net/8wtq17L8/ & https://jsfiddle.net/tovic/Xcb8d/
		var self = this,
			Q = self.helper;

		var border = event.target,
			mouseX = window.event.clientX,
			mouseY = window.event.clientY,
			splitX = border.offsetLeft,
			splitY = border.offsetTop;

		var rHeight = Q(self.parent).height();
		var rWidth = Q(self.parent).width();
		var timeout = false;

		// Set the throttle as a named variable in order to add AND remove
		// the event listener later on. Without it being a named item, it can't
		// be removed.
		var moveElement = throttle(function(event) {
			var left = splitX + event.clientX - mouseX,
				top = splitY + event.clientY - mouseY;

			border.style.left = self.splitType === 'horizontal' ? left + 'px' : '';
			border.style.top = self.splitType === 'vertical' ? top + 'px' : '';

			if (self.splitType === 'horizontal') {
				var percent = left / rWidth;
				percent = percent < 0.1 ? 0.1 : percent;
				percent = percent > 0.9 ? 0.9 : percent;

				self.splitProp = percent;
				Q(self.parent).trigger('h-resize');
			} else {
				self.splitProp = top / rHeight;
				Q(self.parent).trigger('v-resize');
			}
		}, 10);

		function disableSelect(event) {
			event.preventDefault();
		}

		// Destroy the object when we are done
		function removeListeners() {
			document.removeEventListener('mousemove', moveElement, false);
			document.removeEventListener('mouseup', removeListeners, false);
			window.removeEventListener('selectstart', disableSelect);
		}

		document.addEventListener('mousemove', moveElement, false);
		document.addEventListener('mouseup', removeListeners, false);
		window.addEventListener('selectstart', disableSelect);
	},
	helper: function(element) {

		let raw = {
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
			setCSS(raw);

			return size;
		};

		let triggerEvent = (type) => {
			return element.dispatchEvent(new CustomEvent(type, {
				bubbles: false,
				cancelable: true
			}));
		};

		let updateListener = (type, fnc, change) => {
			type = type.split(',');
			type.forEach((t) => {
				t = t.trim();
				if (change === 'add') {
					element.addEventListener(t, fnc);
				} else {
					element.removeEventListener(t, fnc);
				}
			});
		};

		return {
			top: (v) => element.style.top = v + 'px',
			left: (v) => element.style.left = v + 'px',
			right: (v) => element.style.right = v + 'px',
			bottom: (v) => element.style.bottom = v + 'px',
			width: (v) => setSize('width', v),
			height: (v) => setSize('height', v),
			on: (t, f) => updateListener(t, f, 'add'),
			off: (t, f) => updateListener(t, f, 'remove'),
			trigger: (t) => triggerEvent(t),
			dom: element
		};
	}
};