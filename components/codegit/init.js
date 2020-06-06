/*jshint esversion: 6 */

//////////////////////////////////////////////////////////////////////////////80
// Codegit Init
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Andr3as, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {


	var self = null;

	var atheos = global.atheos,
		amplify = global.amplify,
		echo = global.echo,
		oX = global.onyx;

	//////////////////////////////////////////////////////////////////////
	// Codegit
	//////////////////////////////////////////////////////////////////////
	// Notes: 
	// I recall there being a security concern issue on the github issues page
	// for this plugin as well as a call to action to utilize a different
	// backend. I'd like to ensure this plugin is reaching its full potential
	// but there is a huge and still growing ToDo list. 
	//
	// What this means is that I'm going to remove some features that I don't 
	// see as entirely useful / are overly complex, and instead try to focus
	// on simplifying this plugin as much as possible and as performant as 
	// possible.
	//
	// One thing I noticed is that I don't think many of the templates are
	// needed, and the GitPlugin can be made to mostly operate from the
	// overview, and the entire plugin might be able to be made on a state
	// based system, currently it doesn't store anything it needs until it
	// needs to and then it scrambles to do get teh infomation.
	//
	//												- Liam Siira
	//////////////////////////////////////////////////////////////////////


	amplify.subscribe('system.loadExtra', () => atheos.codegit.init());

	atheos.codegit = {

		path: 'components/codegit/',
		controller: 'components/codegit/controller.php',
		dialog: 'components/codegit/dialog.php',
		location: '',
		activeRepo: '',
		line: 0,
		files: [],
		network_graph: {},


		repoBanner: null,
		repoStatus: null,
		fileStatus: null,
		changesTable: null,
		icon: '<i class="fas fa-code-branch"></i>',

		init: function() {
			self = this;

			//Check if directories has git repo
			amplify.subscribe('filemanager.openDir', self.scanForGit);

			//Repo updates
			amplify.subscribe('chrono.mega', self.checkRepoStatus);

			//Handle contextmenu
			amplify.subscribe('contextmenu.show', this.showContextMenu);

			amplify.subscribe('active.focus', function(path) {
				self.checkFileStatus(path);
			});

			amplify.subscribe('active.save', function(path) {
				setTimeout(function() {
					self.checkFileStatus(path);
					self.checkRepoStatus();
				}, 50);
			});

			amplify.subscribe('active.close active.closeAll', function() {
				if (self.fileStatus) {
					self.fileStatus.empty();
				}
			});

			// amplify.subscribe('settings.changed', function() {
			// 	self.showRepoStatus();
			// });
		},

		scanForGit: function(directory) {
			directory.files.forEach(function(file, i) {
				if (pathinfo(file.path).basename === '.git') {
					directory.node.addClass('repo');
					if (!directory.node.find('i.repo-icon')) {
						directory.node.append('<i class="repo-icon fas fa-code-branch"></i>');
					}
				} else if (file.repo) {
					//Deeper inspect
					var repo = oX('#file-manager a[data-path="' + file.path + '"]');
					repo.addClass('repo');
					if (!repo.find('i.repo-icon')) {
						repo.append('<i class="repo-icon fas fa-code-branch"></i>');
					}
				}
			});
			// Repo status
			self.showRepoStatus();
		},

		//Check if directories has git repo
		showRepoStatus: function() {
			if (oX('#project-root').hasClass('repo')) {
				self.addStatusElements();
				self.checkRepoStatus();

			} else {
				if (self.repoBanner) {
					self.repoBanner.hide();
				}
				if (self.fileStatus) {
					self.fileStatus.hide();
				}
			}
		},


		showContextMenu: function(obj) {
			var path = obj.path,
				root = oX('#project-root').attr('data-path'),
				html = '';

			var anchor = '<a class="codegit" onclick="atheos.codegit.';

			function findParentRepo(path) {
				var counter = 0;
				var target = obj.node;

				while (path !== root) {
					path = pathinfo(path).directory;
					target = oX('[data-path="' + path + '"]');
					if (target && target.hasClass('repo')) {
						return path;
					}
					if (counter >= 10) break;
					counter++;
				}
				return false;
			}


			if (obj.type === 'directory') {
				html += ('<hr class="codegit">');

				if (obj.node.hasClass('repo')) {
					html += (anchor + 'showCodeGit(\'' + path + '\');">' + self.icon + 'Open CodeGit</a>');
				} else {
					html += (anchor + 'gitInit(\'' + path + '\');">' + self.icon + 'Git Init</a>');
					html += (anchor + 'clone(\'' + path + '\');">' + self.icon + 'Git Clone</a>');
				}
			} else {
				var repo = findParentRepo(path);
				if (repo) {
					html += ('<hr class="codegit">');
					html += (anchor + 'diff(\'' + repo + '\', \'' + path + '\');">' + self.icon + 'Git Diff</a>');
					html += (anchor + 'blame(\'' + repo + '\', \'' + path + '\');">' + self.icon + 'Git Blame</a>');
					html += (anchor + 'log(\'' + repo + '\', \'' + path + '\');">' + self.icon + 'Git Log</a>');
				}
			}

			obj.menu.append(html);

		},

		showCodeGit: function(repo) {
			repo = repo || oX('#project-root').attr('data-path');
			self.activeRepo = repo;

			var listener = function() {
				oX('menu').on('click', function(e) {
					var target = oX(e.target);
					var tagName = target.el.tagName;
					if (tagName === 'A') {
						self.showPanel(target.attr('data-panel'), repo);
					}
				});

				oX('panel').on('click', function(e) {
					var target = oX(e.target);
					var tagName = target.el.tagName;
					if (tagName === 'BUTTON') {
						if (target.text() === 'Diff') {
							self.showPanel('diff', repo, {
								files: [target.parent('tr').attr('data-file')]
							});
						} else if (target.text() === 'Undo') {
							atheos.toast.show('notice', "Git Undo coming soon");
							// self.showPanel(target.attr('data-panel'), repo);
						}
					}
				});

				self.monitorCheckBoxes();
				atheos.modal.resize();
			};


			atheos.modal.load(800, self.dialog, {
				action: 'codegit',
				repo
			}, listener);
		},

		showPanel: function(panel, repo, data) {
			if (typeof(panel) === 'string') {
				var menu = oX('menu a[data-panel="' + panel + '"]');
				if (menu) {
					oX('menu .active').removeClass('active');
					menu.addClass('active');
				}
				data = data || {};
				data.action = 'loadPanel';
				data.panel = panel;
				data.repo = repo;

				echo({
					url: self.dialog,
					data: data,
					success: function(reply) {
						oX('panel').empty();
						oX('panel').html(reply);
						if (panel === 'overview') {
							self.monitorCheckBoxes();
						}

					}
				});
			}
		},

		showDialog: function(type, repo, path) {
			path = path || oX('#project-root').attr('data-path');
			self.location = repo || self.location;
			atheos.modal.load(600, self.dialog, {
				action: 'loadPanel',
				panel: type,
				repo,
				path
			});
		},

		gitInit: function(path) {
			echo({
				url: self.controller,
				data: {
					action: 'init',
					path
				},
				success: function(reply) {
					if (reply.status == 'success') {
						// $('.directory[data-path="' + path + '"]').addClass('hasRepo');
						// atheos.filemanager.rescan(path);
					}
				}
			});
		},

		commit: function() {
			var message = oX('#commit_message');
			var path = self.getPath(self.activeRepo);

			var data = {
				action: 'commit',
				files: [],
				message: message.value(),
				path: path
			};

			var checkboxes = oX('#codegit_overview tbody').findAll('input[type="checkbox"]');
			checkboxes.forEach((checkbox) => {
				if (checkbox.prop('checked')) {
					data.files.push(checkbox.parent('tr').attr('data-file'));
				}
			});

			echo({
				url: self.controller,
				data: data,
				success: function(data) {
					atheos.toast.show(data);
					if (data.status !== 'error') {
						message.empty();
						checkboxes.forEach((checkbox) => {
							if (checkbox.prop('checked')) {
								checkbox.parent('tr').remove();
							}
						});
					}
				}
			});
		},


		checkFileStatus: function(path) {
			path = path || atheos.active.getPath();

			echo({
				url: self.controller,
				data: {
					action: 'fileStatus',
					path: path
				},
				success: function(reply) {
					var text = '';
					if (reply.status !== 'error') {
						text = `${self.icon}${reply.branch}: +${reply.insertions}, -${reply.deletions}`;
					}
					if (self.fileStatus) {
						self.fileStatus.html(text);
					}
				}
			});
		},

		checkRepoStatus: function(path) {
			path = path || atheos.project.current.path;

			echo({
				url: self.controller,
				data: {
					action: 'status',
					path: path
				},
				success: function(data) {
					var status = "Unknown";
					if (data.status != "error") {
						if (data.added.length !== 0 ||
							data.deleted.length !== 0 ||
							data.modified.length !== 0 ||
							data.renamed.length !== 0) {
							status = "Uncommitted";
						} else if (data.untracked.length !== 0) {
							status = "Untracked";
						} else {
							status = "Committed";
						}
					}

					if (self.repoStatus) self.repoStatus.text(status);
					if (self.repoBanner) self.repoBanner.replaceClass("repoCommitted repoUncommitted repoUntracked", "repo" + status);
				}
			});
		},

		diff: function(repo, path) {
			if (!path || !repo) return;
			path = path.replace(repo + "/", "");
			self.showDialog('diff', repo, path);
		},

		blame: function(repo, path) {
			if (!path || !repo) return;
			path = path.replace(repo + "/", "");
			self.showDialog('blame', repo, path);
		},

		log: function(repo, path) {
			// this.location = repo;
			// path = path.replace(repo + "/", "");
			// this.files = [];
			// this.files.push(path);

			if (!path || !repo) return;
			path = path.replace(repo + "/", "");
			this.showDialog('log', repo, path);
		},


		push: function() {
			var remote = oX('#git_remotes').value();
			var branch = oX('#git_branches').value();

			// this.showDialog('overview', this.location);
			// success: this.path + 'controller.php?action=push&path=' + this.location + '&remote=' + remote + '&branch=' + branch,

			echo({
				url: self.controller,
				data: {
					action: 'push',
					repo: self.activeRepo,
					remote,
					branch
				},
				success: function(reply) {
					log(reply);
					return;
					if (reply.status === 'login_required') {
						atheos.toast.show('error', reply.message);
						codegit.showDialog('login', codegit.location);
						codegit.login = function() {
							var username = $('.git_login_area #username').val();
							var password = $('.git_login_area #password').val();
							codegit.showDialog('overview', codegit.location);
							$.post(codegit.path + 'controller.php?action=push&path=' + codegit.location + '&remote=' + remote + '&branch=' + branch, {
								username: username,
								password: password
							}, function(result) {
								reply = JSON.parse(result);
								atheos.toast[reply.status](reply.message);
							});
						};
					} else if (reply.status === 'passphrase_required') {
						atheos.toast.show('error', reply.message);
						codegit.showDialog('passphrase', codegit.location);
						codegit.login = function() {
							var passphrase = $('.git_login_area #passphrase').val();
							codegit.showDialog('overview', codegit.location);
							$.post(codegit.path + 'controller.php?action=push&path=' + codegit.location + '&remote=' + remote + '&branch=' + branch, {
								passphrase: passphrase
							}, function(reply) {
								reply = JSON.parse(reply);
								atheos.toast[reply.status](reply.message);
							});
						};
					} else {
						atheos.toast[reply.status](reply.message);
					}
				}
			});
		},

		pull: function() {
			var codegit = this;
			var remote = $('.git_push_area #git_remotes').val();
			var branch = $('.git_push_area #git_branches').val();
			this.showDialog('overview', this.location);
			$.getJSON(this.path + 'controller.php?action=pull&path=' + this.location + '&remote=' + remote + '&branch=' + branch, function(result) {
				if (result.status == 'login_required') {
					atheos.toast.show('error', result.message);
					codegit.showDialog('login', codegit.location);
					codegit.login = function() {
						var username = $('.git_login_area #username').val();
						var password = $('.git_login_area #password').val();
						codegit.showDialog('overview', codegit.location);
						$.post(codegit.path + 'controller.php?action=pull&path=' + codegit.location + '&remote=' + remote + '&branch=' + branch, {
							username: username,
							password: password
						}, function(result) {
							result = JSON.parse(result);
							atheos.toast[result.status](result.message);
						});
					};
				} else if (result.status == 'passphrase_required') {
					atheos.toast.show('error', result.message);
					codegit.showDialog('passphrase', codegit.location);
					codegit.login = function() {
						var passphrase = $('.git_login_area #passphrase').val();
						codegit.showDialog('overview', codegit.location);
						$.post(codegit.path + 'controller.php?action=pull&path=' + codegit.location + '&remote=' + remote + '&branch=' + branch, {
							passphrase: passphrase
						}, function(result) {
							result = JSON.parse(result);
							atheos.toast[result.status](result.message);
						});
					};
				} else {
					atheos.toast[result.status](result.message);
				}
			});
		},

		fetch: function() {
			var codegit = this;
			var remote = $('.git_remote_area #git_remotes').val();
			this.showDialog('overview', this.location);
			$.getJSON(this.path + 'controller.php?action=fetch&path=' + this.location + '&remote=' + remote, function(result) {
				if (result.status == 'login_required') {
					atheos.toast.show('error', result.message);
					codegit.showDialog('login', codegit.location);
					codegit.login = function() {
						var username = $('.git_login_area #username').val();
						var password = $('.git_login_area #password').val();
						codegit.showDialog('overview', codegit.location);
						$.post(codegit.path + 'controller.php?action=fetch&path=' + codegit.location + '&remote=' + remote, {
							username: username,
							password: password
						}, function(result) {
							result = JSON.parse(result);
							atheos.toast[result.status](result.message);
						});
					};
				} else if (result.status == 'passphrase_required') {
					atheos.toast.show('error', result.message);
					codegit.showDialog('passphrase', codegit.location);
					codegit.login = function() {
						var passphrase = $('.git_login_area #passphrase').val();
						codegit.showDialog('overview', codegit.location);
						$.post(codegit.path + 'controller.php?action=fetch&path=' + codegit.location + '&remote=' + remote, {
							passphrase: passphrase
						}, function(result) {
							result = JSON.parse(result);
							atheos.toast[result.status](result.message);
						});
					};
				} else {
					atheos.toast[result.status](result.message);
				}
			});
		},



		login: function() {},

		// setSettings: function(path) {
		// 	var codegit = this;
		// 	var settings = {};
		// 	path = this.getPath(path);
		// 	$('.git_settings_area input:not(.no_setting)').each(function(i, el) {
		// 		settings[$(el).attr("id")] = $(el).val();
		// 	});

		// 	$.post(this.path + 'controller.php?action=setSettings&path=' + path, {
		// 		settings: JSON.stringify(settings)
		// 	}, function(result) {
		// 		result = JSON.parse(result);
		// 		atheos.toast[result.status](result.message);
		// 		self.showDialog('overview', self.location);
		// 	});
		// },

		// getSettings: function(path) {
		// 	path = this.getPath(path);
		// 	$.getJSON(this.path + 'controller.php?action=getSettings&path=' + path, function(result) {
		// 		if (result.status == 'error') {
		// 			atheos.toast.show('error', result.message);
		// 			return;
		// 		}
		// 		var local = false;
		// 		$.each(result.data, function(i, item) {
		// 			if (/\//.test(i)) {
		// 				return;
		// 			}
		// 			$('.git_settings_area #' + i).val(item);
		// 			if (/^local_/.test(i)) {
		// 				local = true;
		// 			}
		// 		});
		// 		if (!local) {
		// 			$('#box_local').click();
		// 		}
		// 	});
		// },

		/**
			* Get path
			* 
			* @param {string} [path]
			* @result {string} path
			*/
		getPath: function(path) {
			if (typeof(path) === 'undefined') {
				return this.location;
			} else {
				return path;
			}
		},


		addStatusElements: function() {
			self.repoBanner = oX('#codegit_repo_banner');
			self.repoStatus = oX('#codegit_repo_status');
			self.fileStatus = oX('#codegit_file_status');

			if (!self.repoBanner) {
				oX('#file-manager').before('<div id="codegit_repo_banner">Commit Status: <span id="codegit_repo_status"></span></div>');
				self.repoBanner = oX('#codegit_repo_banner');
				self.repoStatus = oX('#codegit_repo_status');

				// Add eventListener to open CodeGit
				oX("#codegit_repo_banner").on('click', function() {
					self.showCodeGit();
				});
			}

			if (self.showRepoBanner() === false) {
				self.repoBanner.hide();
			} else {
				self.repoBanner.show();
			}

			if (self.showFileStatus() === false) {
				self.fileStatus.empty();
			}
		},

		monitorCheckBoxes: function() {
			var checkboxAll = oX('#codegit_overview #check_all');
			var checkboxes = oX('#codegit_overview tbody').findAll('input[type="checkbox"]');
			var tbody = oX('#codegit_overview tbody');

			checkboxAll.on('click', function() {
				var status = checkboxAll.el.checked;
				checkboxes.forEach((checkbox) => checkbox.el.checked = status);
			});

			tbody.on('click', function(e) {
				var node = e.target;
				if (node.tagName === 'INPUT' && node.type === 'checkbox') {
					if (!node.checked) {
						if (checkboxAll.el.checked) {
							checkboxAll.el.checked = false;
						}
					} else {
						var allChecked = true;
						checkboxes.forEach((checkbox) => {
							allChecked = allChecked && (checkbox.el.checked === true);
						});
						if (allChecked) {
							checkboxAll.el.checked = true;
						}
					}
				}
			});

			amplify.subscribe('modal.unload', function() {
				checkboxAll.off('click');
				tbody.off('click');
			})
		},

		showRepoBanner: function() {
			var setting = atheos.storage('codegit.repoBanner');
			setting = setting === 'disabled' ? false : true;
			return setting;
		},

		showFileStatus: function() {
			var setting = atheos.storage('codegit.fileStatus');
			setting = setting === 'disabled' ? false : true;
			return setting;
		}
	};
})(this);