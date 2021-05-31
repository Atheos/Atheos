//////////////////////////////////////////////////////////////////////////////80
// Market
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Description: 
// The Market component handles all plugin related tasks. Not really much else
// to say about it without repeating myself.
//
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';

	var atheos = global.atheos;

	carbon.subscribe('system.loadMinor', () => atheos.market.init());

	var self = null;

	atheos.market = {

		market: null,
		cache: null,

		init: function() {
			self = this;

			echo({
				data: {
					target: 'market',
					action: 'init'
				},
				settled: function(status, reply) {
					if (status !== 'success') return;

					self.market = reply.market;
					if (reply.request) {
						self.loadMarket();
					}
				}
			});
		},

		loadMarket: function() {
			echo({
				url: self.market,
				settled: function(success, reply) {
					self.saveCache(reply);
				}
			});
		},

		saveCache: function(cache) {
			echo({
				data: {
					target: 'market',
					action: 'saveCache',
					cache: JSON.stringify(cache)
				}
			});
		},

		//////////////////////////////////////////////////////////////////
		// Open marketplace
		//////////////////////////////////////////////////////////////////

		list: function(type, note) {
			var callback = function() {
				atheos.modal.resize();
			};

			atheos.modal.load(960, {
				target: 'market',
				action: 'list',
				type: type,
				note: note,
				callback
			});
		},

		//////////////////////////////////////////////////////////////////
		// Search marketplace
		//////////////////////////////////////////////////////////////////
		search: function(e, query, note) {
			var key = e.charCode || e.keyCode || e.which;
			if (query !== '' && key === 13) {
				atheos.modal.load(800, {
					target: 'market',
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
				data: {
					target: 'market',
					action: 'install',
					name,
					type,
					category
				},
				settled: function(status, reply) {
					atheos.toast.show(status, reply);
					atheos.market.list();
				}
			});

		},

		//////////////////////////////////////////////////////////////////
		// Remove
		//////////////////////////////////////////////////////////////////
		remove: function(name, type, category) {
			atheos.modal.setLoadingScreen('Deleting ' + name + '...');

			echo({
				data: {
					target: 'market',
					action: 'remove',
					name,
					type
				},
				settled: function(status, reply) {
					atheos.toast.show(status, reply);
					atheos.market.list();
				}
			});
		},

		//////////////////////////////////////////////////////////////////
		// Update
		//////////////////////////////////////////////////////////////////
		update: function(name, type, category) {
			atheos.modal.setLoadingScreen('Updating ' + name + '...');

			echo({
				data: {
					target: 'market',
					action: 'update',
					name,
					type,
					category
				},
				settled: function(status, reply) {
					atheos.toast.show(reply);
					atheos.market.list();

				}
			});
		},
	};
})(this);