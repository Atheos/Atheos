//////////////////////////////////////////////////////////////////////////////80
// Codegit Init
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {


	var self = null;

	var atheos = global.atheos;

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


	carbon.subscribe('system.loadExtra', () => atheos.codegit.init());

	atheos.codegit = {

		location: '',
		activeRepo: '',
		files: [],

		repoBanner: null,
		repoStatus: null,
		fileStatus: null,
		changesTable: null,
		icon: '<i class="fas fa-code-branch"></i>',

		init: function() {
			self = this;

			fX('#codegit menu').on('click', function(e) {
				var target = oX(e.target);
				var tagName = target.tagName;
				if (tagName === 'A') {
					self.showPanel(target.attr('data-panel'), self.activeRepo);
				}
			});

			fX('#codegit panel').on('click', function(e) {
				var target = oX(e.target);
				if (target.tagName === 'BUTTON') {
					if (target.text() === 'Diff') {
						self.showPanel('diff', self.activeRepo, {
							files: [target.parent('tr').attr('data-file')]
						});
					} else if (target.text() === 'Undo') {
						self.undo(self.activeRepo, target.parent('tr').attr('data-file'));
					}
				}
			});

			// Add eventListener to open CodeGit
			fX('#codegit_repo_banner').on('click', function() {
				self.showCodeGit();
			});

			//Check if directories has git repo
			carbon.subscribe('filemanager.openDir', self.showRepoStatus);

			//Repo updates
			carbon.subscribe('chrono.mega', self.checkRepoStatus);

			carbon.subscribe('active.focus', function(path) {
				self.checkFileStatus(path);
			});

			carbon.subscribe('active.save', function(path) {
				setTimeout(function() {
					self.checkFileStatus(path);
					self.checkRepoStatus();
				}, 50);
			});

			carbon.subscribe('active.close active.closeAll', function() {
				if (self.fileStatus) {
					self.fileStatus.empty();
				}
			});
		},


		findParentRepo: function(path) {
			let counter = 0,
				root = oX('#project-root').attr('data-path'),
				target;

			while (path !== root) {
				path = pathinfo(path).directory;
				target = oX('[data-path="' + path + '"]');
				if (target && target.hasClass('repo')) {
					return path;
				}
				if (counter >= 10) {
					break;
				}
				counter++;
			}
			return false;
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

		showCodeGit: function(anchor) {
			let repo = anchor ? anchor.path : oX('#project-root').attr('data-path');
			self.activeRepo = repo;

			anchor = oX('#file-manager [data-path="' + repo + '"]');
			if (!anchor.find('i.repo-icon')) return toast('notice', i18n('git_error_noRepo'));

			atheos.modal.load(800, {
				target: 'codegit',
				action: 'codegit',
				repo
			});
		},

		showPanel: function(panel, repo, data) {
			if (typeof(panel) === 'string') {
				var menu = oX('menu a[data-panel="' + panel + '"]');
				if (menu) {
					oX('menu .active').removeClass('active');
					menu.addClass('active');
				}
				data = data || {};
				data.target = 'codegit';
				data.action = 'loadPanel';
				data.panel = panel;
				data.repo = repo;

				echo({
					url: atheos.dialog,
					data: data,
					success: function(reply) {
						oX('panel').html(reply);
					}
				});
			}
		},

		showDialog: function(type, repo, path) {
			path = path || oX('#project-root').attr('data-path');
			self.location = repo || self.location;
			atheos.modal.load(600, {
				target: 'codegit',
				action: 'loadPanel',
				panel: type,
				repo,
				path
			});
		},

		gitInit: function(anchor) {
			echo({
				url: atheos.controller,
				data: {
					target: 'codegit',
					action: 'init',
					type: 'repo',
					repo: anchor.path
				},
				settled: function(status, reply) {
					if (status === 'success') {
						self.addRepoIcon(anchor.path);
					}
				}
			});
		},

		gitClone: function(anchor) {
			var listener = function(e) {
				e.preventDefault();

				var repoURL = oX('#dialog form input[name="clone"]').value();

				echo({
					data: {
						target: 'codegit',
						action: 'clone',
						repoURL,
						path: anchor.path
					},
					settled: function(status, reply) {
						toast(status, reply);
						if (status === 'success') {
							self.addRepoIcon(anchor.path);
							atheos.filemanager.rescan(anchor.path);
							atheos.modal.unload();
						}
					}
				});
			};
			atheos.modal.load(250, {
				target: 'codegit',
				action: 'clone',
				repo: anchor.path,
				listener
			});

		},

		addRepoIcon: function(path) {
			var node = oX('#file-manager a[data-path="' + path + '"]');
			node.addClass('repo');
			if (!node.find('i.repo-icon')) {
				node.append('<i class="repo-icon fas fa-code-branch"></i>');
			}
		},

		commit: function() {
			var message = oX('#commit_message');
			var repo = self.activeRepo;

			var data = {
				action: 'commit',
				target: 'codegit',
				files: [],
				message: message.value(),
				repo
			};

			var checkboxes = oX('#codegit_overview tbody').findAll('input[type="checkbox"]');
			checkboxes.forEach((checkbox) => {
				if (checkbox.prop('checked')) {
					data.files.push(checkbox.parent('tr').attr('data-file'));
				}
			});

			echo({
				url: atheos.controller,
				data: data,
				success: function(reply) {
					toast(reply);
					if (reply.status !== 'error') {
						message.empty();
						oX('input[type="checkbox"][group="cg_overview"][parent="true"').prop('checked', false);
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
				url: atheos.controller,
				data: {
					target: 'codegit',
					action: 'fileStatus',
					path: path
				},
				settled: function(status, reply) {
					var text = '';
					if (status !== 'error') {
						text = `${self.icon}${reply.branch}: +${reply.insertions}, -${reply.deletions}`;
					}
					if (self.fileStatus) {
						self.fileStatus.html(text);
					}
				}
			});
		},

		checkRepoStatus: function() {
			var repo = atheos.project.current.path;

			echo({
				url: atheos.controller,
				data: {
					target: 'codegit',
					action: 'repoStatus',
					repo
				},
				success: function(reply) {
					var status = 'Unknown';
					if (reply.status !== 'error') {
						status = reply.text;
					}

					if (self.repoStatus) {
						self.repoStatus.text(i18n('codegit_' + status.toLowerCase()));
					}
					if (self.repoBanner) {
						self.repoBanner.replaceClass('repoCommitted repoUncommitted repoUntracked', 'repo' + status);
					}
				}
			});
		},

		diff: function(anchor) {
			let {
				path,
				inRepo: repo
			} = anchor;

			if (!path || !repo) return;
			path = path.replace(repo + '/', '');
			self.showDialog('diff', repo, path);
		},

		blame: function(anchor) {
			let {
				path,
				inRepo: repo
			} = anchor;

			if (!path || !repo) return;
			path = path.replace(repo + '/', '');
			self.showDialog('blame', repo, path);
		},

		log: function(anchor) {
			let {
				path,
				inRepo: repo
			} = anchor;

			if (!path || !repo) return;
			path = path.replace(repo + '/', '');
			self.showDialog('log', repo, path);
		},

		undo: function(repo, file) {
			var undo = function() {
				echo({
					url: atheos.controller,
					data: {
						target: 'codegit',
						action: 'checkout',
						repo,
						file
					},
					success: function(reply) {
						toast(reply);
					}
				});
			};

			atheos.alert.show({
				banner: i18n('git_undo'),
				message: i18n('git_undo_file', pathinfo(file).basename),
				actions: {
					'Undo Changes': undo,
					'Cancel': function() {}
				}
			});
		},

		transfer: function(type) {
			var repo = self.activeRepo;
			var remote = oX('#git_remotes').value();
			var branch = oX('#git_branches').value();

			echo({
				url: atheos.controller,
				data: {
					target: 'codegit',
					action: 'transfer',
					type,
					repo,
					remote,
					branch
				},
				settled: function(status, reply) {
					output(status, reply);
				}
			});
		},

		configure: function(type) {
			var data = {
				target: 'codegit',
				action: 'configure',
				repo: self.activeRepo,
				type
			};

			var name = oX('#' + type + '_name');
			var email = oX('#' + type + '_email');

			data.name = name ? name.value() : false;
			data.email = email ? email.value() : false;

			echo({
				url: atheos.controller,
				data,
				success: function(reply) {
					log(reply);
				}
			});
		},

		addStatusElements: function() {
			self.repoBanner = oX('#codegit_repo_banner');
			self.repoStatus = oX('#codegit_repo_status');
			self.fileStatus = oX('#codegit_file_status');

			if (!self.repoBanner.exists()) {
				oX('#file-manager').before('<div id="codegit_repo_banner">Commit Status: <span id="codegit_repo_status"></span></div>');
				self.repoBanner = oX('#codegit_repo_banner');
				self.repoStatus = oX('#codegit_repo_status');
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

		showRepoBanner: function() {
			var setting = storage('codegit.repoBanner');
			setting = setting === 'disabled' ? false : true;
			return setting;
		},

		showFileStatus: function() {
			var setting = storage('codegit.fileStatus');
			setting = setting === 'disabled' ? false : true;
			return setting;
		}
	};
})(this);