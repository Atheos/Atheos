/*
	* Copyright (c) atheos & Andr3as, distributed
	* as-is and without warranty under the MIT License.
	* See http://opensource.org/licenses/MIT for more information. 
	* This information must remain intact.
	*/

(function(global, $) {

	var codegit = null;

	var atheos = global.atheos,
		amplify = global.amplify,
		oX = global.onyx,
		scripts = document.getElementsByTagName('script'),
		path = scripts[scripts.length - 1].src.split('?')[0],
		curpath = path.split('/').slice(0, -1).join('/') + '/';

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


	amplify.subscribe('atheos.plugins', () => atheos.codegit.init());

	atheos.codegit = {

		path: '/components/codegit/',
		controller: '/components/codegit/controller.php',
		dialog: '/components/codegit/dialog.php',
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
			codegit = this;

			//Check if directories has git repo
			amplify.subscribe('filemanager.openDir', codegit.scanForGit);

			//Repo updates
			amplify.subscribe('chrono.mega', codegit.checkRepoStatus);

			//Handle contextmenu
			amplify.subscribe('contextmenu.show', this.showContextMenu);

			amplify.subscribe("contextmenu.hide", function(obj) {
				var children = obj.menu.find('.codegit');
				children.forEach((child) => child.remove());
			});

			amplify.subscribe('active.onFocus', function(path) {
				codegit.checkFileStatus(path);
			});

			amplify.subscribe('active.onSave', function(path) {
				setTimeout(function() {
					codegit.checkFileStatus(path);
					codegit.checkRepoStatus();
				}, 50);
			});

			amplify.subscribe('active.close active.closeAll', function() {
				codegit.fileStatus.empty();
			});

			// amplify.subscribe('settings.changed', function() {
			// 	codegit.showRepoStatus();
			// });

			$('.commit_hash').live('click', function() {
				var commit;
				if (typeof($(this).attr('data-hash')) != 'undefined') {
					commit = $(this).attr('data-hash');
				} else {
					commit = $(this).text();
				}
				commit = commit.replace("commit", "").trim();
				atheos.codegit.showCommit(atheos.codegit.location, commit);
			});
		},

		scanForGit: function(directory) {
			directory.files.forEach(function(file, i) {
				if (atheos.common.getNodeName(file.path) === '.git') {
					directory.node.addClass('repo');
					if (directory.node.find('i.repo-icon').length === 0) {
						directory.node.append('<i class="repo-icon fas fa-code-branch"></i>');
					}
				} else if (file.repo) {
					//Deeper inspect
					var repo = oX('#file-manager a[data-path="' + file.path + '"]');
					repo.addClass('repo');
					if (repo.find('i.repo-icon').length === 0) {
						repo.append('<i class="repo-icon fas fa-code-branch"></i>');
					}
				}
			});
			// Repo status
			codegit.showRepoStatus();
		},

		//Check if directories has git repo
		showRepoStatus: function() {
			if (oX('#project-root').hasClass('repo')) {
				codegit.addStatusElements();
				codegit.checkRepoStatus();

			} else {
				if (codegit.repoBanner) {
					codegit.repoBanner.hide();
				}
				if (codegit.fileStatus) {
					codegit.fileStatus.hide();
				}
			}
		},


		showContextMenu: function(obj) {
			var codegit = atheos.codegit;
			var path = obj.path,
				root = oX('#project-root').attr('data-path'),
				counter = 0;

			var target = obj.node;

			if (obj.type == 'directory') {
				obj.menu.append('<hr class="directory-only codegit">');
				if (target.hasClass('repo')) {
					obj.menu.append('<a class="directory-only codegit" onclick="atheos.codegit.showCodeGit(\'' + obj.path + '\');">' + codegit.icon + 'Open CodeGit</a>');
					obj.menu.append('<a class="directory-only codegit" onclick="atheos.codegit.submoduleDialog(\'' + obj.path + '\');">' + codegit.icon + 'Add Submodule</a>');
				} else {
					obj.menu.append('<a class="directory-only codegit" onclick="atheos.codegit.gitInit(\'' + obj.path + '\');">' + codegit.icon + 'Git Init</a>');
					obj.menu.append('<a class="directory-only codegit" onclick="atheos.codegit.clone(\'' + obj.path + '\');">' + codegit.icon + 'Git Clone</a>');

					//Git Submodule
					while (path != root) {
						path = codegit.dirname(path);
						if ($('[data-path="' + path + '"]').hasClass('repo')) {
							obj.menu.append('<a class="directory-only codegit" onclick="atheos.codegit.submoduleDialog(\'' + path + '\', \'' + obj.path + '\');">' + codegit.icon + 'Add Submodule</a>');
							break;
						}
						if (counter >= 10) break;
						counter++;
					}
				}
			} else {
				var file = path;
				while (path != root) {
					path = codegit.dirname(path);
					if ($('[data-path="' + path + '"]').hasClass('repo')) {
						obj.menu.append('<hr class="file-only codegit">');
						obj.menu.append('<a class="file-only codegit" onclick="atheos.codegit.diff(\'' + obj.path + '\', \'' + path + '\');">' + codegit.icon + 'Git Diff</a>');
						obj.menu.append('<a class="file-only codegit" onclick="atheos.codegit.blame(\'' + obj.path + '\', \'' + path + '\');">' + codegit.icon + 'Git Blame</a>');
						obj.menu.append('<a class="file-only codegit" onclick="atheos.codegit.history(\'' + obj.path + '\', \'' + path + '\');">' + codegit.icon + 'Git History</a>');

						//Init Submodules
						if (codegit.basename(file) == '.gitmodules') {
							obj.menu.append('<a class="directory-only codegit" onclick="atheos.codegit.initSubmodule(\'' + codegit.dirname(file) + '\', \'' + obj.path + '\');">' + codegit.icon + 'Init Submodule</a>');
						}
						break;
					}
					if (counter >= 10) break;
					counter++;
				}
			}
		},

		showCodeGit: function(repo) {
			repo = repo || oX('#project-root').attr('data-path');
			codegit.activeRepo = repo;

			atheos.modal.load(800, codegit.dialog + '?action=codegit&repo=' + repo);

			atheos.modal.ready.then(function() {
				oX('#panel_menu').on('click', function(e) {
					var target = oX(e.target);
					var tagName = target.el.tagName;
					if (tagName === 'A') {
						codegit.showPanel(target.attr('data-panel'), repo);
					}
				});

				oX('#panel_view').on('click', function(e) {
					var target = oX(e.target);
					var tagName = target.el.tagName;
					if (tagName === 'BUTTON') {
						if (target.text() === 'Diff') {
							codegit.showPanel('diff', repo, {
								files: [target.parent('tr').attr('data-file')]
							});
						} else if (target.text() === 'Undo') {
							// codegit.showPanel(target.attr('data-panel'), repo);
						}
					}
				});

				codegit.monitorCheckBoxes();
				atheos.modal.resize();
			});
		},

		showPanel: function(panel, repo, data) {
			if (typeof(panel) === 'string') {
				var menu = oX('#panel_menu a[data-panel="' + panel + '"]');
				if (menu) {
					oX('#panel_menu .active').removeClass('active');
					menu.addClass('active');
				}
				data = data || {};
				data.action = 'loadPanel';
				data.panel = panel;
				data.repo = repo;

				ajax({
					url: codegit.dialog,
					data: data,
					success: function(reply) {
						oX('#panel_view').empty();
						oX('#panel_view').html(reply);
					}
				});
			}
		},

		showDialog: function(type, repo, path) {
			path = path || oX('#project-root').attr('data-path');
			codegit.location = repo || codegit.location;
			atheos.modal.load(600, codegit.dialog + '?action=loadPanel&panel=' + type + "&repo=" + repo + "&path=" + path);
		},

		diff: function(path, repo) {
			if (!path || !repo) return;

			repo = this.getPath(repo);
			path = path.replace(repo + "/", "");

			codegit.showDialog('diff', repo, path);
		},


		gitInit: function(path) {
			$.getJSON(this.path + 'controller.php?action=init&path=' + path, function(result) {
				atheos.toast[result.status](result.message);
				if (result.status == 'success') {
					$('.directory[data-path="' + path + '"]').addClass('hasRepo');
					atheos.filemanager.rescan(path);
				}
			});
		},

		/**
			* Clone repo or show dialog to clone repo
			* 
			* @param {string} path
			* @param {string} repo
			* @param {boolean} init_submodules
			*/
		clone: function(path, repo, init_submodules) {
			var codegit = this;
			init_submodules = init_submodules || "false";
			if (typeof(repo) == 'undefined') {
				this.showDialog('clone', path);
			} else {
				atheos.modal.unload();
				$.getJSON(codegit.path + 'controller.php?action=clone&path=' + path + '&repo=' + repo + '&init_submodules=' + init_submodules, function(result) {
					if (result.status == 'login_required') {
						atheos.toast.show('error', result.message);
						codegit.showDialog('login', codegit.location);
						codegit.login = function() {
							var username = $('.git_login_area #username').val();
							var password = $('.git_login_area #password').val();
							atheos.modal.unload();
							$.post(codegit.path + 'controller.php?action=clone&path=' + path + '&repo=' + repo + '&init_submodules=' + init_submodules, {
									username: username,
									password: password
								},
								function(result) {
									result = JSON.parse(result);
									atheos.toast[result.status](result.message);
									if (result.status == 'success') {
										atheos.filemanager.rescan(path);
									}
								});
						};
					} else {
						atheos.toast[result.status](result.message);
					}
					if (result.status == 'success') {
						atheos.filemanager.rescan(path);
					}
				});
			}
		},




		commit: function() {
			var message = oX('#commit_message');
			var path = this.getPath(codegit.activeRepo);

			var data = {
				files: [],
				message: message.value(),
				path: path
			};

			var checkboxes = oX('#codegit_overview tbody').find('input[type="checkbox"]');
			checkboxes.forEach((checkbox) => {
				if (checkbox.el.checked) {
					data.files.push(checkbox.parent('tr').attr('data-file'));
				}
			});

			ajax({
				url: this.controller + '?action=commit',
				data: data,
				success: function(data) {
					log(data);
					atheos.toast.show(data);
					if (data.status !== 'error') {
						message.empty();
						checkboxes.forEach((checkbox) => {
							if (checkbox.el.checked) {
								checkbox.parent('tr').remove();
							}
						});
					}
				}
			});
		},


		push: function() {
			var codegit = this;
			var remote = $('.git_push_area #git_remotes').val();
			var branch = $('.git_push_area #git_branches').val();
			this.showDialog('overview', this.location);
			$.getJSON(this.path + 'controller.php?action=push&path=' + this.location + '&remote=' + remote + '&branch=' + branch, function(result) {
				if (result.status == 'login_required') {
					atheos.toast.show('error', result.message);
					codegit.showDialog('login', codegit.location);
					codegit.login = function() {
						var username = $('.git_login_area #username').val();
						var password = $('.git_login_area #password').val();
						codegit.showDialog('overview', codegit.location);
						$.post(codegit.path + 'controller.php?action=push&path=' + codegit.location + '&remote=' + remote + '&branch=' + branch, {
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
						$.post(codegit.path + 'controller.php?action=push&path=' + codegit.location + '&remote=' + remote + '&branch=' + branch, {
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

		checkout: function(path, repo) {
			var result = confirm("Are you sure to undo the changes on: " + path);
			if (result) {
				$.getJSON(this.path + 'controller.php?action=checkout&repo=' + repo + '&path=' + path, function(result) {
					atheos.toast[result.status](result.message);
					if (atheos.active.isOpen(repo + "/" + path)) {
						atheos.toast.notice("Reloading file after undoing changes");
						atheos.active.close(repo + "/" + path);
						atheos.filemanager.openFile(repo + "/" + path);
					}
				});
			}
		},

		getRemotes: function(path) {
			path = this.getPath(path);
			$.getJSON(this.path + 'controller.php?action=getRemotes&path=' + path, function(result) {
				if (result.status == 'error') {
					atheos.toast.show('error', result.message);
					return;
				}
				$.each(result.data, function(i, item) {
					$('#git_remotes').append('<option value="' + i + '">' + i + '</option>');
				});
				$.each(result.data, function(i, item) {
					$('.git_remote_info').html(item);
					return false;
				});
				$('#git_remotes').live('change', function() {
					var value = $('#git_remotes').val();
					$('.git_remote_info').html(result.data[value]);
				});
			});
		},

		newRemote: function(path) {
			var codegit = this;
			path = this.getPath(path);
			var name = $('.git_new_remote_area #remote_name').val();
			var url = $('.git_new_remote_area #remote_url').val();
			$.getJSON(this.path + 'controller.php?action=newRemote&path=' + path + '&name=' + name + '&url=' + url, function(result) {
				codegit.showDialog('overview', codegit.location);
				atheos.toast[result.status](result.message);
			});
		},

		removeRemote: function(path) {
			var codegit = this;
			path = this.getPath(path);
			var name = $('#git_remotes').val();
			var result = confirm("Are you sure to remove the remote: " + name);
			if (result) {
				$.getJSON(this.path + 'controller.php?action=removeRemote&path=' + path + '&name=' + name, function(result) {
					atheos.toast[result.status](result.message);
				});
			}
			this.showDialog('overview', this.location);
		},

		renameRemote: function(path) {
			path = this.getPath(path);
			var name = $('#git_remote').text();
			var newName = $('#git_new_name').val();
			$.getJSON(this.path + 'controller.php?action=renameRemote&path=' + path + '&name=' + name + '&newName=' + newName, function(result) {
				atheos.toast[result.status](result.message);
			});
			this.showDialog('overview', this.location);
		},

		getRemoteBranches: function(path) {
			path = this.getPath(path);
			$.getJSON(this.path + 'controller.php?action=getRemoteBranches&path=' + path, function(result) {
				if (result.status == 'error') {
					atheos.toast.show('error', result.message);
					return;
				}
				$.each(result.data.branches, function(i, item) {
					$('#git_remote_branches').append('<option value="' + item + '">' + item + '</option>');
				});
				$('#git_new_branch').val(result.data.current.substr(result.data.current.search('/') + 1));
				$('#git_remote_branches').val(result.data.current);
			});
		},

		checkoutRemote: function(path) {
			path = this.getPath(path);
			var remoteName = $('#git_remote_branches').val();
			var name = $('#git_new_branch').val();
			$.getJSON(this.path + 'controller.php?action=checkoutRemote&path=' + path + '&name=' + name + '&remoteName=' + remoteName, function(result) {
				atheos.toast[result.status](result.message);
			});
			this.showDialog('remote', this.location);
		},

		getBranches: function(path) {
			path = this.getPath(path);
			$.getJSON(this.path + 'controller.php?action=getBranches&path=' + path, function(result) {
				if (result.status == 'error') {
					atheos.toast.show('error', result.message);
					return;
				}
				$.each(result.data.branches, function(i, item) {
					$('#git_branches').append('<option value="' + item + '">' + item + '</option>');
				});
				$('#git_branches').val(result.data.current);
			});
		},

		newBranch: function(path) {
			var codegit = this;
			path = this.getPath(path);
			var name = $('.git_new_branch_area #branch_name').val();
			$.getJSON(this.path + 'controller.php?action=newBranch&path=' + path + '&name=' + name, function(result) {
				codegit.showDialog('branches', codegit.location);
				atheos.toast[result.status](result.message);
			});
		},

		deleteBranch: function(path) {
			path = this.getPath(path);
			var name = $('#git_branches').val();
			var result = confirm("Are you sure to remove the branch: " + name);
			if (result) {
				$.getJSON(this.path + 'controller.php?action=deleteBranch&path=' + path + '&name=' + name, function(result) {
					atheos.toast[result.status](result.message);
				});
			}
			this.showDialog('branches', this.location);
		},

		checkoutBranch: function(path) {
			path = this.getPath(path);
			var name = $('#git_branches').val();
			$.getJSON(this.path + 'controller.php?action=checkoutBranch&path=' + path + '&name=' + name, function(result) {
				atheos.toast[result.status](result.message);
			});
			this.showDialog('overview', this.location);
		},

		renameBranch: function(path) {
			path = this.getPath(path);
			var name = $('#git_branch').text();
			var newName = $('#git_new_name').val();
			$.getJSON(this.path + 'controller.php?action=renameBranch&path=' + path + '&name=' + name + '&newName=' + newName, function(result) {
				atheos.toast[result.status](result.message);
			});
			this.showDialog('overview', this.location);
		},

		merge: function(path) {
			var codegit = this;
			path = this.getPath(path);
			var name = $('#git_branches').val();
			var result = confirm("Are you sure to merge " + name + " into the current branch?");
			if (result) {
				$.getJSON(this.path + 'controller.php?action=merge&path=' + path + '&name=' + name, function(result) {
					atheos.toast[result.status](result.message);
				});
			}
			this.showDialog('overview', this.location);
		},

		rename: function(fPath) {
			var codegit = this;
			var path = codegit.dirname(fPath);
			var old_name = fPath.replace(path, "").substr(1);
			if (old_name.length === 0 || old_name === fPath) {
				//atheos renaming
				atheos.filemanager.rename(fPath);
				return;
			}
			var shortName = atheos.common.getNodeName(fPath);
			var type = atheos.filemanager.getType(fPath);
			atheos.modal.load(250, atheos.filemanager.dialog, {
				action: 'rename',
				path: fPath,
				short_name: shortName,
				type: type
			});
			$('#modal-content form')
				.live('submit', function(e) {
					e.preventDefault();
					var newName = $('#modal-content form input[name="object_name"]')
						.val();
					// Build new path
					var arr = fPath.split('/');
					var temp = [];
					for (i = 0; i < arr.length - 1; i++) {
						temp.push(arr[i]);
					}
					var newPath = temp.join('/') + '/' + newName;
					atheos.modal.unload();
					$.getJSON(codegit.path + "controller.php?action=rename&path=" + path + "&old_name=" + old_name + "&new_name=" + newName, function(data) {
						if (data.status != 'error') {
							atheos.toast.show('success', type.charAt(0)
								.toUpperCase() + type.slice(1) + ' Renamed');
							var node = $('#file-manager a[data-path="' + fPath + '"]');
							// Change pathing and name for node
							node.attr('data-path', newPath)
								.html(newName);
							if (type == 'file') { // Change icons for file
								curExtClass = 'ext-' + atheos.common.getNodeExtension(fPath);
								newExtClass = 'ext-' + atheos.common.getNodeExtension(newPath);
								$('#file-manager a[data-path="' + newPath + '"]')
									.removeClass(curExtClass)
									.addClass(newExtClass);
							} else { // Change pathing on any sub-files/directories
								atheos.filemanager.repathChildren(path, newPath);
							}
							// Change any active files
							atheos.active.rename(fPath, newPath);
						} else {
							atheos.toast.show('error', data.message);
							atheos.filemanager.rename(fPath);
						}
					});
				});
		},

		submoduleDialog: function(repo, path) {
			this.location = repo;
			if (repo === path) {
				path = "";
			} else {
				path = path.replace(repo + "/", "");
			}
			this.files = [];
			this.files.push(path);
			this.showDialog('submodule');
		},

		submodule: function(repo, dir, submodule) {
			var codegit = this;
			repo = repo || this.location;
			path = dir;
			if (this.files[0] != "") {
				path = this.files[0] + "/" + dir;
			}
			codegit.showDialog('overview', repo);
			$.getJSON(this.path + 'controller.php?action=submodule&repo=' + repo + '&path=' + path + '&submodule=' + submodule, function(result) {
				if (result.status == 'login_required') {
					atheos.toast.show('error', result.message);
					codegit.showDialog('login', codegit.location);
					codegit.login = function() {
						var username = $('.git_login_area #username').val();
						var password = $('.git_login_area #password').val();
						codegit.showDialog('overview', codegit.location);
						$.post(codegit.path + 'controller.php?action=submodule&repo=' + repo + '&path=' + path + '&submodule=' + submodule, {
							username: username,
							password: password
						}, function(result) {
							result = JSON.parse(result);
							atheos.toast[result.status](result.message);
							if (result.status == 'success') {
								atheos.filemanager.rescan(repo);
							}
						});
					};
				} else if (result.status == 'passphrase_required') {
					atheos.toast.show('error', result.message);
					codegit.showDialog('passphrase', codegit.location);
					codegit.login = function() {
						var passphrase = $('.git_login_area #passphrase').val();
						codegit.showDialog('overview', codegit.location);
						$.post(codegit.path + 'controller.php?action=submodule&repo=' + repo + '&path=' + path + '&submodule=' + submodule, {
							passphrase: passphrase
						}, function(result) {
							result = JSON.parse(result);
							atheos.toast[result.status](result.message);
							if (result.status == 'success') {
								atheos.filemanager.rescan(repo);
							}
						});
					};
				} else {
					atheos.toast[result.status](result.message);
					if (result.status == 'success') {
						atheos.filemanager.rescan(repo);
					}
				}
			});
		},

		initSubmodule: function(path) {
			var codegit = this;
			path = path || this.location;
			$.getJSON(this.path + 'controller.php?action=initSubmodule&path=' + path, function(result) {
				if (result.status == 'login_required') {
					atheos.toast.show('error', result.message);
					codegit.showDialog('login', codegit.location);
					codegit.login = function() {
						var username = $('.git_login_area #username').val();
						var password = $('.git_login_area #password').val();
						codegit.showDialog('overview', codegit.location);
						$.post(codegit.path + 'controller.php?action=initSubmodule&path=' + path, {
							username: username,
							password: password
						}, function(result) {
							result = JSON.parse(result);
							atheos.toast[result.status](result.message);
							if (result.status == 'success') {
								atheos.filemanager.rescan(path);
							}
						});
					};
				} else if (result.status == 'passphrase_required') {
					atheos.toast.show('error', result.message);
					codegit.showDialog('passphrase', codegit.location);
					codegit.login = function() {
						var passphrase = $('.git_login_area #passphrase').val();
						codegit.showDialog('overview', codegit.location);
						$.post(codegit.path + 'controller.php?action=initSubmodule&path=' + path, {
							passphrase: passphrase
						}, function(result) {
							result = JSON.parse(result);
							atheos.toast[result.status](result.message);
							if (result.status == 'success') {
								atheos.filemanager.rescan(path);
							}
						});
					};
				} else {
					atheos.toast[result.status](result.message);
					if (result.status == 'success') {
						atheos.filemanager.rescan(path);
					}
				}
			})
		},

		checkFileStatus: function(path) {
			path = path || atheos.active.getPath();

			ajax({
				url: codegit.controller,
				data: {
					action: 'fileStatus',
					path: path
				},
				success: function(reply) {
					text = '';
					if (reply.status !== 'error') {
						text = `${codegit.icon}${reply.branch}: +${reply.insertions}, -${reply.deletions}`;
					}
					if (codegit.fileStatus) {
						codegit.fileStatus.html(text);
					}
				}
			})
		},

		checkRepoStatus: function(path) {
			var path = atheos.project.current.path;

			ajax({
				url: codegit.controller,
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

					if (codegit.repoStatus) codegit.repoStatus.text(status);
					if (codegit.repoBanner) codegit.repoBanner.replaceClass("repoCommitted repoUncommitted repoUntracked", "repo" + status)
				}
			});
		},

		showCommit: function(path, commit) {
			var codegit = this;
			path = this.getPath(path);
			this.showDialog('showCommit', path);
			$.getJSON(this.path + 'controller.php?action=showCommit&path=' + this.encode(path) + '&commit=' + commit, function(result) {
				$('.git_show_commit_area .hash').text(commit);
				if (result.status != "success") {
					atheos.toast.show('error', result.message);
					codegit.showDialog('overview', path);
				}
				// result.data = codegit.renderDiff(result.data);
				$('.git_show_commit_area .content ul').append(result.data.join(""));
			});
		},

		blame: function(path, repo) {
			if (!path || !repo) return;

			repo = this.getPath(repo);
			path = path.replace(repo + "/", "");



			codegit.showDialog('blame', repo, path);
			// atheos.modal.ready.then(function() {

			// 	var blame = oX('#codegit_blame');
			// 	var data = JSON.parse(blame.text());
			// 	blame.empty();

			// 	blame.html(codegit.renderBlame(data));

			// 	console.log(data);
			// });
		},

		renderBlame: function(data) {
			data = Object.values(data);
			// var codegit = this;
			// this.location = repo;
			// path = path.replace(repo + "/", "");
			// this.showDialog('blame', repo);
			// $.getJSON(this.path + 'controller.php?action=blame&repo=' + this.encode(repo) + '&path=' + this.encode(path), function(result) {
			// 	log(result);
			// 	return;
			// 	if (result.status != "success") {
			// 		atheos.toast.show('error', result.message);
			// 		codegit.showDialog('overview', repo);
			// 	}
			// 	$('.git_blame_area table thead th').text(path);
			// 	//Split blame output per file line
			var hashRegExp = /^[a-z0-9]{40}/;
			var starts, startIndexes = [],
				segments = [],
				s, e, i;
			starts = data.filter(function(line) {
				return hashRegExp.test(line);
			});
			for (i = 0; i < starts.length; i++) {
				startIndexes.push(data.indexOf(starts[i]));
			}
			for (i = 0; i < starts.length; i++) {
				s = startIndexes[i];
				e = (i < (starts.length - 1)) ? (startIndexes[i + 1]) : (data.length);
				segments.push(data.slice(s, e));
			}
			//Combine lines with the same commit
			var hash = segments[0][0].match(hashRegExp)[0];
			var unique = [{
				segment: segments[0],
				hash: hash,
				lines: [segments[0][12]]
			}];
			for (i = 1; i < segments.length; i++) {
				if (hash === segments[i][0].match(hashRegExp)[0]) {
					//Same
					unique[unique.length - 1].lines.push(segments[i][12]);
				} else {
					hash = segments[i][0].match(hashRegExp)[0];
					//Next
					unique.push({
						segment: segments[i],
						hash: hash,
						lines: [segments[i][12]]
					});
				}
			}
			//Format output
			var output = "",
				msg, date, name, line;
			for (i = 0; i < unique.length; i++) {
				msg = unique[i].segment[9].replace("summary ", "");
				date = unique[i].segment[7].replace("committer-time ", "");
				date = new Date(date * 1000);
				date = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
				name = unique[i].segment[5].replace("committer ", "");
				hash = unique[i].hash;
				output += '<tr><td>' + msg + '<br>' + name + ': ' + date + '</td>';
				output += '<td class="commit_hash" data-hash="' + hash + '">' + hash.substr(0, 8) + '</td><td><ol>';
				for (var j = 0; j < unique[i].lines.length; j++) {
					line = unique[i].lines[j].replace(new RegExp('\t', 'g'), ' ')
						.replace(new RegExp(' ', 'g'), "&nbsp;")
						.replace(new RegExp('\n', 'g'), "<br>");
					output += '<li>' + line + '</li>';
				}
				output += '</ol></td></tr>';
			}
			$('.git_blame_area table tbody').html(output);
			// });
		},

		history: function(path, repo) {
			this.location = repo;
			path = path.replace(repo + "/", "");
			this.files = [];
			this.files.push(path);
			this.showDialog('log', repo);
		},

		network: function(path) {
			var codegit = this;
			path = this.getPath(path);
			this.showDialog('network', path);
			$.getJSON(this.path + 'controller.php?action=network&path=' + this.encode(path), function(result) {
				codegit.network_graph.setData(result.data);
				codegit.network_graph.generate();
			});
		},

		login: function() {},

		setSettings: function(path) {
			var codegit = this;
			var settings = {};
			path = this.getPath(path);
			$('.git_settings_area input:not(.no_setting)').each(function(i, el) {
				settings[$(el).attr("id")] = $(el).val();
			});

			$.post(this.path + 'controller.php?action=setSettings&path=' + path, {
				settings: JSON.stringify(settings)
			}, function(result) {
				result = JSON.parse(result);
				atheos.toast[result.status](result.message);
				codegit.showDialog('overview', codegit.location);
			});
		},

		getSettings: function(path) {
			path = this.getPath(path);
			$.getJSON(this.path + 'controller.php?action=getSettings&path=' + path, function(result) {
				if (result.status == 'error') {
					atheos.toast.show('error', result.message);
					return;
				}
				var local = false;
				$.each(result.data, function(i, item) {
					if (/\//.test(i)) {
						return;
					}
					$('.git_settings_area #' + i).val(item);
					if (/^local_/.test(i)) {
						local = true;
					}
				});
				if (!local) {
					$('#box_local').click();
				}
			});
		},

		/**
			* Get path
			* 
			* @param {string} [path]
			* @result {string} path
			*/
		getPath: function(path) {
			if (typeof(path) == 'undefined') {
				return this.location;
			} else {
				return path;
			}
		},

		/**
			* Get basename
			* 
			* @param {string} [path]
			* @result {string} basename
			*/
		basename: function(path) {
			return path.replace(/\\/g, '/').replace(/.*\//, '');
		},

		/**
			* Get dirname
			* 
			* @param {string} [path]
			* @result {string} dirname
			*/
		dirname: function(path) {
			if (path) {
				return path.replace(/\\/g, '/').replace(/\/[^\/]*$/, '');
			}
			return false;
		},

		findRepo: function(path) {
			var root = oX('#project-root').attr('data-path'),
				counter = 0;

			var file = path;
			while (path != root) {
				path = codegit.dirname(path);
				if ($('[data-path="' + path + '"]').hasClass('repo')) {
					return path;
					break;
				}
				if (counter >= 10) break;
				counter++;
			}
			return false;
		},

		/**
			* Encode Uri component
			* 
			* @param {string} [string]
			* @result {string} encoded string
			*/
		encode: function(string) {
			return encodeURIComponent(string);
		},

		addStatusElements: function() {
			if (!codegit.repoBanner) {
				oX('#file-manager').before('<div id="codegit_repo_banner">Commit Status: <span id="codegit_repo_status"></span></div>');
				codegit.repoBanner = oX('#codegit_repo_banner');
				codegit.repoStatus = oX('#codegit_repo_status');

				// Add eventListener to open CodeGit
				oX("#codegit_repo_banner").on('click', function() {
					atheos.codegit.showCodeGit();
				});

				if (codegit.repoBannerDisabled() !== true) {
					codegit.repoBanner.show();
				} else {
					codegit.repoBanner.hide();
				}
			}
			if (!codegit.fileStatus) {
				oX('#current_file').after('<div class="divider"></div><div id="codegit_file_status"></div>');
				codegit.fileStatus = oX('#codegit_file_status');

				if (codegit.fileStatusDisabled() !== true) {
					codegit.fileStatus.show();
				} else {
					codegit.fileStatus.hide();
				}
			}
		},

		monitorCheckBoxes: function() {
			var checkboxAll = oX('#codegit_overview #check_all');
			var checkboxes = oX('#codegit_overview tbody').find('input[type="checkbox"]');

			checkboxAll.on('click', function() {
				var status = checkboxAll.el.checked;
				checkboxes.forEach((checkbox) => checkbox.el.checked = status);
			});

			oX('#codegit_overview tbody').on('click', function(e) {
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
		},

		repoBannerDisabled: function() {
			var setting = atheos.storage('plugin.codegit.disableRepoBanner');
			return setting || false;
		},

		fileStatusDisabled: function() {
			var setting = atheos.storage('plugin.codegit.disableFileStatus');
			return setting || false;
		},

		suppressCommitDiff: function() {
			var setting = atheos.storage('plugin.codegit.suppressCommitDiff');
			return setting || false;
		}
	};
})(this, jQuery);