//////////////////////////////////////////////////////////////////////////////80
// Sidebar
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/LICENSE.md for more.
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

(function(global) {
	'use strict';

	var atheos = global.atheos;

	var self = null;
	var editor = null;

	carbon.subscribe('system.loadMinor', () => atheos.sidebars.init());


	atheos.sidebars = {

		leftLockedVisible: true,
		rightLockedVisible: false,

		isLeftSidebarOpen: true,
		isRightSidebarOpen: false,

		leftTrigger: 'hover',
		rightTrigger: 'hover',

		hoverDuration: 300,

		dragging: false,

		//////////////////////////////////////////////////////////////////////	
		// Sidebar Initialization
		//////////////////////////////////////////////////////////////////////	
		init: function() {
			self = this;
			editor = oX('#editor-region');

			this.sbLeft.init();
			this.sbRight.init();

			carbon.subscribe('settings.loaded', function() {


				var sbLeftWidth = storage('sidebars.sb-left-width'),
					sbRightWidth = storage('sidebars.sb-right-width');

				var handleWidth = oX('.handle').width(),
					marginL = handleWidth,
					marginR = handleWidth;

				self.leftTrigger = storage('sidebars.leftTrigger') || 'hover';
				self.rightTrigger = storage('sidebars.rightTrigger') || 'hover';

				if (storage('sidebars.leftLockedVisible') === false) {
					oX('#sb_left .lock').trigger('click');
				}

				if (storage('sidebars.rightLockedVisible') === true) {
					oX('#sb_right .lock').trigger('click');
				}




				if (sbLeftWidth !== null) {
					sbLeftWidth = parseInt(sbLeftWidth, 10);
					oX('#sb_left').css('width', sbLeftWidth + 'px');
				}

				if (sbRightWidth !== null) {
					sbRightWidth = parseInt(sbRightWidth, 10);
					oX('#sb_right').css('width', sbRightWidth + 'px');
				}

				if (self.leftLockedVisible) {
					marginL = oX('#sb_left').width();
				} else if (sbLeftWidth !== null) {
					oX('#sb_left').css('left', ((sbLeftWidth - handleWidth) * -1) + 'px');
					self.sbLeft.close();

				}

				if (self.rightLockedVisible) {
					marginR = oX('#sb_right').width();
					self.sbRight.open();
				} else if (sbRightWidth !== null) {
					oX('#sb_right').css('right', ((sbRightWidth - handleWidth) * -1) + 'px');
				}

				editor.css({
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

				this.hoverDuration = storage('sidebars.hoverDuration') || 300;

				this.icon.on('click', function(e) {
					self.sbLeft.lock();
				});

				this.handle.on('mousedown', () => {
					self.resize(this.sidebar.el, 'left');
				});

				this.handle.on('click', function() {
					if (!self.dragging && self.leftTrigger === 'click') {
						self.sbLeft.open();
					}
				});

				this.sidebar.on('mouseover', function() {
					if (!self.dragging && self.leftTrigger === 'hover') {
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

					if (!self.dragging && mouseLeft) {
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
					editor.css('margin-left', sidebarWidth + 'px');

					setTimeout(function() {
						atheos.sidebars.isLeftSidebarOpen = true;
						atheos.active.updateTabDropdownVisibility();
						editor.trigger('h-resize-root');
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
						editor.css('margin-left', '15px');

						setTimeout(function() {
							atheos.sidebars.isLeftSidebarOpen = false;
							atheos.active.updateTabDropdownVisibility();
							editor.trigger('h-resize-root');
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
				atheos.settings.save('sidebars.leftLockedVisible', self.leftLockedVisible, true);
				storage('sidebars.leftLockedVisible', self.leftLockedVisible);
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

				this.hoverDuration = storage('sidebars.hoverDuration') || 300;

				this.icon.on('click', function(e) {
					self.sbRight.lock();
				});

				this.handle.on('mousedown', () => {
					self.resize(this.sidebar.el, 'right');
				});

				this.handle.on('click', function() {
					if (!self.dragging && self.rightTrigger === 'click') {
						self.sbRight.open();
					}
				});

				this.sidebar.on('mouseover', function() {
					if (!self.dragging && self.rightTrigger === 'hover') {
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

					if (!self.dragging && mouseLeft) {
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
					editor.css('margin-right', sidebarWidth + 'px');

					setTimeout(function() {
						self.isRightSidebarOpen = true;
						atheos.active.updateTabDropdownVisibility();
						editor.trigger('h-resize-root');
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

						editor.css('margin-right', '15px');

						setTimeout(function() {
							self.isRightSidebarOpen = false;
							atheos.active.updateTabDropdownVisibility();
							editor.trigger('h-resize-root');
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
				atheos.settings.save('sidebars.rightLockedVisible', self.rightLockedVisible, true);
				storage('sidebars.rightLockedVisible', self.rightLockedVisible);
			}
		},
		//////////////////////////////////////////////////////////////////////	
		// Sidebar Resize Function
		//////////////////////////////////////////////////////////////////////	
		resize: function(sidebar, side) {
			//References: http://jsfiddle.net/8wtq17L8/ & https://jsfiddle.net/tovic/Xcb8d/

			if (sidebar === null) {
				return;
			}

			var rect = sidebar.getBoundingClientRect(),
				modalX = rect.left,
				ed = editor.el,
				width;

			ed.style.transition = 'none';
			self.dragging = true;

			var moveElement = function(event) {
				if (side === 'left') {
					width = (modalX + event.clientX + 10);
				} else {
					width = (window.innerWidth - event.clientX + 10);
				}

				width = width > 14 ? width + 'px' : '15px';
				sidebar.style.width = width;
				ed.style['margin-' + side] = width;

			};

			function removeListeners() {
				setTimeout(function() {
					ed.style.transition = '';
					editor.css('margin-' + side, width);
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

})(this);