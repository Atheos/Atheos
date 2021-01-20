//////////////////////////////////////////////////////////////////////////////80
// Atheos Specific Helper functions
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/LICENSE.md for more.
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

(function(global) {
	'use strict';

	var atheos = global.atheos;

	var self = null;

	atheos.common = {

		init: function() {
			self = this;
			self.initDropdown();
			self.initTogglePassword();
			self.initCheckMonitors();
		},


		//////////////////////////////////////////////////////////////////////80
		// Options Menu Event Handlers
		//////////////////////////////////////////////////////////////////////80
		optionMenus: [],

		initMenuHandler: function(button, menu, switchClasses) {
			var menuOpen = false;

			menu.close = function() {
				if (menuOpen) {
					if (isArray(switchClasses)) {
						// I could have made a nice If statement to switch the appropriate classes
						// on menu open vs close, however converting the boolean value to a number
						// was an inspirational moment and seemed really cool.
						button.replaceClass(switchClasses[+menuOpen], switchClasses[+!menuOpen]);
					}
					atheos.flow.slide('close', menu.el);
					window.removeEventListener('click', menu.close);
					menuOpen = false;
				}
			};

			this.optionMenus.push(menu);

			button.on('click', (e) => {
				e.stopPropagation();

				// Close other menus
				this.closeMenus(menu);

				if (isArray(switchClasses)) {
					// I could have made a nice If statement to switch the appropriate classes
					// on menu open vs close, however converting the boolean value to a number
					// was an inspirational moment and seemed really cool.
					button.replaceClass(switchClasses[+menuOpen], switchClasses[+!menuOpen]);
				}
				if (menuOpen) {
					menu.close();
				} else {
					atheos.flow.slide('open', menu.el);
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
				oX('dropdown', true).off('click');
			};

			oX('dropdown', true).on('click', function(e) {
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
			oX('i.togglePassword', true).on('click', function(e) {
				var icon = oX(e.target);
				var field = icon.sibling('input[name="' + icon.attr('for') + '"]');
				if (!field) {
					return;
				}
				if (field.prop('type') === 'password') {
					field.prop('type', 'text');
				} else {
					field.prop('type', 'password');
				}
				icon.switchClass('fa-eye', 'fa-eye-slash');
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Checkbox Group Handler
		//////////////////////////////////////////////////////////////////////80		
		initCheckMonitors: function() {
			oX('input[type="checkbox"][group]', true).on('click', function(e) {
				log('test');
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

		createOverlay: function(type, hidden) {
			var overlay = oX('#overlay');
			if (overlay) {
				overlay.remove();
			}
			overlay = oX('<div id="overlay">');

			if (type === 'alert') {
				overlay.on('click', atheos.alert.unload);
			} else {
				overlay.on('click', atheos.modal.unload);
			}
			if (hidden) {
				overlay.hide();
			}
			var toast = oX('#toast_container');
			if (toast) {
				toast.before(overlay.el);
			} else {
				document.body.appendChild(overlay.el);
			}
			return overlay;
		},

		hideOverlay: function() {
			oX('#overlay').hide();
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
		//  Notes: could probably be optimized to cache the scripts nodeArray
		//////////////////////////////////////////////////////////////////////
		scriptCache: [],
		loadScript: function(url, callback) {
			if (self.scriptCache.includes(url)) {
				//already loaded so just call the callback
				if (typeof callback === 'function') {
					callback.call(this);
				}
			} else {
				this.scriptCache.push(url);

				var script = document.createElement('script');
				script.type = 'text/javascript';
				script.src = url;
				document.getElementsByTagName('head')[0].appendChild(script);
				if (typeof callback === 'function') {
					callback.call(this);
				}
			}
		}
	};

})(this);