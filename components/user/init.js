/*jshint esversion: 6 */

//////////////////////////////////////////////////////////////////////////////80
// User Init
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

	amplify.subscribe('system.loadMinor', () => atheos.user.init());

	atheos.user = {

		loginForm: oX('#login'),
		controller: 'components/user/controller.php',
		dialog: 'components/user/dialog.php',

		//////////////////////////////////////////////////////////////////////80
		// Initilization
		//////////////////////////////////////////////////////////////////////80
		init: function() {
			self = this;

			if (self.loginForm) {
				self.loginForm.on('submit', function(e) {
					e.preventDefault();
					// Save Language
					atheos.storage('language', oX('#language').value());
					// Save Theme
					atheos.storage('editor.theme', oX('#theme').value());
					self.authenticate();
				});


				// Get Theme
				var theme = atheos.storage('theme');
				var select = oX('#theme');
				if (select && select.findAll('option').length > 1) {
					select.findAll('option').forEach(function(option) {
						if (option.value() === theme) {
							option.attr('selected', 'selected');
						}
					});
				}

				// Get Language
				var language = atheos.storage('language');
				select = oX('#language');
				if (select && select.findAll('option').length > 1) {
					select.findAll('option').forEach(function(option) {
						if (option.value() === language) {
							option.attr('selected', 'selected');
						}
					});
				}

				// More Selector
				oX('#show_login_options').on('click', function(e) {
					oX(e.target).hide();
					oX('#login_options').show();
				});
			}

			amplify.subscribe('chrono.mega', function() {
				// Run controller to check session (also acts as keep-alive) & Check user
				ajax({
					url: atheos.user.controller,
					data: {
						'action': 'keepAlive'
					},
					success: function(reply) {
						if (reply.status === 'error') {
							atheos.user.logout();
						}
					}
				});
			});

		},

		//////////////////////////////////////////////////////////////////////80
		// Authenticate User
		//////////////////////////////////////////////////////////////////////80
		authenticate: function() {
			var data = atheos.common.serializeForm(self.loginForm.el);
			data.action = 'authenticate';
			ajax({
				url: self.controller,
				data: data,
				success: function(reply) {
					if (reply.status !== 'error') {
						window.location.reload();
					} else {
						atheos.toast.show(reply);

					}
				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Change Password
		//////////////////////////////////////////////////////////////////////80
		changePassword: function(username) {
			var listener = function(e) {
				e.preventDefault();

				var password1 = oX('#modal_content form input[name="password1"]').value();
				var password2 = oX('#modal_content form input[name="password2"]').value();
				var password = password1 === password2 ? password1 : false;

				if (!password) {
					atheos.toast.show('error', 'Passwords do not match.');
				} else {
					ajax({
						url: self.controller,
						data: {
							'action': 'changePassword',
							'username': username,
							'password': password
						},
						success: function(reply) {
							if (reply.status !== 'error') {
								atheos.toast.show('success', 'Password Changed');
								atheos.modal.unload();
							}
						}
					});
				}
			};

			atheos.modal.load(400, self.dialog, {
				action: 'changePassword',
				username
			}, () => {
				oX('#modal_content').on('submit', listener);
			});

		},

		//////////////////////////////////////////////////////////////////////80
		// Create User
		//////////////////////////////////////////////////////////////////////80
		create: function() {
			var listener = function(e) {
				e.preventDefault();

				var username = oX('#modal_content form input[name="username"]').value();
				var password1 = oX('#modal_content form input[name="password1"]').value();
				var password2 = oX('#modal_content form input[name="password2"]').value();

				var password = password1 === password2 ? password1 : false;

				// Check matching passwords
				if (!password) {
					atheos.toast.show('error', 'Passwords Do Not Match');
				}

				// Check no spaces in username
				if (!/^[a-z0-9]+$/i.test(username) || username.length === 0) {
					atheos.toast.show('error', 'Username Must Be Alphanumeric String');
					username = false;
				}
				if (password && username) {
					ajax({
						url: self.controller,
						data: {
							'action': 'create',
							'username': username,
							'password': password
						},
						success: function(reply) {
							if (reply.status !== 'error') {
								atheos.toast.show('success', 'User Account Created');
								self.list();
							}
						}
					});
				}
			};

			atheos.modal.load(400, self.dialog, {
				action: 'create',
			}, () => {
				oX('#modal_content').on('submit', listener);
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Delete User
		//////////////////////////////////////////////////////////////////////80
		delete: function(username) {
			var listener = function(e) {
				e.preventDefault();

				ajax({
					url: self.controller,
					data: {
						'action': 'delete',
						'username': username
					},
					success: function(reply) {
						if (reply.status !== 'error') {
							atheos.toast.show('success', 'Account Deleted');
							self.showUserList();
						}
					}
				});
			};

			atheos.modal.load(400, self.dialog, {
				action: 'delete',
				username
			}, () => {
				oX('#modal_content').on('submit', listener);
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Open the user manager dialog
		//////////////////////////////////////////////////////////////////////80
		list: function() {
			atheos.modal.load(400, self.dialog, {
				action: 'list'
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Logout
		//////////////////////////////////////////////////////////////////////80
		logout: function() {
			var postLogout = function() {
				amplify.publish('user.logout');
				atheos.settings.save();
				ajax({
					url: self.controller,
					data: {
						'action': 'logout'
					},
					success: function() {
						window.location.reload();
					}
				});
			};

			var changedTabs = '';

			for (var path in atheos.active.sessions) {
				if (atheos.active.sessions[path].status === 'changed') {
					var basename = pathinfo(path).basename;
					changedTabs += basename + '\n';
				}
			}

			if (changedTabs !== '') {
				var dialog = {
					banner: 'You have unsaved changes.',
					data: changedTabs,
					actions: {
						'Save All & Close': function() {
							atheos.active.saveAll();
							postLogout();
						},
						'Discard Changes': function() {
							for (var path in atheos.active.sessions) {
								atheos.active.sessions[path].status = 'current';
							}
							postLogout();
						},
						'Cancel': function() {
							// Cancel
						}
					}
				};
				atheos.alert.show(dialog);
			} else {
				postLogout();
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Save active project to server
		//////////////////////////////////////////////////////////////////////80
		saveActiveProject: function(project) {
			ajax({
				url: self.controller,
				data: {
					action: 'saveActiveProject',
					activeProject: project
				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Set Project Access
		//////////////////////////////////////////////////////////////////////80
		showUserACL: function(username) {
			var listener = function(e) {
				e.preventDefault();

				var data = atheos.common.serializeForm(e.target);
				data.action = 'updateACL';
				data.username = username;

				if (data.userACL !== 'full') {
					data.userACL = data.project;
				}

				delete data.project;

				// Check and make sure if access level not full that at least on project is selected
				if (data.userACL !== 'full' && data.userACL.length < 0) {
					atheos.toast.show('error', 'At least one project must be selected');
				} else {
					ajax({
						url: self.controller,
						data: data,
						success: function() {
							atheos.modal.unload();
						}
					});
				}
			};

			atheos.modal.load(400, self.dialog, {
				action: 'showUserACL',
				username
			}, () => {
				oX('#modal_content').on('submit', listener);
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Show/Hide Project List in ACL dialog
		//////////////////////////////////////////////////////////////////////80
		toggleACL: function(e) {
			var aclSelect = oX('#aclSelect');
			if (aclSelect) {
				var projectSelect = oX('#projectSelect').el;
				var direction = aclSelect.value() === 'full' ? 'close' : 'open';
				atheos.flow.slide(direction, projectSelect, 300);
			}
		}

	};

})(this);