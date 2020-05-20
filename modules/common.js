//////////////////////////////////////////////////////////////////////////////80
// Atheos Specific Helper functions
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
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

	var atheos = global.atheos,
		ajax = global.ajax,
		oX = global.onyx;



	atheos.common = {


		//////////////////////////////////////////////////////////////////////
		// Options Menu Event Handlers
		//////////////////////////////////////////////////////////////////////
		optionMenus: [],

		initMenuHandler: function(button, menu, switchClasses) {
			var menuOpen = false;

			menu.close = function() {
				if (menuOpen) {
					if (types.isArray(switchClasses)) {
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

				if (types.isArray(switchClasses)) {
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

		//////////////////////////////////////////////////////////////////////
		// SerializeForm
		//////////////////////////////////////////////////////////////////////
		serializeForm: function(form) {
			var field, l, s = [];
			var o = {};
			if (typeof form === 'object' && form.nodeName === 'FORM') {

				var len = form.elements.length;

				for (var i = 0; i < len; i++) {
					field = form.elements[i];
					// field.type === 'file' && field.type === 'reset' && field.type === 'submit' && field.type === 'button' &&
					if (!field.name || field.disabled || field.nodeName === 'BUTTON' || ['file', 'reset', 'submit', 'button'].indexOf(field.type) > -1) {
						continue;
					}

					if (field.type === 'select-multiple') {
						l = form.elements[i].options.length;
						for (var j = 0; j < l; j++) {
							if (field.options[j].selected) {
								o[field.name] = field.options[j].value;
							}
						}
					} else if (field.type !== 'checkbox' && field.type !== 'radio') {
						o[field.name] = field.value;
					} else if (field.checked) {
						if (o[field.name]) {
							o[field.name].push(field.value);
						} else {
							o[field.name] = [field.value];
						}
					}
				}
			}
			return o;
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
			var toast = oX('#toast-container');
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
			if (path.indexOf("/") === 0) {
				return true;
			} else {
				return false;
			}
		},
		//////////////////////////////////////////////////////////////////////
		// Load Script: Used to add new JS to the page.
		//  Notes: could probably be optimized to cache the scripts nodeArray
		//////////////////////////////////////////////////////////////////////
		loadScript: function(url, arg1, arg2) {
			var cache = true,
				callback = null;

			if (typeof arg1 === 'function') {
				callback = arg1;
				cache = arg2 || cache;
			} else {
				cache = arg1 || cache;
				callback = arg2 || callback;
			}

			var load = true;
			//check all existing script tags in the page for the url
			var scripts = document.getElementsByTagName('script');
			for (var i = 0; i < scripts.length; i++) {
				load = (url !== scripts[i].src);
			}

			if (load) {
				//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
				//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval

				//didn't find it in the page, so load it
				// jQuery.ajax({
				// 	type: 'GET',
				// 	url: url,
				// 	success: callback,
				// 	dataType: 'script',
				// 	cache: cache
				// });

				// ajax({
				// 	url: url,
				// 	success: function(data) {
				// 		eval(data);
				// 		if (typeof callback === 'function') {
				// 			callback.call(this);
				// 		}
				// 	},
				// });

				var script = document.createElement('script');
				script.type = 'text/javascript';
				script.src = url;
				document.getElementsByTagName('head')[0].appendChild(script);
				if (typeof callback === 'function') {
					callback.call(this);
				}

			} else {
				//already loaded so just call the callback
				if (typeof callback === 'function') {
					callback.call(this);
				}
			}
		}
	};

})(this);