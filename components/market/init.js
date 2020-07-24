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
		oX = global.onyx;

	amplify.subscribe('system.loadMinor', () => atheos.market.init());

	var self = null;

	atheos.market = {

		home: null,
		cache: null,

		init: function() {
			self = this;

			echo({
				url: atheos.controller,
				data: {
					target: 'market',
					action: 'init'
				},
				success: function(reply) {
					if (reply.status === 'error') {
						return;
					}
					self.home = reply.market;

					if (reply.request) {
						self.loadMarket();
					}

				}
			});
		},

		loadMarket: function() {
			echo({
				url: self.home,
				success: function(reply) {
					self.saveCache(reply);
				}
			});
		},

		saveCache: function(cache) {
			echo({
				url: atheos.controller,
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

			atheos.modal.load(960, atheos.dialog, {
				target:'market',
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
				atheos.modal.load(800, atheos.dialog, {
				target:'market',action: 'list',
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
				url: atheos.controller,
				data: {
					target: 'market',
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
			atheos.modal.setLoadingScreen('Deleting ' + name + '...');
			echo({
				url: atheos.controller,
				data: {
					target: 'market',
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
			atheos.modal.setLoadingScreen('Updating ' + name + '...');

			echo({
				url: atheos.controller,
				data: {
					target: 'market',
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