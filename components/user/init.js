//////////////////////////////////////////////////////////////////////////////80
// User Init
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';

	const self = {

		loginForm: null,

		//////////////////////////////////////////////////////////////////////80
		// Initilization
		//////////////////////////////////////////////////////////////////////80
		init: function() {
			self.loginForm = oX('#login');

			if (self.loginForm) {
				fX('#login').on('submit', function(e) {
					e.preventDefault();

					if (oX('#remember').prop('checked')) {
						// Save Username
						storage('username', oX('#username').value());
						storage('remember', true);
					} else {
						storage('username', false);
						storage('remember', false);

						oX('#password').focus();
					}

					// Save Language
					storage('language', oX('#language').value());

					self.authenticate(e.target);
				});

				let element;

				let username = storage('username'),
					remember = storage('remember'),
					language = storage('language');

				if (username && remember) {
					element = oX('#username');
					oX('#username').value(username);
					oX('#remember').prop('checked', true);
					oX('#password').focus();
				}

				// Get Language
				element = oX('#language');
				if (element.exists() && element.findAll('option').length > 1) {
					element.findAll('option').forEach(function(option) {
						if (option.value() === language) {
							option.attr('selected', 'selected');
						}
					});
				}

				// More Selector
				fX('#show_login_options').on('click', function(e) {
					e.preventDefault();
					oX(e.target).hide();
					oX('#hide_login_options').show('inline-block');
					oX('#login_options').show();
				});
				fX('#hide_login_options').on('click', function(e) {
					e.preventDefault();
					oX(e.target).hide();
					oX('#show_login_options').show('inline-block');
					oX('#login_options').hide();
				});

			} else {
				// Run controller to check session (also acts as keep-alive) & Check user
				carbon.subscribe('chrono.tera', function() {
					echo({
						data: {
							'target': 'user',
							'action': 'keepAlive'
						},
						settled: function(status, reply) {
							if (status !== 'success') {
								atheos.user.logout();
							}
						}
					});
				});
			}


			//////////////////////////////////////////////////////////////////80
			// Show/Hide Project List in ACL dialog
			//////////////////////////////////////////////////////////////////80
			fX('#aclSelect').on('change', function(e) {
				let aclSelect = oX(e.target),
					projectSelect = oX('#projectSelect').element,
					direction = aclSelect.value() === 'full' ? 'close' : 'open';
				atheos.flow.slide(direction, projectSelect, 300);
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Authenticate User
		//////////////////////////////////////////////////////////////////////80
		authenticate: function(form) {
			let data = serialize(form);
			if (data.password === '' || data.username === '') {
				return toast('notice', 'Username/Password not provided.');
			}
			data.target = 'user';
			data.action = 'authenticate';
			echo({
				data: data,
				settled: function(status, reply) {
					if (status === 'success') {
						window.location.reload();
					}
					toast(status, reply);
				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Change Password
		//////////////////////////////////////////////////////////////////////80
		changePassword: function(username) {
			let listener = function(e) {
				e.preventDefault();

				let data = serialize(e.target);
				let vPass = data.password === data.validate;

				if (!vPass) return toast('error', 'Passwords do not match.');

				echo({
					data: {
						target: 'user',
						action: 'changePassword',
						username: username,
						password: data.password
					},
					settled: function(status, reply) {
						toast(status, reply);
						if (status !== 'error') {
							atheos.modal.unload();
						}
					}
				});
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
			let listener = function(e) {
				e.preventDefault();

				let data = serialize(e.target);

				let vUser = !(/^[^A-Za-z0-9\-\_\@\.]+$/i.test(data.username)) && data.username.length !== 0,
					vPass = data.password === data.validate;

				if (!vUser) return toast('error', 'Username must be an alphanumeric string');
				if (!vPass) return toast('error', 'Passwords do not match.');

				echo({
					data: {
						target: 'user',
						action: 'create',
						username: data.username,
						password: data.password
					},
					settled: function(status, reply) {
						toast(status, reply);
						if (status !== 'error') {
							self.list();
						}
					}
				});
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
			let listener = function(e) {
				e.preventDefault();

				echo({
					data: {
						target: 'user',
						action: 'delete',
						username: username
					},
					settled: function(status, reply) {
						toast(status, reply);
						if (status !== 'error') {
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
			let postLogout = function() {
				carbon.publish('user.logout');
				atheos.settings.save();
				echo({
					data: {
						target: 'user',
						action: 'logout'
					},
					settled: function() {
						window.location.reload();
					}
				});
			};

			let changedTabs = atheos.active.unsavedChanges();
			if (changedTabs) {
				atheos.active.focus(changedTabs[0]);
				let changes = '';
				changedTabs.forEach(function(path, i) {
					changes += pathinfo(path).basename + '\n';
				});

				let dialog = {
					banner: 'You have unsaved changes.',
					data: changes,
					actions: {
						'Save All & Close': function() {
							atheos.active.saveAll();
							postLogout();
						},
						'Discard Changes': function() {
							for (let path in atheos.active.sessions) {
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
			let listener = function(e) {
				e.preventDefault();

				let data = serializeForm(e.target);
				data.target = 'user';
				data.action = 'updateACL';
				data.username = username;

				if (data.userACL !== 'full') {
					data.userACL = data.project;
				}

				delete data.project;

				// Check and make sure if access level not full that at least on project is selected
				if (data.userACL !== 'full' && data.userACL.length < 0) {
					toast('error', 'At least one project must be selected');
				} else {
					echo({
						data: data,
						settled: function(status, reply) {
							toast(status, reply);
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
		}
	};

	carbon.subscribe('system.loadMinor', () => self.init());
	atheos.user = self;

})();