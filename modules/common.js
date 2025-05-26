//////////////////////////////////////////////////////////////////////////////80
// Atheos Specific Helper functions
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Notes: 
// This helper module is potentially temporary, but will be used to
// help identify and reduce code repition across the application.
// Think of it like a temporary garbage dump of all functions that
// don't fit within the actual module I found them in.
//
// If any of these become long term solutions, more research will need
// to take place on each function to ensure it does what it says. Most
// of these were just pulled from a google search and kept if they 
// seemed to work.
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';

	const self = {

		init: function() {
			self.initDropdown();
			self.initTogglePassword();
			self.initPasswordMonitor();
			self.initCheckMonitors();
			self.initOverlay();
		},


		//////////////////////////////////////////////////////////////////////80
		// Options Menu Event Handlers
		//////////////////////////////////////////////////////////////////////80
		optionMenus: [],

		initMenuHandler: function(buttonID, menuID, switchClasses) {
			var menuOpen = false;

			let menu = oX(menuID);

			menu.close = function() {
				if (menuOpen) {
					if (isArray(switchClasses)) {
						// I could have made a nice If statement to switch the appropriate classes
						// on menu open vs close, however converting the boolean value to a number
						// was an inspirational moment and seemed really cool.
						$(buttonID).replaceClass(switchClasses[+menuOpen], switchClasses[+!menuOpen]);
					}
					atheos.flow.slide('close', menu.element);
					window.removeEventListener('click', menu.close);
					menuOpen = false;
				}
			};

			this.optionMenus.push(menu);

			fX(buttonID).on('click', (e) => {
				e.stopPropagation();

				// Close other menus
				this.closeMenus(menu);

				if (isArray(switchClasses)) {
					// I could have made a nice If statement to switch the appropriate classes
					// on menu open vs close, however converting the boolean value to a number
					// was an inspirational moment and seemed really cool.
					$(buttonID).replaceClass(switchClasses[+menuOpen], switchClasses[+!menuOpen]);
				}
				if (menuOpen) {
					menu.close();
				} else {
					atheos.flow.slide('open', menu.element);
					menuOpen = true;
					window.addEventListener('click', menu.close);
				}
			});
		},

		closeMenus: function(exclude) {
			this.optionMenus.forEach((menu) => {
				if (menu !== exclude) {
					menu.close();
				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Dropdown Menu Handler (WIP for custom drop downs)
		//////////////////////////////////////////////////////////////////////80
		initDropdown: function() {
			var close = function() {
				oX('dropdown.expanded').removeClass('expanded');
				fX('dropdown').off('click');
			};

			fX('dropdown').on('click', function(e) {
				e.preventDefault();
				e.stopPropagation();

				var target = oX(e.target),
					parent = target.parent('dropdown');


				parent.addClass('expanded');

				oX('#' + target.attr('for')).prop('checked', true);

				window.addEventListener('click', close);
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Show/Hide Password Handler
		//////////////////////////////////////////////////////////////////////80		
		initTogglePassword: function() {
			fX('i.togglePassword').on('click', function(e) {
				var icon = $(e.target);
				var field = icon.sibling('input[name="' + icon.attr('for') + '"]');
				if (!field) return;

				if (field.prop('type') === 'password') {
					field.prop('type', 'text');
				} else {
					field.prop('type', 'password');
				}
				icon.switchClass('fa-eye', 'fa-eye-slash');
			});
		},

		initPasswordMonitor: function() {
			let reqs = {
				lowercase: /[a-z]/,
				uppercase: /[A-Z]/,
				numeric: /[0-9]/,
				symbols: /[^\w\s|_]/
			};

			let testStrength = throttle(function(e) {
				if (oX('#login')) return;

				let input = oX(e.target),
					pwd = input.value(),
					str = +(pwd.length > 8);

				if (!pwd) return;

				input.removeClass();

				for (let k in reqs) {
					str += +(reqs[k].test(pwd));
				}
				input.addClass('cat' + str);
			}, 250);

			fX('input[name="password"],input[name="validate"]').on('change, input', testStrength);
		},

		//////////////////////////////////////////////////////////////////////80
		// Checkbox Group Handler
		//////////////////////////////////////////////////////////////////////80		
		initCheckMonitors: function() {
			fX('input[type="checkbox"][group]').on('click', function(e) {
				var input = oX(e.target);
				var members = oX(document).findAll('input[type="checkbox"][group="' + input.attr('group') + '"]');
				var checked = input.prop('checked');

				if (input.attr('parent')) {
					members.forEach((c) => c.prop('checked', checked));
				}

				var parent = members.filter((c) => c.attr('parent'))[0];
				if (!checked) {
					parent.prop('checked', checked);
				} else {
					var allChecked = true;
					members.forEach((c) => {
						if (c !== parent) {
							allChecked = allChecked && (c.prop('checked') === true);
						}
					});
					parent.prop('checked', allChecked);
				}
			});
		},

		overlay: null,
		initOverlay: function() {
			self.overlay = oX('overlay');
			// overlay.on('click', atheos.alert.unload);
			// overlay.on('click', atheos.modal.unload);
		},

		showOverlay: function(type, hidden) {
			if (!hidden) self.overlay.addClass('active');
			if (type === 'alert') {
				self.overlay.on('click', atheos.alert.unloadAll);
			} else {
				self.overlay.on('click', atheos.modal.unload);
			}
			return self.overlay;
		},

		hideOverlay: function() {
			self.overlay.removeClass('active');
			self.overlay.hide();
		},

		//////////////////////////////////////////////////////////////////////
		// Check Absolute Path
		//////////////////////////////////////////////////////////////////////
		isAbsPath: function(path) {
			// const isRelative = path => !/^([a-z]+:)?[\\/]/i.test(path);
			// log(isRelative(path));
			return path.indexOf('/') === 0;
		},

		//////////////////////////////////////////////////////////////////////
		// Load Script: Used to add new JS to the page.
		//////////////////////////////////////////////////////////////////////
		scriptCache: {},
		loadScript: function(url, callback) {
		    // If script is already loaded, callback instantly
			if (self.scriptCache[url] === 'loaded') {
				if (isFunction(callback)) callback.call(this);
				return;
			}

			if (self.scriptCache[url] === 'loading') {
				document.addEventListener(`script:${url}`, () => {
					if (isFunction(callback)) callback.call(this);
				}, {
					once: true
				});
				return;
			}

			self.scriptCache[url] = 'loading';

			const script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = url;

			script.onload = () => {
				self.scriptCache[url] = 'loaded';
				document.dispatchEvent(new Event(`script:${url}`));
				if (isFunction(callback)) callback.call(this);
			};

			script.onerror = () => {
				delete self.scriptCache[url];
				console.error(`Failed to load script: ${url}`);
			};

			document.head.appendChild(script);
		}
	};

	carbon.subscribe('system.loadVital', () => self.init());
	atheos.common = self;

})();