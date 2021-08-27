//////////////////////////////////////////////////////////////////////////////80
// Sidebar
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80
// Notes:
// The opening and closing functions for each sidebar originally had some sort 
// of jquery proxy function, a timeout, and a data method for storing reference
// to that timeout. Removing them seems to have had no ill effects. My guess is
// that it was an original attempt at the hoverIntent plugin, but who knows.
// Keeping this in mind in case I ever have to come back to it. 
// JSFiddle Link: http://jsfiddle.net/npXQx/
//
// Currently, I'm not overly happy with the layout, but it is a lot easier to 
// maintain I think. The left/right sidebars are seperate objects with their own
// functions.
//
// Need to implement changing the sidebar settings such as duration of hover and
// the trigger event.
//
// Sidebar module currently called from:
//	Components/Active/init.js
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';

	let editor = null,
		workspace = null,
		handleWidth = 0,
		hoverDuration = 300;

	const self = {

		dragging: false,

		//////////////////////////////////////////////////////////////////////	
		// Sidebar Initialization
		//////////////////////////////////////////////////////////////////////	
		init: function() {
			editor = oX('#EDITOR');
			workspace = oX('#workspace');

			left.init();
			right.init();

			carbon.subscribe('settings.loaded', function() {

				handleWidth = oX('.handle').width();

				hoverDuration = storage('sidebars.hoverDuration') || 300;
				left.trigger = storage('sidebars.leftTrigger') || 'hover';
				right.trigger = storage('sidebars.rightTrigger') || 'hover';

				if (storage('sidebars.leftLockedVisible') === false) {
					fX('#SBLEFT .lock').trigger('click');
				}

				if (storage('sidebars.rightLockedVisible') === false) {
					fX('#SBRIGHT .lock').trigger('click');
				}

				let sbLeftWidth = storage('sidebars.sb-left-width'),
					sbRightWidth = storage('sidebars.sb-right-width');
				if (sbLeftWidth !== null) {
					sbLeftWidth = parseInt(sbLeftWidth, 10);
					oX('#SBLEFT').css('width', sbLeftWidth + 'px');
				}

				if (sbRightWidth !== null) {
					sbRightWidth = parseInt(sbRightWidth, 10);
					oX('#SBRIGHT').css('width', sbRightWidth + 'px');
				}

				if (!left.lockedVisible && sbLeftWidth !== null) {
					left.element.addClass('unlocked');
					oX('#SBLEFT').css('left', ((sbLeftWidth - handleWidth) * -1) + 'px');
					workspace.css('padding-left', handleWidth + 'px');
				}

				if (!right.lockedVisible && sbRightWidth !== null) {
					right.element.addClass('unlocked');
					oX('#SBRIGHT').css('right', ((sbRightWidth - handleWidth) * -1) + 'px');
					workspace.css('padding-right', handleWidth + 'px');
				}
			});
		},

		//////////////////////////////////////////////////////////////////////	
		// Sidebar Resize Function
		//////////////////////////////////////////////////////////////////////	
		resize: function(sidebar, side) {
			//References: http://jsfiddle.net/8wtq17L8/ & https://jsfiddle.net/tovic/Xcb8d/

			if (sidebar === null) return;

			var rect = sidebar.getBoundingClientRect(),
				modalX = rect.left,
				width;

			self.dragging = true;

			var moveElement = function(event) {
				if (side === 'left') {
					width = (modalX + event.clientX + 10);
				} else {
					width = (window.innerWidth - event.clientX + 10);
				}

				width = width > 14 ? width + 'px' : '15px';
				sidebar.style.width = width;
			};

			function removeListeners() {
				setTimeout(function() {
					atheos.settings.save('sidebars.sb-' + side + '-width', width);
				}, 200);

				storage('sidebars.sb-' + side + '-width', width);
				self.dragging = false;

				document.removeEventListener('mousemove', moveElement, false);
				document.removeEventListener('mouseup', removeListeners, false);
			}

			document.addEventListener('mousemove', moveElement, false);
			document.addEventListener('mouseup', removeListeners, false);
		}
	};

	//////////////////////////////////////////////////////////////////////	
	// Left Sidebar
	//////////////////////////////////////////////////////////////////////	
	const left = {
		element: null,
		handle: '#SBLEFT .handle',
		icon: null,
		timeoutOpen: null,
		timeoutClose: null,
		trigger: 'hover',
		lockedVisible: true,
		isOpen: true,

		init: function() {
			this.element = oX('#SBLEFT');
			this.icon = oX('#SBLEFT .lock');

			fX('#SBLEFT .lock').on('click', () => this.lock());

			fX(this.handle).on('mousedown', () => {
				self.resize(this.element.element, 'left');
			});

			fX(this.handle).on('click', () => {
				if (!self.dragging && this.trigger === 'click') {
					this.open();
				}
			});

			fX('#SBLEFT').on('mouseover', () => {
				if (!self.dragging && this.trigger === 'hover') {
					this.open();
				}
			});

			fX('#SBLEFT').on('mouseout', (event) => {
				// Events is designed around event bubbling. Some events, like MouseLeave, don't bubble.
				// In order to achieve MouseLeave with events, I needed to create a method that capture
				// the mouseout event, and converts it into a mouseleave. This function checks if
				// elment the mouse moved to is the target element, or a child of; if it is, then the 
				// mouse did not leave the parent element.
				// InspiredBy: http://jsfiddle.net/amasad/TH9Hv/8/

				var trigger = this.element.element,
					destination = event.toElement || event.relatedTarget,
					mouseLeft = (destination === trigger) ? true : !trigger.contains(destination);

				if (!self.dragging && mouseLeft) this.close();
			});
		},
		open: function() {
			var sidebarWidth = this.element.width();

			if (this.timeoutClose) clearTimeout(this.timeoutClose);

			this.timeoutOpen = setTimeout(() => {

				this.element.css('left', '0px');

				setTimeout(() => {
					this.isOpen = true;
					atheos.active.updateTabDropdownVisibility();
					fX('#EDITOR').trigger('h-resize-root');
				}, 300);

			}, hoverDuration);

		},
		close: function() {
			var sidebarWidth = this.element.width();
			if (this.timeoutOpen) clearTimeout(this.timeoutOpen);

			this.timeoutClose = setTimeout(() => {
				if (this.lockedVisible) return;
				this.element.css('left', -(sidebarWidth - handleWidth) + 'px');

				setTimeout(() => {
					this.isOpen = false;
					atheos.active.updateTabDropdownVisibility();
					fX('#EDITOR').trigger('h-resize-root');
				}, 300);
			}, hoverDuration);
		},
		lock: function() {
			if (this.lockedVisible) {
				this.icon.replaceClass('fa-lock', 'fa-unlock');
				this.element.addClass('unlocked');
				workspace.css('padding-left', handleWidth + 'px');
			} else {
				this.icon.replaceClass('fa-unlock', 'fa-lock');
				this.element.removeClass('unlocked');
				workspace.css('padding-left', '');
			}
			this.lockedVisible = !(this.lockedVisible);
			atheos.settings.save('sidebars.leftLockedVisible', this.lockedVisible, true);
			storage('sidebars.leftLockedVisible', this.lockedVisible);
		}
	};

	//////////////////////////////////////////////////////////////////////	
	// Right Sidebar
	//////////////////////////////////////////////////////////////////////	
	const right = {
		element: null,
		handle: '#SBRIGHT .handle',
		icon: null,
		timeoutOpen: null,
		timeoutClose: null,
		trigger: 'hover',
		lockedVisible: true,
		isOpen: true,

		init: function() {
			this.element = oX('#SBRIGHT');
			this.icon = oX('#SBRIGHT .lock');

			fX('#SBRIGHT .lock').on('click', () => this.lock());

			fX(this.handle).on('mousedown', () => {
				self.resize(this.element.element, 'right');
			});

			fX(this.handle).on('mousedown', () => {
				if (!self.dragging && this.trigger === 'click') {
					this.open();
				}
			});

			fX('#SBRIGHT').on('mouseover', () => {
				if (!self.dragging && this.trigger === 'hover') {
					this.open();
				}
			});

			fX('#SBRIGHT').on('mouseout', (event) => {
				// Events is designed around event bubbling. Some events, like MouseLeave, don't bubble.
				// In order to achieve MouseLeave with events, I needed to create a method that capture
				// the mouseout event, and converts it into a mouseleave. This function checks if
				// elment the mouse moved to is the target element, or a child of; if it is, then the 
				// mouse did not leave the parent element.
				// InspiredBy: http://jsfiddle.net/amasad/TH9Hv/8/
				var trigger = this.element.element,
					destination = event.toElement || event.relatedTarget,
					mouseLeft = (destination === trigger) ? true : !trigger.contains(destination);

				if (!self.dragging && mouseLeft) this.close();
			});
		},
		open: function() {
			var sidebarWidth = this.element.width();

			if (this.timeoutClose) clearTimeout(this.timeoutClose);

			this.timeoutOpen = setTimeout(() => {

				this.element.css('right', '0px');

				setTimeout(() => {
					this.isOpen = true;
					atheos.active.updateTabDropdownVisibility();
					fX('#EDITOR').trigger('h-resize-root');
				}, 300);

			}, hoverDuration);
		},
		close: function() {
			var sidebarWidth = this.element.width();
			if (this.timeoutOpen) clearTimeout(this.timeoutOpen);

			this.timeoutClose = setTimeout(() => {
				if (this.lockedVisible) return;
				this.element.css('right', -(sidebarWidth - handleWidth) + 'px');

				setTimeout(() => {
					this.isOpen = false;
					atheos.active.updateTabDropdownVisibility();
					fX('#EDITOR').trigger('h-resize-root');
				}, 300);
			}, hoverDuration);

		},
		lock: function() {
			if (this.lockedVisible) {
				this.icon.replaceClass('fa-lock', 'fa-unlock');
				this.element.addClass('unlocked');
				workspace.css('padding-right', handleWidth + 'px');
			} else {
				this.icon.replaceClass('fa-unlock', 'fa-lock');
				this.element.removeClass('unlocked');
				workspace.css('padding-right', '');
			}
			this.lockedVisible = !(this.lockedVisible);
			atheos.settings.save('sidebars.rightLockedVisible', this.lockedVisible, true);
			storage('sidebars.rightLockedVisible', this.lockedVisible);
		}
	};


	atheos.sidebars = self;
	atheos.sidebars.sbLeft = left;
	atheos.sidebars.sbRight = right;
	carbon.subscribe('system.loadMinor', () => self.init());

})();