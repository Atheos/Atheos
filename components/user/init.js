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
		o = global.onyx;


	amplify.subscribe('atheos.loaded', function(settings) {
		atheos.user.init();
	});

	atheos.user = {

		loginForm: o('#login'),
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
					atheos.storage.set('language', o('#language').value());
					// Save Theme
					atheos.storage.set('theme', o('#theme').value());
					user.authenticate();
				});
			}
			// Get Theme
			var theme = atheos.storage.get('theme');
			$('#theme option').each(function() {
				if ($(this).val() === theme) {
					$(this).attr('selected', 'selected');
				}
			});

			// Get Language
			var language = atheos.storage.get('language');
			$('#language option').each(function() {
				if ($(this).val() === language) {
					$(this).attr('selected', 'selected');
				}
			});

			// More Selector
			$('.show-language-selector').click(function() {
				$(this).hide();
				$('.language-selector').animate({
					height: 'toggle'
				}, 'fast');
			});

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
				data: atheos.helpers.serializeForm(this.loginForm.el),
				success: function(response) {
					console.log(response);
					response = JSON.parse(response);
					if (response.status !== 'error') {
						window.location.reload();
					}
				}
			});
		},

		//////////////////////////////////////////////////////////////////
		// Logout
		//////////////////////////////////////////////////////////////////

		logout: function() {
			var forcelogout = true;
			if ($('#list-active-files li.changed').length > 0) {
				forcelogout = confirm(i18n('You have unsaved files.'));
			}
			if (forcelogout) {
				$('#list-active-files li.changed').each(function() {
					$(this).removeClass('changed');
				});
				amplify.publish('user.logout', {});
				atheos.settings.save();
				$.get(this.controller + '?action=logout', function() {
					window.location.reload();
				});
			}
		},

		//////////////////////////////////////////////////////////////////
		// Open the user manager dialog
		//////////////////////////////////////////////////////////////////

		list: function() {
			$('#modal_content form')
				.die('submit'); // Prevent form bubbling
			atheos.modal.load(400, this.dialog + '?action=list');
		},

		//////////////////////////////////////////////////////////////////
		// Create User
		//////////////////////////////////////////////////////////////////

		createNew: function() {
			var _this = this;
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
						$.post(_this.controller + '?action=create', {
							'username': username,
							'password': password1
						}, function(data) {
							var createResponse = atheos.jsend.parse(data);
							if (createResponse !== 'error') {
								atheos.toast.success(i18n('User Account Created'));
								_this.list();
							}
						});
					}
				});
		},

		//////////////////////////////////////////////////////////////////
		// Delete User
		//////////////////////////////////////////////////////////////////

		delete: function(username) {
			var _this = this;
			atheos.modal.load(400, this.dialog + '?action=delete&username=' + username);
			$('#modal_content form')
				.live('submit', function(e) {
					e.preventDefault();
					var username = $('#modal-content form input[name="username"]')
						.val();
					$.get(_this.controller + '?action=delete&username=' + username, function(data) {
						var deleteResponse = atheos.jsend.parse(data);
						if (deleteResponse !== 'error') {
							atheos.toast.success(i18n('Account Deleted'));
							_this.list();
						}
					});
				});
		},

		//////////////////////////////////////////////////////////////////
		// Set Project Access
		//////////////////////////////////////////////////////////////////

		projects: function(username) {
			atheos.modal.load(400, this.dialog + '?action=projects&username=' + username);
			var _this = this;
			$('#modal_content form')
				.live('submit', function(e) {
					e.preventDefault();
					var username = $('#modal_content form input[name="username"]')
						.val();
					var accessLevel = $('#modal_content form select[name="access_level"]')
						.val();
					var projects = [];
					$('input:checkbox[name="project"]:checked').each(function() {
						projects.push($(this).val());
					});
					if (accessLevel === 0) {
						projects = 0;
					}
					// Check and make sure if access level not full that at least on project is selected
					if (accessLevel === 1 && !projects) {
						atheos.toast.error(i18n('At Least One Project Must Be Selected'));
					} else {
						$.post(_this.controller + '?action=project_access&username=' + username, {
							projects: projects
						}, function(data) {
							var projectsResponse = atheos.jsend.parse(data);
							if (projectsResponse !== 'error') {
								atheos.toast.success(i18n('Account Modified'));
							}
						});
					}
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

		project: function(project) {
			$.get(this.controller + '?action=project&project=' + project);
		}

	};

})(this, jQuery);