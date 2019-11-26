'use strict';

(function(global, $) {

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
	// Sidebar module currently called from:
	//	Modal.js
	//												- Liam Siira
	//////////////////////////////////////////////////////////////////////		

	core.sidebars = {
		settings: {
			leftLock: true,
			rightLock: false,
			modalLock: false,
			isLeftSidebarOpen: true,
			isRightSidebarOpen: false
		},
		IDs: {
			sbarLeft: '#sb-left',
			sbarRight: '#sb-right',
			sbarLockLeft: '#lock-left-sidebar',
			sbarLockRight: '#lock-right-sidebar',
		},

		init: function() {
			amplify.subscribe('settings.loaded', function(settings) {
				var sbWidth = localStorage.getItem('codiad.sidebars.sb-left-width'),
					SBs = core.sidebars;

				if (sbWidth !== null) {
					// This somehow runs before the OBJ is fully created and so the IDs aren't available yet
					// Either delay this with a setTimeout, or figure out a better plan
					bioflux.queryO(SBs.IDs.sbarLeft).style.width = sbWidth;
					core.helpers.trigger(window, 'resize');
					core.helpers.trigger('#editor-region', 'h-resize-init');
				}

				if (localStorage.getItem('codiad.sidebars.lock-left-sidebar') === "false") {
					core.helpers.trigger(SBs.IDs.sbarLockLeft, 'click');
					SBs.closeLeftSidebar();
				}

				if (localStorage.getItem('codiad.sidebars.lock-right-sidebar') === "true") {
					core.helpers.trigger(SBs.IDs.sbarLockRight, 'click');
					SBs.openRightSidebar();
				}
			});

			//////////////////////////////////////////////////////////////////////	
			// Left Sidebar Initialization
			//////////////////////////////////////////////////////////////////////	

			events.on('click', this.IDs.sbarLockLeft, function(e) {
				var icon = e.target || e.srcElement;
				if (core.sidebars.settings.leftLock) {
					bioflux.replaceClass(icon, 'icon-lock', 'icon-lock-open');
				} else {
					bioflux.replaceClass(icon, 'icon-lock-open', 'icon-lock');
				}
				core.sidebars.settings.leftLock = !(core.sidebars.settings.leftLock);
				localStorage.setItem('codiad.sidebars.lock-left-sidebar', core.sidebars.settings.leftLock);
			});

			events.on('mousedown', this.IDs.sbarLeft + ' .sidebar-handle', function(e) {
				core.sidebars.drag(bioflux.queryO(core.sidebars.IDs.sbarLeft));
			});

			hoverintent(bioflux.queryO(this.IDs.sbarLeft), this.openLeftSidebar, this.closeLeftSidebar);

			//////////////////////////////////////////////////////////////////////	
			// Right Sidebar Initialization
			//////////////////////////////////////////////////////////////////////	

			events.on('click', this.IDs.sbarLockRight, function(e) {
				var icon = e.target || e.srcElement;
				if (core.sidebars.settings.rightLock) {
					bioflux.replaceClass(icon, 'icon-lock', 'icon-lock-open');
				} else {
					bioflux.replaceClass(icon, 'icon-lock-open', 'icon-lock');
				}
				core.sidebars.settings.rightLock = !(core.sidebars.settings.rightLock);
				localStorage.setItem('codiad.sidebars.lock-right-sidebar', core.sidebars.settings.rightLock);
			});

			events.on('click', this.IDs.sbarRight + ' .sidebar-handle', function() {
				if (core.editor.settings.rightSidebarTrigger) { // if trigger set to Click
					core.sidebars.openRightSidebar();
				}
			});

			hoverintent(bioflux.queryO(this.IDs.sbarRight), function() {
				if (!core.editor.settings.rightSidebarTrigger) { // if trigger set to Hover
					core.sidebars.openRightSidebar();
				}
			}, function() {
				setTimeout(function() {
					if (!core.sidebars.settings.rightLock) {
						core.sidebars.closeRightSidebar();
					}
				}, 500);
			});
		},
		closeLeftSidebar: function() {
			var _this = this;
			var sbarWidthL = $("#sb-left")
				.width(),
				sbarWidthR = $("#sb-right")
				.width();
			if (!core.sidebars.settings.rightLock) {
				sbarWidthR = 10;
			}
			$('#sb-left')
				.data("timeout_r", setTimeout($.proxy(function() {
					if (!core.sidebars.settings.leftLock && !core.sidebars.settings.modalLock) { // Check locks
						$('#sb-left').css('left', (-sbarWidthL + 10) + 'px');
						$('#editor-region').css('margin-left', '10px');
						setTimeout(function() {
							_this.isLeftSidebarOpen = false;
							$('#sb-left').trigger('h-resize-init');
							core.active.updateTabDropdownVisibility();
						}, 500);
					} else {
						if ($("#sb-left .sidebar-handle").position().left <= 0) {
							$("#sb-left").width(10);
							$("#sb-left")
								.animate({
									'left': "0px"
								}, 300, 'easeOutQuart');
							$("#sb-left .sidebar-handle").css("left", 0);
							$('#editor-region')
								.animate({
									'margin-left': '10px'
								}, 300, 'easeOutQuart', function() {
									_this.isLeftSidebarOpen = false;
									$(this).trigger('h-resize-init');
									core.active.updateTabDropdownVisibility();
								});
						}
					}
				}, this), 500));

		},

		closeLeftSidebarNew: function() {
			var sidebars = core.sidebars;

			var sbarLeft = bioflux.queryO(sidebars.IDs.sbarLeft),
				sbarRight = bioflux.queryO(sidebars.IDs.sbarRight),
				sbarWidthL = sbarLeft.clientWidth,
				sbarWidthR = sbarRight.clientWidth;

			if (!sidebars.settings.rightLock) {
				sbarWidthR = 10;
			}
			setTimeout(function() {
				if (!sidebars.settings.leftLock && !sidebars.settings.modalLock) {
					sbarLeft.style.left = (-sbarWidthL + 10) + 'px';
					bioflux.queryO('#editor-region').style.marginLeft = '10px';
					setTimeout(function() {
						sidebars.settings.isLeftSidebarOpen = false;

						core.helpers.trigger('#sb-left', 'h-resize-init');

						core.active.updateTabDropdownVisibility();
					}, 300);
				} else {
					var sbLeftHandle = bioflux.queryO(sidebars.IDs.sbarLeft + ' .sidebar-handle');
					if (sbLeftHandle && sbLeftHandle.offsetLeft <= 0) {
						sbarLeft.style.width = '10px';
						sbarLeft.style.left = '0px';
					}
					$("#sb-left .sidebar-handle").css("left", 0);
					$('#editor-region')
						.animate({
							'margin-left': '10px'
						}, 300, 'easeOutQuart', function() {
							sidebars.settings.isLeftSidebarOpen = false;
							$(this).trigger('h-resize-init');
							core.active.updateTabDropdownVisibility();
						});

				}
			}, 500);

		},
		openLeftSidebar: function() {
			var _this = core.sidebars;
			var timeout_r = $('#sb-left')
				.data("timeout_r");
			if (timeout_r) {
				clearTimeout(timeout_r);
			}
			var sbarWidthL = $("#sb-left")
				.width(),
				sbarWidthR = $("#sb-right")
				.width();
			if (!core.sidebars.settings.rightLock) {
				sbarWidthR = 10;
			}
			$('#editor-region')
				.animate({
					'margin-left': sbarWidthL + 'px'
				}, 300, 'easeOutQuart', function() {
					_this.settings.isLeftSidebarOpen = true;
					$('#sb-left').trigger('h-resize-init');
					core.active.updateTabDropdownVisibility();
				});
			$('#sb-left')
				.animate({
					'left': '0px'
				}, 300, 'easeOutQuart');
		},

		closeRightSidebar: function() {
			var _this = this;
			var sbarWidthR = $("#sb-right").width();
			$('#sb-right')
				.animate({
					'right': '-' + (sbarWidthR - 10) + 'px'
				}, 300, 'easeOutQuart');
			var sbarWidthL = $("#sb-left")
				.width(),
				sbarWidthR = $("#sb-right")
				.width();
			if (!core.sidebars.settings.leftLock) {
				sbarWidthL = 10;
			}
			$('#editor-region')
				.animate({
					'margin-right': '0px'
				}, 300, 'easeOutQuart', function() {
					_this.settings.isRightSidebarOpen = false;
					core.active.updateTabDropdownVisibility();
				});
			$('#tab-close')
				.animate({
					'margin-right': 0 + 'px'
				}, 300, 'easeOutQuart');
			$('#tab-dropdown')
				.animate({
					'margin-right': 0 + 'px'
				}, 300, 'easeOutQuart');
		},
		openRightSidebar: function() {
			var _this = this;
			var timeout_r = $('#sb-right')
				.data("timeout_r");
			if (timeout_r) {
				clearTimeout(timeout_r);
			}
			var sbarWidthR = $("#sb-right")
				.width(),
				sbarWidthL = $("#sb-left")
				.width();
			if (!core.sidebars.settings.leftLock) {
				sbarWidthL = 10;
			}
			$('#editor-region').css('margin-right', '0px');
			$('#editor-region')
				.animate({
					'margin-right': sbarWidthR - 10 + 'px'
				}, 300, 'easeOutQuart', function() {
					_this.settings.isRightSidebarOpen = true;
					core.active.updateTabDropdownVisibility();
				});
			$('#tab-close')
				.animate({
					'margin-right': (sbarWidthR - 10) + 'px'
				}, 300, 'easeOutQuart');
			$('#tab-dropdown')
				.animate({
					'margin-right': (sbarWidthR - 10) + 'px'
				}, 300, 'easeOutQuart');
			$('#sb-right')
				.animate({
					'right': '0px'
				}, 300, 'easeOutQuart');
		},
		drag: function(sidebar) {
			//References: http://jsfiddle.net/8wtq17L8/ & https://jsfiddle.net/tovic/Xcb8d/

			var rect = sidebar.getBoundingClientRect(),
				mouse_x = window.event.clientX,
				modal_x = rect.left;

			function move_element(event) {
				if (sidebar !== null) {
					sidebar.style.width = (modal_x + event.clientX + 10) + 'px';
				}
			}

			// Destroy the object when we are done
			function remove_listeners() {
				core.helpers.trigger(window, 'resize');
				core.helpers.trigger('#editor-region', 'h-resize-init');
				// $(window).resize();
				// $('editor-region').trigger('h-resize-init');

				localStorage.setItem('codiad.sidebars.sb-left-width', bioflux.queryO('#sb-left').style.width);

				document.removeEventListener('mousemove', move_element, false);
				document.removeEventListener('mouseup', remove_listeners, false);
			}

			// document.onmousemove = _move_elem;
			document.addEventListener('mousemove', move_element, false);
			document.addEventListener('mouseup', remove_listeners, false);
		}
	};

})(this, jQuery);