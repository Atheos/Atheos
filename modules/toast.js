//////////////////////////////////////////////////////////////////////////////80
// User Alerts / Messages
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Notes: 
// Currently, the langauge translations are done on each call to the Toast
// message, even though I think it would make more sense for Toast to handle
// the translation. For Future consideration.
//
// The toast messages should have settings options to allow the user to choose 
// durations, and whether they auto close or not.
//
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {

	'use strict';

	var atheos = global.atheos;

	var self = null;

	carbon.subscribe('system.loadMinor', () => atheos.toast.init());

	atheos.toast = {

		global: {
			position: 'bottom-right', // top-left, top-center, top-right, middle-left, middle-center, middle-right
			text: 'Message undefined'
		},
		types: {
			success: {
				icon: 'check-circle',
				stayTime: 3000,
			},
			error: {
				icon: 'exclamation-circle',
				stayTime: 10000,
			},
			warning: {
				icon: 'exclamation-triangle',
				stayTime: 5000,
			},
			notice: {
				icon: 'info-circle',
				stayTime: 3000,
			},
		},

		init: function() {
			self = this;

			self.container = oX('#toast_container');

			oX('#toast_container .close', true).on('click', function(e) {
				var wrapper = oX(e.target).parent('toast');
				atheos.toast.hide(wrapper.el);
			});

		},

		createContainer: function(position) {
			var container = document.createElement('div');
			container.id = 'toast_container';
			container.classList.add('toast-position-' + position);
			document.body.appendChild(container);
			return container;
		},

		createToast: function(text, type) {
			var html = `<toast><i class="fas fa-${ type }"></i><p class="message">${ text || global.text }</p><i class="fas fa-times-circle close"></i></toast>`;

			var wrapper = oX(html);
			return wrapper.el;
		},

		showToast: function(options) {
			options = extend(self.global, options);
			options.text = options.raw ? options.text : i18n(options.text);

			// declare variables
			var wrapper = self.createToast(options.text, options.icon);

			self.container.append(wrapper);
			self.container.removeClass();
			self.container.addClass(options.position);

			setTimeout(function() {
				wrapper.classList.add('active');
				setTimeout(() => self.hide(wrapper), options.stayTime);
			}, 10);

			return wrapper;
		},

		show: function(type, text, options) {
			if (isObject(type)) {
				options = type;
				type = options.status;
			} else {
				options = isObject(options) ? options : {};
			}
			
			if(isObject(text)) {
				text = text.text;
			}
			
			if (self.types.hasOwnProperty(type)) {
				options = extend(self.types[type], options);
				options.text = options.message || options.text || text;
				self.showToast(options);
			}

		},
		hide: function(wrapper) {
			wrapper.classList.remove('active');
			wrapper.addEventListener('transitionend', wrapper.remove);
		}
	};

	global.toast = atheos.toast.show;

})(this);