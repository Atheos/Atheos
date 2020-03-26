/*
	*  Copyright (c) atheos & Kent Safranski (atheos.com), distributed
	*  as-is and without warranty under the MIT License. See
	*  [root]/license.txt for more. This information must remain intact.
	*/

(function(global, $) {

	var atheos = global.atheos,
		amplify = global.amplify,
		i18n = global.i18n,
		o = global.onyx;

	amplify.subscribe('atheos.loaded', () => atheos.project.init());


	atheos.project = {

		controller: 'components/project/controller.php',
		dialog: 'components/project/dialog.php',

		//projectmanager
		sideExpanded: true,
		current: {
			name: '',
			path: ''
		},

		init: function() {
			this.loadCurrent();
			this.loadSide();

			var project = this;

			var projectCreate = o('#projects-create'),
				projectManage = o('#projects-manage'),
				projectCollpse = o('#projects-collapse');

			if (projectCreate) {
				projectCreate.on('click', function() {
					atheos.project.create('true');
				});
			}

			if (projectManage) {
				projectManage.on('click', function() {
					atheos.project.list();
				});
			}

			if (projectCollpse) {
				projectCollpse.on('click', function() {
					if (project.sideExpanded) {
						project.collapse();
					} else {
						project.expand();
					}
				});
			}

			amplify.subscribe('chrono.mega', function() {
				project.getCurrent();
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
						o('#file-manager').empty();
						o('#file-manager').html(`<ul><li>
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
			atheos.finder.contractFinder();
			ajax({
				url: this.controller + '?action=open&path=' + encodeURIComponent(path),
				success: function(data) {
					if (data.status != 'error') {
						project.loadCurrent();
						if (atheos.modal.settings.isModalVisible) {
							atheos.modal.unload();
						}
						atheos.user.saveActiveProject(path);
						localStorage.removeItem("lastSearched");
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
			// $('.sb-projects-content').load();
			ajax({
				url: this.dialog + '?action=sidelist&trigger=' + localStorage.getItem('atheos.editor.fileManagerTrigger'),
				success: function(reply) {
					o('.sb-projects-content').html(reply);
					// log(reply);
					this.sideExpanded = true;
				}
			});
		},

		expand: function() {
			this.sideExpanded = true;
			$('#side-projects').css('height', 276 + 'px');
			$('.project-list-title').css('right', 0);
			$('.sb-left-content').css('bottom', 276 + 'px');
			$('#projects-collapse')
				.removeClass('icon-up-dir')
				.addClass('icon-down-dir');
		},

		collapse: function() {
			this.sideExpanded = false;
			$('#side-projects').css('height', 33 + 'px');
			$('.project-list-title').css('right', 0);
			$('.sb-left-content').css('bottom', 33 + 'px');
			$('#projects-collapse')
				.removeClass('icon-down-dir')
				.addClass('icon-up-dir');
		},

		//////////////////////////////////////////////////////////////////
		// Create Project
		//////////////////////////////////////////////////////////////////

		create: function(close) {
			var _this = this;
			atheos.modal.load(500, this.dialog + '?action=create&close=' + close);
			$('#modal_content form')
				.live('submit', function(e) {
					e.preventDefault();
					var projectName = $('#modal_content form input[name="project_name"]').val(),
						projectPath = $('#modal_content form input[name="project_path"]').val(),
						gitRepo = $('#modal_content form input[name="git_repo"]').val(),
						gitBranch = $('#modal_content form input[name="git_branch"]').val();
					var create = function() {
						$.get(_this.controller + '?action=create&project_name=' + encodeURIComponent(projectName) + '&project_path=' + encodeURIComponent(projectPath) + '&git_repo=' + gitRepo + '&git_branch=' + gitBranch, function(data) {
							var createdata = atheos.jsend.parse(data);
							if (createdata !== 'error') {
								_this.open(createdata.path);
								atheos.modal.unload();
								_this.loadSide();
								/* Notify listeners. */
								amplify.publish('project.onCreate', {
									"name": projectName,
									"path": projectPath,
									"git_repo": gitRepo,
									"git_branch": gitBranch
								});
							}
						});
					};
					if (projectPath.indexOf('/') === 0) {
						atheos.alert.show({
							banner: 'Do you really want to create a project with an absolute path?',
							data: projectPath,
							positive: {
								message: 'Yes',
								fnc: function() {
									create();

								}
							},
							negative: {
								message: 'No',
								fnc: function() {}
							}
						});
					} else {
						create();
					}
				});
		},

		//////////////////////////////////////////////////////////////////
		// Rename Project
		//////////////////////////////////////////////////////////////////

		rename: function(name, path) {
			var _this = this;
			atheos.modal.load(500, this.dialog + '?action=rename&path=' + encodeURIComponent(path) + '&name=' + name);

			$('#modal_content form')
				.live('submit', function(e) {
					e.preventDefault();
					var projectPath = $('#modal_content form input[name="project_path"]')
						.val();
					var projectName = $('#modal_content form input[name="project_name"]')
						.val();
					$.get(_this.controller + '?action=rename&project_path=' + encodeURIComponent(projectPath) + '&project_name=' + encodeURIComponent(projectName), function(data) {
						var renamedata = atheos.jsend.parse(data);
						if (renamedata != 'error') {
							atheos.toast.show('success', 'Project renamed');
							_this.loadSide();
							$('#file-manager a[data-type="root"]').html(projectName);
							atheos.modal.unload();
							/* Notify listeners. */
							amplify.publish('project.onRename', {
								"path": projectPath,
								"name": projectName
							});
						}
					});
				});
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
							if (deletedata != 'error') {
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
									"path": projectPath,
									"name": name
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
			return (path.indexOf("/") == 0) ? true : false;
		},

		//////////////////////////////////////////////////////////////////
		// Get Current (Path)
		//////////////////////////////////////////////////////////////////

		getCurrent: function() {
			var project = this;
			ajax({
				url: this.controller,
				data: {
					action: "current"
				},
				success: function(data) {
					if (data.status === 'success') {
						project.current.path = data.path;
					}
				}
			});
			return project.current.path;
		}
	};
})(this, jQuery);