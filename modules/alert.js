//////////////////////////////////////////////////////////////////////////////80
// Alert: User Action Required
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Notes: 
// https://codepen.io/tlongren/pen/pnkij?editors=0010
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

	var atheos = global.atheos,
		i18n = global.i18n,
		o = global.onyx;

	atheos.alert = {

		init: function(verbose) {
			if (verbose) {
				console.log('Alert Initialized');
			}
		},

		create: function(text, type) {
			var overlay = o('<div>'),
				dialog = o('<div>'),
				// drag = o('<i>'),
				close = o('<i>');

			overlay.attr('id', 'alert-overlay');
			overlay.on('click', atheos.alert.unload);

			dialog.attr('id', 'alert-dialog');

			close.addClass('close fas fa-times-circle');
			close.on('click', atheos.alert.unload);

			// drag.addClass('drag fas fa-arrows-alt');
			// drag.on('mousedown', function() {
			// 	drag.addClass('active');
			// 	modal.drag(wrapper);
			// }, false);

			dialog.append(close);
			// dialog.append(drag);
			// overlay.append(dialog);

			document.body.appendChild(overlay.el);
			document.body.appendChild(dialog.el);
			return overlay;
		},

		show: function(options) {
			if (options && typeof options === 'object') {
				var alert = this;
				var overlay = o('#alert-overlay') || this.create(),
					dialog = o('#alert-dialog');

				overlay.css({
					'display': 'block'
				});

				dialog.css({
					'display': 'block'
				});

				if (options.banner) {
					dialog.append(document.createElement('h1'));
					dialog.find('h1').text(i18n(options.banner));
				}
				if (options.message) {
					dialog.append(document.createElement('h2'));
					dialog.find('h2').text(i18n(options.message));
				}
				if (options.data) {
					dialog.append(document.createElement('pre'));
					dialog.find('pre').text(i18n(options.data));
				}
				if (options.actions || (options.positive && options.negative)) {
					var actions = o('<div>');
					actions.addClass('actions');
					dialog.append(actions);

					if (options.actions) {
						options.actions.forEach(function(action) {
							let button = document.createElement('button');
							button.innerText = i18n(action.message);
							button.addEventListener('click', function() {
								action.fnc();
								alert.unload();
							});
							actions.append(button);
						});
					} else {
						var positive = document.createElement('button');
						var negative = document.createElement('button');

						positive.innerText = i18n(options.positive.message);
						negative.innerText = i18n(options.negative.message);

						positive.addEventListener('click', function() {
							options.positive.fnc();
							alert.unload();

						});
						negative.addEventListener('click', function() {
							options.negative.fnc();
							alert.unload();
						});
						actions.append(positive);
						actions.append(negative);
					}
				}
			}
		},
		unload: function() {
			var overlay = o('#alert-overlay');
			var dialog = o('#alert-dialog');
			if (overlay && overlay) {
				dialog.innerHTML = '';
				dialog.style.display = 'none';
				overlay.style.display = 'none';
			}
		}
	};
})(this);