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
		ajax = global.ajax,
		amplify = global.amplify,
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

			ajax({
				url: self.controller,
				data: {
					action: 'init'
				},
				success: function(data) {
					self.local = data.local;
					self.home = data.remote;
					self.repo = data.github;

					self.loadLatest();
				}
			});
		},

		//////////////////////////////////////////////////////////////////
		// Download Archive
		//////////////////////////////////////////////////////////////////
		download: function() {
			var archive = oX('#modal_content form input[name="archive"]').value();
			oX('#download').attr('src', archive);
			ajax({
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
			var listener = function() {
				var form = oX('#modal_content form');
				if (form) {
					form.find('input[name="archive"').value(self.remote.zipball_url);
					form.find('input[name="remoteversion"').value(self.remote.tag_name);
					form.find('#remote_latest').text(self.remote.tag_name);
					form.find('#remote_body').text(self.remote.body);
				}
			};
			atheos.modal.load(500, self.dialog, {
				action: 'check'
			}, listener);
		},
		
		//////////////////////////////////////////////////////////////////////80
		// Load Latest from the Repo
		//////////////////////////////////////////////////////////////////////80
		loadLatest() {
			ajax({
				url: self.repo,
				success: function(reply) {
					self.remote = reply;
				}
			});
		}
	};

})(this);