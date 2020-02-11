//////////////////////////////////////////////////////////////////////////////80
// User Alerts / Messages
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Notes: 
// Currently the icons are hard coded: Close/Types. They'll need to be migrated
// to css classes modifiable by the themes for consistancy.
//
// Currently, the langauge translations are done on each call to the Toast
// message, even though I think it would make more sense for Toast to handle
// the translation. For Future consideration.
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80


(function(global) {

	'use strict';

	var core = global.codiad;

	core.toast = {

		icons: {
			'error': 'exclamation-circle',
			'notice': 'info-circle',
			'success': 'check-circle',
			'warning': 'exclamation-triangle'
		},
		settings: {

			stayTime: 3000,
			text: '',
			sticky: false,
			type: 'info-circle',
			position: 'bottom-right', // top-left, top-center, top-right, middle-left, middle-center, middle-right
			close: null
		},

		init: function(options) {
			if (options) {
				this.settings = core.helpers.extend(this.settings, options);
			}
		},

		createContainer: function() {
			var container = document.createElement('div');
			container.id = 'toast-container';
			container.classList.add('toast-position-' + this.settings.position);
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
				core.message.hide(wrapper);
			});

			return wrapper;
		},

		showToast: function(options) {
			options = core.helpers.extend(this.settings, options);

			// declare variables
			var container = document.querySelector('#toast-container') || this.createContainer(),
				wrapper = this.createToast(options.text, options.type);

			container.appendChild(wrapper);

			setTimeout(function() {
				wrapper.classList.add('toast-active');

				if (!options.sticky) {
					setTimeout(function() {
						core.toast.hide(wrapper);
					}, options.stayTime);
				}
			}, 10);


			return wrapper;
		},

		success: function(message, options) {
			options = (options && typeof options === 'object') ? options : {};
			options.text = message || 'Message undefined';
			options.type = this.icons.success;
			this.showToast(options);
		},
		error: function(message, options) {
			options = (options && typeof options === 'object') ? options : {};
			options.text = message || 'Message undefined';
			options.type = this.icons.error;
			options.stayTime = 10000;
			this.showToast(options);
		},
		warning: function(message, options) {
			options = (options && typeof options === 'object') ? options : {};
			options.text = message || 'Message undefined';
			options.type = this.icons.warning;
			options.stayTime = 5000;
			this.showToast(options);
		},
		notice: function(message, options) {
			options = (options && typeof options === 'object') ? options : {};
			options.text = message || 'Message undefined';
			options.type = this.icons.notice;
			this.showToast(options);
		},
		hide: function(wrapper) {
			wrapper.classList.remove('toast-active');
			wrapper.addEventListener("transitionend", function() {
				wrapper.remove();
			});
		}
	};
})(this);