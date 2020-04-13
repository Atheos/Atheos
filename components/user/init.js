//////////////////////////////////////////////////////////////////////////////80
// User
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';
	var user = null;

	var atheos = global.atheos,
		ajax = global.ajax,
		amplify = global.amplify,
		i18n = global.i18n,
		oX = global.onyx;


	amplify.subscribe('atheos.loaded', () => atheos.user.init());


	atheos.user = {

		loginForm: oX('#login'),
		controller: 'components/user/controller.php',
		dialog: 'components/user/dialog.php',

		//////////////////////////////////////////////////////////////////
		// Initilization
		//////////////////////////////////////////////////////////////////

		init: function() {
			user = this;

			if (user.loginForm) {
				user.loginForm.on('submit', function(e) {
					e.preventDefault();
					// Save Language
					atheos.storage('language', oX('#language').value());
					// Save Theme
					atheos.storage('editor.theme', oX('#theme').value());
					user.authenticate();
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
					success: function(data) {
						if (data.debug) {
							console.log(data.debug);
						}
						if (data.pass === 'false') {
							atheos.user.logout();
						}
					}
				});
			});

		},

		//////////////////////////////////////////////////////////////////
		// Authenticate User
		//////////////////////////////////////////////////////////////////

		authenticate: function() {
			var data = atheos.common.serializeForm(user.loginForm.el);
			data.action = 'authenticate';
			ajax({
				url: user.controller,
				data: data,
				success: function(data) {
					if (data.status !== 'error') {
						window.location.reload();
					} else {
						atheos.toast.show(data);

					}
				}
			});
		},

		//////////////////////////////////////////////////////////////////
		// Logout
		//////////////////////////////////////////////////////////////////

		logout: function() {
			var postLogout = function() {
				amplify.publish('user.logout');
				atheos.settings.save();
				ajax({
					url: user.controller,
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
					var fileName = atheos.common.splitDirectoryAndFileName(path).fileName;
					changedTabs += fileName + '\n';
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

		//////////////////////////////////////////////////////////////////
		// Open the user manager dialog
		//////////////////////////////////////////////////////////////////
		list: function() {
			atheos.modal.load(400, this.dialog + '?action=list');
		},

		//////////////////////////////////////////////////////////////////
		// Create User
		//////////////////////////////////////////////////////////////////
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
						url: user.controller,
						data: {
							'action': 'create',
							'username': username,
							'password': password
						},
						success: function(data) {
							if (data.status !== 'error') {
								atheos.toast.show('success', 'User Account Created');
								user.list();
							}
						}
					});
				}
			};
			amplify.subscribe('modal.loaded', function() {
				oX('#modal_content form').on('submit', listener);
			});
			atheos.modal.load(400, this.dialog + '?action=create');
		},

		//////////////////////////////////////////////////////////////////
		// Delete User
		//////////////////////////////////////////////////////////////////
		delete: function(username) {
			var listener = function(e) {
				e.preventDefault();
				var username = oX('#modal-content form input[name="username"]').value();
				ajax({
					url: user.controller,
					data: {
						'action': 'delete',
						'username': username
					},
					success: function(data) {
						if (data.status !== 'error') {
							atheos.toast.show('success', 'Account Deleted');
							user.list();
						}
					}
				});
			};

			amplify.subscribe('modal.loaded', function() {
				oX('#modal_content form').on('submit', listener);
			});
			atheos.modal.load(400, this.dialog + '?action=delete&username=' + username);

		},

		//////////////////////////////////////////////////////////////////
		// Set Project Access
		//////////////////////////////////////////////////////////////////
		showUserACL: function(username) {
			var listener = function(e) {
				e.preventDefault();

				var data = atheos.common.serializeForm(oX('#modal_content form').el);
				data.action = 'changeUserACL';

				if (data.acl === 'false') {
					data.project = 'full';
				}

				// Check and make sure if access level not full that at least on project is selected
				if (data.acl === 'true' && !data.project) {
					atheos.toast.show('error', 'At Least One Project Must Be Selected');
				} else {
					ajax({
						url: user.controller,
						data: data,
						success: function(data) {
							atheos.modal.unload();
						}
					});
				}
			};

			amplify.subscribe('modal.loaded', function() {
				oX('#modal_content form').on('submit', listener);
			});
			atheos.modal.load(400, user.dialog + '?action=projects&username=' + username);
		},

		//////////////////////////////////////////////////////////////////
		// Show/Hide Project List in ACL dialog
		//////////////////////////////////////////////////////////////////
		toggleACL: function(e) {
			var aclSelect = oX('#aclSelect');
			if (aclSelect) {
				var projectSelect = oX('#projectSelect').el;
				var direction = aclSelect.value() === 'false' ? 'close' : 'open';
				atheos.ux.slide(direction, projectSelect, 300);
			}
		},

		//////////////////////////////////////////////////////////////////
		// Change Password
		//////////////////////////////////////////////////////////////////
		changePassword: function(username) {
			var listener = function(e) {
				e.preventDefault();
				var username = oX('#modal_content form input[name="username"]').value();
				var password1 = oX('#modal_content form input[name="password1"]').value();
				var password2 = oX('#modal_content form input[name="password2"]').value();

				var password = password1 === password2 ? password1 : false;


				if (!password) {
					atheos.toast.show('error', 'Passwords Do Not Match');
				} else {
					ajax({
						url: user.controller,
						data: {
							'action': 'password',
							'username': username,
							'password': password
						},
						success: function(data) {
							if (data.status !== 'error') {
								atheos.toast.show('success', 'Password Changed');
								atheos.modal.unload();
							}
						}
					});
				}
			};

			amplify.subscribe('modal.loaded', function() {
				oX('#modal_content form').on('submit', listener);
			});
			atheos.modal.load(400, user.dialog + '?action=password&username=' + username);

		},

		//////////////////////////////////////////////////////////////////
		// Save active project to server
		//////////////////////////////////////////////////////////////////
		saveActiveProject: function(project) {
			ajax({
				url: this.controller,
				data: {
					action: 'saveActiveProject',
					activeProject: project
				}
			});
		}
	};

})(this);