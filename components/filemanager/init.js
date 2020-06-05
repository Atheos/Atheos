/*jshint esversion: 6 */

//////////////////////////////////////////////////////////////////////////////80
// FileManager Init
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80
// Notes:
// Goodness this file is very complex; it's going to take a very long time
// to really get a grasp of what's going on in this file and how to
// refactor it.
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';
	var atheos = global.atheos,
		amplify = global.amplify,
		ajax = global.ajax,
		fileIcons = global.FileIcons,
		oX = global.onyx;

	var self = null;

	amplify.subscribe('system.loadMajor', () => atheos.filemanager.init());

	atheos.filemanager = {

		clipboard: '',

		noOpen: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'exe', 'zip', 'tar', 'tar.gz'],
		noBrowser: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],

		controller: 'components/filemanager/controller.php',
		dialog: 'components/filemanager/dialog.php',
		openTrigger: 'single',
		showHidden: true,

		init: function() {
			self = this;
			// Initialize node listener
			this.nodeListener();

			amplify.subscribe('settings.loaded', function() {
				var local = atheos.storage('filemanager.openTrigger');
				if (local === 'single' || local === 'double') {
					self.openTrigger = local;
				}
				self.showHidden = atheos.storage('filemanager.showHidden') === false ? false : self.showHidden;
			});
		},

		//////////////////////////////////////////////////////////////////
		// Listen for click events on nodes
		//////////////////////////////////////////////////////////////////
		nodeListener: function() {

			var checkAnchor = function(node) {
				node = oX(node);
				//////////////////////////////////////////////////////////////////
				// This tagname business is due to the logical but annoying way
				// event delegation is handled. I keep trying to avoid organizing
				// the css in a better way for the file manager, and this is the
				// result.
				//////////////////////////////////////////////////////////////////
				var tagName = node.el.tagName;
				if (tagName === 'UL') {
					return false;
				} else if (tagName !== 'A') {
					if (tagName === 'LI') {
						node = node.find('a');
					} else {
						node = node.parent('a');
					}
				}
				return node;
			};

			var nodeFunctions = function(node) {
				if (node) {
					if (node.attr('data-type') === 'directory' || node.attr('data-type') === 'root') {
						self.openDir(node.attr('data-path'));
					} else if (node.attr('data-type') === 'file') {
						self.openFile(node.attr('data-path'));
					}
				}
			};

			oX('#file-manager').on('click', function(e) {
				if (self.openTrigger === 'single') {
					nodeFunctions(checkAnchor(e.target));
				}
			});

			oX('#file-manager').on('dblclick', function(e) {
				if (self.openTrigger === 'double') {
					nodeFunctions(checkAnchor(e.target));
				}
			});

			oX('#file-manager').on('mousedown', function(e) {
				var options = {
					dragZone: oX('#file-manager').el,
					direction: 'vertical',
					drop: self.handleDrop
				};
				atheos.flow.dragNdrop(e, options);
			});
		},

		handleDrop: function(node) {
			//Check for duplicates
			// repathChildren and node
			node = oX(node);
			var parent = node.parent().siblings('a[data-path]')[0];

			node = node.find('a[data-path]');
			var oldPath = node.attr('data-path');
			var parPath = parent.attr('data-path');

			var basename = pathinfo(oldPath).basename;
			var newPath = parPath + '/' + basename;
			log(oldPath, newPath);

			if (oX('#file-manager a[data-path="' + newPath + '"]')) {
				atheos.toast.show('warning', 'Path already exists.');
				return false;
			} else {
				echo({
					url: self.controller,
					data: {
						action: 'move',
						oldPath,
						newPath
					},
					success: function(reply) {
						log(reply);
					}
				});
				return true;
			}
		},

		//////////////////////////////////////////////////////////////////
		// Loop out all files and folders in directory path
		//////////////////////////////////////////////////////////////////
		openDir: function(path, rescan) {
			var slideDuration = 200;
			rescan = rescan || false;

			var node = oX('#file-manager a[data-path="' + path + '"]');
			let icon = node.find('.expand');

			if (node.hasClass('open') && !rescan) {
				node.removeClass('open');

				var list = node.siblings('ul')[0];
				if (list) {
					atheos.flow.slide('close', list.el, slideDuration);
					if (icon) {
						icon.replaceClass('fa-minus', 'fa-plus');
					}
					setTimeout(function() {
						list.remove();
					}, slideDuration);
				}

			} else {
				if (icon) {
					icon.addClass('loading');
				}
				echo({
					url: self.controller,
					data: {
						action: 'index',
						path
					},
					success: function(reply) {
						if (reply.status !== 'error') {
							/* Notify listener */

							var files = reply.index;
							if (files && files.length > 0) {
								if (icon) {
									icon.replaceClass('fa-plus', 'fa-minus');
								}
								var display = ' style="display:none;"';
								if (rescan) {
									display = '';
								}
								var appendage = '<ul' + display + '>';

								files.forEach(function(file) {
									appendage += self.createDirectoryItem(file.path, file.type, file.size);
								});

								appendage += '</ul>';

								if (rescan && node.siblings('ul')[0]) {
									node.siblings('ul')[0].remove();
								}

								node.after(appendage);
								var list = node.siblings('ul')[0];
								if (!rescan && list) {
									atheos.flow.slide('open', list.el, slideDuration);
								}
							}
							amplify.publish('filemanager.openDir', {
								files: files,
								node: node,
								path: path
							});
						}
						node.addClass('open');

						if (icon) {
							icon.removeClass('loading');
							icon.replaceClass('fa-plus', 'fa-minus');
						}
						if (rescan && self.rescanChildren.length > self.rescanCounter) {
							self.rescan(self.rescanChildren[self.rescanCounter++]);
						} else {
							self.rescanChildren = [];
							self.rescanCounter = 0;
						}

					}
				});
			}
		},

		//////////////////////////////////////////////////////////////////
		// Create node in file tree
		//////////////////////////////////////////////////////////////////

		createDirectoryItem: function(path, type, size) {

			var basename = pathinfo(path).basename;

			if (!self.showHidden && basename.charAt(0) === '.') {
				return '';
			}

			var fileClass = type === 'directory' ? 'fa fa-folder blue' : fileIcons.getClassWithColor(basename);

			var nodeClass = 'none';
			if (type === 'directory' && (size > 0)) {
				nodeClass = 'fa fa-plus';
			}

			fileClass = fileClass || 'fa fa-file green';

			return `<li class="draggable">
			<a data-type="${type}" data-path="${path}">
			<i class="expand ${nodeClass}"></i>
			<i class="${fileClass}"></i>
			<span>${basename}</span>
			</a>
			</li>`;
		},


		rescanChildren: [],

		rescanCounter: 0,

		rescan: function(path) {
			path = path || oX('#project-root').attr('data-path');
			if (self.rescanCounter === 0) {
				var list = oX('#file-manager a[data-path="' + path + '"]').siblings('ul')[0];
				var openNodes = list.findAll('a.open');

				for (var i = 0; i < openNodes.length; i++) {
					self.rescanChildren.push(openNodes[i].attr('data-path'));
				}
			}
			self.openDir(path, true);
		},

		//////////////////////////////////////////////////////////////////
		// Open File
		//////////////////////////////////////////////////////////////////

		openFile: function(path, focus, line) {
			focus = focus || true;

			var ext = pathinfo(path).extension.toLowerCase();

			if (self.noOpen.indexOf(ext) < 0) {
				echo({
					url: self.controller,
					data: {
						action: 'open',
						path: path
					},
					success: function(reply) {
						if (reply.status !== 'error') {
							atheos.active.open(path, reply.content, reply.modifyTime, focus);
							if (line) {
								setTimeout(atheos.editor.gotoLine(line), 500);
							}
						}
					}
				});
			} else {
				if (!atheos.common.isAbsPath(path)) {
					if (self.noBrowser.indexOf(ext) < 0) {
						self.download(path);
					} else {
						self.openInModal(path);
					}
				} else {
					atheos.toast.show('error', 'Unable to open file in Browser');
				}
			}
		},

		//////////////////////////////////////////////////////////////////
		// Save file
		// I'm pretty sure the save methods on this are magic and should
		// be worshipped.
		//////////////////////////////////////////////////////////////////
		saveModifications: function(path, data, callbacks) {
			callbacks = callbacks || {};
			data.action = 'save';
			data.path = path;

			echo({
				url: self.controller,
				data: data,
				success: function(data) {
					var context;

					if (data.status === 'success') {
						atheos.toast.show('success', 'File saved');
						if (typeof callbacks.success === 'function') {
							context = callbacks.context || self;
							callbacks.success.call(context, data.modifyTime);
						}
					} else {
						if (data.text === 'Client is out of sync.') {
							atheos.alert.show({
								banner: 'File changed on server!',
								message: 'Would you like to load the updated file?\n' +
									'Pressing no will cause your changes to override the\n' +
									'server\'s copy upon next save.',
								actions: {
									'Reload File': function() {
										atheos.active.remove(path);
										self.openFile(path);
									},
									'Save Anyway': function() {
										var session = atheos.editor.getActive().getSession();
										session.serverMTime = null;
										session.untainted = null;
										atheos.active.save();
									}
								}

							});
						} else {
							atheos.toast.show('error', 'File could not be saved');
						}
						if (typeof callbacks.error === 'function') {
							context = callbacks.context || self;
							callbacks.error.apply(context, [data.data]);
						}
					}
				}
			});
		},

		saveFile: function(path, content, callbacks) {
			// trace({
			// 	file: {
			// 		path,
			// 		content,
			// 		callbacks
			// 	}
			// });
			self.saveModifications(path, {
					content: content
				},
				callbacks);
		},

		savePatch: function(path, patch, mtime, callbacks) {
			// trace({
			// 	patch: {
			// 		path,
			// 		patch,
			// 		mtime,
			// 		callbacks
			// 	}
			// });
			if (patch.length > 0) {
				self.saveModifications(path, {
					patch: patch,
					modifyTime: mtime
				}, callbacks);
			} else if (typeof callbacks.success === 'function') {
				var context = callbacks.context || self;
				callbacks.success.call(context, mtime);
			}
		},

		//////////////////////////////////////////////////////////////////
		// Copy to Clipboard
		//////////////////////////////////////////////////////////////////
		copy: function(path) {
			self.clipboard = path;
			atheos.toast.show('success', 'Copied to Clipboard');
		},

		//////////////////////////////////////////////////////////////////
		// Paste
		//////////////////////////////////////////////////////////////////

		paste: function(path) {
			var split = pathinfo(self.clipboard);
			var copy = split.basename;
			var type = split.type;

			var processPaste = function(path, duplicate) {

				if (duplicate) {
					copy = 'copy_' + copy;
				}

				echo({
					url: self.controller,
					data: {
						action: 'duplicate',
						path: self.clipboard,
						dest: path + '/' + copy
					},
					success: function(reply) {
						if (reply.status !== 'error') {
							self.addToFileManager(path + '/' + copy, type, path);
							/* Notify listeners. */
							amplify.publish('filemanager.paste', {
								path: path,
								dest: copy
							});
						}
					}
				});
			};

			if (self.clipboard === '') {
				atheos.toast.show('error', 'Nothing in Your Clipboard');

			} else if (path === self.clipboard) {
				atheos.toast.show('error', 'Cannot Paste Directory Into Itself');

			} else if (oX('#file-manager a[data-path="' + path + '/' + copy + '"]')) {
				atheos.alert.show({
					banner: 'Path already exists!',
					message: 'Would you like to overwrite or duplicate the file?',
					data: `/${path}/${copy}`,
					actions: {
						'Overwrite': function() {
							processPaste(path, false);
						},
						'Duplicate': function() {
							processPaste(path, true);
						}
					}
				});
			} else {
				processPaste(path, false);
			}

		},

		//////////////////////////////////////////////////////////////////
		// Duplicate Object
		//////////////////////////////////////////////////////////////////
		duplicate: function(path) {
			var split = pathinfo(path);
			var name = split.basename;
			var type = split.type;

			var listener = function(e) {
				e.preventDefault();

				var clone = oX('#modal_content form input[name="clone"]').value();

				// Build new path
				var parent = path.split('/').slice(0, -1).join('/');
				var clonePath = parent + '/' + clone;

				echo({
					url: self.controller,
					data: {
						action: 'duplicate',
						path: path,
						dest: clonePath
					},
					success: function(reply) {
						atheos.toast.show(reply);

						if (reply.status === 'success') {
							self.addToFileManager(clonePath, type, parent);
							atheos.modal.unload();
							/* Notify listeners. */
							amplify.publish('filemanager.duplicate', {
								sourcePath: path,
								clonePath: clonePath,
								type: type
							});
						}
					}
				});
				atheos.modal.unload();
			};

			atheos.modal.load(250,
				self.dialog, {
					action: 'duplicate',
					name: name,
					type: type
				}, () => {
					oX('#modal_content').on('submit', listener);
				});

		},

		//////////////////////////////////////////////////////////////////
		// Create new node
		//////////////////////////////////////////////////////////////////
		create: function(path, type) {
			var listener = function(e) {
				e.preventDefault();

				var nodeName = oX('#modal_content form input[name="nodeName"]').value();
				var newPath = path + '/' + nodeName;

				echo({
					url: self.controller,
					data: {
						action: 'create',
						path: newPath,
						type: type
					},
					success: function(reply) {
						log(reply);
						if (reply.status !== 'error') {
							atheos.toast.show('success', 'File Created');
							atheos.modal.unload();
							// Add new element to filemanager screen
							self.addToFileManager(newPath, type, path);
							if (type === 'file') {
								self.openFile(newPath, true);
							}
							/* Notify listeners. */
							amplify.publish('filemanager.onCreate', {
								createPath: newPath,
								path: path,
								nodeName: nodeName,
								type: type
							});
						}
					}
				});
			};

			atheos.modal.load(250, self.dialog, {
				action: 'create',
				type: type
			}, () => {
				oX('#modal_content').on('submit', listener);
			});
		},

		//////////////////////////////////////////////////////////////////
		// Create node in file tree
		//////////////////////////////////////////////////////////////////
		addToFileManager: function(path, type, parent) {
			var parentNode = oX('#file-manager a[data-path="' + parent + '"]');
			if (!oX('#file-manager a[data-path="' + path + '"]')) {
				// Doesn't already exist
				if (parentNode.hasClass('open') && parentNode.attr('data-type').match(/^(directory|root)$/)) {
					// Only append node if parent is open (and a directory)

					var node = self.createDirectoryItem(path, type, 0);

					var list = parentNode.siblings('ul')[0];
					if (list) {
						// UL exists, other children to play with
						list.append(node);
						self.sortNodes(list.el);
					} else {
						list = oX('<ul>');
						list.append(node);
						parentNode.append(list.el);
					}
				} else {
					if (parentNode.find('.expand')) {
						parentNode.find('.expand').replaceClass('none', 'fa fa-plus');
					}
				}
			}
		},
		//////////////////////////////////////////////////////////////////
		// Sort nodes in file tree during node creation
		//////////////////////////////////////////////////////////////////
		sortNodes: function(list) {
			var nodesToSort = list.children;

			nodesToSort = Array.prototype.map.call(nodesToSort, function(node) {
				return {
					node: node,
					span: node.querySelector('span').textContent,
					type: node.querySelector('a').getAttribute('data-type')
				};
			});

			nodesToSort.sort(function(a, b) {
				return a.span.localeCompare(b.span);
			});

			nodesToSort.sort(function(a, b) {
				return a.type.localeCompare(b.type);
			});

			nodesToSort.forEach(function(item) {
				list.appendChild(item.node);
			});
		},


		//////////////////////////////////////////////////////////////////
		// Rename
		//////////////////////////////////////////////////////////////////
		rename: function(path) {
			var split = pathinfo(path);
			var nodeName = split.basename;
			var type = split.type;

			var listener = function(e) {
				e.preventDefault();
				var newName = oX('#modal_content form input[name="name"]').value();
				// Build new path
				var arr = path.split('/');
				var temp = [];
				for (var i = 0; i < arr.length - 1; i++) {
					temp.push(arr[i]);
				}
				var newPath = temp.join('/') + '/' + newName;
				echo({
					url: self.controller,
					data: {
						action: 'rename',
						path: path,
						name: newName
					},
					success: function(reply) {
						if (reply.status === 'success') {
							if (type === 'file') {
								atheos.toast.show('success', 'File Renamed.');
							} else {
								atheos.toast.show('success', 'Folder Renamed.');

							}
							var node = oX('#file-manager a[data-path="' + path + '"]'),
								icon = node.find('i:nth-child(2)'),
								span = node.find('span');
							// Change pathing and name for node
							node.attr('data-path', newPath);
							span.text(newName);
							if (type === 'file') {
								// Change icons for file
								icon.removeClass();
								var ico = fileIcons.getClassWithColor(newName);
								if (ico) {
									icon.addClass(fileIcons.getClassWithColor(newName));
								}
							} else {
								// Change pathing on any sub-files/directories
								self.repathChildren(path, newPath);
							}
							// Change any active files
							atheos.active.rename(path, newPath);
						}
					}
				});
				atheos.modal.unload();
			};

			atheos.modal.load(250,
				self.dialog, {
					action: 'rename',
					name: nodeName,
					type: type
				},
				() => {
					oX('#modal_content form').on('submit', listener);
				}
			);

		},

		repathChildren: function(oldPath, newPath) {
			var node = oX('#file-manager a[data-path="' + newPath + '"]'),
				ul = node.el.nextElementSibling;

			if (ul) {
				var children = ul.querySelectorAll('a');
				for (var i = 0; i < children.length; i++) {
					var path = children[i].getAttribute('data-path');
					path = path.replace(oldPath, newPath);
					children[i].setAttribute('data-path', path);
				}
			}

		},

		//////////////////////////////////////////////////////////////////
		// Delete
		//////////////////////////////////////////////////////////////////
		delete: function(path) {
			atheos.alert.show({
				message: 'Are you sure you wish to delete the following:',
				data: path,
				actions: {
					'Delete': function() {
						echo({
							url: self.controller,
							data: {
								action: 'delete',
								path
							},
							success: function(reply) {
								if (reply.status === 'success') {
									var node = oX('#file-manager a[data-path="' + path + '"]');
									node.parent('li').remove();
									// Close any active files
									atheos.active.remove(path);
								}
							}
						});
					},
					'Cancel': function() {}
				}
			});
		}

	};

})(this);