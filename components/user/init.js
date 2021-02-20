//////////////////////////////////////////////////////////////////////////////80
// User Init
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

	carbon.subscribe('system.loadMinor', () => atheos.user.init());

	atheos.user = {

		loginForm: oX('#login'),
		controller: 'components/user/controller.php',

		//////////////////////////////////////////////////////////////////////80
		// Initilization
		//////////////////////////////////////////////////////////////////////80
		init: function() {
			self = this;

			if (self.loginForm) {
				self.loginForm.on('submit', function(e) {
					e.preventDefault();

					if (oX('#remember').prop('checked')) {
						// Save Username
						atheos.storage('username', oX('#username').value());
						atheos.storage('remember', true);
					} else {
						atheos.storage('username', false);
						atheos.storage('remember', false);

						oX('#password').focus();
					}

					// Save Language
					atheos.storage('language', oX('#language').value());
					// Save Theme
					atheos.storage('editor.theme', oX('#theme').value());

					self.authenticate();
				});

				var element;

				var username = atheos.storage('username');
				var remember = atheos.storage('remember');
				if (username && remember) {
					element = oX('#username');
					oX('#username').value(username);
					oX('#remember').prop('checked', true);

					oX('#password').focus();
				}


				// Get Theme
				var theme = atheos.storage('theme');
				element = oX('#theme');
				if (element && element.findAll('option').length > 1) {
					element.findAll('option').forEach(function(option) {
						if (option.value() === theme) {
							option.attr('selected', 'selected');
						}
					});
				}

				// Get Language
				var language = atheos.storage('language');
				element = oX('#language');
				if (element && element.findAll('option').length > 1) {
					element.findAll('option').forEach(function(option) {
						if (option.value() === language) {
							option.attr('selected', 'selected');
						}
					});
				}

				// More Selector
				oX('#show_login_options').on('click', function(e) {
					e.preventDefault();
					oX(e.target).hide();
					oX('#hide_login_options').show('inline-block');
					oX('#login_options').show();
				});
				oX('#hide_login_options').on('click', function(e) {
					e.preventDefault();
					oX(e.target).hide();
					oX('#show_login_options').show('inline-block');
					oX('#login_options').hide();
				});
			}

			carbon.subscribe('chrono.mega', function() {
				// Run controller to check session (also acts as keep-alive) & Check user
				echo({
					url: atheos.controller,
					data: {
						'target': 'user',
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
			var data = serializeForm(self.loginForm.el);
			if (data.password === '' || data.username === '') {
				atheos.toast.show('notice', 'Username/Password not provided.');
				return;
			}
			data.target = 'user';
			data.action = 'authenticate';
			echo({
				url: atheos.controller,
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
					echo({
						url: atheos.controller,
						data: {
							target: 'user',
							action: 'changePassword',
							username: username,
							password: password
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

			atheos.modal.load(400, {
				target: 'user',
				action: 'changePassword',
				username,
				listener
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
					echo({
						url: atheos.controller,
						data: {
							target: 'user',
							action: 'create',
							username: username,
							password: password
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

			atheos.modal.load(400, {
				target: 'user',
				action: 'create',
				listener
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Delete User
		//////////////////////////////////////////////////////////////////////80
		delete: function(username) {
			var listener = function(e) {
				e.preventDefault();

				echo({
					url: atheos.controller,
					data: {
						target: 'user',
						action: 'delete',
						username: username
					},
					success: function(reply) {
						if (reply.status !== 'error') {
							atheos.toast.show('success', 'Account Deleted');
							self.list();
						}
					}
				});
			};

			atheos.modal.load(400, {
				target: 'user',
				action: 'delete',
				username,
				listener
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Open the user manager dialog
		//////////////////////////////////////////////////////////////////////80
		list: function() {
			atheos.modal.load(400, {
				target: 'user',
				action: 'list'
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Logout
		//////////////////////////////////////////////////////////////////////80
		logout: function() {
			var postLogout = function() {
				carbon.publish('user.logout');
				atheos.settings.save();
				echo({
					url: atheos.controller,
					data: {
						target: 'user',
						action: 'logout'
					},
					success: function() {
						window.location.reload();
					}
				});
			};

			var changedTabs = atheos.active.unsavedChanges();
			if (changedTabs) {
				atheos.active.focus(changedTabs[0]);
				var changes = '';
				changedTabs.forEach(function(path, i) {
					changes += pathinfo(path).basename + '\n';
				});

				var dialog = {
					banner: 'You have unsaved changes.',
					data: changes,
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
		saveActiveProject: function(name, path) {
			echo({
				url: atheos.controller,
				data: {
					target: 'user',
					action: 'saveActiveProject',
					name,
					path
				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Set Project Access
		//////////////////////////////////////////////////////////////////////80
		showUserACL: function(username) {
			var listener = function(e) {
				e.preventDefault();

				var data = serializeForm(e.target);
				data.target = 'user';
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
					echo({
						url: atheos.controller,
						data: data,
						settled: function(status, reply) {
							atheos.toast.show(status, reply.text);
							if (status !== 'error') {
								atheos.modal.unload();
							}
						}
					});
				}
			};

			atheos.modal.load(400, {
				target: 'user',
				action: 'showUserACL',
				username,
				listener
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