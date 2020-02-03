'use strict';

(function(global, $, p) {

	var core = global.codiad,
		amplify = global.amplify,
		bioflux = global.bioflux,
		events = global.events,
		hoverintent = global.hoverintent;

	//////////////////////////////////////////////////////////////////////
	// Sidebar
	//////////////////////////////////////////////////////////////////////
	// Notes:
	// The opening and closing functions for each sidebar originally had
	// some sort of jquery proxy function, a timeout, and a data method
	// for storing reference to that timeout. Removing them seems to have
	// had no ill effects. My guess is that it was an original attempt at
	// the hoverIntent plugin, but who knows. Keeping this in mind in case
	// I ever have to come back to it. http://jsfiddle.net/npXQx/
	//
	// Honestly, there is a lot going on inside each of these functions in
	// this file and I don't like it. It's easy to get lost here, and 
	// readability is next to performance and security in my mind. I know
	// comments are important and required but good clean code should be
	// understandable at a glance and this code will probably change a lot
	// as I hit the grove of it sooooooo
	//
	// Future to-do: The right sidebar had a larger icon for it's handle due
	// the default "hover" while the left is generally locked open. I changed
	// them to match and plan on changing them to change based on whether the
	// sidebar is locked or not.
	//
	// Currently only the right sidebar can be set to click-trigger while the
	// left is default to hover-hover trigger if unlocked.
	//
	// Sidebar module currently called from:
	//	Components/Active/init.js
	//	System.js: During initialization, check if left sidebar is locked.
	//												- Liam Siira
	//////////////////////////////////////////////////////////////////////		


	core.sidebars = {
		settings: {
			leftLockedVisible: true,
			rightLockedVisible: false,
			isLeftSidebarOpen: true,
			isRightSidebarOpen: false,
			leftSidebarTrigger: false,
			rightSidebarTrigger: false
		},

		init: function() {
			amplify.subscribe('settings.loaded', function(settings) {
				var sbLeftWidth = localStorage.getItem('codiad.sidebars.sb-left-width'),
					sbRightWidth = localStorage.getItem('codiad.sidebars.sb-left-width'),
					SBs = core.sidebars;

				core.sidebars.leftSidebarTrigger = localStorage.getItem('codiad.sidebars.leftSidebarTrigger');
				core.sidebars.rightSidebarTrigger = localStorage.getItem('codiad.sidebars.rightSidebarTrigger');

				if (sbLeftWidth !== null) {
					// This somehow runs before the OBJ is fully created and so the IDs aren't available yet
					// Either delay this with a setTimeout, or figure out a better plan
					p('#sb-left').style.width = sbLeftWidth;
					core.helpers.trigger(window, 'resize');
					core.helpers.trigger('#editor-region', 'h-resize-init');
				}
				if (sbRightWidth !== null) {
					// This somehow runs before the OBJ is fully created and so the IDs aren't available yet
					// Either delay this with a setTimeout, or figure out a better plan
					p('#sb-left').style.width = sbRightWidth;
					core.helpers.trigger(window, 'resize');
					core.helpers.trigger('#editor-region', 'h-resize-init');
				}

				if (localStorage.getItem('codiad.sidebars.lock-left-sidebar') === "false") {
					core.helpers.trigger('#lock-left-sidebar', 'click');
					SBs.closeSidebar('left');
				}

				if (localStorage.getItem('codiad.sidebars.lock-right-sidebar') === "true") {
					core.helpers.trigger('#lock-right-sidebar', 'click');
					SBs.openSidebar('right');
				}
			});

			//////////////////////////////////////////////////////////////////////	
			// Left Sidebar Initialization
			//////////////////////////////////////////////////////////////////////	

			events.on('click', '#lock-left-sidebar', function(e) {
				var icon = e.target || e.srcElement;
				var sbarLeft = p('#sb-left');
				if (core.sidebars.settings.leftLockedVisible) {
					p(icon).toggleClass('icon-lock-close', 'icon-lock-open');
					// bioflux.replaceClass(icon, 'icon-lock-close', 'icon-lock-open');
					// bioflux.replaceClass(sbarLeft, 'locked', 'unlocked');
				} else {
					bioflux.replaceClass(icon, 'icon-lock-open', 'icon-lock-close');
					// bioflux.replaceClass(sbarLeft, 'unlocked', 'locked');
				}
				core.sidebars.settings.leftLockedVisible = !(core.sidebars.settings.leftLockedVisible);
				localStorage.setItem('codiad.sidebars.lock-left-sidebar', core.sidebars.settings.leftLockedVisible);
			});

			events.on('mousedown', '#sb-left .sidebar-handle', function(e) {
				core.sidebars.drag(bioflux.queryO('#sb-left'), 'left');
			});

			events.on('click', '#sb-left .sidebar-handle', function() {
				if (core.sidebars.settings.leftSidebarTrigger) { // if trigger set to Click
					core.sidebars.openSidebar('left');
				}
			});

			hoverintent(bioflux.queryO('#sb-left'), function() {
				if (!core.sidebars.settings.leftSidebarTrigger) { // if trigger set to Hover
					core.sidebars.openSidebar('left');
				}
			}, function() {
				core.sidebars.closeSidebar('left');
			});


			//////////////////////////////////////////////////////////////////////	
			// Right Sidebar Initialization
			//////////////////////////////////////////////////////////////////////	

			events.on('click', '#lock-right-sidebar', function(e) {
				var icon = e.target || e.srcElement;
				if (core.sidebars.settings.rightLockedVisible) {
					bioflux.replaceClass(icon, 'icon-lock-close', 'icon-lock-open');
				} else {
					bioflux.replaceClass(icon, 'icon-lock-open', 'icon-lock-close');
				}
				core.sidebars.settings.rightLockedVisible = !(core.sidebars.settings.rightLockedVisible);
				localStorage.setItem('codiad.sidebars.lock-right-sidebar', core.sidebars.settings.rightLockedVisible);
			});

			events.on('mousedown', '#sb-right .sidebar-handle', function(e) {
				core.sidebars.drag(bioflux.queryO('#sb-right'), 'right');
			});

			events.on('click', '#sb-right .sidebar-handle', function() {
				if (core.sidebars.settings.rightSidebarTrigger) { // if trigger set to Click
					core.sidebars.openSidebar('right');
				}
			});

			hoverintent(bioflux.queryO('#sb-right'), function() {
				if (!core.sidebars.settings.rightSidebarTrigger) { // if trigger set to Hover
					core.sidebars.openSidebar('right');
				}
			}, function() {
				core.sidebars.closeSidebar('right');
			});

			var handleWidth = 10;

			$(window).on('load resize', function() {

				var marginL, reduction;
				if ($("#sb-left")
					.css('left') !== 0 && !core.sidebars.settings.leftLockedVisible) {
					marginL = handleWidth;
					reduction = 2 * handleWidth;
				} else {
					marginL = $("#sb-left")
						.width();
					reduction = marginL + handleWidth;
				}
				$('#editor-region')
					.css({
						'margin-left': marginL + 'px',
						'height': ($('body')
							.outerHeight()) + 'px'
					});
				$('#root-editor-wrapper')
					.css({
						'height': ($('body')
							.outerHeight() - 57) + 'px' // TODO Adjust '75' in function of the final tabs height.
					});

				// Run resize command to fix render issues
				if (core.editor) {
					core.editor.resize();
					core.active.updateTabDropdownVisibility();
				}
			});
		},

		openSidebar: function(side) {
			side = side || 'left';
			var sidebars = core.sidebars,
				sidebar = bioflux.queryO(side === "left" ? '#sb-left' : '#sb-right'),
				sidebarWidth = sidebar.clientWidth;

			if (sidebar.data && sidebar.data.timeoutClose) {
				clearTimeout(sidebar.data.timeoutClose);
			}
			sidebar.style[side] = '0px';

			bioflux.queryO('#editor-region').style['margin-' + side] = sidebarWidth - ((side === 'left') ? 0 : 0) + 'px';

			setTimeout(function() {
				if (side === 'left') {
					sidebars.settings.isLeftSidebarOpen = true;
				} else {
					sidebars.settings.isRightSidebarOpen = true;

				}
				core.helpers.trigger('#sb-' + side, 'h-resize-init');
				core.active.updateTabDropdownVisibility();
			}, 300);
			if (side === 'right') {
				bioflux.queryO('#tab-close').style.marginRight = (sidebarWidth - 10) + 'px';
				bioflux.queryO('#tab-dropdown').style.marginRight = (sidebarWidth - 10) + 'px';
			}
		},

		closeSidebar: function(side) {
			side = side || 'left';

			var sidebars = core.sidebars,
				sidebar = bioflux.queryO(side === "left" ? '#sb-left' : '#sb-right'),
				sidebarWidth = sidebar.clientWidth,
				sidebarHandleWidth = sidebar.querySelector('.sidebar-handle').clientWidth;

			// If the sidebar isn't locked & the modal isn't open, minimize the sidebar.
			if (!sidebars.settings[side + 'LockedVisible']) { // Check locks
				if (side === 'left') {
					sidebar.style.left = (-sidebarWidth + sidebarHandleWidth) + 'px';
				} else {
					sidebar.style.right = -(sidebarWidth - sidebarHandleWidth) + 'px';
				}
				p('#editor-region').style['margin-' + side] = (side === 'left') ? '15px' : '15px';

				setTimeout(function() {
					if (side === 'left') {
						sidebars.settings.isLeftSidebarOpen = false;
					} else {
						sidebars.settings.isRightSidebarOpen = false;
					}
					core.helpers.trigger('#sb-' + side, 'h-resize-init');
					core.active.updateTabDropdownVisibility();
				}, 300);
				if (side === 'right') {
					p('#tab-close').style.marginRight = '0px';
					p('#tab-dropdown').style.marginRight = '0px';
				}
			} else {
				// Looking through older commits, this else function runs to ensure
				// that the sidebar doesn't get completely off screen and no longer
				// clickable, but I'm not sure it's really necessary. I'm keeping it
				// since it really doesn't have any negative impact for now.
				//		- Liam Siira

				// var sbLeftHandle = bioflux.queryO(sidebars.IDs.sbarLeft + ' .sidebar-handle');
				// if (sbLeftHandle && sbLeftHandle.offsetLeft <= 0) {
				// 	sidebar.style.left = '0px';
				// }
			}


		},

		drag: function(sidebar, side) {
			//References: http://jsfiddle.net/8wtq17L8/ & https://jsfiddle.net/tovic/Xcb8d/

			var rect = sidebar.getBoundingClientRect(),
				mouseX = window.event.clientX,
				modalX = rect.left;

			function moveElement(event) {
				if (sidebar !== null) {
					if (side === 'left') {
						sidebar.style.width = (modalX + event.clientX + 10) + 'px';
					} else {
						sidebar.style.width = (window.innerWidth - event.clientX + 10) + 'px';
					}
					p('#editor-region').style['margin-' + side] = sidebar.style.width;
					if (side === 'right') {
						p('#tab-close').style.marginRight = (sidebar.clientWidth - 10) + 'px';
						p('#tab-dropdown').style.marginRight = (sidebar.clientWidth - 10) + 'px';
					}
				}
			}

			function removeListeners() {
				core.helpers.trigger(window, 'resize');
				core.helpers.trigger('#editor-region', 'h-resize-init');

				localStorage.setItem('codiad.sidebars.sb-left-width', p('#sb-left').style.width);
				localStorage.setItem('codiad.sidebars.sb-right-width', p('#sb-right').style.width);

				document.removeEventListener('mousemove', moveElement, false);
				document.removeEventListener('mouseup', removeListeners, false);
			}

			document.addEventListener('mousemove', moveElement, false);
			document.addEventListener('mouseup', removeListeners, false);
		}
	};

})(this, jQuery, pico);