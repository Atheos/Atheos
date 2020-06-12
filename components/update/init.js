/*jshint esversion: 6 */

//////////////////////////////////////////////////////////////////////////////80
// Update Init
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';

	var atheos = global.atheos,
		amplify = global.amplify,
		echo = global.echo,
		oX = global.onyx;

	var self = null;

	amplify.subscribe('system.loadExtra', () => atheos.update.init());

	atheos.update = {

		controller: 'components/update/controller.php',
		dialog: 'components/update/dialog.php',
		home: null,
		repo: null,
		local: null,
		remote: null,

		//////////////////////////////////////////////////////////////////////80
		// Initilization
		//////////////////////////////////////////////////////////////////////80
		init: function() {
			self = this;

			echo({
				url: self.controller,
				data: {
					action: 'init'
				},
				success: function(reply) {
					if (reply.status === 'error') {
						return;
					}
					self.local = reply.local;
					self.home = reply.remote;
					self.repo = reply.github;

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
			var archive = oX('#modal_content form input[name="archive"]').value();
			oX('#download').attr('src', archive);
			echo({
				url: self.controller,
				data: {
					action: 'clear'
				}
			});
			atheos.modal.unload();
		},

		//////////////////////////////////////////////////////////////////
		// Update Check
		//////////////////////////////////////////////////////////////////
		check: function() {
			atheos.modal.load(500, self.dialog, {
				action: 'check'
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Load Latest from the Repo
		//////////////////////////////////////////////////////////////////////80
		loadLatest() {
			echo({
				url: self.repo,
				success: function(reply) {
					log(reply);
					self.saveCache(reply);
				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Load Latest from the Repo
		//////////////////////////////////////////////////////////////////////80	
		saveCache: function(cache) {
			echo({
				url: self.controller,
				data: {
					action: 'saveCache',
					cache: JSON.stringify(cache)
				}
			});
		}
	};

})(this);