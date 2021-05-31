//////////////////////////////////////////////////////////////////////////////80
// Install Init
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';

	var self = false;

	atheos.install = {

		//////////////////////////////////////////////////////////////////////80
		// Initilization
		//////////////////////////////////////////////////////////////////////80
		init: function() {
			fX('#retest').on('click', () => window.location.reload());

			if (self) return;
			self = this;

			let form = oX('#install');
			if (!form) return;

			let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
				option = oX('select[name="timezone"] option[value="' + timezone + '"]');
			if (option) option.attr('selected', 'selected');

			form.on('submit', self.checkForm);
		},

		checkForm: function(e) {
			e.preventDefault();

			let fData = serialize(e.target);

			let vUser = !(/^[^A-Za-z0-9\-\_\@\.]+$/i.test(fData.username)) && fData.username.length !== 0,
				vPass = fData.password === fData.validate;

			if (!vUser) return toast('error', 'Username must be an alphanumeric string');
			if (!vPass) return toast('error', 'Passwords do not match.');

			if (fData.projectName.length === 0) return toast('error', 'Missing Project Name.');
			if (fData.projectPath.length === 0) return toast('error', 'Missing Project Path.');

			// Check Path
			if (fData.projectPath.indexOf('/') === 0) {
				let dialog = {
					banner: 'Do you really want to create project with an absolute path?',
					data: fData.projectPath,
					actions: {
						'Yes': function() {
							self.install(fData);
						},
						'No': function() {}
					}
				};
				atheos.alert.show(dialog);
			} else {
				self.install(fData);
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Post install data
		//////////////////////////////////////////////////////////////////////80
		install: function(data) {
			echo({
				url: 'components/install/process.php',
				data,
				settled: function(status, reply) {
					log(status,reply);
					if (status === 'success') {
						setTimeout(() => window.location.reload(), 100);
						toast(status, reply);
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

})();