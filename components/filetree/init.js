//////////////////////////////////////////////////////////////////////////////80
// File Tree Component
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';

	const self = {

		clipboard: '',

		openTrigger: 'click',
		showHidden: true,

		//////////////////////////////////////////////////////////////////////80
		// Initialize file tree
		//////////////////////////////////////////////////////////////////////80
		init: function() {
			// Initialize node listener
			self.nodeListener();
			let toggleHidden = oX('#fm_toggle_hidden');
			fX('#fm_toggle_hidden').on('click', self.toggleHidden);

			carbon.subscribe('settings.loaded', function() {
				var local = storage('filetree.openTrigger');
				if (local === 'click' || local === 'dblclick') {
					self.openTrigger = local;
				}
				self.showHidden = storage('filetree.showHidden') === false ? false : self.showHidden;

				if (self.showHidden === false) {
					toggleHidden.switchClass('fa-eye', 'fa-eye-slash');
				}
			});

			fX('#dialog .fileRename').on('submit', self.rename);
			fX('#dialog .pathCreate').on('submit', self.create);
			fX('#dialog .pathDuplicate').on('submit', self.duplicate);
		},



		//////////////////////////////////////////////////////////////////////80
		// Set file tree root
		//////////////////////////////////////////////////////////////////////80		
		setRoot: function(state) {
			oX('#FILETREE').empty();
			
			let name = atheos.current.projectName,
			 path = atheos.current.projectPath,
			 isRepo = atheos.current.projectIsRepo;

			let repoIcon = isRepo ? '<i class="repo-icon fas fa-code-branch"></i>' : '';

			oX('#FILETREE').html(
				`<ul>
				<li class="draggable">
					<a id="project-root" data-type="root" data-path="${path}">
						${repoIcon}
						<i class="root fa fa-folder" data-type="root"></i>
						<span>${name}</span>
					</a>
					<ul></ul>
				</li>
			</ul>`);
			atheos.filetree.openFolder(path, state);
		},

		toggleHidden: function(e) {
			let toggle = oX('#fm_toggle_hidden');
			toggle.switchClass('fa-eye', 'fa-eye-slash');
			self.showHidden = toggle.hasClass('fa-eye') ? true : false;
			atheos.settings.save('filetree.showHidden', self.showHidden, true);
			self.rescan();
		},

		checkAnchor: function(anchor) {
			anchor = oX(anchor);
			//////////////////////////////////////////////////////////////////////80
			// This tagname business is due to the logical but annoying way
			// event delegation is handled. I keep trying to avoid organizing
			// the css in a better way for the file manager, and this is the
			// result.
			//////////////////////////////////////////////////////////////////////80
			let tagName = anchor.tagName;
			if (tagName === 'UL') {
				return false;
			} else if (tagName !== 'A') {
				if (tagName === 'LI') {
					anchor = anchor.find('a');
				} else {
					anchor = anchor.parent('a');
				}
			}
			return anchor;
		},

		//////////////////////////////////////////////////////////////////////80
		// Open a preview in another window
		//////////////////////////////////////////////////////////////////////80
		openInBrowser: function(anchor) {
			let path = anchor ? anchor.path : atheos.inFocusPath;

			echo({
				data: {
					target: 'filetree',
					action: 'loadURL',
					path: path
				},
				settled: function(reply, status) {
					if (status !== 200) return toast(status, reply.text);

					window.open(reply.text, '_newtab');
				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Open a preview in a modal iFrame
		//////////////////////////////////////////////////////////////////////80
		// openInModal: function(path) {
		// 	atheos.modal.load(250, {
		// 		action: 'preview',
		// 		path: path
		// 	});
		// },

		//////////////////////////////////////////////////////////////////////80
		// Listen for click events on nodes
		//////////////////////////////////////////////////////////////////////80
		nodeListener: function() {
			fX('#FILETREE a').on('click, dblclick', function(e) {
				if (self.openTrigger === e.type) {
					var anchor = self.checkAnchor(e.target);
					if (anchor.attr('data-type') === 'folder' || anchor.attr('data-type') === 'root') {
						self.openFolder(anchor.attr('data-path'));
					} else if (anchor.attr('data-type') === 'file') {
						atheos.editor.openFile(anchor.attr('data-path'));
					}
				}
			});

			fX('#FILETREE').on('mousedown', self.handleDrag);
			fX('#FILETREE').on('dragstart', blackhole);
		},

		handleDrag: function(e) {
			// Inspired By: https://codepen.io/fitri/pen/VbrZQm
			// Made with love by @fitri
			// & https://github.com/io-developer/js-dragndrop
			e.stopPropagation();

			var target = e.target;
			var origin, sibling;

			var dragZone = oX('#FILETREE').element;
			var clone, startEX, startEY, startMX, startMY, timeout;

			var xMax, yMax;

			// Move actual/invisible node around / ID target


			// Need to be able to drop it into an empty list.
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
						dragZone.querySelectorAll('i[data-type="folder"],i[data-type="root"]').forEach(function(iNode) {
							iNode.classList.replace('fa-download', 'fa-folder');
						});
						swap.parentNode.insertBefore(target, swap.nextSibling);
						if (swap.querySelectorAll('a[data-type="folder"],a[data-type="root"]').length > 0) {
							swap.querySelector('i[data-type="folder"],i[data-type="root"]').classList.replace('fa-folder', 'fa-download');
						}
					}
				}
			}

			// Move clone/ghost element node
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

				if (timeout && !clone) return clearTimeout(timeout);

				target.style.opacity = '';
				if (clone) clone.remove();

				var parentUl = target.closest('ul');
				var parentFolder = target.previousSibling.querySelector('a[data-type="folder"],a[data-type="root"]');
				var folder;
				if (!parentFolder) {
					if (!parentUl) return;
					folder = parentUl.previousElementSibling;
					if (parentUl === origin || !folder) return origin.append(target);
				} else {
					dragZone.querySelectorAll('i[data-type="folder"],i[data-type="root"]').forEach(function(iNode) {
						iNode.classList.replace('fa-download', 'fa-folder');
					});
					folder = target.previousSibling.querySelector('a');
				}
				self.handleDrop(target, folder);
			}

			target = target.closest('.draggable');
			if (!target || !dragZone) return;

			origin = target.parentNode;
			sibling = target.previousElementSibling;

			timeout = setTimeout(dragStart, 250);
			document.addEventListener('mouseup', dragEnd);
		},

		handleDrop: function(node, dest) {
			node = oX(node).find('a[data-path');
			dest = oX(dest);

			let oldPath = node.attr('data-path'),
				parPath = dest.attr('data-path'),
				newPath = parPath + '/' + pathinfo(oldPath).basename;

			if (oldPath !== newPath) {
				if (oX('#FILETREE a[data-path="' + newPath + '"]').exists()) {
					toast('warning', 'File or path already exists.');
					node.remove();
					self.rescan();
				} else {
					echo({
						data: {
							target: 'filetree',
							action: 'move',
							path: oldPath,
							dest: newPath
						},
						settled: function(reply, status) {
							if (status !== 200) {
								toast('error', reply);
							} else {
								//node.attr('data-path', newPath);
								atheos.editor.rename(oldPath, newPath);
							}
							node.remove();
							self.rescan();
							self.sortNodes(dest.element.parentElement.closest('ul'));
						}
					});
				}
			} else {
				node.remove();
				self.rescan();
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Loop out all files and folders in directory path
		//////////////////////////////////////////////////////////////////////80
		openFolder: function(path, rescan) {
			var slideDuration = 200;
			rescan = rescan || false;

			var node = oX('#FILETREE a[data-path="' + CSS.escape(path) + '"]');
			if (!node.exists()) return;
			let icon = node.find('.expand');

			//Slide open Folder
			if (node.hasClass('open') && !rescan) {
				node.removeClass('open');

				var list = node.siblings('ul')[0];
				if (list) {
					atheos.flow.slide('close', list.element, slideDuration);
					if (icon) {
						icon.replaceClass('fa-minus', 'fa-plus');
					}
					setTimeout(function() {
						list.empty();
					}, slideDuration);
				}

			} else {
				if (icon.exists()) {
					icon.addClass('loading');
				}
				echo({
					data: {
						target: 'filetree',
						action: 'index',
						path
					},
					settled: function(reply, status) {
						if (status === 200) {
							/* Notify listener */

							var files = reply.index;
							if (files && files.length > 0) {
								if (icon.exists()) {
									icon.replaceClass('fa-plus', 'fa-minus');
								}

								var UL = node.siblings('ul')[0];
								// if (!UL) {
								// 	node.after('<ul></ul>');
								// 	UL = node.siblings('ul')[0];
								// }
								if (!rescan) UL.css('display', 'none');

								var appendage = '';

								files.forEach(function(file) {
									appendage += self.createDirectoryItem(file.path, file.type, file.size, file.repo, file.link);

									if (pathinfo(file.path).basename === '.git') {
										atheos.codegit.addRepoIcon(path);
									}

								});

								if (rescan && node.siblings('ul').length > 0) {
									node.siblings('ul')[0].empty();
								}

								UL.append(appendage);
								var list = node.siblings('ul')[0];
								if (!rescan && list) {
									atheos.flow.slide('open', list.element, slideDuration);
								}
							}
							carbon.publish('filetree.openFolder', {
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
		// Check if file/folder should be hidden
		//////////////////////////////////////////////////////////////////////80
		isHidden: function(basename) {
			if (self.showHidden) return false;
			if (basename.charAt(0) === '.' || basename == '__pycache__') {
				return true;
			}
			return false;
		},

		//////////////////////////////////////////////////////////////////////80
		// Create node in file tree
		//////////////////////////////////////////////////////////////////////80
		createDirectoryItem: function(path, type, size, repo, link) {

			var basename = pathinfo(path).basename;
			if (self.isHidden(basename)) return '';

			var fileClass = type === 'folder' ? 'fa fa-folder' : icons.getClassWithColor(basename);
			var emptyFolder = type === 'folder' ? '<ul></ul>' : '';

			var nodeClass = 'none';
			if (type === 'folder' && (size > 0)) {
				nodeClass = 'fa fa-plus';
			}

			fileClass = fileClass || 'fa fa-file green';

			var repoIcon = repo ? '<i class="repo-icon fas fa-code-branch"></i>' : '';

			return `<li class="draggable">
			<a ${link ? 'title=\"' + link + '\"' : ''} data-type="${type}" data-path="${path}">
			<i class="expand ${nodeClass}"></i>
			<i class="${fileClass}" data-type="${type}"></i>
			${repoIcon}
			
			<span ${link ? 'class=\"aqua\"' : ''}>${basename}</span>
			</a>
			${emptyFolder}
			</li>`;
		},


		rescanChildren: [],

		rescanCounter: 0,

		rescan: function(anchor) {
			let path = isObject(anchor) ? anchor.path : anchor;
			path = path || oX('#project-root').attr('data-path');

			if (self.rescanCounter === 0) {
				var list = oX('#FILETREE a[data-path="' + path + '"]').siblings('ul')[0];
				var openNodes = list.findAll('a.open');

				for (var i = 0; i < openNodes.length; i++) {
					self.rescanChildren.push(openNodes[i].attr('data-path'));
				}
			}
			self.openFolder(path, true);
		},

		//////////////////////////////////////////////////////////////////////80
		// Cut to Cutboard
		//////////////////////////////////////////////////////////////////////80
		cut: function(anchor) {
			self.cutboard = anchor.path;
			toast('success', 'On Cutting Board');
		},

		//////////////////////////////////////////////////////////////////////80
		// Copy to Clipboard
		//////////////////////////////////////////////////////////////////////80
		copy: function(anchor) {
			self.clipboard = anchor.path;
			toast('success', 'Copied to Clipboard');
		},

		//////////////////////////////////////////////////////////////////////80
		// Paste
		//////////////////////////////////////////////////////////////////////80
		paste: function(anchor) {
			let parentDest = anchor.path;


			let activePath = self.cutboard ? self.cutboard : self.clipboard;


			if (activePath === '') {
				return toast('error', 'Nothing to Paste');
			} else if (parentDest === activePath) {
				return toast('error', 'Cannot paste folder into itself');
			}

			activePath = pathinfo(activePath);

			let activeBase = activePath.basename,
				activeType = activePath.type;

			var processPaste = function(parentDest, duplicate) {

				if (duplicate) {
					activeBase = 'copy_' + activeBase;
				}

				echo({
					data: {
						target: 'filetree',
						action: 'duplicate',
						path: self.clipboard,
						dest: parentDest + '/' + activeBase
					},
					settled: function(reply, status) {
						if (status !== 200) return;
						if (self.cutboard !== false) {
							self.cutboard = false;
						}
						self.addToFileTree(parentDest + '/' + activeBase, activeType, parentDest);
						/* Notify listeners. */
						carbon.publish('filetree.paste', {
							path: parentDest,
							dest: activeBase
						});
					}
				});
			};

			if (oX('#FILETREE a[data-path="' + parentDest + '/' + activeBase + '"]').exists()) {
				atheos.alert.show({
					banner: 'Path already exists!',
					message: 'Would you like to overwrite or duplicate the file?',
					data: `${parentDest}/${activeBase}`,
					actions: {
						'Overwrite': function() {
							processPaste(parentDest, false);
						},
						'Duplicate': function() {
							processPaste(parentDest, true);
						}
					}
				});
			} else {
				processPaste(parentDest, false);
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Duplicate Object
		//////////////////////////////////////////////////////////////////////80
		openDuplicate: function(anchor) {
			let split = pathinfo(anchor.path),
				name = split.basename,
				type = split.type;

			self.activeAnchor = anchor;

			atheos.modal.load(250, {
				target: 'filetree',
				action: 'duplicate',
				name,
				type
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Duplicate Object
		//////////////////////////////////////////////////////////////////////80
		duplicate: function(e) {
			e.preventDefault();

			let path = self.activeAnchor.path,
				split = pathinfo(path),
				name = split.basename,
				type = split.type;

			var clone = oX('#dialog form input[name="clone"]').value();

			// Build new path
			var parent = path.split('/').slice(0, -1).join('/');
			var clonePath = parent + '/' + clone;

			echo({
				data: {
					target: 'filetree',
					action: 'duplicate',
					path: path,
					dest: clonePath
				},
				settled: function(reply, status) {
					toast(status, reply);
					if (status !== 200) return;

					self.addToFileTree(clonePath, type, parent);
					atheos.modal.unload();
					/* Notify listeners. */
					carbon.publish('filetree.duplicate', {
						sourcePath: path,
						clonePath: clonePath,
						type: type
					});
				}
			});
			atheos.modal.unload();
		},

		//////////////////////////////////////////////////////////////////////80
		// Extract Object
		//////////////////////////////////////////////////////////////////////80		
		extract: function(anchor) {
			anchor = extend(anchor, pathinfo(anchor.path));

			let parent = anchor.directory,
				fileName = anchor.fileName;


			var processExtact = function(duplicate) {

				if (duplicate) {
					fileName = 'copy_' + fileName;
					anchor.fileName = fileName;
				}

				anchor.target = 'filetree';
				anchor.action = 'extract';

				echo({
					data: anchor,
					settled: function(reply, status) {
						if (status !== 200) return;

						self.addToFileTree(parent + '/' + fileName, 'folder', parent, 1);
						/* Notify listeners. */
						carbon.publish('filetree.extract', {
							path: parent + '/' + fileName,
							dest: parent
						});
					}
				});
			};

			if (oX('#FILETREE a[data-path="' + parent + '/' + fileName + '"]').exists()) {
				atheos.alert.show({
					banner: 'Path already exists!',
					message: 'Would you like to overwrite or duplicate the file?',
					data: `${parent}/${fileName}`,
					actions: {
						'Overwrite': function() {
							processExtact(false);
						},
						'Duplicate': function() {
							processExtact(true);
						}
					}
				});
			} else {
				processExtact(false);
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Active Anchor for Rename, Duplicate and Create
		//////////////////////////////////////////////////////////////////////80
		activeAnchor: {},

		//////////////////////////////////////////////////////////////////////80
		// Create new node
		//////////////////////////////////////////////////////////////////////80
		create: function(e) {
			e.preventDefault();

			let name = oX('#dialog form input[name="nodeName"]').value(),
				path = self.activeAnchor.path + '/' + name,
				type = self.activeAnchor.type;

			echo({
				data: {
					target: 'filetree',
					action: 'create',
					path,
					type
				},
				settled: function(reply, status) {
					if (status !== 200) return toast(status, reply);
					toast('success', 'File Created');
					atheos.modal.unload();
					// Add new element to file tree
					self.addToFileTree(path, type, self.activeAnchor.path, 0);
					if (type === 'file') {
						self.openFile(path, true);
					}
					/* Notify listeners. */
					carbon.publish('filetree.create', {
						type,
						path,
						name
					});
				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Create node in file tree
		//////////////////////////////////////////////////////////////////////80
		addToFileTree: function(path, type, parent, size) {
			var parentNode = oX('#FILETREE a[data-path="' + parent + '"]');

			// Already exists
			if (oX('#FILETREE a[data-path="' + path + '"]').exists()) return;

			if (parentNode.hasClass('open') && parentNode.attr('data-type').match(/^(folder|root)$/)) {
				// Only append node if parent is open (and a directory)

				var node = self.createDirectoryItem(path, type, size);

				var list = parentNode.siblings('ul')[0];
				if (list) {
					// UL exists, other children to play with
					list.append(node);
					self.sortNodes(list.element);
				} else {
					list = oX('<ul>');
					list.append(node);
					parentNode.append(list.element);
				}
			} else {
				if (parentNode.find('.expand')) {
					parentNode.find('.expand').replaceClass('none', 'fa fa-plus');
				}
			}
		},
		//////////////////////////////////////////////////////////////////////80
		// Sort nodes in file tree during node creation
		//////////////////////////////////////////////////////////////////////80
		sortNodes: function(list) {
			var children = [...list.children];

			children = children.map(function(node) {
				return {
					node: node,
					span: (node.querySelector('span')) ? node.querySelector('span').textContent : '',
					type: (node.querySelector('a')) ? node.querySelector('a').getAttribute('data-type') : ''
				};
			});

			// Alpahetical
			children.sort(function(a, b) {
				return a.span.localeCompare(b.span);
			});

			children.reverse();

			// By Type
			children.sort(function(a, b) {
				return a.type.localeCompare(b.type);
			});

			children.reverse();

			// Double reverse is to put folders first, then files, but each
			// subsection in alphabetical order
			children.forEach(function(item) {
				list.appendChild(item.node);
			});
		},


		//////////////////////////////////////////////////////////////////////80
		// Open Rename Dialog
		//////////////////////////////////////////////////////////////////////80
		openRename: function(anchor) {
			self.activeAnchor = anchor;
			atheos.modal.load(250, {
				target: 'filetree',
				action: 'rename',
				name: anchor.name,
				type: anchor.type
			});
		},

		createFile: function(anchor) {
			self.openCreate(anchor, 'file');
		},

		createFolder: function(anchor) {
			self.openCreate(anchor, 'folder');
		},

		//////////////////////////////////////////////////////////////////////80
		// Open Create Dialog
		//////////////////////////////////////////////////////////////////////80
		openCreate: function(anchor, type) {
			anchor.type = type;
			self.activeAnchor = anchor;
			atheos.modal.load(250, {
				target: 'filetree',
				action: 'create',
				type: type
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Rename
		//////////////////////////////////////////////////////////////////////80
		rename: function(e) {
			e.preventDefault();

			let path = self.activeAnchor.path,
				name = self.activeAnchor.name,
				type = self.activeAnchor.type;

			var newName = oX('#dialog form input[name="name"]').value();
			// Build new path
			var arr = path.split('/');
			var temp = [];
			for (var i = 0; i < arr.length - 1; i++) {
				temp.push(arr[i]);
			}
			var newPath = temp.join('/') + '/' + newName;
			echo({
				data: {
					target: 'filetree',
					action: 'rename',
					path: path,
					name: newName
				},
				settled: function(reply, status) {
					if (status !== 200) return;
					if (type === 'file') {
						toast('success', 'File Renamed.');
					} else {
						toast('success', 'Folder Renamed.');

					}
					var node = oX('#FILETREE a[data-path="' + path + '"]'),
						icon = node.find('i:nth-child(2)'),
						span = node.find('span');
					// Change pathing and name for node
					node.attr('data-path', newPath);
					span.text(newName);
					if (type === 'file') {
						// Change icons for file
						icon.removeClass();
						var fileClass = icons.getClassWithColor(newName) || 'fa fa-file green';
						icon.addClass(fileClass);

					} else {
						// Change pathing on any sub-files/directories
						self.repathChildren(path, newPath);
					}
					// Change any active files
					atheos.editor.rename(path, newPath);
				}
			});
			atheos.modal.unload();
		},


		repathChildren: function(oldPath, newPath) {
			var node = oX('#FILETREE a[data-path="' + newPath + '"]'),
				ul = node.element.nextElementSibling;

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
		delete: function(anchor) {
			let path = anchor.path;
			atheos.alert.show({
				message: 'Are you sure you wish to delete the following:',
				data: anchor.name,
				actions: {
					'Delete': function() {
						echo({
							data: {
								target: 'filetree',
								action: 'delete',
								path
							},
							settled: function(reply, status) {
								if (status !== 200) return;
								var node = oX('#FILETREE a[data-path="' + path + '"]');
								node.parent('li').remove();
								// Close any active files
								atheos.editor.remove(path);
							}
						});
					},
					'Cancel': function() {}
				}
			});
		}

	};

	carbon.subscribe('system.loadMajor', () => self.init());
	atheos.filetree = self;

})();