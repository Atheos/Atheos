/*jshint esversion: 6 */

//////////////////////////////////////////////////////////////////////////////80
// Install Init
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
		echo = global.echo;

	var self = null;

	atheos.install = {

		form: oX('#install'),
		controller: 'components/user/controller.php',
		dialog: 'components/user/dialog.php',

		//////////////////////////////////////////////////////////////////
		// Initilization
		//////////////////////////////////////////////////////////////////

		init: function() {
			self = this;
			if (!self.form) {
				return;
			}
			// document.body.style.overflow = 'auto';

			var timezone = self.getTimeZone();
			oX('[name=timezone]').findAll('option').forEach(function(option) {
				if (option.text().indexOf(timezone) > -1) {
					option.attr('selected', 'selected');
				}
			});

			self.form.on('submit', self.checkForm);
		},

		checkForm: function(e) {
			e.preventDefault();

			// Check empty fields
			var emptyFields = self.form.findAll('input').filter((input) => {
				return (input.value() === '' && input.attr('name') !== 'path');
			});

			if (emptyFields.length > 0) {
				alert('All fields must be filled out.');
				return;
			}

			// Check password
			var passwordsMatch = oX('input[name="password"]').value() === oX('input[name="confirm"]').value();
			if (!passwordsMatch) {
				alert('Passwords do not match.');
				return;
			}

			// Check Path
			var projectPath = oX('input[name="projectPath"]').value();
			var absolutePath = projectPath.indexOf('/') === 0 ? true : false;

			if (absolutePath) {
				var dialog = {
					banner: 'Do you really want to create project with an absolute path?',
					data: projectPath,
					actions: {
						'Yes': function() {
							self.install();
						},
						'No': function() {}
					}
				};
				atheos.alert.show(dialog);
			} else {
				self.install();
			}
		},

		install: function() {
			var data = serializeForm(self.form.el);
			echo({
				url: 'components/install/process.php',
				data,
				success: function(reply) {
					if (reply === 'success') {
						window.location.reload();
					} else {
						var dialog = {
							banner: 'An error occurred:',
							data: reply,
							actions: {
								'Okay': function() {}
							}
						};
						atheos.alert.show(dialog);
					}
				}
			});
		},

		getTimeZone: function() {
			var num = new Date().getTimezoneOffset();
			if (num === 0) {
				return 'GMT';
			} else {
				var hours = Math.floor(num / 60);
				var minutes = Math.floor((num - (hours * 60)));

				if (hours < 10) {
					hours = '0' + Math.abs(hours);
				}
				if (minutes < 10) {
					minutes = '0' + Math.abs(minutes);
				}

				return 'GMT' + (num < 0 ? '+' : '-') + hours + ':' + minutes;
			}
		}
	};

})(this);