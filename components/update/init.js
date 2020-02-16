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
		o = global.onyx;

	amplify.subscribe('atheos.loaded', function(settings) {
		atheos.update.init();
	});

	atheos.update = {

		controller: 'components/update/controller.php',
		dialog: 'components/update/dialog.php',
		home: 'https://www.atheos.io/update',
		repo: 'https://api.github.com/repos/Atheos/Atheos/releases/latest',
		local: '',

		//////////////////////////////////////////////////////////////////
		// Initilization
		//////////////////////////////////////////////////////////////////

		init: function() {
			var update = this;
			ajax({
				url: update.controller + '?action=init',
				success: function(data) {
					update.local = JSON.parse(data);
				}
			});
			ajax({
				url: update.repo,
				success: function(data) {
					update.remote = JSON.parse(data);
				}
			});
		},

		//////////////////////////////////////////////////////////////////
		// Update Check
		//////////////////////////////////////////////////////////////////

		check: function() {
			atheos.modal.load(500, this.dialog + '?action=check');
		},

		//////////////////////////////////////////////////////////////////
		// Download Archive
		//////////////////////////////////////////////////////////////////

		download: function() {
			var archive = $('#modal_content form input[name="archive"]').val();
			o('#download').attr('src', archive);
			ajax({
				url: this.controller + '?action=clear',
			});
			atheos.modal.unload();
		}

	};

})(this);