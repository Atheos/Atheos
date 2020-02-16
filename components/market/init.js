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
		ajax = global.ajax,
		o = global.onyx;

	amplify.subscribe('atheos.loaded', function() {
		atheos.market.init();
	});

	atheos.market = {

		controller: 'components/market/controller.php',
		dialog: 'components/market/dialog.php',

		init: function() {},

		//////////////////////////////////////////////////////////////////
		// Open marketplace
		//////////////////////////////////////////////////////////////////

		list: function(type, note) {
			atheos.modal.load(800, this.dialog + '?action=list&type=' + type + '&note=' + note);
		},

		//////////////////////////////////////////////////////////////////
		// Search marketplace
		//////////////////////////////////////////////////////////////////

		search: function(e, query, note) {
			var key = e.charCode || e.keyCode || e.which;
			if (query !== '' && key == 13) {
				atheos.modal.load(800, this.dialog + '?action=list&note=' + note + '&type=undefined&query=' + query);
			}
		},

		//////////////////////////////////////////////////////////////////
		// Open in browser
		//////////////////////////////////////////////////////////////////                

		openInBrowser: function(path) {
			window.open(path, '_newtab');
		},

		//////////////////////////////////////////////////////////////////
		// Install
		//////////////////////////////////////////////////////////////////

		install: function(page, type, name, repo) {
			var market = this;
			if (repo !== '') {
				o('#modal_content').html('<div id="modal-loading"></div><div align="center">Installing ' + name + '...</div><br>');
				ajax({
					url: this.controller + '?action=install&type=' + type + '&name=' + name + '&repo=' + repo,
					success: function(data) {
						var response = atheos.jsend.parse(data);
						if (response == 'error') {
							atheos.toast.error(response.message);
						}
						market.list(page, true);
					}
				});
			} else {
				atheos.toast.error('No Repository URL');
			}
		},

		//////////////////////////////////////////////////////////////////
		// Remove
		//////////////////////////////////////////////////////////////////

		remove: function(page, type, name) {
			var market = this;
			o('#modal_content').html('<div id="modal-loading"></div><div align="center">Deleting ' + name + '...</div><br>');
			ajax({
				url: this.controller + '?action=remove&type=' + type + '&name=' + name,
				success: function(data) {
					var response = atheos.jsend.parse(data);
					if (response == 'error') {
						atheos.toast.error(response.message);
					}
					market.list(page, true);
				}
			});
		},

		//////////////////////////////////////////////////////////////////
		// Update
		//////////////////////////////////////////////////////////////////

		update: function(page, type, name) {
			var market = this;
			o('#modal_content').html('<div id="modal-loading"></div><div align="center">Updating ' + name + '...</div><br>');
			ajax({
				url: this.controller + '?action=update&type=' + type + '&name=' + name,
				success: function(data) {
					var response = atheos.jsend.parse(data);
					if (response == 'error') {
						atheos.toast.error(response.message);
					}
					market.list(page, false);
				}
			});
		},
	};
})(this);