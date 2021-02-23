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
// The toast messages should have settings opts to allow the user to choose 
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
			position: 'bottom right', // top-left, top-center, top-right, middle-left, middle-center, middle-right
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

			self.container = oX('toaster');

			fX('toast').on('click', function(e) {
				var toast = e.target.closest('toast');
				self.hide(toast);
			});
		},

		create: function(type, text) {
			var html = `<toast><i class="${ type } fas fa-circle"></i><p class="message">${ text || global.text }</p></toast>`;

			let div = document.createElement('div');
			div.innerHTML = html;
			return div.firstChild;
		},

		showToast: function(opts) {
			opts = extend(self.global, opts);
			opts.text = opts.raw ? opts.text : i18n(opts.text);

			// declare variables
			var toast = self.create(opts.type, opts.text);

			self.container.append(toast);

			setTimeout(function() {
				toast.classList.add('active');
				setTimeout(() => self.hide(toast), opts.stayTime);
			}, 10);
		},

		show: function(type, text, opts) {
			if (isObject(type)) {
				opts = type;
				type = opts.status;
			} else {
				opts = isObject(opts) ? opts : {};
			}

			if (isObject(text)) {
				text = text.text;
			}

			if (self.types.hasOwnProperty(type)) {
				opts = extend(self.types[type], opts);
				opts.type = type;
				opts.text = opts.message || opts.text || text;
				self.showToast(opts);
			}

		},
		hide: function(toast) {
			toast.classList = '';
			toast.addEventListener('transitionend', toast.remove);
		}
	};

	global.toast = atheos.toast.show;

})(this);