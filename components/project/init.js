/*jshint esversion: 6 */

//////////////////////////////////////////////////////////////////////////////80
// Project
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function(global, $) {

	var atheos = global.atheos,
		ajax = global.ajax,
		amplify = global.amplify,
		i18n = global.i18n,
		oX = global.onyx;

	var self = null;

	amplify.subscribe('system.loadMinor', () => atheos.project.init());

	atheos.project = {

		controller: 'components/project/controller.php',
		dialog: 'components/project/dialog.php',

		//projectmanager
		sideExpanded: true,
		openTrigger: 'single',
		current: {
			name: '',
			path: ''
		},

		init: function() {
			self = this;

			self.loadCurrent();
			self.loadSide();

			var projectCreate = oX('#projects-create'),
				projectManage = oX('#projects-manage'),
				projectCollpse = oX('#projects-collapse');

			if (projectCreate) {
				projectCreate.on('click', function() {
					self.create('true');
				});
			}

			if (projectManage) {
				projectManage.on('click', function() {
					self.list();
				});
			}

			if (projectCollpse) {
				projectCollpse.on('click', function() {
					if (self.sideExpanded) {
						self.collapse();
					} else {
						self.expand();
					}
				});
			}

			amplify.subscribe('chrono.mega', function() {
				self.getCurrent();
			});

			amplify.subscribe('settings.loaded', function() {
				var local = atheos.storage('project.openTrigger');
				if (local === 'single' || local === 'double') {
					self.openTrigger = local;
				}
			});

			self.nodeListener();
		},

		nodeListener: function() {

			var nodeFunctions = (function(node) {
				node = oX(node);

				var tagName = node.el.tagName;

				if (tagName === 'UL') {
					return false;
				} else if (tagName !== 'LI') {
					node = node.parent();
				}
				self.open(node.attr('data-project'));

			}).bind(this);

			oX('#project_list .content').on('click', function(e) {
				if (self.openTrigger === 'single') {
					nodeFunctions(e.target);
				}
			});

			oX('#project_list .content').on('dblclick', function(e) {
				if (self.openTrigger === 'double') {
					nodeFunctions(e.target);
				}
			});

		},

		//////////////////////////////////////////////////////////////////
		// Get Current Project
		//////////////////////////////////////////////////////////////////

		loadCurrent: function() {
			var project = this;
			ajax({
				url: this.controller,
				data: {
					'action': 'load'
				},
				success: function(data) {
					atheos.toast.show(data, 'Project Loaded');
					if (data.status != 'error') {
						project.current = {
							name: data.name,
							path: data.path
						};
						oX('#file-manager').empty();
						oX('#file-manager').html(`<ul><li>
									<a id="project-root" data-type="root" data-path="${data.path}">
									<i class="root fa fa-folder medium-blue"></i>
									<span>${data.name}</span>
									</a>
								</li></ul>`);
						atheos.filemanager.openDir(data.path);
						atheos.user.saveActiveProject(data.path);
					}
				}
			});
		},

		//////////////////////////////////////////////////////////////////
		// Open Project
		//////////////////////////////////////////////////////////////////
		open: function(path) {
			var project = this;
			atheos.scout.hideFilter();
			ajax({
				url: this.controller + '?action=open&path=' + encodeURIComponent(path),
				success: function(data) {
					if (data.status !== 'error') {
						project.loadCurrent();
						if (atheos.modal.modalVisible) {
							atheos.modal.unload();
						}
						atheos.user.saveActiveProject(path);
						localStorage.removeItem('lastSearched');
						/* Notify listeners. */
						amplify.publish('project.onOpen', path);
					}
				}
			});
		},

		//////////////////////////////////////////////////////////////////
		// Open the project manager dialog
		//////////////////////////////////////////////////////////////////

		list: function() {
			atheos.modal.load(500, this.dialog + '?action=list');
		},

		//////////////////////////////////////////////////////////////////
		// Load and list projects in the sidebar.
		//////////////////////////////////////////////////////////////////
		loadSide: function() {
			ajax({
				url: this.dialog + '?action=sidelist',
				success: function(reply) {
					oX('#project_list .content').html(reply);
				}
			});
		},

		expand: function() {
			this.sideExpanded = true;
			oX('#sb_left #project_list').css('height', '');
			oX('#sb_left>.content').css('bottom', '');

			oX('#projects-collapse').replaceClass('fa-chevron-circle-up', 'fa-chevron-circle-down');
		},

		collapse: function() {
			this.sideExpanded = false;
			var height = oX('#sb_left #project_list .title').height();

			oX('#sb_left #project_list').css('height', height + 'px');
			oX('#sb_left>.content').css('bottom', height + 'px');

			oX('#projects-collapse').replaceClass('fa-chevron-circle-down', 'fa-chevron-circle-up');

		},

		//////////////////////////////////////////////////////////////////
		// Create Project
		//////////////////////////////////////////////////////////////////
		create: function(close) {

			var projectName, projectPath, gitRepo, gitBranch;

			var createProject = function() {
				var data = {
					action: 'create',
					projectName,
					projectPath,
					gitRepo,
					gitBranch
				};

				ajax({
					url: self.controller,
					data,
					success: function(reply) {
						if (reply.status !== 'error') {
							self.open(reply.path);
							self.loadSide();
							/* Notify listeners. */
							delete data.action;
							amplify.publish('project.create', data);
						}
					}
				});
			};

			var listener = function(e) {
				e.preventDefault();

				projectName = oX('#modal_content form input[name="project_name"]').value();
				projectPath = oX('#modal_content form input[name="project_path"]').value();
				gitRepo = oX('#modal_content form input[name="git_repo"]').value();
				gitBranch = oX('#modal_content form input[name="git_branch"]').value();


				if (projectPath.indexOf('/') === 0) {
					atheos.alert.show({
						banner: 'Do you really want to create a project with an absolute path?',
						data: projectPath,
						actions: {
							'Yes': function() {
								createProject();
							},
							'No': function() {}
						}
					});
				} else {
					createProject();
				}
			};

			amplify.subscribe('modal.loaded', function() {
				oX('#modal_content form').once('submit', listener);
			});
			atheos.modal.load(500, this.dialog + '?action=create&close=' + close);

		},

		//////////////////////////////////////////////////////////////////
		// Rename Project
		//////////////////////////////////////////////////////////////////

		rename: function(name, path) {
			atheos.modal.load(500, this.dialog + '?action=rename&path=' + encodeURIComponent(path) + '&name=' + name);

			var listener = function(e) {
				e.preventDefault();

				var projectPath = oX('#modal_content form input[name="project_path"]').value();
				var projectName = oX('#modal_content form input[name="project_name"]').value();

				var data = {
					action: 'rename',
					projectPath,
					projectName
				};

				ajax({
					url: self.controller,
					data,
					success: function(reply) {
						if (reply.status !== 'error') {
							atheos.toast.show('success', 'Project renamed');
							self.loadSide();
							atheos.modal.unload();
							/* Notify listeners. */
							delete data.action;
							amplify.publish('project.rename', data);
						}
					}
				});
			};

			amplify.subscribe('modal.loaded', function() {
				oX('#modal_content form').once('submit', listener);
			});
			atheos.modal.load(500, this.dialog + '?action=create&close=' + close);
		},

		//////////////////////////////////////////////////////////////////
		// Delete Project
		//////////////////////////////////////////////////////////////////

		delete: function(name, path) {
			var _this = this;
			atheos.modal.load(500, this.dialog + '?action=delete&name=' + encodeURIComponent(name) + '&path=' + encodeURIComponent(path));
			$('#modal_content form')
				.live('submit', function(e) {
					e.preventDefault();
					var projectPath = $('#modal_content form input[name="project_path"]')
						.val();
					var deletefiles = $('input:checkbox[name="delete"]:checked').val();
					var followlinks = $('input:checkbox[name="follow"]:checked').val();
					var action = '?action=delete';
					if (typeof deletefiles !== 'undefined') {
						if (typeof followlinks !== 'undefined') {
							action += '&follow=true&path=' + encodeURIComponent(projectPath);
						} else {
							action += '&path=' + encodeURIComponent(projectPath);
						}
					}
					$.get(atheos.filemanager.controller + action, function(d) {
						$.get(_this.controller + '?action=delete&project_path=' + encodeURIComponent(projectPath), function(data) {
							var deletedata = atheos.jsend.parse(data);
							if (deletedata !== 'error') {
								atheos.toast.show('success', 'Project Deleted');
								_this.list();
								_this.loadSide();
								// Remove any active files that may be open
								$('#active-files a')
									.each(function() {
										var curPath = $(this)
											.attr('data-path');
										if (curPath.indexOf(projectPath) === 0) {
											atheos.active.remove(curPath);
										}
									});
								/* Notify listeners. */
								amplify.publish('project.onDelete', {
									'path': projectPath,
									'name': name
								});
							}
						});
					});
				});
		},

		//////////////////////////////////////////////////////////////////
		// Check Absolute Path
		//////////////////////////////////////////////////////////////////

		isAbsPath: function(path) {
			return (path.indexOf('/') === 0) ? true : false;
		},

		//////////////////////////////////////////////////////////////////
		// Get Current (Path)
		//////////////////////////////////////////////////////////////////

		getCurrent: function() {
			ajax({
				url: self.controller,
				data: {
					action: 'current'
				},
				success: function(data) {
					if (data.status === 'success') {
						self.current.path = data.path;
					}
				}
			});
			return self.current.path;
		}
	};
})(this, jQuery);