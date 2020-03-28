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
 
(function() {
	var method;
	var noop = function() {};
	var methods = [
		'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
		'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
		'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
		'timeStamp', 'trace', 'warn'
	];
	var length = methods.length;
	var console = (window.console = window.console || {});

	while (length--) {
		method = methods[length];

		// Only stub undefined methods.
		if (!console[method]) {
			console[method] = noop;
		}
	}

	if (Function.prototype.bind) {
		window.log = Function.prototype.bind.call(console.log, console);
	} else {
		window.log = function() {
			Function.prototype.apply.call(console.log, console, arguments);
		};
	}
})();

(function(global) {
	'use strict';

	var atheos = global.atheos,
		ajax = global.ajax,
		o = global.onyx;



	atheos.common = {


		//////////////////////////////////////////////////////////////////
		// Return the node name (sans path)
		//////////////////////////////////////////////////////////////////

		getNodeName: function(path) {
			return path.split('/').pop();
		},

		//////////////////////////////////////////////////////////////////
		// Return extension from path
		//////////////////////////////////////////////////////////////////

		getNodeExtension: function(path) {
			return path.split('.').pop();
		},

		getNodeType: function(path) {
			return o('#file-manager a[data-path="' + path + '"]').attr('data-type');
		},

		_basename: function(path, suffix) {
			//  discuss at: http://phpjs.org/functions/basename/
			var b = path;
			var lastChar = b.charAt(b.length - 1);

			if (lastChar === '/' || lastChar === '\\') {
				b = b.slice(0, -1);
			}

			b = b.replace(/^.*[\/\\]/g, '');

			if (typeof suffix === 'string' && b.substr(b.length - suffix.length) === suffix) {
				b = b.substr(0, b.length - suffix.length);
			}

			return b;
		},

		_dirname: function(path) {
			// discuss at: http://phpjs.org/functions/dirname/
			return path.replace(/\\/g, '/')
				.replace(/\/[^\/]*\/?$/, '');
		},

		//////////////////////////////////////////////////////////////////////
		// Extend
		//////////////////////////////////////////////////////////////////////

		extend: function(obj, src) {
			var temp = JSON.parse(JSON.stringify(obj));
			for (var key in src) {
				if (src.hasOwnProperty(key)) {
					temp[key] = src[key];
				}
			}
			return temp;
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
		//////////////////////////////////////////////////////////////////////
		// Trigger
		//////////////////////////////////////////////////////////////////////
		trigger: function(selector, event) {
			console.warn('Trigger Helper will be depreciated on next release');
			if (event && selector) {
				var element;
				if (selector.self === window) {
					element = selector;
				} else {
					element = selector.nodeType === Node.ELEMENT_NODE ? selector : document.querySelector(selector);
				}
				if (element) {
					var e;
					if ('createEvent' in document) {
						// modern browsers, IE9+
						e = document.createEvent('HTMLEvents');
						e.initEvent(event, false, true);
						element.dispatchEvent(e);
					} else {
						// IE 8
						e = document.createEventObject();
						e.eventType = event;
						element.fireEvent('on' + e.eventType, e);
					}
				}
			}
		},
		createOverlay: function() {
			var overlay = o('<div>');

			overlay.attr('id', 'overlay');
			overlay.on('click', atheos.alert.unload);
			overlay.on('click', atheos.modal.unload);

			// overlay.on('click', function(event) {
			// 	if (event.target.id !== 'modal_overlay') {
			// 		return;
			// 	}
			// 	modal.unload();
			// }, false);

			document.body.appendChild(overlay.el);
			return overlay;
		},

		hideOverlay: function() {
			oX('#overlay').hide();
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

// (function(global) {
// 	'use strict';

// 	var atheos = global.atheos,
// 		ajax = global.ajax,
// 		o = global.onyx;

// 	atheos.common = {



// 	};

// })(this);