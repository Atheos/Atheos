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
		common = atheos.common,
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
		dialogUpload: 'components/filemanager/dialog_upload.php',
		openTrigger: 'single',

		init: function() {
			self = this;
			// Initialize node listener
			this.nodeListener();
			// Load uploader
			common.loadScript('components/filemanager/upload_scripts/jquery.ui.widget.js', true);
			common.loadScript('components/filemanager/upload_scripts/jquery.iframe-transport.js', true);
			common.loadScript('components/filemanager/upload_scripts/jquery.fileupload.js', true);

			amplify.subscribe('settings.loaded', function() {
				var local = atheos.storage('filemanager.openTrigger');
				if (local === 'single' || local === 'double') {
					self.openTrigger = local;
				}
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
						node = node.parent();
					}
				}
				return node;
			};

			var nodeFunctions = (function(node) {
				if (node) {
					if (node.attr('data-type') === 'directory' || node.attr('data-type') === 'root') {
						this.openDir(node.attr('data-path'));
					} else if (node.attr('data-type') === 'file') {
						this.openFile(node.attr('data-path'));
					}
				}
			}).bind(this);

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
				//var options = {
				//	dragZone: oX('#file-manager').el,
				//	direction: 'vertical'
				//};
				// atheos.flow.dragNdrop(e, options);
			});
		},

		//////////////////////////////////////////////////////////////////
		// Loop out all files and folders in directory path
		//////////////////////////////////////////////////////////////////

		indexFiles: [],

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
				ajax({
					url: self.controller + '?action=index&path=' + path,
					success: function(data) {
						if (data.status !== 'error') {
							/* Notify listener */
							self.indexFiles = data.data.index;

							var files = self.indexFiles;
							if (files.length > 0) {
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
								files: self.indexFiles,
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

			var name = common.getNodeName(path);

			var fileClass = type === 'directory' ? 'fa fa-folder medium-blue' : fileIcons.getClassWithColor(name);

			var nodeClass = 'none';
			if (type === 'directory' && (size > 0)) {
				nodeClass = 'fa fa-plus';
			}

			fileClass = fileClass || 'fa fa-file medium-green';

			return `<li class="draggable">
						<a data-type="${type}" data-path="${path}">
							<i class="expand ${nodeClass}"></i>
							<i class="${fileClass}"></i>
							<span>${name}</span>
						</a>
					</li>`;
		},


		rescanChildren: [],

		rescanCounter: 0,

		rescan: function(path) {
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

			var ext = common.getNodeExtension(path).toLowerCase();

			if (self.noOpen.indexOf(ext) < 0) {
				ajax({
					url: self.controller + '?action=open&path=' + encodeURIComponent(path),
					success: function(reply) {
						if (reply.status !== 'error') {
							atheos.active.open(path, reply.data.content, reply.data.mtime, focus);
							if (line) {
								setTimeout(atheos.editor.gotoLine(line), 500);
							}
						}
					}
				});
			} else {
				if (!atheos.project.isAbsPath(path)) {
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
		// Open in browser/modal
		//////////////////////////////////////////////////////////////////

		openInBrowser: function(path) {
			path = path || atheos.active.getPath();

			if (!path) {
				atheos.toast.show('error', 'No file selected');
				return;
			}

			ajax({
				url: self.controller + '?action=open_in_browser&path=' + encodeURIComponent(path),
				success: function(data) {
					if (data.success !== 'error') {
						window.open(data.url, '_newtab');
					}
				},
				async: false
			});
		},

		openInModal: function(path) {
			atheos.modal.load(250, self.dialog, {
				action: 'preview',
				path: path
			});
		},

		//////////////////////////////////////////////////////////////////
		// Save file
		// I'm pretty sure the save methods on this are magic and should
		// be worshipped.
		//////////////////////////////////////////////////////////////////
		saveModifications: function(path, data, callbacks) {
			callbacks = callbacks || {};

			ajax({
				url: self.controller + '?action=modify&path=' + encodeURIComponent(path),
				data: data,
				success: function(data) {
					var context;

					if (data.status === 'success') {
						atheos.toast.show('success', 'File saved');
						if (typeof callbacks.success === 'function') {
							context = callbacks.context || self;
							callbacks.success.call(context, data.data.mtime);
						}
					} else {
						if (data.message === 'Client is out of sync') {
							atheos.alert.show({
								banner: 'File contents changed on server!',
								message: 'Would you like to retreieve an updated copy of the file?\n' +
									'Pressing no will cause your changes to override the\n' +
									'server\'s copy upon next save.',
								positive: {
									message: 'Yes',
									fnc: function() {
										atheos.active.remove(path);
										self.openFile(path);
									}
								},
								negative: {
									message: 'No',
									fnc: function() {
										var session = atheos.editor.getActive().getSession();
										session.serverMTime = null;
										session.untainted = null;
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
			self.saveModifications(path, {
				content: content
			}, callbacks);
		},

		savePatch: function(path, patch, mtime, callbacks) {
			if (patch.length > 0) {
				self.saveModifications(path, {
					patch: patch,
					mtime: mtime
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
			var processPaste = function(path, duplicate) {
				var nodeName = common.getNodeName(self.clipboard);
				var type = common.getNodeType(self.clipboard);

				if (duplicate) {
					nodeName = 'copy_of_' + nodeName;
				}
				ajax({
					url: `${self.controller}?action=duplicate&path=${encodeURIComponent(self.clipboard)}'&destination='${encodeURIComponent(path + '/' + nodeName)}`,
					success: function(data) {
						if (data.status !== 'error') {
							self.addToFileManager(path + '/' + nodeName, type, path);
							/* Notify listeners. */
							amplify.publish('filemanager.onPaste', {
								path: path,
								nodeName: nodeName,
								duplicate: duplicate
							});
						}
					}

				});
			};

			if (self.clipboard === '') {
				atheos.toast.show('error', 'Nothing in Your Clipboard');

			} else if (path === self.clipboard) {
				atheos.toast.show('error', 'Cannot Paste Directory Into Itself');

			} else {
				var nodeName = common.getNodeName(self.clipboard);

				if (oX('#file-manager a[data-path="' + path + '/' + nodeName + '"]')) {

					atheos.alert.show({
						banner: 'Path already exists!',
						message: 'Would you like to overwrite or duplicate the file?',
						data: `/${path}/${nodeName}`,
						actions: {
							'Overwrite': function() {
								console.log('Overwrite');
								processPaste(path, false);
							},
							'Duplicate': function() {
								console.log('Duplicate');
								processPaste(path, true);
							}
						}
					});
				} else {
					processPaste(path, false);
				}
			}
		},

		//////////////////////////////////////////////////////////////////
		// Duplicate Object
		//////////////////////////////////////////////////////////////////		
		duplicate: function(path, name) {
			var nodeName = common.getNodeName(path);
			var type = common.getNodeType(path);

			var listener = function() {
				oX('#modal_content form').once('submit', function(e) {
					e.preventDefault();

					var newName = oX('#modal_content form input[name="object_name"]').value();

					// Build new path
					var parent = path.split('/').slice(0, -1).join('/');
					var newPath = parent + '/' + newName;

					ajax({
						url: `${self.controller}?action=duplicate&path=${encodeURIComponent(path)}'&destination='${encodeURIComponent(newPath)}`,
						success: function(data) {
							atheos.toast[data.status](data.message);

							if (data.status !== 'error') {
								self.addToFileManager(newPath, type, parent);
								atheos.modal.unload();
								/* Notify listeners. */
								amplify.publish('filemanager.onPaste', {
									path: path,
									nodeName: nodeName
								});
							}
						}
					});
					atheos.modal.unload();
				});
			};

			amplify.subscribe('modal.loaded', listener);

			atheos.modal.load(250, self.dialog, {
				action: 'duplicate',
				path: path,
				nodeName: nodeName,
				type: type
			});

		},

		//////////////////////////////////////////////////////////////////
		// Create new node
		//////////////////////////////////////////////////////////////////
		create: function(path, type) {
			var listener = function() {
				oX('#modal_content form').once('submit', function(e) {
					e.preventDefault();

					var nodeName = oX('#modal_content form input[name="nodeName"]').value();
					var newPath = path + '/' + nodeName;

					ajax({
						url: `${self.controller}?action=create&path=${encodeURIComponent(newPath)}&type=${type}`,
						success: function(data) {
							if (data.status !== 'error') {
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
				});
			};

			amplify.subscribe('modal.loaded', listener);

			atheos.modal.load(250, self.dialog, {
				action: 'create',
				type: type
			});

		},

		//////////////////////////////////////////////////////////////////
		// Create node in file tree
		//////////////////////////////////////////////////////////////////
		addToFileManager: function(path, type, parent) {
			var parentNode = oX('#file-manager a[data-path="' + parent + '"]');
			if (!oX('#file-manager a[data-path="' + path + '"]')) { // Doesn't already exist
				if (parentNode.hasClass('open') && parentNode.attr('data-type').match(/^(directory|root)$/)) { // Only append node if parent is open (and a directory)

					var node = self.createDirectoryItem(path, type, 0);

					var list = parentNode.siblings('ul')[0];
					if (list) { // UL exists, other children to play with
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
			var nodeName = common.getNodeName(path);
			var type = common.getNodeType(path);

			var listener = function() {
				oX('#modal_content form').on('submit', function(e) {
					e.preventDefault();
					var newName = oX('#modal_content form input[name="object_name"]').value();
					// Build new path
					var arr = path.split('/');
					var temp = [];
					for (var i = 0; i < arr.length - 1; i++) {
						temp.push(arr[i]);
					}
					var newPath = temp.join('/') + '/' + newName;
					ajax({
						url: self.controller,
						type: 'GET',
						data: {
							action: 'modify',
							path: path,
							newName: newName
						},
						success: function(data) {
							if (data.status !== 'error') {
								atheos.toast.show('success', 'File Renamed');
								var node = oX('#file-manager a[data-path="' + path + '"]'),
									icon = node.find('i:nth-child(2)'),
									span = node.find('span');
								// Change pathing and name for node
								node.attr('data-path', newPath);
								span.text(newName);
								if (type === 'file') { // Change icons for file
									icon.removeClass();
									var ico = fileIcons.getClassWithColor(newName);
									if (ico) {
										icon.addClass(fileIcons.getClassWithColor(newName));
									}
								} else { // Change pathing on any sub-files/directories
									self.repathChildren(path, newPath);
								}
								// Change any active files
								atheos.active.rename(path, newPath);
							}
						}
					});
					atheos.modal.unload();
				});
			};

			amplify.subscribe('modal.loaded', listener);

			atheos.modal.load(250, self.dialog, {
				action: 'rename',
				path: path,
				nodeName: nodeName,
				type: type
			});

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
			var listener = function() {
				oX('#modal_content form').once('submit', function(e) {
					e.preventDefault();

					ajax({
						url: self.controller + '?action=delete&path=' + encodeURIComponent(path),
						success: function(data) {
							if (data !== 'error') {
								var node = oX('#file-manager a[data-path="' + path + '"]');
								node.parent('li').remove();
								// Close any active files
								var active = document.querySelectorAll('#active-files a');
								for (var i = 0; i < active.length; i++) {
									var curPath = oX(active[i]).attr('data-path');
									if (curPath.indexOf(path) === 0) {
										atheos.active.remove(curPath);
									}
								}
							}
							atheos.modal.unload();
						}
					});
				});
			};

			amplify.subscribe('modal.loaded', listener);

			atheos.modal.load(400, self.dialog, {
				action: 'delete',
				path: path
			});

		},

		//////////////////////////////////////////////////////////////////
		// Upload
		//////////////////////////////////////////////////////////////////
		upload: function(path) {
			atheos.modal.load(500, self.dialogUpload, {
				path: path
			});
		},

		//////////////////////////////////////////////////////////////////
		// Download
		//////////////////////////////////////////////////////////////////
		download: function(path) {
			var type = atheos.common.getNodeType(path);
			oX('#download').attr('src', 'components/filemanager/download.php?path=' + encodeURIComponent(path) + '&type=' + type);
		}


	};

})(this);