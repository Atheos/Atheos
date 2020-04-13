/*jshint esversion: 6 */

//////////////////////////////////////////////////////////////////////////////80
// Project Init
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {

	var atheos = global.atheos,
		ajax = global.ajax,
		amplify = global.amplify,
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
			self.loadDock();

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
					if (data.status !== 'error') {
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
		open: function(projectPath) {
			atheos.scout.hideFilter();
			ajax({
				url: self.controller,
				data: {
					action: 'open',
					projectPath
				},
				success: function(data) {
					if (data.status !== 'error') {
						self.loadCurrent();
						if (atheos.modal.modalVisible) {
							atheos.modal.unload();
						}
						atheos.user.saveActiveProject(projectPath);
						localStorage.removeItem('lastSearched');
						/* Notify listeners. */
						amplify.publish('project.onOpen', projectPath);
					}
				}
			});
		},

		//////////////////////////////////////////////////////////////////
		// Open the project manager dialog
		//////////////////////////////////////////////////////////////////

		list: function() {
			atheos.modal.load(500, this.dialog, {
				action: 'list'
			});
		},

		//////////////////////////////////////////////////////////////////
		// Load and list projects in the sidebar.
		//////////////////////////////////////////////////////////////////
		loadDock: function() {
			ajax({
				url: this.dialog,
				data: {
					action: 'projectDock'
				},
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
		create: function() {

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

				projectName = oX('#modal_content form input[name="projectName"]').value();
				projectPath = oX('#modal_content form input[name="projectPath"]').value();
				gitRepo = oX('#modal_content form input[name="gitRepo"]').value();
				gitBranch = oX('#modal_content form input[name="gitBranch"]').value();


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

				// More Selector
				oX('#show_git_options').on('click', function(e) {
					e.preventDefault();
					oX(e.target).hide();
					atheos.flow.slide('open', oX('#git_options').el);
				});

			});
			atheos.modal.load(500, self.dialog, {
				action: 'create'
			});
		},

		//////////////////////////////////////////////////////////////////
		// Rename Project
		//////////////////////////////////////////////////////////////////

		rename: function(projectName, projectPath) {

			var listener = function(e) {
				e.preventDefault();

				projectName = oX('#modal_content form input[name="projectName"]').value();

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
			atheos.modal.load(500, self.dialog, {
				action: 'rename',
				projectName
			});
		},

		//////////////////////////////////////////////////////////////////
		// Delete Project
		//////////////////////////////////////////////////////////////////

		delete: function(projectName, projectPath) {
			var listener = function(e) {
				e.preventDefault();

				var deleteFiles = oX('input:checkbox[name="delete"]:checked').value();
				var followLinks = oX('input:checkbox[name="follow"]:checked').value();

				ajax({
					url: self.controller,
					data: {
						action: 'delete',
						projectPath,
						projectName,
						deleteFiles,
						followLinks
					},
					success: function(data) {
						if (data.status === 'success') {
							atheos.toast.show('success', 'Project Deleted');
							atheos.toast.show('notice', 'Project file deletion not implemented');
							self.list();
							self.loadDock();

							for (var path in atheos.active.sessions) {
								if (path.indexOf(projectPath) === 0) {
									atheos.active.remove(path);
								}
							}

							amplify.publish('project.delete', {
								'path': projectPath,
								'name': projectName
							});
						}

					}
				});
			};

			amplify.subscribe('modal.loaded', function() {
				oX('#modal_content form').once('submit', listener);
			});
			atheos.modal.load(500, self.dialog, {
				action: 'rename',
				projectName,
				projectPath
			});
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
})(this);