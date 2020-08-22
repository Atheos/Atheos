//////////////////////////////////////////////////////////////////////////////80
// Alert: User Action Required
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Notes: 
// https://codepen.io/tlongren/pen/pnkij?editors=0010asd
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

	var atheos = global.atheos;

	atheos.alert = {

		create: function(text, type) {
			var element = oX('<div>');
			element.attr('id', 'alert');
			document.body.appendChild(element.el);
			return element;
		},

		show: function(options) {
			if (!options || typeof options !== 'object') {
				return;
			}
			var alert = this;
			var overlay = atheos.common.createOverlay('alert'),
				element = oX('#alert') || this.create();

			overlay.show();
			element.show();

			if (options.banner) {
				element.append(document.createElement('h1'));
				element.find('h1').text(i18n(options.banner));
			}
			if (options.message) {
				element.append(document.createElement('h2'));
				element.find('h2').text(i18n(options.message));
			}
			if (options.data) {
				element.append(document.createElement('pre'));
				element.find('pre').text(i18n(options.data));
			}
			if (options.actions) {
				var actions = oX('<div>');
				actions.addClass('actions');
				element.append(actions);

				for (var key in options.actions) {
					let button = document.createElement('button');
					button.innerText = i18n(key);
					button.addEventListener('click', function() {
						options.actions[button.innerText]();
						button.remove();
						alert.unload();
					});
					actions.append(button);
				}
			}

			element.css({
				'top': '15%',
				'left': 'calc(50% - ' + (element.width() / 2) + 'px)',
			});

		},
		unload: function() {
			var overlay = oX('#overlay');
			var element = oX('#alert');
			if (overlay) {
				overlay.remove();
			}
			if (element) {
				element.empty();
				element.hide();
			}
		}
	};
})(this);