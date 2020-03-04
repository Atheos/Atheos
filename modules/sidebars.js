//////////////////////////////////////////////////////////////////////////////80
// Sidebar
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Notes:
// The opening and closing functions for each sidebar originally had some sort 
// of jquery proxy function, a timeout, and a data method for storing reference
// to that timeout. Removing them seems to have had no ill effects. My guess is
// that it was an original attempt at the hoverIntent plugin, but who knows.
// Keeping this in mind in case I ever have to come back to it. 
// JSFiddle Link: http://jsfiddle.net/npXQx/
//
// Honestly, there is a lot going on inside each of these functions in this file
// and I don't like it. It's easy to get lost here, and readability is next to
// performance and security in my mind. I know comments are important and
// required but good clean code should be understandable at a glance and this
// code will probably change a lot as I hit the grove of it.
//
// Currently, I'm not overly happy with the layout, but it is a lot easier to 
// maintain I think. The left/right sidebars are seperate objects with their own
// functions. I wish I knew more about passing scopes as I think it would really
// cut down on the clutter in this file.
//
// Currently only the right sidebar can be set to click-trigger while the left is
// default to hover-hover trigger if unlocked.
//
// Sidebar module currently called from:
//	Components/Active/init.js
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';

	var atheos = global.atheos,
		amplify = global.amplify,
		oX = global.onyx;

	atheos.sidebars = {
		settings: {
			leftLockedVisible: true,
			rightLockedVisible: false,
			leftOpenOnClick: false,
			rightOpenOnClick: false,
			isLeftSidebarOpen: true,
			isRightSidebarOpen: false,
			leftSidebarClickOpen: false,
			rightSidebarClickOpen: false,
			hoverDuration: 300
		},
		//////////////////////////////////////////////////////////////////////	
		// Sidebar Initialization
		//////////////////////////////////////////////////////////////////////	
		init: function() {

			var sidebars = atheos.sidebars,
				sbLeftWidth = atheos.storage('sidebars.sb-left-width'),
				sbRightWidth = atheos.storage('sidebars.sb-right-width');

			if (sbLeftWidth !== null) {
				oX('#sb-left').css({
					'width': sbLeftWidth + 'px',
					// 'left': 0 - (sbLeftWidth - 15) + 'px'
				});
			}
			if (sbRightWidth !== null) {
				oX('#sb-right').css({
					'width': sbRightWidth + 'px',
					'right': -(sbRightWidth - 15) + 'px'
				});
			}

			this.sbLeft.init();
			this.sbRight.init();


			sidebars.leftOpenOnClick = atheos.storage('sidebars.leftOpenOnClick');
			sidebars.rightOpenOnClick = atheos.storage('sidebars.rightOpenOnClick');

			if (atheos.storage('sidebars.leftLockedVisible') === false) {
				oX('#sb-left-lock').trigger('click');
				sidebars.sbLeft.close();
			}

			if (atheos.storage('sidebars.rightLockedVisible')) {
				oX('#sb-right-lock').trigger('click');
				sidebars.sbRight.open();
			}

			amplify.subscribe('settings.loaded', function(settings) {
				var handleWidth = oX('#sb-left-handle').clientWidth();

				var marginL = handleWidth,
					marginR = handleWidth;

				if (atheos.sidebars.settings.leftLockedVisible) {
					marginL = oX('#sb-left').clientWidth();
				}

				if (atheos.sidebars.settings.rightLockedVisible) {
					marginR = oX('#sb-right').clientWidth();
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
				var sidebars = atheos.sidebars;
				this.sidebar = oX('#sb-left');
				this.handle = oX('#sb-left-handle');
				this.icon = oX('#sb-left-lock');

				this.hoverDuration = atheos.storage('sidebars.hoverDuration') || 300;

				this.icon.on('click', function(e) {
					sidebars.sbLeft.lock();
				});

				this.handle.on('mousedown', function(e) {
					sidebars.resize(oX('#sb-left').el, 'left');
				});

				this.handle.on('click', function() {
					if (sidebars.settings.leftOpenOnClick) { // if trigger set to Click
						sidebars.sbLeft.open();
					}
				});

				this.sidebar.on('mouseout', function() {
					sidebars.sbLeft.close();
				});
				this.sidebar.on('mouseover', function() {
					if (!sidebars.settings.leftOpenOnClick) { // if trigger set to Hover
						sidebars.sbLeft.open();
					}
				});
			},
			open: function() {
				var sidebarWidth = this.sidebar.clientWidth();

				if (this.timeoutClose) {
					clearTimeout(this.timeoutClose);
				}
				this.timeoutOpen = setTimeout((function() {

					this.sidebar.css('left', '0px');
					oX('#editor-region').css('margin-left', sidebarWidth + 'px');

					setTimeout(function() {
						atheos.sidebars.settings.isLeftSidebarOpen = true;
						atheos.sidebars.sbLeft.sidebar.trigger('h-resize-init');
						atheos.active.updateTabDropdownVisibility();
					}, 300);
				}).bind(this), this.hoverDuration);

			},
			close: function() {
				var sidebarWidth = this.sidebar.clientWidth(),
					sidebarHandleWidth = this.handle.clientWidth();

				if (this.timeoutOpen) {
					clearTimeout(this.timeoutOpen);
				}

				sidebarWidth = oX('#sb-left').clientWidth();

				this.timeoutClose = setTimeout((function() {

					if (!atheos.sidebars.settings.leftLockedVisible) {

						this.sidebar.css('left', (-sidebarWidth + sidebarHandleWidth) + 'px');
						oX('#editor-region').css('margin-left', '15px');

						setTimeout(function() {
							atheos.sidebars.settings.isLeftSidebarOpen = false;
							atheos.active.updateTabDropdownVisibility();
						}, 300);
					}
				}).bind(this), this.hoverDuration);
			},
			lock: function() {
				var settings = atheos.sidebars.settings;
				if (settings.leftLockedVisible) {
					this.icon.replaceClass('fas fa-lock', 'fas fa-unlock');
				} else {
					this.icon.replaceClass('fas fa-unlock', 'fas fa-lock');
				}
				settings.leftLockedVisible = !(settings.leftLockedVisible);
				atheos.storage('sidebars.leftLockedVisible', settings.leftLockedVisible);
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
				var sidebars = atheos.sidebars;
				this.sidebar = oX('#sb-right');
				this.handle = oX('#sb-right-handle');
				this.icon = oX('#sb-right-lock');

				this.hoverDuration = atheos.storage('sidebars.hoverDuration') || 300;

				this.icon.on('click', function(e) {
					sidebars.sbRight.lock();
				});

				this.handle.on('mousedown', function(e) {
					sidebars.resize(oX('#sb-right').el, 'right');
				});

				this.handle.on('click', function() {
					if (sidebars.settings.rightOpenOnClick) { // if trigger set to Click
						sidebars.sbRight.open();
					}
				});
				this.sidebar.on('mouseout', function() {
					sidebars.sbRight.close();
				});
				this.sidebar.on('mouseover', function() {
					if (!sidebars.settings.rightOpenOnClick) { // if trigger set to Click
						sidebars.sbRight.open();
					}
				});
			},
			open: function() {
				var sidebarWidth = this.sidebar.clientWidth();

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
						atheos.sidebars.settings.isRightSidebarOpen = true;
						atheos.active.updateTabDropdownVisibility();
					}, 300);

					// oX('#tab-close').css('margin-right', (sidebarWidth - 10) + 'px');
					// oX('#tab-dropdown').css('margin-right', (sidebarWidth - 10) + 'px');

				}).bind(this), this.hoverDuration);
			},
			close: function() {
				var sidebarWidth = this.sidebar.clientWidth(),
					sidebarHandleWidth = this.handle.clientWidth();

				if (this.timeoutOpen) {
					clearTimeout(this.timeoutOpen);
				}

				this.timeoutClose = setTimeout((function() {
					if (!atheos.sidebars.settings.rightLockedVisible) {
						this.sidebar.css('right', -(sidebarWidth - sidebarHandleWidth) + 'px');

						oX('#editor-region').css('margin-right', '15px');

						setTimeout(function() {
							atheos.sidebars.settings.isRightSidebarOpen = false;
							atheos.sidebars.sbRight.sidebar.trigger('h-resize-init');
							atheos.active.updateTabDropdownVisibility();
						}, 300);
						// oX('#tab-close').style.marginRight = '0px';
						// oX('#tab-dropdown').style.marginRight = '0px';
					}
				}).bind(this), this.hoverDuration);

			},
			lock: function() {
				var settings = atheos.sidebars.settings;
				if (settings.rightLockedVisible) {
					this.icon.replaceClass('fas fa-lock', 'fas fa-unlock');
				} else {
					this.icon.replaceClass('fas fa-unlock', 'fas fa-lock');
				}
				settings.rightLockedVisible = !(settings.rightLockedVisible);
				atheos.storage('sidebars.rightLockedVisible', settings.rightLockedVisible);
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
						oX('#tab-close').style.marginRight = (sidebar.clientWidth - 10) + 'px';
						oX('#tab-dropdown').style.marginRight = (sidebar.clientWidth - 10) + 'px';
					}
				}
			}

			function removeListeners() {
				setTimeout(function() {
					editor.css('margin-' + side, sidebar.clientWidth + 'px');
				}, 200);

				var width = oX('#sb-' + side).clientWidth();
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