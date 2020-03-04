/*
	*  Copyright (c) atheos & Kent Safranski (atheos.com), distributed
	*  as-is and without warranty under the MIT License. See
	*  [root]/license.txt for more. This information must remain intact.
	*/

(function(global, $) {

	var atheos = global.atheos,
		ajax = global.ajax,
		amplify = global.amplify,
		i18n = global.i18n,
		oX = global.onyx;


	amplify.subscribe('atheos.loaded', function(settings) {
		atheos.user.init();
	});

	atheos.user = {

		loginForm: oX('#login'),
		controller: 'components/user/controller.php',
		dialog: 'components/user/dialog.php',

		//////////////////////////////////////////////////////////////////
		// Initilization
		//////////////////////////////////////////////////////////////////

		init: function() {
			var user = this;

			if (user.loginForm) {
				user.loginForm.on('submit', function(e) {
					e.preventDefault();
					// Save Language
					atheos.storage('language', oX('#language').value());
					// Save Theme
					atheos.storage('theme', oX('#theme').value());
					user.authenticate();
				});


				// Get Theme
				var theme = atheos.storage('theme');
				var select = oX('#theme');
				if (select && select.find('option') > 1) {
					select.find('option').forEach(function(option) {
						if (option.value() === theme) {
							console.log('found');
							option.attr('selected', 'selected');
						}
					});
				}

				// Get Language
				var language = atheos.storage('language');
				select = oX('#language');
				if (select && select.find('option') > 1) {
					select.find('option').forEach(function(option) {
						if (option.value() === language) {
							console.log('found');
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
					url: atheos.user.controller + '?action=verify',
					success: function(data) {
						if (data === 'false') {
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
			ajax({
				url: this.controller + '?action=authenticate',
				type: 'post',
				data: atheos.common.serializeForm(this.loginForm.el),
				success: function(response) {
					response = JSON.parse(response);
					if (response.status !== 'error') {
						window.location.reload();
					} else {
						atheos.toast.error(response.message);

					}
				}
			});
		},

		//////////////////////////////////////////////////////////////////
		// Logout
		//////////////////////////////////////////////////////////////////

		logout: function() {
			var forcelogout = true;
			var unsaved = oX('#list-active-files').find('li.changed');
			if (unsaved.length > 0) {
				forcelogout = confirm(i18n('You have unsaved files.'));
			}
			if (forcelogout) {
				unsaved.forEach(function(changed) {
					changed.removeClass('changed');
				});

				amplify.publish('user.logout');
				atheos.settings.save();
				ajax({
					url: this.controller + '?action=logout',
					success: function() {
						window.location.reload();
					}
				});
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

		createNew: function() {
			var user = this;
			atheos.modal.load(400, this.dialog + '?action=create');
			$('#modal_content form')
				.live('submit', function(e) {
					e.preventDefault();
					var pass = true;
					var username = $('#modal_content form input[name="username"]')
						.val();
					var password1 = $('#modal_content form input[name="password1"]')
						.val();
					var password2 = $('#modal_content form input[name="password2"]')
						.val();

					// Check matching passwords
					if (password1 !== password2) {
						atheos.toast.error(i18n('Passwords Do Not Match'));
						pass = false;
					}

					// Check no spaces in username
					if (!/^[a-z0-9]+$/i.test(username) || username.length === 0) {
						atheos.toast.error(i18n('Username Must Be Alphanumeric String'));
						pass = false;
					}

					if (pass) {
						$.post(user.controller + '?action=create', {
							'username': username,
							'password': password1
						}, function(data) {
							var createResponse = atheos.jsend.parse(data);
							if (createResponse !== 'error') {
								atheos.toast.success(i18n('User Account Created'));
								user.list();
							}
						});
					}
				});
		},

		//////////////////////////////////////////////////////////////////
		// Delete User
		//////////////////////////////////////////////////////////////////

		delete: function(username) {
			var user = this;
			atheos.modal.load(400, this.dialog + '?action=delete&username=' + username);
			$('#modal_content form')
				.live('submit', function(e) {
					e.preventDefault();
					var username = $('#modal-content form input[name="username"]')
						.val();
					$.get(user.controller + '?action=delete&username=' + username, function(data) {
						var deleteResponse = atheos.jsend.parse(data);
						if (deleteResponse !== 'error') {
							atheos.toast.success(i18n('Account Deleted'));
							user.list();
						}
					});
				});
		},

		//////////////////////////////////////////////////////////////////
		// Set Project Access
		//////////////////////////////////////////////////////////////////

		showUserACL: function(username) {
			atheos.modal.load(400, this.dialog + '?action=projects&username=' + username);
			var user = this;

			atheos.modal.ready.then(function() {
				oX('#modal_content').on('submit', function(e) {
					e.preventDefault();

					data = atheos.common.serializeForm(oX('#modal_content form').el);
					data.action = 'setUserACL';

					if (data.access_level === 0) {
						data.projects = 0;
					}

					// Check and make sure if access level not full that at least on project is selected
					if (data.access_level === 1 && !projects) {
						atheos.toast.error(i18n('At Least One Project Must Be Selected'));
					} else {
						ajax({
							url: user.controller,
							type: 'post',
							data: data,
							success: function(data) {
								console.log(data);
								atheos.modal.unload();
							}
						});
					}

				});
			});

		},

		//////////////////////////////////////////////////////////////////
		// Change Password
		//////////////////////////////////////////////////////////////////

		password: function(username) {
			var _this = this;
			atheos.modal.load(400, this.dialog + '?action=password&username=' + username);
			$('#modal_content form')
				.live('submit', function(e) {
					e.preventDefault();
					var username = $('#modal_content form input[name="username"]')
						.val();
					var password1 = $('#modal_content form input[name="password1"]')
						.val();
					var password2 = $('#modal_content form input[name="password2"]')
						.val();
					if (password1 !== password2) {
						atheos.toast.error(i18n('Passwords Do Not Match'));
					} else {
						$.post(_this.controller + '?action=password', {
							'username': username,
							'password': password1
						}, function(data) {
							var passwordResponse = atheos.jsend.parse(data);
							if (passwordResponse !== 'error') {
								atheos.toast.success(i18n('Password Changed'));
								atheos.modal.unload();
							}
						});
					}
				});
		},

		//////////////////////////////////////////////////////////////////
		// Change Current Project
		//////////////////////////////////////////////////////////////////

		saveActiveProject: function(project) {
			ajax({
				url: this.controller,
				type: 'post',
				data: {
					action: 'saveActiveProject',
					project: project
				}
			});
		}
	};

})(this, jQuery);