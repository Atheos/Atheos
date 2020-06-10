//////////////////////////////////////////////////////////////////////////////80
// Market
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Description: 
// The Market component handles all plugin related tasks. Not really much else
// to say about it without repeating myself.
//
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';

	var atheos = global.atheos,
		amplify = global.amplify,
		echo = global.echo,
		oX = global.onyx;

	amplify.subscribe('system.loadMinor', () => atheos.market.init());

	var self = null;

	atheos.market = {

		controller: 'components/market/controller.php',
		dialog: 'components/market/dialog.php',
		home: null,
		cache: null,
		addons: null,

		init: function() {
			self = this;

			var oneWeekAgo = Date.now() - (604800000);

			echo({
				url: self.controller,
				data: {
					action: 'init'
				},
				success: function(reply) {
					if (reply.status === 'error') {
						return;
					}
					self.home = reply.market;

					log(reply);

					if (reply.request) {
						self.loadMarket();
					}

				}
			});
		},

		loadMarket: function() {
			var cache;

			echo({
				url: self.home,
				success: function(reply) {
					self.saveCache(reply);
				}
			});
		},

		saveCache: function(cache) {
			echo({
				url: self.controller,
				data: {
					action: 'saveCache',
					cache: JSON.stringify(cache)
				}
			});
		},

		//////////////////////////////////////////////////////////////////
		// Open marketplace
		//////////////////////////////////////////////////////////////////

		list: function(type, note) {
			atheos.modal.load(1000, self.dialog, {
				action: 'list',
				type: type,
				note: note
			});

			var listener = function() {
				var manualRepo = oX('#manual_repo');

				oX('#manual_install').on('click', function(e) {
					e.preventDefault();
					if (manualRepo.value()) {
						// Install Manually
					}
				});

				manualRepo.on('keypress', function(e) {
					var keyCode = e.keyCode || e.which;
					if (keyCode === '13') {
						e.preventDefault();
						// Install Manually
					}
				});
			};

			// amplify.subscribe('modal.loaded', listener);
		},

		findAddon: function(name) {
			var addon = false;
			if (self.cache.hasOwnProperty(name)) {
				addon = self.cache[name];

			} else if (self.addons.hasOwnProperty(name)) {
				addon = self.addons[name];

			}
			return addon;
		},

		//////////////////////////////////////////////////////////////////
		// Search marketplace
		//////////////////////////////////////////////////////////////////
		search: function(e, query, note) {
			var key = e.charCode || e.keyCode || e.which;
			if (query !== '' && key === 13) {
				atheos.modal.load(800, self.dialog, {
					action: 'list',
					query: query,
					note: note
				});
			}
		},

		//////////////////////////////////////////////////////////////////
		// Install
		//////////////////////////////////////////////////////////////////
		install: function(name, type, category) {

			atheos.modal.setLoadingScreen('Installing ' + name + '...');

			echo({
				url: self.controller,
				data: {
					action: 'install',
					name,
					type,
					category
				},
				success: function(reply) {
					atheos.toast.show(reply);
					atheos.market.list();
				}
			});

		},

		//////////////////////////////////////////////////////////////////
		// Remove
		//////////////////////////////////////////////////////////////////
		remove: function(name, type, category) {
			var addon = self.findAddon(name);
			if (!addon) {
				atheos.toast.show('error', 'No Repository URL');
				return;
			}

			atheos.modal.setLoadingScreen('Deleting ' + name + '...');
			echo({
				url: self.controller,
				data: {
					action: 'remove',
					name,
					type
				},
				success: function(reply) {
					atheos.toast.show(reply);
					atheos.market.list();
				}
			});
		},

		//////////////////////////////////////////////////////////////////
		// Update
		//////////////////////////////////////////////////////////////////
		update: function(name, type, category) {
			var addon = self.findAddon(name);
			if (!addon) {
				atheos.toast.show('error', 'No Repository URL');
				return;
			}

			atheos.modal.setLoadingScreen('Updating ' + name + '...');

			echo({
				url: self.controller,
				data: {
					action: 'update',
					name,
					type,
					category
				},
				success: function(reply) {
					atheos.toast.show(reply);
					atheos.market.list();

				}
			});
		},
	};
})(this);