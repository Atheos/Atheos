//////////////////////////////////////////////////////////////////////////////80
// Confirm: User Action Required
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

	var core = global.codiad;

	core.confirm = {

		icons: {
			'error': 'exclamation-circle',
			'notice': 'info-circle',
			'success': 'check-circle',
			'warning': 'exclamation-triangle'
		},
		init: function() {}, 

		createConfirm: function(text, type) {
			var overlay = document.createElement('div'),
				dialog = document.createElement('div'),
				actions = document.createElement('div');

			overlay.id = 'confirm-overlay';
			dialog.id = 'confirm-dialog';

			actions.classList.add('actions');

			dialog.appendChild(document.createElement('h2'));
			dialog.appendChild(actions);

			// Insert it to the page
			overlay.appendChild(dialog);
			document.body.appendChild(overlay);
			return overlay;
		},

		showConfirm: function(options) {
			// if (!options) {
			// 	options = {
			// 		message: "Are you sure you want to do this?",
			// 		confirm: {
			// 			message: "Yes",
			// 			fnc: function() {
			// 				console.log('Success');
			// 			}
			// 		},
			// 		deny: {
			// 			message: "No",
			// 			fnc: function() {
			// 				console.log('Fail');
			// 			}
			// 		}
			// 	};
			// }

			if (options && typeof options === 'object') {
				// declare variables
				var overlay = document.querySelector('#confirm-overlay') || this.createConfirm(),
					dialog = overlay.querySelector('#confirm-dialog'),
					message = dialog.querySelector('h2'),
					actions = dialog.querySelector('.actions');

				overlay.style.display = 'block';

				if (options.message) {
					message.innerText = options.message;
				}
				var confirm = document.createElement('button');
				var deny = document.createElement('button');

				confirm.innerText = options.confirm.message;
				deny.innerText = options.deny.message;

				confirm.addEventListener('click', function() {
					options.confirm.fnc();
					overlay.style.display = 'none';

				});
				deny.addEventListener('click', function() {
					options.deny.fnc();
					overlay.style.display = 'none';

				});
				actions.innerHTML = '';
				actions.appendChild(confirm);
				actions.appendChild(deny);

				// if (options.actions) {
				// 	options.actions.forEach(function(action) {
				// 		let button = document.createElement('button');
				// 		button.innerText = action.message;
				// 		button.addEventListener('click', function() {
				// 			action.fnc();
				// 		});
				// 		actions.appendChild(button);
				// 	});
				// }

			}
		}
	};
})(this);