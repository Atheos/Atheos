//////////////////////////////////////////////////////////////////////////////80
// Install Init
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';

	var atheos = global.atheos;
	var self = null;

	atheos.install = {

		form: oX('#install'),

		//////////////////////////////////////////////////////////////////
		// Initilization
		//////////////////////////////////////////////////////////////////

		init: function() {
			fX('#retest').on('click', () => window.location.reload());
			
			self = this;
			if (!self.form) return;
			
			atheos.toast.init();

			let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
				option = oX('select[name="timezone"] option[value="' + timezone + '"]');
			if (option) option.attr('selected', 'selected');


			self.form.on('submit', self.checkForm);
		},

		checkForm: function(e) {
			e.preventDefault();

			let data = serialize(e.target);

			let vUser = !(/^[^A-Za-z0-9\-\_\@\.]+$/i.test(data.username)) && data.username.length !== 0,
				vPass = data.password === data.validate;

			if (!vUser) return toast('error', 'Username must be an alphanumeric string');
			if (!vPass) return toast('error', 'Passwords do not match.');

			if (data.projectName.length === 0) return toast('error', 'Missing Project Name.');
			if (data.projectPath.length === 0) return toast('error', 'Missing Project Path.');

			// Check Path
			if (data.projectPath.indexOf('/') === 0) {
				let dialog = {
					banner: 'Do you really want to create project with an absolute path?',
					data: data.projectPath,
					actions: {
						'Yes': function(data) {
							self.install();
						},
						'No': function() {}
					}
				};
				atheos.alert.show(dialog);
			} else {
				self.install(data);
			}
		},

		install: function(data) {
			echo({
				url: 'components/install/process.php',
				data,
				settled: function(status, reply) {
					if (status === 'success') {
						window.location.reload();
					} else {
						var dialog = {
							banner: 'An error occurred:',
							data: reply.text,
							actions: {
								'Okay': function() {}
							}
						};
						atheos.alert.show(dialog);
					}
				}
			});
		},
	};

})(this);