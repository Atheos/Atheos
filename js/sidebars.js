//////////////////////////////////////////////////////////////////////////////80
// Sidebar
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
//	System.js: During initialization, check if left sidebar is locked.
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';

	var core = global.codiad,
		amplify = global.amplify,
		o = global.onyx,
		hoverintent = global.hoverintent;


	core.sidebars = {
		settings: {
			leftLockedVisible: true,
			rightLockedVisible: false,
			isLeftSidebarOpen: true,
			isRightSidebarOpen: false,
			leftSidebarTrigger: false,
			rightSidebarTrigger: false
		},
		//////////////////////////////////////////////////////////////////////	
		// Sidebar Initialization
		//////////////////////////////////////////////////////////////////////	
		init: function() {
			amplify.subscribe('settings.loaded', function(settings) {
				var sbLeftWidth = localStorage.getItem('codiad.sidebars.sb-left-width'),
					sbRightWidth = localStorage.getItem('codiad.sidebars.sb-left-width');


				if (sbLeftWidth !== null) {
					o('#sb-left').style.width = sbLeftWidth;
					core.helpers.trigger(window, 'resize');
					core.helpers.trigger('#editor-region', 'h-resize-init');
				}
				if (sbRightWidth !== null) {
					o('#sb-left').style.width = sbRightWidth;
					core.helpers.trigger(window, 'resize');
					core.helpers.trigger('#editor-region', 'h-resize-init');
				}

				core.sidebars.leftSidebarTrigger = localStorage.getItem('codiad.sidebars.leftSidebarTrigger');
				core.sidebars.rightSidebarTrigger = localStorage.getItem('codiad.sidebars.rightSidebarTrigger');

				if (localStorage.getItem('codiad.sidebars.lock-left-sidebar') === 'false') {
					core.helpers.trigger('#lock-left-sidebar', 'click');
					core.sidebars.left.close();
				}

				if (localStorage.getItem('codiad.sidebars.lock-right-sidebar') === 'true') {
					core.helpers.trigger('#lock-right-sidebar', 'click');
					core.sidebars.right.open();
				}
			});



			this.left.init();

			this.right.init();

		},
		//////////////////////////////////////////////////////////////////////	
		// Left Sidebar
		//////////////////////////////////////////////////////////////////////	
		left: {
			sidebar: '',
			handle: '',
			icon: '',
			init: function() {
				this.sidebar = o('#sb-left');
				this.handle = o('#sb-left-handle');
				this.icon = o('#sb-left-lock');

				this.icon.on('click', function(e) {
					core.sidebars.left.lock();
				});

				this.handle.on('mousedown', function(e) {
					core.sidebars.resize(o('#sb-left').el, 'left');
				});

				this.handle.on('click', function() {
					if (core.sidebars.settings.leftSidebarTrigger) { // if trigger set to Hover
						core.sidebars.left.open();
					}
				});

				hoverintent(this.sidebar.el, function() {
					if (!core.sidebars.settings.leftSidebarTrigger) { // if trigger set to Hover
						core.sidebars.left.open();
					}
				}, function() {
					core.sidebars.left.close();
				});

			},
			open: function() {
				var sidebarWidth = this.sidebar.clientWidth();

				if (this.sidebar.data && this.sidebar.data.timeoutClose) {
					clearTimeout(this.sidebar.data.timeoutClose);
				}
				this.sidebar.css({
					'left': '0px'
				});
				o('#editor-region').css({
					'margin-left': sidebarWidth + 'px'
				});

				setTimeout(function() {
					core.sidebars.settings.isLeftSidebarOpen = true;
					core.sidebars.left.sidebar.trigger('h-resize-init');
					core.active.updateTabDropdownVisibility();
				}, 300);

			},
			close: function() {
				var sidebarWidth = this.sidebar.clientWidth(),
					sidebarHandleWidth = this.handle.clientWidth();

				sidebarWidth = o('#sb-left').clientWidth;

				if (!core.sidebars.settings.leftLockedVisible) {
					this.sidebar.css({
						'left': (-sidebarWidth + sidebarHandleWidth) + 'px'
					});

					o('#editor-region').css({
						'margin-left': '15px'
					});

					setTimeout(function() {
						core.sidebars.settings.isLeftSidebarOpen = false;
						core.sidebars.left.sidebar.trigger('h-resize-init');
						core.active.updateTabDropdownVisibility();
					}, 300);
				}
			},
			lock: function() {
				if (core.sidebars.settings.leftLockedVisible) {
					this.icon.replaceClass('icon-lock-close', 'icon-lock-open');
				} else {
					this.icon.replaceClass('icon-lock-open', 'icon-lock-close');
				}
				core.sidebars.settings.leftLockedVisible = !(core.sidebars.settings.leftLockedVisible);
				localStorage.setItem('codiad.sidebars.lock-right-sidebar', core.sidebars.settings.leftLockedVisible);
			}
		},
		//////////////////////////////////////////////////////////////////////	
		// Right Sidebar
		//////////////////////////////////////////////////////////////////////	
		right: {
			sidebar: '',
			handle: '',
			icon: '',
			init: function() {
				this.sidebar = o('#sb-right');
				this.handle = o('#sb-right-handle');
				this.icon = o('#sb-right-lock');
				this.icon.on('click', function(e) {
					core.sidebars.right.lock();
				});

				this.handle.on('mousedown', function(e) {
					core.sidebars.resize(o('#sb-right').el, 'right');
				});

				this.handle.on('click', function() {
					if (core.sidebars.settings.rightSidebarTrigger) { // if trigger set to Hover
						core.sidebars.right.open();
					}
				});

				hoverintent(this.sidebar.el, function() {
					if (!core.sidebars.settings.rightSidebarTrigger) { // if trigger set to Hover
						core.sidebars.right.open();
					}
				}, function() {
					core.sidebars.right.close();
				});
			},
			open: function() {
				var sidebarWidth = this.sidebar.clientWidth();

				if (this.sidebar.data && this.sidebar.data.timeoutClose) {
					clearTimeout(this.sidebar.data.timeoutClose);
				}
				this.sidebar.css({
					'right': '0px'
				});
				o('#editor-region').css({
					'margin-right': sidebarWidth + 'px'
				});

				setTimeout(function() {
					core.sidebars.settings.isRightSidebarOpen = true;
					core.sidebars.right.sidebar.trigger('h-resize-init');
					core.active.updateTabDropdownVisibility();
				}, 300);
				o('#tab-close').style.marginRight = (sidebarWidth - 10) + 'px';
				o('#tab-dropdown').style.marginRight = (sidebarWidth - 10) + 'px';

			},
			close: function() {
				var sidebarWidth = this.sidebar.clientWidth(),
					sidebarHandleWidth = this.handle.clientWidth();

				if (!core.sidebars.settings.rightLockedVisible) {
					this.sidebar.css({
						'right': -(sidebarWidth - sidebarHandleWidth) + 'px'
					});

					o('#editor-region').css({
						'margin-right': '15px'
					});

					setTimeout(function() {
						core.sidebars.settings.isRightSidebarOpen = false;
						core.sidebars.right.sidebar.trigger('h-resize-init');
						core.active.updateTabDropdownVisibility();
						core.helpers.trigger(window, 'resize');
					}, 300);
					o('#tab-close').style.marginRight = '0px';
					o('#tab-dropdown').style.marginRight = '0px';
				}
			},
			lock: function() {
				if (core.sidebars.settings.rightLockedVisible) {
					this.icon.replaceClass('icon-lock-close', 'icon-lock-open');
				} else {
					this.icon.replaceClass('icon-lock-open', 'icon-lock-close');
				}
				core.sidebars.settings.rightLockedVisible = !(core.sidebars.settings.rightLockedVisible);
				localStorage.setItem('codiad.sidebars.lock-right-sidebar', core.sidebars.settings.rightLockedVisible);
				core.helpers.trigger(window, 'resize');
				// core.helpers.trigger('#editor-region', 'h-resize-init');
			}
		},
		//////////////////////////////////////////////////////////////////////	
		// Sidebar Resize Function
		//////////////////////////////////////////////////////////////////////	
		resize: function(sidebar, side) {
			//References: http://jsfiddle.net/8wtq17L8/ & https://jsfiddle.net/tovic/Xcb8d/

			var rect = sidebar.getBoundingClientRect(),
				modalX = rect.left;

			function moveElement(event) {
				if (sidebar !== null) {
					if (side === 'left') {
						sidebar.style.width = (modalX + event.clientX + 10) + 'px';
					} else {
						sidebar.style.width = (window.innerWidth - event.clientX + 10) + 'px';
					}
					o('#editor-region').style['margin-' + side] = sidebar.clientWidth + 'px';
					if (side === 'right') {
						o('#tab-close').style.marginRight = (sidebar.clientWidth - 10) + 'px';
						o('#tab-dropdown').style.marginRight = (sidebar.clientWidth - 10) + 'px';
					}
				}
			}

			function removeListeners() {
				core.helpers.trigger(window, 'resize');

				localStorage.setItem('codiad.sidebars.sb-left-width', o('#sb-left').style.width);
				localStorage.setItem('codiad.sidebars.sb-right-width', o('#sb-right').style.width);

				document.removeEventListener('mousemove', moveElement, false);
				document.removeEventListener('mouseup', removeListeners, false);
			}

			document.addEventListener('mousemove', moveElement, false);
			document.addEventListener('mouseup', removeListeners, false);
		}
	};

})(this);