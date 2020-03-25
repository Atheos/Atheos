//////////////////////////////////////////////////////////////////////////////80
// User Alerts / Messages
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Notes: 
// Currently, the langauge translations are done on each call to the Toast
// message, even though I think it would make more sense for Toast to handle
// the translation. For Future consideration.
//
// The toast messages should have settings options to allow the user to choose 
// durations, and whether they auto close or not.
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {

	'use strict';

	var atheos = global.atheos,
		i18n = global.i18n,
		types = global.types,
		extend = atheos.common.extend;

	atheos.toast = {

		global: {
			position: 'bottom-right', // top-left, top-center, top-right, middle-left, middle-center, middle-right
			sticky: false,
			text: 'Message undefined'
		},
		types: {
			success: {
				icon: 'check-circle',
				sticky: false,
				stayTime: 3000,
			},
			error: {
				icon: 'exclamation-circle',
				sticky: false,
				stayTime: 10000,
			},
			warning: {
				icon: 'exclamation-triangle',
				sticky: false,
				stayTime: 5000,
			},
			notice: {
				icon: 'info-circle',
				sticky: false,
				stayTime: 3000,
			},
		},

		createContainer: function(position) {
			var container = document.createElement('div');
			container.id = 'toast-container';
			container.classList.add('toast-position-' + position);
			document.body.appendChild(container);
			return container;
		},

		createToast: function(text, type) {
			var wrapper = document.createElement('div'),
				message = document.createElement('p'),
				icon = document.createElement('i'),
				close = document.createElement('i');

			wrapper.classList.add('toast-wrapper');
			message.classList.add('toast-message');
			message.innerText = text || 'Default Text';

			icon.classList.add('fas', 'fa-' + type, 'toast-icon');
			close.classList.add('fas', 'fa-times-circle', 'toast-close');

			wrapper.appendChild(icon);
			wrapper.appendChild(message);
			wrapper.appendChild(close);

			close.addEventListener('click', function() {
				atheos.toast.hide(wrapper);
			});

			return wrapper;
		},

		showToast: function(options) {
			options = extend(this.global, options);
			options.text = options.raw ? options.text : i18n(options.text);

			// declare variables
			var container = document.querySelector('#toast-container') || this.createContainer(options.position),
				wrapper = this.createToast(options.text, options.icon);

			container.appendChild(wrapper);

			setTimeout(function() {
				wrapper.classList.add('toast-active');

				if (!options.sticky) {
					setTimeout(function() {
						atheos.toast.hide(wrapper);
					}, options.stayTime);
				}
			}, 10);

			return wrapper;
		},

		success: function(message, options) {
			options = types.isObject(options) ? options : {};
			options = extend(this.types.success, options);
			options.text = message;

			this.showToast(options);
		},
		error: function(message, options) {
			options = types.isObject(options) ? options : {};
			options = extend(this.types.error, options);
			options.text = message;

			this.showToast(options);
		},
		warning: function(message, options) {
			options = types.isObject(options) ? options : {};
			options = extend(this.types.warning, options);
			options.text = message;

			this.showToast(options);
		},
		notice: function(message, options) {
			options = types.isObject(options) ? options : {};
			options = extend(this.types.notice, options);
			options.text = message;

			this.showToast(options);
		},
		show: function(type, text, options) {
			if (types.isObject(type)) {
				options = type;
				type = options.status;
			} else {
				options = types.isObject(options) ? options : {};
			}
			if (this.types.hasOwnProperty(type)) {
				options = extend(this.types[type], options);
				options.text = options.message || text;
				this.showToast(options);
			}

		},
		hide: function(wrapper) {
			wrapper.classList.remove('toast-active');
			wrapper.addEventListener('transitionend', function() {
				wrapper.remove();
			});
		}
	};
	atheos.message = atheos.toast;
})(this);