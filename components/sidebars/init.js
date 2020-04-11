//////////////////////////////////////////////////////////////////////////////80
// Sidebar
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
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

(function(global) {
	'use strict';

	var sidebars = null;

	var atheos = global.atheos,
		amplify = global.amplify,
		oX = global.onyx;

	var self = null;

	amplify.subscribe('atheos.loadMinor', () => atheos.sidebars.init());


	atheos.sidebars = {

		leftLockedVisible: true,
		rightLockedVisible: false,
		leftOpenOnClick: false,
		rightOpenOnClick: false,
		isLeftSidebarOpen: true,
		isRightSidebarOpen: false,
		leftSidebarClickOpen: false,
		rightSidebarClickOpen: false,
		hoverDuration: 300,

		//////////////////////////////////////////////////////////////////////	
		// Sidebar Initialization
		//////////////////////////////////////////////////////////////////////	
		init: function() {
			self = this;

			this.sbLeft.init();
			this.sbRight.init();

			amplify.subscribe('settings.loaded', function() {


				var sbLeftWidth = atheos.storage('sidebars.sb-left-width'),
					sbRightWidth = atheos.storage('sidebars.sb-right-width');

				if (sbLeftWidth !== null) {
					oX('#sb_left').css({
						'width': sbLeftWidth + 'px',
						// 'left': 0 - (sbLeftWidth - 15) + 'px'
					});
				}
				if (sbRightWidth !== null) {
					oX('#sb_right').css({
						'width': sbRightWidth + 'px',
						'right': -(sbRightWidth - 15) + 'px'
					});
				}


				self.leftOpenOnClick = atheos.storage('sidebars.leftOpenOnClick');
				self.rightOpenOnClick = atheos.storage('sidebars.rightOpenOnClick');

				if (atheos.storage('sidebars.leftLockedVisible') === false) {
					oX('#sb_left .lock').trigger('click');
					self.sbLeft.close();
				}

				if (atheos.storage('sidebars.rightLockedVisible')) {
					oX('#sb_right .lock').trigger('click');
					self.sbRight.open();
				}

				var handleWidth = oX('.handle').width();

				var marginL = handleWidth,
					marginR = handleWidth;

				if (self.leftLockedVisible) {
					marginL = oX('#sb_left').width();
				}

				if (self.rightLockedVisible) {
					marginR = oX('#sb_right').width();
				}

				oX('#editor-region').css({
					'margin-left': marginL + 'px',
					'margin-right': marginR + 'px',
				});
			});
		},
		//////////////////////////////////////////////////////////////////////	
		// Left Sidebar
		//////////////////////////////////////////////////////////////////////	
		sbLeft: {
			sidebar: null,
			handle: null,
			icon: null,
			timeoutOpen: null,
			timeoutClose: null,
			hoverDuration: 300,
			init: function() {
				this.sidebar = oX('#sb_left');
				this.handle = oX('#sb_left .handle');
				this.icon = oX('#sb_left .lock');

				this.hoverDuration = atheos.storage('sidebars.hoverDuration') || 300;

				this.icon.on('click', function(e) {
					self.sbLeft.lock();
				});

				this.handle.on('mousedown', () => {
					self.resize(this.sidebar.el, 'left');
				});

				this.handle.on('click', function() {
					if (self.leftOpenOnClick) { // if trigger set to Click
						self.sbLeft.open();
					}
				});

				this.sidebar.on('mouseover', function() {
					if (!self.leftOpenOnClick) { // if trigger set to Hover
						self.sbLeft.open();
					}
				});

				this.sidebar.on('mouseout', function() {
					// Events is designed around event bubbling. Some events, like MouseLeave, don't bubble.
					// In order to achieve MouseLeave with events, I needed to create a method that capture
					// the mouseout event, and converts it into a mouseleave. This function checks if
					// elment the mouse moved to is the target element, or a child of; if it is, then the 
					// mouse did not leave the parent element.
					// InspiredBy: http://jsfiddle.net/amasad/TH9Hv/8/

					var trigger = self.sbLeft.sidebar.el,
						destination = event.toElement || event.relatedTarget,
						mouseLeft = (destination === trigger) ? true : !trigger.contains(destination);

					if (mouseLeft) {
						self.sbLeft.close();
					}
				});
			},
			open: function() {
				var sidebarWidth = this.sidebar.width();

				if (this.timeoutClose) {
					clearTimeout(this.timeoutClose);
				}
				this.timeoutOpen = setTimeout((function() {

					this.sidebar.css('left', '0px');
					oX('#editor-region').css('margin-left', sidebarWidth + 'px');

					setTimeout(function() {
						atheos.sidebars.isLeftSidebarOpen = true;
						atheos.sidebars.sbLeft.sidebar.trigger('h-resize-init');
						atheos.active.updateTabDropdownVisibility();
					}, 300);
				}).bind(this), this.hoverDuration);

			},
			close: function() {
				var sidebarWidth = this.sidebar.width(),
					sidebarHandleWidth = this.handle.width();

				if (this.timeoutOpen) {
					clearTimeout(this.timeoutOpen);
				}

				sidebarWidth = this.sidebar.width();

				this.timeoutClose = setTimeout((function() {

					if (!self.leftLockedVisible) {

						this.sidebar.css('left', (-sidebarWidth + sidebarHandleWidth) + 'px');
						oX('#editor-region').css('margin-left', '15px');

						setTimeout(function() {
							atheos.sidebars.isLeftSidebarOpen = false;
							atheos.active.updateTabDropdownVisibility();
						}, 300);
					}
				}).bind(this), this.hoverDuration);
			},
			lock: function() {
				if (self.leftLockedVisible) {
					this.icon.replaceClass('fa-lock', 'fa-unlock');
					this.handle.addClass('unlocked');
				} else {
					this.icon.replaceClass('fa-unlock', 'fa-lock');
					this.handle.removeClass('unlocked');
				}
				self.leftLockedVisible = !(self.leftLockedVisible);
				atheos.settings.save('sidebars.leftLockedVisible', self.leftLockedVisible);

				atheos.storage('sidebars.leftLockedVisible', self.leftLockedVisible);
			}
		},
		//////////////////////////////////////////////////////////////////////	
		// Right Sidebar
		//////////////////////////////////////////////////////////////////////	
		sbRight: {
			sidebar: null,
			handle: null,
			icon: null,
			timeoutOpen: null,
			timeoutClose: null,
			hoverDuration: 300,
			init: function() {
				this.sidebar = oX('#sb_right');
				this.handle = oX('#sb_right .handle');
				this.icon = oX('#sb_right .lock');

				this.hoverDuration = atheos.storage('sidebars.hoverDuration') || 300;

				this.icon.on('click', function(e) {
					self.sbRight.lock();
				});

				this.handle.on('mousedown', () => {
					self.resize(this.sidebar.el, 'right');
				});

				this.handle.on('click', function(e) {
					if (self.rightOpenOnClick) { // if trigger set to Click
						self.sbRight.open();
					}
				});
				this.sidebar.on('mouseover', function(e) {
					if (!self.rightOpenOnClick) { // if trigger set to Hover
						self.sbRight.open();
					}
				});


				this.sidebar.on('mouseout', function(e) {
					// Events is designed around event bubbling. Some events, like MouseLeave, don't bubble.
					// In order to achieve MouseLeave with events, I needed to create a method that capture
					// the mouseout event, and converts it into a mouseleave. This function checks if
					// elment the mouse moved to is the target element, or a child of; if it is, then the 
					// mouse did not leave the parent element.
					// InspiredBy: http://jsfiddle.net/amasad/TH9Hv/8/

					var trigger = self.sbRight.sidebar.el,
						destination = event.toElement || event.relatedTarget,
						mouseLeft = (destination === trigger) ? true : !trigger.contains(destination);

					if (mouseLeft) {
						self.sbRight.close();
					}
				});
			},
			open: function() {
				var sidebarWidth = this.sidebar.width();

				if (this.sidebar.data && this.sidebar.data.timeoutClose) {
					clearTimeout(this.sidebar.data.timeoutClose);
				}

				if (this.timeoutClose) {
					clearTimeout(this.timeoutClose);
				}
				this.timeoutOpen = setTimeout((function() {

					this.sidebar.css('right', '0px');
					oX('#editor-region').css('margin-right', sidebarWidth + 'px');

					setTimeout(function() {
						self.isRightSidebarOpen = true;
						atheos.active.updateTabDropdownVisibility();
					}, 300);

				}).bind(this), this.hoverDuration);
			},
			close: function() {
				var sidebarWidth = this.sidebar.width(),
					sidebarHandleWidth = this.handle.width();

				if (this.timeoutOpen) {
					clearTimeout(this.timeoutOpen);
				}

				this.timeoutClose = setTimeout((function() {
					if (!self.rightLockedVisible) {
						this.sidebar.css('right', -(sidebarWidth - sidebarHandleWidth) + 'px');

						oX('#editor-region').css('margin-right', '15px');

						setTimeout(function() {
							self.isRightSidebarOpen = false;
							atheos.active.updateTabDropdownVisibility();
						}, 300);
					}
				}).bind(this), this.hoverDuration);

			},
			lock: function() {
				if (self.rightLockedVisible) {
					this.icon.replaceClass('fa-lock', 'fa-unlock');
					this.handle.addClass('unlocked');
				} else {
					this.icon.replaceClass('fa-unlock', 'fa-lock');
					this.handle.removeClass('unlocked');
				}
				self.rightLockedVisible = !(self.rightLockedVisible);
				atheos.settings.save('sidebars.rightLockedVisible', self.rightLockedVisible);
				atheos.storage('sidebars.rightLockedVisible', self.rightLockedVisible);
			}
		},
		//////////////////////////////////////////////////////////////////////	
		// Sidebar Resize Function
		//////////////////////////////////////////////////////////////////////	
		resize: function(sidebar, side) {
			//References: http://jsfiddle.net/8wtq17L8/ & https://jsfiddle.net/tovic/Xcb8d/

			var rect = sidebar.getBoundingClientRect(),
				modalX = rect.left,
				editor = oX('#editor-region');

			function moveElement(event) {
				if (sidebar !== null) {
					var width;
					if (side === 'left') {
						width = (modalX + event.clientX + 10);
					} else {
						width = (window.innerWidth - event.clientX + 10);
					}

					sidebar.style.width = ((width > 14) ? width : 15) + 'px';

					editor.css('margin-' + side, sidebar.clientWidth + 'px');

					if (side === 'right') {
						oX('#tab_close').style.marginRight = (sidebar.clientWidth - 10) + 'px';
						oX('#tab_dropdown').style.marginRight = (sidebar.clientWidth - 10) + 'px';
					}
				}
			}

			function removeListeners() {
				setTimeout(function() {
					editor.css('margin-' + side, sidebar.clientWidth + 'px');
					atheos.settings.save('sidebars.sb-' + side + '-width', sidebar.clientWidth + 'px');
				}, 200);

				var width = oX('#sb_' + side).width();
				width = width > 14 ? width : 15;

				atheos.storage('sidebars.sb-' + side + '-width', width);

				document.removeEventListener('mousemove', moveElement, false);
				document.removeEventListener('mouseup', removeListeners, false);
			}

			document.addEventListener('mousemove', moveElement, false);
			document.addEventListener('mouseup', removeListeners, false);
		}
	};

})(this);