//////////////////////////////////////////////////////////////////////////////80
// Project Init
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';

	let hoverDuration = 300;

	let toggle = oX('#PDTOGGLE'),
		// 		open = 'fa-chevron-circle-up',
		// 		close = 'fa-chevron-circle-down';
		lock = 'fa-lock',
		unlock = 'fa-unlock';

	const self = {

		//projectmanager
		openTrigger: 'click',
		openOnHover: true,
		timeoutOpen: null,
		timeoutClose: null,


		init: function() {
			self.dock.load();

			fX('#project-atheos').on('click', function() {
				self.open('Atheos IDE', '@TH305');
			});
			fX('#project-webRoot').on('click', function() {
				self.open('Web Root', 'W3BR00T');
			});
			fX('#projects-create').on('click', self.create);
			fX('#projects-manage').on('click', self.list);

			fX('#PDTOGGLE').on('click', function() {
				if (self.dock.lockedOpen) {
					self.dock.collapse();
					self.dock.lockedOpen = false;
					self.dock.setIcon(unlock);
					atheos.settings.save('project.lockedOpen', false, true);
					storage('project.lockedOpen', false);
				} else {
					self.dock.expand();
					self.dock.lockedOpen = true;
					self.dock.setIcon(lock);
					atheos.settings.save('project.lockedOpen', true, true);
					storage('project.lockedOpen', true);
				}
			});

			fX('#project_list').on('mouseover', function() {
				if (!self.openOnHover) return;
				if (self.timeoutClose) clearTimeout(self.timeoutClose);

				if (!self.dock.lockedOpen) {
					self.timeoutOpen = setTimeout(() => {
						self.dock.expand();
					}, hoverDuration);
				}
			});
			fX('#project_list').on('mouseout', function(e) {
				if (!self.openOnHover) return;
				if (self.timeoutOpen) clearTimeout(self.timeoutOpen);

				let left = mouseLeft('#project_list', e);

				if (left && !self.dock.lockedOpen) {
					self.timeoutClose = setTimeout(() => {

						self.dock.collapse();
					}, hoverDuration);
				}
			});

			// 			carbon.subscribe('chrono.mega', function() {
			// 				self.getCurrent();
			// 			});

			carbon.subscribe('settings.loaded', function() {
				var local = storage('project.openTrigger');
				if (local === 'click' || local === 'dblclick') {
					self.openTrigger = local;
				}

				if (storage('project.lockedOpen') === false) {
					self.dock.lockedOpen = false;
					self.dock.collapse();
					self.dock.setIcon(unlock);
				}
				if (storage('project.openOnHover') === false) {
					self.openOnHover = false;
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
				settled: function(reply, status) {
					atheos.toast.show(reply);
					if (status !== 200) return;

					if (reply.restore) {
						atheos.filetree.rescanChildren = reply.state;
					}

					atheos.current.projectIsRepo = reply.repo;
					atheos.current.projectPath = reply.path;
					atheos.current.projectName = reply.name;

					atheos.filetree.setRoot(reply.restore);

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
			lockedOpen: true,
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
					}
				});
			},

			expand: function() {
				oX('#SBLEFT #project_list').css('height', '');
				oX('#SBLEFT>.content').css('bottom', '');
			},

			collapse: function() {
				var height = oX('#SBLEFT #project_list .title').height();
				oX('#SBLEFT #project_list').css('height', height + 'px');
				oX('#SBLEFT>.content').css('bottom', height + 'px');
			},
			setIcon: function(icon) {
				toggle.removeClass();
				toggle.addClass('fas ' + icon);
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Create Project
		//////////////////////////////////////////////////////////////////////80
		create: function() {

			var listener = function(e) {
				e.preventDefault();

				let name = oX('#dialog form input[name="projectName"]').value(),
					path = oX('#dialog form input[name="projectPath"]').value(),
					repo = oX('#dialog form input[name="gitRepo"]').value(),
					branch = oX('#dialog form input[name="gitBranch"]').value();


				if (path.indexOf('/') === 0) {
					atheos.alert.show({
						banner: 'Do you really want to create a project with an absolute path?',
						data: path,
						actions: {
							'Yes': function() {
								self.createProject(name, path, repo, branch);
							},
							'No': function() {}
						}
					});
				} else {
					self.createProject(name, path, repo, branch);
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

		//////////////////////////////////////////////////////////////////////80
		// Create Project
		//////////////////////////////////////////////////////////////////////80
		createProject: function(projectName, projectPath, gitRepo, gitBranch) {
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
				success: function(reply, status) {
					if (status !== 200) return;
					self.open(reply.name, reply.path);
					self.dock.load();
					/* Notify listeners. */
					delete data.action;
					carbon.publish('project.create', data);
				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Rename Project
		//////////////////////////////////////////////////////////////////////80
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
					settled: function(reply, status) {
						if (status !== 200) return;
						atheos.toast.show('success', 'Project renamed');
						self.dock.load();
						atheos.modal.unload();
						/* Notify listeners. */
						delete data.action;
						carbon.publish('project.rename', data);
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
					settled: function(reply, status) {
						if (status !== 200) return;
						atheos.toast.show('success', reply.text);

						self.list();
						self.dock.load();

						for (var path in atheos.sessionmanager.sessions) {
							if (path.indexOf(projectPath) === 0) {
								atheos.sessionmanager.remove(path);
							}
						}

						carbon.publish('project.delete', {
							'path': projectPath,
							'name': projectName
						});
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
					if (data.status === 200) {
						self.current.path = data.path;
					}
				}
			});
			return self.current.path;
		}
	};

	carbon.subscribe('system.loadMinor', () => self.init());
	atheos.project = self;
})();