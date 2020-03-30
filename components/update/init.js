//////////////////////////////////////////////////////////////////////////////80
// Update Init
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Description: 
// The Update component is used to check for Atheos updates, pinging the home
// server, as well as handling all client tracking/statistics.
//
//
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {

	var atheos = global.atheos,
		amplify = global.amplify,
		ajax = global.ajax,
		oX = global.onyx;

	amplify.subscribe('atheos.loaded', () => atheos.update.init());

	var self = null;

	atheos.update = {

		controller: 'components/update/controller.php',
		dialog: 'components/update/dialog.php',
		home: null,
		repo: null,
		local: null,
		remote: null,

		//////////////////////////////////////////////////////////////////
		// Initilization
		//////////////////////////////////////////////////////////////////

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

		loadLatest() {
			ajax({
				url: self.repo,
				success: function(data) {
					self.remote = data;
				}
			});
		},

		//////////////////////////////////////////////////////////////////
		// Update Check
		//////////////////////////////////////////////////////////////////

		check: function() {
			atheos.modal.load(500, self.dialog, {
				action: 'check'
			});

			var listener = function() {
				var form = oX('#modal_content form');
				if (form) {
					form.find('input[name="archive"')[0].value(self.remote.zipball_url);
					form.find('input[name="remoteversion"')[0].value(self.remote.tag_name);
					form.find('#remote_latest')[0].text(self.remote.tag_name);
					form.find('#remote_body')[0].text(self.remote.body);
				}
			};

			amplify.subscribe('modal.loaded', listener);
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
		}

	};

})(this);