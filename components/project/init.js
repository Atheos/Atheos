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

	amplify.subscribe('atheos.loaded', function(settings) {
		atheos.project.init();
	});

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

			o('#projects-create').on('click', function() {
				atheos.project.create('true');
			});

			o('#projects-manage').on('click', function() {
				atheos.project.list();
			});

			o('#projects-collapse').on('click', function() {
				if (!project.sideExpanded) {
					project.expand();
				} else {
					project.collapse();
				}
			});
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
				type: 'post',
				data: {
					'action': 'load'
				},
				success: function(response) {
					response = JSON.parse(response);

					if (response.status != 'error') {
						project.current = {
							name: response.name,
							path: response.path
						};
						o('#file-manager').empty();
						o('#file-manager').html(`<ul><li>
									<a id="project-root" data-type="root" data-path="${response.path}">
									<i class="root fa fa-folder medium-blue"></i>
									<span>${response.name}</span>
									</a>
								</li></ul>`);
						atheos.filemanager.openDir(response.path);
						atheos.user.saveActiveProject(response.path);
						atheos.toast.success('Project Loaded');
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
				success: function(response) {

					response = JSON.parse(response);
					if (response.status != 'error') {
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
			$('#modal_content form')
				.die('submit'); // Prevent form bubbling
			atheos.modal.load(500, this.dialog + '?action=list');
		},

		//////////////////////////////////////////////////////////////////
		// Load and list projects in the sidebar.
		//////////////////////////////////////////////////////////////////
		loadSide: function() {
			$('.sb-projects-content').load(this.dialog + '?action=sidelist&trigger=' + localStorage.getItem('atheos.editor.fileManagerTrigger'));
			this.sideExpanded = true;
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
							var createResponse = atheos.jsend.parse(data);
							if (createResponse !== 'error') {
								_this.open(createResponse.path);
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
						var renameResponse = atheos.jsend.parse(data);
						if (renameResponse != 'error') {
							atheos.toast.success('Project renamed');
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
							var deleteResponse = atheos.jsend.parse(data);
							if (deleteResponse != 'error') {
								atheos.toast.success('Project Deleted');
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
				type: 'post',
				data: {
					action: "current"
				},
				success: function(response) {
					response = JSON.parse(response);
					if (response.status === 'success') {
						project.current.path = response.path;
					}
				}
			});
			return project.current.path;
		}
	};
})(this, jQuery);