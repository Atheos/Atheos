//////////////////////////////////////////////////////////////////////////////80
// Macro: Create custom quick actions
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @daeks, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';

	let example = {
		title: 'NameOfAction',
		icon: 'fas fa-code',
		type: 'File|Directory|Dialog',
		owner: 'USERNAME',
		users: [],
		action: 'FunctionToCall',
		arguments: 'ArguementsToPass',
		fTypes: []
	};

	const self = {
		//////////////////////////////////////////////////////////////////////80
		// Initilization
		//////////////////////////////////////////////////////////////////////80
		init: function() {
			self.load();

			fX('#modal.macros').on('change', function(e) {
				var target = oX(e.target);
				var tagName = target.el.tagName;
				var type = target.el.type;

				var key = target.attr('data-setting'),
					value;

				if (tagName === 'SELECT') {
					value = target.value();

				} else if (tagName === 'INPUT' && type === 'checkbox') {
					value = target.prop('checked');

				} else if (tagName === 'INPUT' && type === 'radio') {
					value = target.value();

				} else {
					return;
				}

				storage(key, value);
				self.save(key, value);
				self.publish(key, value);
			});

			fX('#modal_wrapper .macros menu').on('click', function(e) {
				var target = oX(e.target);
				var tagName = target.el.tagName;
				if (tagName === 'A') {
					self.showTab(target);
				}
			});

		},

		//////////////////////////////////////////////////////////////////////80
		// Load Macros
		//////////////////////////////////////////////////////////////////////80
		load: function() {
			echo({
				url: atheos.controller,
				data: {
					target: 'macro',
					action: 'load',
				},
				settled: function(status, reply) {
					log(status);
					if (status !== 'success') return;
					log(reply);
					for (var key in reply) {
						storage(key, reply[key]);
					}

				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Show Macro Menu
		//////////////////////////////////////////////////////////////////////80
		show: function() {
			atheos.modal.load(800, {
				target: 'macro',
				action: 'openDialog'
			});
		}
	};

	carbon.subscribe('system.loadMinor', () => self.init());
	atheos.macro = self;

})();