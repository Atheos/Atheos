//////////////////////////////////////////////////////////////////////////////80
// Update Init
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';

	var atheos = global.atheos;

	var self = null;

	carbon.subscribe('system.loadExtra', () => atheos.update.init());

	atheos.update = {

		github: null,

		//////////////////////////////////////////////////////////////////////80
		// Initilization
		//////////////////////////////////////////////////////////////////////80
		init: function() {
			self = this;

			echo({
				url: atheos.controller,
				data: {
					target: 'update',
					action: 'init'
				},
				settled: function(status, reply) {
					if (status !== 'success') return;

					self.github = reply.github;

					if (reply.request) {
						self.loadLatest();
					}
				}
			});
		},

		//////////////////////////////////////////////////////////////////
		// Download Archive
		//////////////////////////////////////////////////////////////////
		download: function() {
			var archive = oX('#dialog form input[name="archive"]').value();
			oX('#download').attr('src', archive);
			echo({
				url: atheos.controller,
				data: {
					target: 'update',
					action: 'clear'
				}
			});
			atheos.modal.unload();
		},

		//////////////////////////////////////////////////////////////////
		// Update Check
		//////////////////////////////////////////////////////////////////
		check: function() {
			atheos.modal.load(500, {
				target: 'update',
				action: 'check'
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Load Latest from the Repo
		//////////////////////////////////////////////////////////////////////80
		loadLatest() {
			echo({
				url: self.github,
				settled: function(status, reply) {
					if (status === 'success') self.saveCache(reply);
				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Load Latest from the Repo
		//////////////////////////////////////////////////////////////////////80	
		saveCache: function(cache) {
			echo({
				url: atheos.controller,
				data: {
					target: 'update',
					action: 'saveCache',
					cache: JSON.stringify(cache)
				}
			});
		}
	};

})(this);