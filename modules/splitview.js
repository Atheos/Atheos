//////////////////////////////////////////////////////////////////////////////80
// Codiad
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Description: 
// The System Module initializes the core Atheos object and puts the engine in
// motion, calling the initilization of other modules, and publishing the
// Amplify 'atheos.loaded' event.
//
// Notes:
// This file also houses the wrapper functions for older APIs to get to newer
// newer systems, while pushing warnings about said depreciation.
//
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80


(function(global) {

	//////////////////////////////////////////////////////////////////////
	// Collection of wrapper functions for depreciated calls.
	//////////////////////////////////////////////////////////////////////

	var atheos = global.atheos,
		amplify = global.amplify,
		oX = global.onyx,
		$ = global.jQuery;

	amplify.subscribe('system.loadExtra', () => atheos.splitview.init());

	var self = null;

	atheos.splitview = {

		splitMenuOpen: false,

		init: function() {
			self = this;

			atheos.common.initMenuHandler(oX('#split'), oX('#split-options-menu'));


			// atheos.editor.initMenuHandler($('#split'), splitOptionsMenu);

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
	var self = this;

	self.root = root;
	self.splitType = splitType;
	self.childContainers = {};
	self.childElements = {};
	self.splitProp = 0.5;

	self.setChild(0, children[0]);
	self.setChild(1, children[1]);

	self.splitter = onyx('<div class="splitter"></div>');
	root.append(self.splitter.el);

	self.splitter.on('mousedown', (e) => self.drag(e));

	if (splitType === 'vertical') {
		this.splitter.addClass('h-splitter');
		this.splitter.css('width', separatorWidth);
		this.splitter.css('height', root.height());

	} else if (splitType === 'horizontal') {
		this.splitter.addClass('v-splitter');
		this.splitter.css('height', separatorWidth);
		this.splitter.css('width', root.width());
	}

	this.root.on('h-resize', function(e, percolateUp, percolateDown) {
		e.stopPropagation();
		if (self.splitType === 'vertical') {
			var w1 = self.root.width() * self.splitProp - separatorWidth / 2;
			var w2 = self.root.width() * (1 - self.splitProp) - separatorWidth / 2;
			self.childElements[0].css('width', w1);
			self.childElements[1].css('width', w2);
			self.childElements[1].css('left', w1 + separatorWidth);
			self.splitter.css('left', w1);


		} else if (self.splitType === 'horizontal') {
			var w = self.root.width();
			self.childElements[0].css('width', w);
			self.childElements[1].css('width', w);
			self.splitter.css('width', w);
		}
		if (percolateUp) {
			self.root.parent('.editor-wrapper').trigger('h-resize', [true, false]);
		}
		if (!percolateDown) return;
		if (self.childContainers[0]) {
			self.childContainers[0].root.trigger('h-resize', [false, true]);
		} else if (self.childContainers[1]) {
			self.childContainers[1].root.trigger('h-resize', [false, true]);
		}
	});

	this.root.on('v-resize', function(e, percolateUp, percolateDown) {
		e.stopPropagation();
		if (self.splitType === 'vertical') {
			var h = self.root.height();
			self.childElements[0].css('height', h);
			self.childElements[1].css('height', h);
			self.splitter.css('height', h);

		} else if (self.splitType === 'horizontal') {
			var h1 = self.root.height() * self.splitProp - separatorWidth / 2;
			var h2 = self.root.height() * (1 - self.splitProp) - separatorWidth / 2;

			self.childElements[0].css('height', h1);
			self.childElements[1].css('height', h2);
			self.childElements[1].css('top', h1 + separatorWidth);
			self.splitter.css('top', h1);
		}
		if (percolateUp) {
			self.root.parent('.editor-wrapper').trigger('v-resize', [true, false]);
		}
		if (!percolateDown) return;
		if (self.childContainers[0]) {
			self.childContainers[0].root.trigger('v-resize', [false, true]);
		} else if (self.childContainers[1]) {
			self.childContainers[1].root.trigger('v-resize', [false, true]);
		}
	});

	this.root.trigger('h-resize', [false, false]).trigger('v-resize', [false, false]);
}

SplitContainer.prototype = {
	setChild: function(splitID, element) {

		if (element instanceof SplitContainer) {
			this.childElements[splitID] = element.root;
			this.childContainers[splitID] = element;
			element.splitID = splitID;
		} else {
			this.childElements[splitID] = element;
		}

		this.childElements[splitID].appendTo(this.root);
		this.cssInit(splitID, this.childElements[splitID]);
	},
	cssInit: function(splitID, element) {
		var properties = {};
		var h1, h2, w1, w2, rh, rw;

		rh = this.root.height();
		rw = this.root.width();

		if (this.splitType === 'vertical') {

			w1 = rw * this.splitProp - separatorWidth / 2;
			w2 = rw * (1 - this.splitProp) - separatorWidth / 2;

			if (splitID === 0) {
				properties = {
					left: 0,
					width: w1,
					height: rh,
					top: 0
				};
			} else {
				properties = {
					left: w1 + separatorWidth,
					width: w2,
					height: rh,
					top: 0
				};
			}

		} else if (this.splitType === 'horizontal') {

			h1 = rh * this.splitProp - separatorWidth / 2;
			h2 = rh * (1 - this.splitProp) - separatorWidth / 2;

			if (splitID === 0) {
				properties = {
					top: 0,
					height: h1,
					width: rw,
					left: 0
				};
			} else {
				properties = {
					top: h1 + separatorWidth,
					height: h2,
					width: rw,
					left: 0
				};
			}

		}

		element.css(properties);
	},
	drag: function(event) {
		//References: http://jsfiddle.net/8wtq17L8/ & https://jsfiddle.net/tovic/Xcb8d/
		var self = this;
		var splitter = event.target;

		var mouseX = window.event.clientX,
			mouseY = window.event.clientY,
			splitX = splitter.offsetLeft,
			splitY = splitter.offsetTop;

		function effectChange(top, left) {


			if (self.splitType === 'vertical') {
				var w1 = left - separatorWidth / 2;
				var w2 = self.root.width() - left - separatorWidth / 2;
				self.splitProp = w1 / self.root.width();
				self.childElements[0].css('width', w1);
				self.childElements[1].css('width', w2);
				self.childElements[1].css('left', w1 + separatorWidth)

				self.childElements[0].trigger('h-resize', [true, true]);
				self.childElements[1].trigger('h-resize', [true, true]);
				self.splitProp = left / self.root.width();


			} else {
				var h1 = top - separatorWidth / 2;
				var h2 = self.root.width() - top - separatorWidth / 2;
				self.splitProp = h1 / self.root.height();
				self.childElements[0].css('height', h1);
				self.childElements[1].css('height', h2);
				self.childElements[1].css('top', h1 + separatorWidth);

				self.childElements[0].trigger('v-resize', [true, true]);
				self.childElements[1].trigger('v-resize', [true, true]);

			}
		};



		function moveElement(event) {
			if (splitter) {
				var left = splitX + event.clientX - mouseX,
					top = splitY + event.clientY - mouseY;
				splitter.style.left = self.splitType === 'vertical' ? left + 'px' : '';
				splitter.style.top = self.splitType === 'horizontal' ? top + 'px' : '';
				effectChange(top, left);
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

	}

};