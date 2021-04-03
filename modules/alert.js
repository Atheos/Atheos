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

(function() {
	'use strict';

	const node = {

		active: [],

		create: function() {
			var element = oX('<div>');
			element.attr('id', 'alert_' + node.active.length);
			document.body.appendChild(element.el);
			element.addClass('alert');
			node.active.push(element);
			return element;
		},

		show: function(options) {
			if (!options || typeof options !== 'object') return;
			atheos.common.showOverlay('alert');

			let element = node.create();

			element.show();

			if (options.banner) {
				element.append(document.createElement('h1'));
				element.find('h1').text(i18n(options.banner));
			}

			if (options.data) {
				element.append(document.createElement('pre'));
				element.find('pre').text(i18n(options.data));
			}

			if (options.message) {
				element.append(document.createElement('h2'));
				element.find('h2').text(i18n(options.message));
			}


			if (options.actions) {
				var actions = oX('<div>');
				actions.addClass('actions');
				element.append(actions);

				for (var key in options.actions) {
					let button = document.createElement('button');
					let callback = options.actions[key];
					button.innerText = i18n(key);
					button.addEventListener('click', function() {
						callback();
						node.unload(element);
					});
					actions.append(button);
				}
			}

			element.css({
				'top': '15%',
				'left': 'calc(50% - ' + (element.width() / 2) + 'px)',
			});

		},
		unload: function(element) {
			if (!element) return;
			element.remove();
			const index = node.active.indexOf(element);
			if (index > -1) node.active.splice(index, 1);
			if (node.active.length === 0) atheos.common.hideOverlay();
		},
		unloadAll: function() {
			atheos.common.hideOverlay();
			var i = node.active.length;

			while (--i >= 0) {
				let el = node.active[i];
				el.remove();
				node.active.splice(i, 1);
			}
		}
	};

	// window.alert = atheos.alert.show;
	atheos.alert = node;

})();