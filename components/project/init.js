//////////////////////////////////////////////////////////////////////////////80
// Project Init
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {

	var atheos = global.atheos;

	var self = null;

	carbon.subscribe('system.loadMinor', () => atheos.project.init());

	atheos.project = {

		//projectmanager
		sideExpanded: true,
		openTrigger: 'click',
		current: {
			name: '',
			path: ''
		},

		init: function() {
			self = this;

			self.load();
			self.dock.load();

			fX('#project-atheos').on('click', function() {
				self.open('Atheos IDE', '@TH305');
			});
			fX('#projects-create').on('click', self.create);
			fX('#projects-manage').on('click', self.list);
			fX('#projects-collapse').on('click', function() {
				if (self.sideExpanded) {
					self.dock.collapse();
					atheos.settings.save('project.dockOpen', false, true);
					storage('project.dockOpen', false);
				} else {
					self.dock.expand();
					atheos.settings.save('project.dockOpen', true, true);
					storage('project.dockOpen', true);
				}
			});

			carbon.subscribe('chrono.mega', function() {
				self.getCurrent();
			});

			carbon.subscribe('settings.loaded', function() {
				var local = storage('project.openTrigger');
				if (local === 'click' || local === 'dblclick') {
					self.openTrigger = local;
				}

				if (storage('project.dockOpen') === false) {
					self.dock.collapse();
				}

			});

			fX('#project_list .content li').on('click, dblclick', function(e) {
				if (self.openTrigger === e.type) {
					var node = oX(e.target);

					if (node.tagName === 'UL') {
						return false;
					} else if (node.tagName !== 'LI') {
						node = node.parent();
					}
					self.open(node.text(), node.attr('data-project'));
				}
			});
		},

		//////////////////////////////////////////////////////////////////
		// Get Current Project
		//////////////////////////////////////////////////////////////////
		load: function() {
			echo({
				url: atheos.controller,
				data: {
					target: 'project',
					action: 'load'
				},
				settled: function(status, reply) {
					atheos.toast.show(reply);
					if (status === 'error') return;
					var logSpan = oX('#last_login');
					if (reply.lastLogin && logSpan) {
						// logSpan.find('span').text(i18n('login_last', reply.lastLogin));
						logSpan.find('span').text(reply.lastLogin);
					}

					self.setRoot(reply.name, reply.path, reply.repo);

				}
			});
		},

		//////////////////////////////////////////////////////////////////
		// Open Project
		//////////////////////////////////////////////////////////////////
		open: function(projectName, projectPath) {
			atheos.scout.exitFilter();
			echo({
				url: atheos.controller,
				data: {
					target: 'project',
					action: 'open',
					projectName,
					projectPath
				},
				settled: function(status, reply) {
					atheos.toast.show(reply);
					if (status === 'error') return;


					self.setRoot(reply.name, reply.path, reply.repo);

					if (atheos.modal.modalVisible) {
						atheos.modal.unload();
					}

					atheos.user.saveActiveProject(reply.name, reply.path);
					localStorage.removeItem('lastSearched');
					/* Notify listeners. */
					carbon.publish('project.open', reply.path);

				}
			});
		},

		//////////////////////////////////////////////////////////////////
		// Set project root in file manager
		//////////////////////////////////////////////////////////////////		
		setRoot: function(name, path, repo) {
			self.current = {
				name,
				path
			};
			oX('#file-manager').empty();

			let repoIcon = repo ? '<i class="repo-icon fas fa-code-branch"></i>' : '';

			oX('#file-manager').html(
				`<ul>
				<li>
					<a id="project-root" data-type="root" data-path="${path}">
						${repoIcon}
						<i class="root fa fa-folder blue"></i>
						<span>${name}</span>
					</a>
					<ul></ul>
				</li>
			</ul>`);
			atheos.filemanager.openDir(path);
		},

		//////////////////////////////////////////////////////////////////
		// Open the project manager dialog
		//////////////////////////////////////////////////////////////////
		list: function() {
			atheos.modal.load(500, {
				target: 'project',
				action: 'list'
			});
		},

		//////////////////////////////////////////////////////////////////
		// Load and list projects in the sidebar.
		//////////////////////////////////////////////////////////////////
		dock: {
			load: function() {
				echo({
					url: atheos.dialog,
					data: {
						target: 'project',
						action: 'projectDock'
					},
					success: function(reply) {
						oX('#project_list .content').html(reply);

						let projects = oX('#project_list .content').findAll('LI');
						if (projects.length < 2) {
							self.dock.collapse();
						}

					}
				});
			},

			expand: function() {
				self.sideExpanded = true;
				oX('#SBLEFT #project_list').css('height', '');
				oX('#SBLEFT>.content').css('bottom', '');

				oX('#projects-collapse').replaceClass('fa-chevron-circle-up', 'fa-chevron-circle-down');



			},

			collapse: function() {
				self.sideExpanded = false;
				var height = oX('#SBLEFT #project_list .title').height();

				oX('#SBLEFT #project_list').css('height', height + 'px');
				oX('#SBLEFT>.content').css('bottom', height + 'px');

				oX('#projects-collapse').replaceClass('fa-chevron-circle-down', 'fa-chevron-circle-up');
			}
		},

		//////////////////////////////////////////////////////////////////
		// Create Project
		//////////////////////////////////////////////////////////////////
		create: function() {

			var projectName, projectPath, gitRepo, gitBranch;

			var createProject = function() {
				var data = {
					target: 'project',
					action: 'create',
					projectName,
					projectPath,
					gitRepo,
					gitBranch
				};

				echo({
					url: atheos.controller,
					data,
					success: function(reply) {
						if (reply.status !== 'error') {
							self.open(reply.name, reply.path);
							self.dock.load();
							/* Notify listeners. */
							delete data.action;
							carbon.publish('project.create', data);
						}
					}
				});
			};

			var listener = function(e) {
				e.preventDefault();

				projectName = oX('#dialog form input[name="projectName"]').value();
				projectPath = oX('#dialog form input[name="projectPath"]').value();
				gitRepo = oX('#dialog form input[name="gitRepo"]').value();
				gitBranch = oX('#dialog form input[name="gitBranch"]').value();


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

			atheos.modal.load(400, {
				target: 'project',
				action: 'create',
				listener,
				callback: function() {
					// More Selector
					fX('#show_git_options').on('click', function(e) {
						e.preventDefault();
						oX(e.target).hide();
						atheos.flow.slide('open', oX('#git_options').element);
					});
				}
			});
		},

		//////////////////////////////////////////////////////////////////
		// Rename Project
		//////////////////////////////////////////////////////////////////

		rename: function(oldName, projectPath) {

			var listener = function(e) {
				e.preventDefault();

				var newName = oX('#dialog form input[name="projectName"]').value();

				var data = {
					target: 'project',
					action: 'rename',
					projectPath,
					oldName,
					newName
				};

				echo({
					url: atheos.controller,
					data,
					settled: function(status, reply) {
						if (status !== 'error') {
							atheos.toast.show('success', 'Project renamed');
							self.dock.load();
							atheos.modal.unload();
							/* Notify listeners. */
							delete data.action;
							carbon.publish('project.rename', data);
						}
					}
				});
			};

			atheos.modal.load(400, {
				target: 'project',
				action: 'rename',
				name: oldName,
				listener
			});
		},

		//////////////////////////////////////////////////////////////////
		// Delete Project
		//////////////////////////////////////////////////////////////////
		delete: function(projectName, projectPath) {
			var listener = function(e) {
				e.preventDefault();

				var scope = oX('input[name="scope"]:checked').value();

				echo({
					url: atheos.controller,
					data: {
						target: 'project',
						action: 'delete',
						scope,
						projectPath,
						projectName
					},
					settled: function(status, reply) {
						if (status === 'success') {
							atheos.toast.show('success', reply.text);

							self.list();
							self.dock.load();

							for (var path in atheos.active.sessions) {
								if (path.indexOf(projectPath) === 0) {
									atheos.active.remove(path);
								}
							}

							carbon.publish('project.delete', {
								'path': projectPath,
								'name': projectName
							});
						}

					}
				});
			};

			atheos.modal.load(400, {
				target: 'project',
				action: 'delete',
				name: projectName,
				path: projectPath,
				listener
			});
		},


		//////////////////////////////////////////////////////////////////
		// Get Current (Path)
		//////////////////////////////////////////////////////////////////
		getCurrent: function() {
			echo({
				url: atheos.controller,
				data: {
					target: 'project',
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