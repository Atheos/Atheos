//////////////////////////////////////////////////////////////////////////////80
// FileManager Init
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/LICENSE.md for more.
// This information must remain intact.
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
		carbon = global.carbon,
		echo = global.echo;

	var self = null;

	carbon.subscribe('system.loadMajor', () => atheos.filemanager.init());

	atheos.filemanager = {

		clipboard: '',

		noOpen: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'exe', 'zip', 'tar', 'tar.gz'],
		noBrowser: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],

		openTrigger: 'click',
		showHidden: true,

		init: function() {
			self = this;
			// Initialize node listener
			this.nodeListener();
			let toggleHidden = oX('#fm_toggle_hidden');
			toggleHidden.on('click', self.toggleHidden);

			carbon.subscribe('settings.loaded', function() {
				var local = storage('filemanager.openTrigger');
				if (local === 'click' || local === 'dblclick') {
					self.openTrigger = local;
				}
				self.showHidden = storage('filemanager.showHidden') === false ? false : self.showHidden;

				if (self.showHidden === false) {
					toggleHidden.switchClass('fa-eye', 'fa-eye-slash');
				}
			});

		},

		toggleHidden: function(e) {
			let toggle = oX('#fm_toggle_hidden');
			toggle.switchClass('fa-eye', 'fa-eye-slash');
			self.showHidden = toggle.hasClass('fa-eye') ? true : false;
			atheos.settings.save('filemanager.showHidden', self.showHidden, true);
			self.rescan();

		},

		//////////////////////////////////////////////////////////////////////80
		// Listen for click events on nodes
		//////////////////////////////////////////////////////////////////////80
		nodeListener: function() {

			var checkAnchor = function(node) {
				node = oX(node);
				//////////////////////////////////////////////////////////////////////80
				// This tagname business is due to the logical but annoying way
				// event delegation is handled. I keep trying to avoid organizing
				// the css in a better way for the file manager, and this is the
				// result.
				//////////////////////////////////////////////////////////////////////80
				if (node.tagName === 'UL') {
					return false;
				} else if (node.tagName !== 'A') {
					if (node.tagName === 'LI') {
						node = node.find('a');
					} else {
						node = node.parent('a');
					}
				}
				return node;
			};

			oX('#file-manager a', true).on('click, dblclick', function(e) {
				if (self.openTrigger === e.type) {
					var node = checkAnchor(e.target);
					if (node.attr('data-type') === 'directory' || node.attr('data-type') === 'root') {
						self.openDir(node.attr('data-path'));
					} else if (node.attr('data-type') === 'file') {
						self.openFile(node.attr('data-path'));
					}
				}
			});

			oX('#file-manager').on('mousedown', self.handleDrag);

		},

		handleDrag: function(e) {
			// Inspired By: https://codepen.io/fitri/pen/VbrZQm
			// Made with love by @fitri
			// & https://github.com/io-developer/js-dragndrop
			e.stopPropagation();

			var target = e.target;
			var origin, sibling;

			var dragZone = oX('#file-manager').el;
			var clone, startEX, startEY, startMX, startMY, timeout;

			var xMax, yMax;

			function moveTarget(e) {
				timeout = false;

				var swap = [].slice.call(dragZone.querySelectorAll('.draggable'));

				swap = swap.filter((item) => {
					var rect = item.getBoundingClientRect();
					if (e.clientX < rect.left || e.clientX >= rect.right) return false;
					if (e.clientY < rect.top || e.clientY >= rect.bottom) return false;
					return (item !== clone);
				});

				if (swap.length === 0) return;

				swap = swap[swap.length - 1];
				if (dragZone.contains(swap)) {
					swap = swap !== target.nextSibling ? swap : swap.nextSibling;
					if (swap && !target.contains(swap)) {
						swap.parentNode.insertBefore(target, swap);
					}
				}
			}

			function dragMove(e) {
				var x = startEX + e.screenX - startMX,
					y = startEY + e.screenY - startMY;

				// Clamp / wrap coordinates
				x = (x > xMax) ? xMax : ((x < 0) ? 0 : x);
				y = (y > yMax) ? yMax : ((y < 0) ? 0 : y);

				clone.style.left = (x - dragZone.scrollLeft) + 'px';
				clone.style.top = (y - dragZone.scrollTop) + 'px';

				if (timeout === false) {
					// In an attempt at optimization, I am setting a timeout on
					// the moveTarget such that it runs only once every 50ms
					timeout = setTimeout(() => moveTarget(e), 50);
				}
			}

			function dragStart() {
				timeout = false;

				startEX = target.offsetLeft;
				startEY = target.offsetTop;

				startMX = e.screenX;
				startMY = e.screenY;

				clone = target.cloneNode(true);

				let UL = clone.querySelector('UL');
				if (UL) UL.remove();

				clone.style.left = (startEX - dragZone.scrollLeft) + 'px';
				clone.style.top = (startEY - dragZone.scrollTop) + 'px';
				clone.style.position = 'absolute';
				clone.style.cursor = 'grabbing';

				dragZone.append(clone);
				target.style.opacity = 0.5;

				xMax = dragZone.offsetWidth - clone.offsetWidth;
				yMax = dragZone.offsetHeight - clone.offsetHeight;

				document.addEventListener('mousemove', dragMove);
			}

			function dragEnd() {
				document.removeEventListener('mousemove', dragMove);
				document.removeEventListener('mouseup', dragEnd);
				if (timeout) {
					return clearTimeout(timeout);
				}
				target.style.opacity = '';
				if (clone) clone.remove();

				let parent = target.closest('ul');
				let folder = parent.previousSibling;

				if (parent === origin || !folder) return origin.append(target);

				self.sortNodes(parent);
				self.handleDrop(target, folder);
			}

			target = target.closest('.draggable');
			if (!target || !dragZone) return;

			origin = target.parentNode;
			sibling = target.previousSibling;

			timeout = setTimeout(dragStart, 250);
			document.addEventListener('mouseup', dragEnd);
		},

		handleDrop: function(node, dest) {
			node = oX(node).find('a[data-path');
			dest = oX(dest);

			let oldPath = node.attr('data-path'),
				parPath = dest.attr('data-path'),
				newPath = parPath + '/' + pathinfo(oldPath).basename;

			if (oX('#file-manager a[data-path="' + newPath + '"]')) {
				toast('warning', 'Path already exists.');
				self.rescan();
			} else {
				echo({
					data: {
						target: 'filemanager',
						action: 'move',
						path: oldPath,
						dest: newPath
					},
					settled: function(status, reply) {
						if (status !== 'success') {
							toast('error', reply);
							self.rescan();
						} else {
							node.attr('data-path', newPath);
							atheos.active.rename(oldPath, newPath);
						}
					}
				});
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Loop out all files and folders in directory path
		//////////////////////////////////////////////////////////////////////80
		openDir: function(path, rescan) {
			var slideDuration = 200;
			rescan = rescan || false;

			var node = oX('#file-manager a[data-path="' + CSS.escape(path) + '"]');
			if (!node) return;
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
					data: {
						target: 'filemanager',
						action: 'index',
						path
					},
					settled: function(status, reply) {
						if (status !== 'error') {
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
									appendage += self.createDirectoryItem(file.path, file.type, file.size, file.repo);

									if (pathinfo(file.path).basename === '.git') {
										atheos.codegit.addRepoIcon(path);
									}

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
							carbon.publish('filemanager.openDir', {
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

		//////////////////////////////////////////////////////////////////////80
		// Create node in file tree
		//////////////////////////////////////////////////////////////////////80

		createDirectoryItem: function(path, type, size, repo) {

			var basename = pathinfo(path).basename;

			if (self.showHidden === false && basename.charAt(0) === '.') {
				return '';
			}

			var fileClass = type === 'directory' ? 'fa fa-folder blue' : icons.getClassWithColor(basename);

			var nodeClass = 'none';
			if (type === 'directory' && (size > 0)) {
				nodeClass = 'fa fa-plus';
			}

			fileClass = fileClass || 'fa fa-file green';

			var repoIcon = repo ? '<i class="repo-icon fas fa-code-branch"></i>' : '';
			var repoClass = repo ? ' class="repo"' : '';

			return `<li class="draggable">
			<a data-type="${type}" data-path="${path}"${repoClass}>
			<i class="expand ${nodeClass}"></i>
			<i class="${fileClass}"></i>
			${repoIcon}
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

		//////////////////////////////////////////////////////////////////////80
		// Open File
		//////////////////////////////////////////////////////////////////////80

		openFile: function(path, focus, line) {
			focus = typeof(focus) !== 'undefined' ? focus : true;

			var ext = pathinfo(path).extension.toLowerCase();

			if (self.noOpen.indexOf(ext) < 0) {
				echo({
					data: {
						target: 'filemanager',
						action: 'open',
						path: path
					},
					settled: function(status, reply) {
						if (status !== 'success') return;
						atheos.active.open(path, reply.content, reply.modifyTime, focus);
						if (line) setTimeout(atheos.editor.gotoLine(line), 500);
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
					toast('error', 'Unable to open file in Browser');
				}
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Save file
		// I'm pretty sure the save methods on this are magic and should
		// be worshipped.
		//////////////////////////////////////////////////////////////////////80
		saveModifications: function(path, data, callback) {
			data.target = 'filemanager';
			data.action = 'save';
			data.path = path;

			echo({
				data: data,
				settled: function(status, reply) {
					if (status === 'success') {
						toast('success', 'File saved');
						if (typeof callback === 'function') {
							callback.call(self, reply.modifyTime);
						}
					} else if (reply.text === 'out of sync') {
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
						toast('error', 'File could not be saved');
					}
				}
			});
		},

		saveFile: function(path, content, callback) {
			self.saveModifications(path, {
					content
				},
				callback);
		},

		savePatch: function(path, patch, callback, modifyTime) {
			if (patch.length > 0) {
				self.saveModifications(path, {
					patch,
					modifyTime
				}, callback);
			} else if (typeof callback === 'function') {
				callback.call(self, modifyTime);
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Copy to Clipboard
		//////////////////////////////////////////////////////////////////////80
		copy: function(path) {
			self.clipboard = path;
			toast('success', 'Copied to Clipboard');
		},

		//////////////////////////////////////////////////////////////////////80
		// Paste
		//////////////////////////////////////////////////////////////////////80
		paste: function(path) {
			var split = pathinfo(self.clipboard);
			var copy = split.basename;
			var type = split.type;

			var processPaste = function(path, duplicate) {

				if (duplicate) {
					copy = 'copy_' + copy;
				}

				echo({
					data: {
						target: 'filemanager',
						action: 'duplicate',
						path: self.clipboard,
						dest: path + '/' + copy
					},
					settled: function(status, reply) {
						if (status !== 'error') {
							self.addToFileManager(path + '/' + copy, type, path);
							/* Notify listeners. */
							carbon.publish('filemanager.paste', {
								path: path,
								dest: copy
							});
						}
					}
				});
			};

			if (self.clipboard === '') {
				toast('error', 'Nothing in Your Clipboard');

			} else if (path === self.clipboard) {
				toast('error', 'Cannot Paste Directory Into Itself');

			} else if (oX('#file-manager a[data-path="' + path + '/' + copy + '"]')) {
				atheos.alert.show({
					banner: 'Path already exists!',
					message: 'Would you like to overwrite or duplicate the file?',
					data: `${path}/${copy}`,
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

		//////////////////////////////////////////////////////////////////////80
		// Duplicate Object
		//////////////////////////////////////////////////////////////////////80
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
					data: {
						target: 'filemanager',
						action: 'duplicate',
						path: path,
						dest: clonePath
					},
					settled: function(status, reply) {
						toast(status, reply);

						if (status === 'success') {
							self.addToFileManager(clonePath, type, parent);
							atheos.modal.unload();
							/* Notify listeners. */
							carbon.publish('filemanager.duplicate', {
								sourcePath: path,
								clonePath: clonePath,
								type: type
							});
						}
					}
				});
				atheos.modal.unload();
			};

			atheos.modal.load(250, {
				target: 'filemanager',
				action: 'duplicate',
				name: name,
				type: type,
				listener
			});

		},

		//////////////////////////////////////////////////////////////////////80
		// Create new node
		//////////////////////////////////////////////////////////////////////80
		create: function(path, type) {
			var listener = function(e) {
				e.preventDefault();

				var nodeName = oX('#modal_content form input[name="nodeName"]').value();
				var newPath = path + '/' + nodeName;

				echo({
					data: {
						target: 'filemanager',
						action: 'create',
						path: newPath,
						type: type
					},
					settled: function(status, reply) {
						if (status !== 'success') return;
						toast('success', 'File Created');
						atheos.modal.unload();
						// Add new element to filemanager screen
						self.addToFileManager(newPath, type, path);
						if (type === 'file') {
							self.openFile(newPath, true);
						}
						/* Notify listeners. */
						carbon.publish('filemanager.onCreate', {
							createPath: newPath,
							path: path,
							nodeName: nodeName,
							type: type
						});
					}
				});
			};

			atheos.modal.load(250, {
				target: 'filemanager',
				action: 'create',
				type: type,
				listener
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Create node in file tree
		//////////////////////////////////////////////////////////////////////80
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
		//////////////////////////////////////////////////////////////////////80
		// Sort nodes in file tree during node creation
		//////////////////////////////////////////////////////////////////////80
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


		//////////////////////////////////////////////////////////////////////80
		// Rename
		//////////////////////////////////////////////////////////////////////80
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
					data: {
						target: 'filemanager',
						action: 'rename',
						path: path,
						name: newName
					},
					settled: function(status, reply) {
						if (status !== 'success') return;
						if (type === 'file') {
							toast('success', 'File Renamed.');
						} else {
							toast('success', 'Folder Renamed.');

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
							var ico = icons.getClassWithColor(newName);
							if (ico) {
								icon.addClass(icons.getClassWithColor(newName));
							}
						} else {
							// Change pathing on any sub-files/directories
							self.repathChildren(path, newPath);
						}
						// Change any active files
						atheos.active.rename(path, newPath);
					}
				});
				atheos.modal.unload();
			};

			atheos.modal.load(250, {
				target: 'filemanager',
				action: 'rename',
				name: nodeName,
				type: type,
				listener
			});

		},

		repathChildren: function(oldPath, newPath) {
			var node = oX('#file-manager a[data-path="' + newPath + '"]'),
				ul = node.el.nextElementSibling;

			if (!ul) return;
			var children = ul.querySelectorAll('a');
			for (var i = 0; i < children.length; i++) {
				var path = children[i].getAttribute('data-path');
				path = path.replace(oldPath, newPath);
				children[i].setAttribute('data-path', path);
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Delete
		//////////////////////////////////////////////////////////////////////80
		delete: function(path) {
			atheos.alert.show({
				message: 'Are you sure you wish to delete the following:',
				data: pathinfo(path).basename,
				actions: {
					'Delete': function() {
						echo({
							data: {
								target: 'filemanager',
								action: 'delete',
								path
							},
							settled: function(status, reply) {
								if (status !== 'success') return;
								var node = oX('#file-manager a[data-path="' + path + '"]');
								node.parent('li').remove();
								// Close any active files
								atheos.active.remove(path);
							}
						});
					},
					'Cancel': function() {}
				}
			});
		}

	};

})(this);