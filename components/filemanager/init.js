//////////////////////////////////////////////////////////////////////////////80
// FileManager
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Notes: 
// Goodness this file is very complex; it's going to take a very long time
// to really get a grasp of what's going on in this file and how to 
// refactor it.
// The context menu should become an object stored within the filemanager, and
// constructed based on the fules specified therein. The OBJ is created, and then
// added to by each plugin based on it's requirements. The OBJ could even be 
// cached.
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';
	var atheos = global.atheos,
		amplify = global.amplify,
		ajax = global.ajax,
		fileIcons = global.FileIcons,
		o = global.onyx;

	amplify.subscribe('atheos.loaded', function(settings) {
		atheos.filemanager.init();
	});

	atheos.filemanager = {

		clipboard: '',

		noOpen: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'exe', 'zip', 'tar', 'tar.gz'],
		noBrowser: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],

		controller: 'components/filemanager/controller.php',
		dialog: 'components/filemanager/dialog.php',
		dialogUpload: 'components/filemanager/dialog_upload.php',

		contextMenu: {},

		init: function() {
			//Prevent text selection in fie-manager
			// $('#file-manager').on('selectstart', false);

			// Initialize node listener
			this.nodeListener();
			// Load uploader
			atheos.helpers.loadScript('components/filemanager/upload_scripts/jquery.ui.widget.js', true);
			atheos.helpers.loadScript('components/filemanager/upload_scripts/jquery.iframe-transport.js', true);
			atheos.helpers.loadScript('components/filemanager/upload_scripts/jquery.fileupload.js', true);
		},

		//////////////////////////////////////////////////////////////////
		// Listen for click events on nodes
		//////////////////////////////////////////////////////////////////

		nodeListener: function() {

			var checkAnchor = function(node) {
				node = o(node);
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
						node = node.find('a')[0];
					} else {
						node = o(node.parent());
					}
				}
				return node;
			};

			var nodeFunctions = (function(node) {
				if (node) {
					node = o(node);
					if (node.attr('data-type') === 'directory' || node.attr('data-type') === 'root') {
						this.openDir(node.attr('data-path'));
					} else {
						this.openFile(node.attr('data-path'));
					}
				}
			}).bind(this);

			o('#file-manager').on('click', function(e) {
				if (!atheos.editor.settings.fileManagerTrigger) {
					nodeFunctions(checkAnchor(e.target));
				}
			});

			o('#file-manager').on('dblclick', function(e) {
				if (atheos.editor.settings.fileManagerTrigger) {
					nodeFunctions(checkAnchor(e.target));
				}
			});

		},

		//////////////////////////////////////////////////////////////////
		// Loop out all files and folders in directory path
		//////////////////////////////////////////////////////////////////

		indexFiles: [],

		openDir: function(path, rescan) {
			var fileManager = this,
				slideDuration = 200;
			rescan = rescan || false;

			var node = o('#file-manager a[data-path="' + path + '"]');
			let icon = node.find('.expand')[0];
			// if (icon && !icon.hasClass('none')) {
			// 	if (icon.hasClass('fa-plus')) {
			// 		icon.removeClass('fa-plus');
			// 		icon.addClass('fa-minus');
			// 	} else {
			// 		icon.removeClass('fa-minus');
			// 		icon.addClass('fa-plus');
			// 	}
			// }

			if (node.hasClass('open') && !rescan) {
				node.removeClass('open');

				var list = node.siblings('ul')[0];
				if (list) {
					fileManager.slide('close', list.el, slideDuration);
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
					url: this.controller + '?action=index&path=' + encodeURIComponent(path),
					success: function(response) {

						response = JSON.parse(response);
						if (response.status !== 'error') {
							/* Notify listener */
							fileManager.indexFiles = response.data.index;

							var files = fileManager.indexFiles;
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
									appendage += fileManager.createDirectoryItem(file.path, file.type, file.size);
								});

								appendage += '</ul>';

								if (rescan && node.siblings('ul')[0]) {
									node.siblings('ul')[0].remove();
								}

								node.after(appendage);
								var list = node.siblings('ul')[0];
								if (!rescan && list) {
									fileManager.slide('open', list.el, slideDuration);
								}
							}
							amplify.publish('filemanager.onIndex', {
								path: path,
								files: fileManager.indexFiles
							});
						}
						node.addClass('open');

						if (icon) {
							icon.removeClass('loading');
							icon.replaceClass('fa-plus', 'fa-minus');
						}
						if (rescan && fileManager.rescanChildren.length > fileManager.rescanCounter) {
							fileManager.rescan(fileManager.rescanChildren[fileManager.rescanCounter++]);
						} else {
							fileManager.rescanChildren = [];
							fileManager.rescanCounter = 0;
						}

					}
				});
			}
		},

		//////////////////////////////////////////////////////////////////
		// Create node in file tree
		//////////////////////////////////////////////////////////////////

		createDirectoryItem: function(path, type, size) {

			var name = atheos.helpers.getNodeName(path);
			// name = path.replace(path, '').split('/').join('');

			var fileClass = type === 'directory' ? 'fa fa-folder medium-blue' : fileIcons.getClassWithColor(name);

			var nodeClass = 'none';
			if (type === 'directory' && (size > 0)) {
				nodeClass = 'fa fa-plus';
			}

			fileClass = fileClass || 'fa fa-file medium-green';

			return `<li>
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
			if (this.rescanCounter === 0) {
				var list = o('#file-manager a[data-path="' + path + '"]').siblings('ul')[0];
				var openNodes = list.find('a.open');

				for (var i = 0; i < openNodes.length; i++) {
					this.rescanChildren.push(openNodes[i].attr('data-path'));
				}
			}
			this.openDir(path, true);
		},

		//////////////////////////////////////////////////////////////////
		// Open File
		//////////////////////////////////////////////////////////////////

		openFile: function(path, focus, line) {
			focus = focus || true;

			var ext = atheos.helpers.getNodeExtension(path).toLowerCase();

			if (this.noOpen.indexOf(ext) < 0) {
				ajax({
					url: this.controller + '?action=open&path=' + encodeURIComponent(path),
					success: function(response) {
						response = JSON.parse(response);
						if (response.status !== 'error') {
							atheos.active.open(path, response.data.content, response.data.mtime, false, focus);
							if (line) {
								atheos.active.gotoLine(line);
							}
						}
					}
				});
			} else {
				if (!atheos.project.isAbsPath(path)) {
					if (this.noBrowser.indexOf(ext) < 0) {
						this.download(path);
					} else {
						this.openInModal(path);
					}
				} else {
					atheos.toast.error('Unable to open file in Browser');
				}
			}
		},

		//////////////////////////////////////////////////////////////////
		// Open in browser/modal
		//////////////////////////////////////////////////////////////////

		openInBrowser: function(path) {
			ajax({
				url: this.controller + '?action=open_in_browser&path=' + encodeURIComponent(path),
				success: function(response) {
					response = JSON.parse(response);
					if (response != 'error') {
						window.open(response.url, '_newtab');
					}
				},
				async: false
			});
		},
		openInModal: function(path) {
			atheos.modal.load(250, this.dialog, {
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
			var fileManager = this;

			var notifySaveErr = function() {
				atheos.toast.error('File could not be saved');
				if (typeof callbacks.error === 'function') {
					var context = callbacks.context || fileManager;
					callbacks.error.apply(context, [data]);
				}
			};

			ajax({
				type: 'post',
				url: this.controller + '?action=modify&path=' + encodeURIComponent(path),
				data: data,
				success: function(response) {
					response = JSON.parse(response);

					var context;

					if (response.status === 'success') {
						atheos.toast.success('File saved');
						if (typeof callbacks.success === 'function') {
							context = callbacks.context || fileManager;
							callbacks.success.call(context, response.data.mtime);
						}
					} else {
						if (response.message === 'Client is out of sync') {
							atheos.alert.show({
								banner: 'File contents changed on server!',
								message: 'Would you like to retreieve an updated copy of the file?\n' +
									'Pressing no will cause your changes to override the\n' +
									'server\'s copy upon next save.',
								positive: {
									message: 'Yes',
									fnc: function() {
										atheos.active.close(path);
										atheos.active.removeDraft(path);
										fileManager.openFile(path);
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
							atheos.toast.error('File could not be saved');
						}
						if (typeof callbacks.error === 'function') {
							context = callbacks.context || fileManager;
							callbacks.error.apply(context, [response.data]);
						}
					}
				}
			});
		},

		saveFile: function(path, content, callbacks) {
			this.saveModifications(path, {
				content: content
			}, callbacks);
		},

		savePatch: function(path, patch, mtime, callbacks) {
			if (patch.length > 0) {
				this.saveModifications(path, {
					patch: patch,
					mtime: mtime
				}, callbacks);
			} else if (typeof callbacks.success === 'function') {
				var context = callbacks.context || this;
				callbacks.success.call(context, mtime);
			}
		},

		//////////////////////////////////////////////////////////////////
		// Copy to Clipboard
		//////////////////////////////////////////////////////////////////

		copy: function(path) {
			this.clipboard = path;
			atheos.toast.success('Copied to Clipboard');
		},

		//////////////////////////////////////////////////////////////////
		// Paste
		//////////////////////////////////////////////////////////////////

		paste: function(path) {
			var fileManager = this;

			var processPaste = function(path, duplicate) {
				var nodeName = atheos.helpers.getNodeName(fileManager.clipboard);
				var type = atheos.helpers.getNodeType(fileManager.clipboard);

				if (duplicate) {
					nodeName = 'copy_of_' + nodeName;
				}
				ajax({
					url: `${fileManager.controller}?action=duplicate&path=${encodeURIComponent(fileManager.clipboard)}'&destination='${encodeURIComponent(path + '/' + nodeName)}`,
					success: function(response) {
						response = JSON.parse(response);
						if (response.status !== 'error') {
							fileManager.addToFileManager(path, path + '/' + nodeName, type);
							atheos.modal.unload();
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

			if (this.clipboard === '') {
				atheos.toast.error('Nothing in Your Clipboard');

			} else if (path === this.clipboard) {
				atheos.toast.error('Cannot Paste Directory Into Itself');

			} else {
				var nodeName = atheos.helpers.getNodeName(fileManager.clipboard);

				if (o('#file-manager a[data-path="' + path + '/' + nodeName + '"]')) {

					atheos.alert.show({
						banner: 'Path already exists!',
						message: 'Would you like to overwrite or duplicate the file?',
						data: `/${path}/${nodeName}`,
						actions: [{
								message: 'Overwrite',
								fnc: function() {
									console.log('Overwrite');
									processPaste(path, false);
								}
							},
							{
								message: 'Duplicate',
								fnc: function() {
									console.log('Duplicate');
									processPaste(path, true);
								}
							}
						]
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
			var fileManager = this;
			var nodeName = atheos.helpers.getNodeName(path);
			var type = atheos.helpers.getNodeType(path);

			atheos.modal.load(250, this.dialog, {
				action: 'duplicate',
				path: path,
				nodeName: nodeName,
				type: type
			});

			atheos.modal.ready.then(function() {
				o('#modal_content form').once('submit', function(e) {
					e.preventDefault();
					var newName = o('#modal_content form input[name="object_name"]').value();

					// Build new path
					var arr = path.split('/');
					var temp = [];
					for (var i = 0; i < arr.length - 1; i++) {
						temp.push(arr[i]);
					}
					var newPath = temp.join('/') + '/' + newName;

					ajax({
						url: `${fileManager.controller}?action=duplicate&path=${encodeURIComponent(fileManager.clipboard)}'&destination='${encodeURIComponent(path + '/' + nodeName)}`,
						success: function(response) {
							response = JSON.parse(response);
							
							atheos.toast[response.status](response.message);

							if (response.status !== 'error') {
								fileManager.addToFileManager(path, path + '/' + nodeName, type);
								atheos.modal.unload();
								/* Notify listeners. */
								amplify.publish('filemanager.onPaste', {
									path: path,
									nodeName: nodeName,
									duplicate: duplicate
								});
							}
						}
					});
					atheos.modal.unload();
				});
			});
		},

		//////////////////////////////////////////////////////////////////
		// Create Object
		//////////////////////////////////////////////////////////////////
		create: function(path, type) {
			var fileManager = this;

			atheos.modal.load(250, this.dialog, {
				action: 'create',
				type: type
			});

			atheos.modal.ready.then(function() {
				o('#modal_content form').once('submit', function(e) {
					e.preventDefault();

					var nodeName = o('#modal_content form input[name="nodeName"]').value();
					var newPath = path + '/' + nodeName;

					ajax({
						url: `${atheos.filemanager.controller}?action=create&path=${encodeURIComponent(newPath)}&type=${type}`,
						success: function(response) {
							response = JSON.parse(response);
							if (response.status !== 'error') {
								atheos.toast.success('File Created');
								atheos.modal.unload();
								// Add new element to filemanager screen
								atheos.filemanager.addToFileManager(newPath, type, path);
								if (type === 'file') {
									atheos.filemanager.openFile(newPath, true);
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
			});
		},

		//////////////////////////////////////////////////////////////////
		// Create node in file tree
		//////////////////////////////////////////////////////////////////

		addToFileManager: function(path, type, parent) {
			var parentNode = o('#file-manager a[data-path="' + parent + '"]');
			if (!o('#file-manager a[data-path="' + path + '"]')) { // Doesn't already exist
				if (parentNode.hasClass('open') && parentNode.attr('data-type').match(/^(directory|root)$/)) { // Only append node if parent is open (and a directory)

					var node = this.createDirectoryItem(path, type, 0);

					var list = parentNode.siblings('ul')[0];
					if (list) { // UL exists, other children to play with
						list.append(node);
						this.sortPath(list.el);
					} else {
						list = o('<ul>');
						list.append(node);
						parentNode.append(list.el);
					}
				} else {
					if (parentNode.find('.expand')[0]) {
						parentNode.find('.expand')[0].replaceClass('none', 'fa fa-plus');
					}
				}
			}
		},

		sortPath: function(list) {
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
			var nodeName = atheos.helpers.getNodeName(path);
			var type = atheos.helpers.getNodeType(path);
			var fileManager = this;

			atheos.modal.load(250, this.dialog, {
				action: 'rename',
				path: path,
				nodeName: nodeName,
				type: type
			});

			atheos.modal.ready.then(function() {
				o('#modal_content form').once('submit', function(e) {
					e.preventDefault();
					var newName = o('#modal_content form input[name="object_name"]').value();
					// Build new path
					var arr = path.split('/');
					var temp = [];
					for (var i = 0; i < arr.length - 1; i++) {
						temp.push(arr[i]);
					}
					var newPath = temp.join('/') + '/' + newName;
					ajax({
						url: fileManager.controller,
						data: {
							action: 'modify',
							path: path,
							newName: newName
						},
						success: function(response) {
							response = JSON.parse(response);
							if (response.status !== 'error') {
								atheos.toast.success('File Renamed');
								var node = o('#file-manager a[data-path="' + path + '"]'),
									icon = node.find('i:nth-child(2)')[0],
									span = node.find('span')[0];
								// Change pathing and name for node
								node.attr('data-path', newPath);
								span.text(newName);
								if (type === 'file') { // Change icons for file
									icon.removeClass();
									icon.addClass(fileIcons.getClassWithColor(newName));
								} else { // Change pathing on any sub-files/directories
									fileManager.repathChildren(path, newPath);
								}
								// Change any active files
								atheos.active.rename(path, newPath);
							}
						}
					});
					atheos.modal.unload();
				});
			});
		},

		repathChildren: function(oldPath, newPath) {
			var node = o('#file-manager a[data-path="' + newPath + '"]'),
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
			var filemanager = this;
			atheos.modal.load(400, this.dialog, {
				action: 'delete',
				path: path
			});
			atheos.modal.ready.then(function() {
				o('#modal_content form').once('submit', function(e) {
					e.preventDefault();

					ajax({
						url: filemanager.controller + '?action=delete&path=' + encodeURIComponent(path),
						success: function(response) {
							response = JSON.parse(response);
							if (response !== 'error') {
								var node = o('#file-manager a[data-path="' + path + '"]');
								node.parent('li').remove();
								// Close any active files
								var active = document.querySelectorAll('#active-files a');
								for (var i = 0; i < active.length; i++) {
									var curPath = o(active[i]).attr('data-path');
									if (curPath.indexOf(path) === 0) {
										atheos.active.remove(curPath);
									}
								}
							}
							atheos.modal.unload();
						}
					});
				});
			});
		},

		//////////////////////////////////////////////////////////////////
		// Upload
		//////////////////////////////////////////////////////////////////

		upload: function(path) {
			atheos.modal.load(500, this.dialogUpload, {
				path: path
			});
		},

		//////////////////////////////////////////////////////////////////
		// Download
		//////////////////////////////////////////////////////////////////

		download: function(path) {
			var type = this.getType(path);
			o('#download').attr('src', 'components/filemanager/download.php?path=' + encodeURIComponent(path) + '&type=' + type);
		},

		slide: function(direction, target, duration = 500) {
			//Source: https://w3bits.com/javascript-slidetoggle/
			target.style.overflow = 'hidden';
			target.style.transitionProperty = 'height, margin, padding';
			target.style.transitionDuration = duration + 'ms';

			var zeroStyles = function() {
				target.style.height = 0;
				target.style.paddingTop = 0;
				target.style.paddingBottom = 0;
				target.style.marginTop = 0;
				target.style.marginBottom = 0;
			};

			if (window.getComputedStyle(target).display === 'none' || direction === 'open') {
				//SlideDown (Open)
				target.style.removeProperty('display');

				var display = window.getComputedStyle(target).display;
				display = display === 'none' ? 'block' : display;

				target.style.display = display;
				var height = target.offsetHeight;

				zeroStyles();
				target.offsetHeight;
				target.style.boxSizing = 'border-box';
				target.style.height = height + 'px';
				target.style.removeProperty('padding-top');
				target.style.removeProperty('padding-bottom');
				target.style.removeProperty('margin-top');
				target.style.removeProperty('margin-bottom');
				window.setTimeout(() => {
					target.setAttribute('style', '');
				}, duration);
			} else {
				// SlideUp (Close)
				target.style.boxSizing = 'border-box';
				target.style.height = target.offsetHeight + 'px';
				target.offsetHeight;
				zeroStyles();
				window.setTimeout(() => {
					target.setAttribute('style', '');
					target.style.display = 'none';
				}, duration);
			}
		}


	};

})(this);





//////////////////////////////////////////////////////////////////
// This search module needs it's own component sooner than later
//////////////////////////////////////////////////////////////////

(function(global) {
	// 'use strict';
	var atheos = global.atheos,
		amplify = global.amplify,
		ajax = global.ajax,
		o = global.onyx;
	//////////////////////////////////////////////////////////////////
	// Search
	//////////////////////////////////////////////////////////////////
	atheos.filemanager.search = function(path) {
		var filemanager = this;
		atheos.modal.load(500, this.dialog, {
			action: 'search',
			path: path
		});
		atheos.modal.ready.then(function() {
			atheos.modal.hideOverlay();
			var table = o('#filemanager-search-results');


			var lastSearched = JSON.parse(localStorage.getItem('lastSearched'));
			if (lastSearched) {
				o('#modal_content form input[name="search_string"]').value(lastSearched.searchText);
				o('#modal_content form input[name="search_file_type"]').value(lastSearched.fileExtension);
				o('#modal_content form select[name="search_type"]').value(lastSearched.searchType);
				if (lastSearched.searchResults !== '') {
					table.html(lastSearched.searchResults);
					filemanager.slide('open', table.el);
					atheos.modal.resize();
				}
			}


			var listener = function(e) {
				e.preventDefault();

				o('#filemanager-search-processing').show();

				// amplify.subscribe('modal.unload', function() {
				// 	o('#modal_content form').off('submit', listener);
				// });

				var searchString = o('#modal_content form input[name="search_string"]').value();
				var fileExtensions = o('#modal_content form input[name="search_file_type"]').value();
				var searchFileType = fileExtensions.trim();
				if (searchFileType !== '') {
					//season the string to use in find command
					searchFileType = '\\(' + searchFileType.replace(/\s+/g, '\\|') + '\\)';
				}

				var searchType = o('#modal_content form select[name="search_type"]').value();

				ajax({
					type: 'post',
					url: filemanager.controller + '?action=search&path=' + encodeURIComponent(path) + '&type=' + searchType,
					data: {
						search_string: searchString,
						search_file_type: searchFileType,
						searchString: searchString,
						searchFileType: searchFileType
					},
					success: function(response) {
						response = JSON.parse(response);
						table.empty();
						var results = '';
						if (response.status !== 'error') {
							var index = response.data;

							for (var key in index) {
								if (!index.hasOwnProperty(key)) {
									continue;
								}

								var file = index[key];

								if (key.substr(-1) === '/') {
									key = key.substr(0, key.substr.length - 1);
								}

								var node = o('<div>'),
									content = '<span><strong>File: </strong>' + key + '</span>';



								node.addClass('file');

								file.forEach(function(result) {
									result.string = String(result.string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
									content += `<a class="result" onclick="atheos.filemanager.openFile('${result.path}',true,${result.line});atheos.modal.unload();"><span>Line ${result.line}: </span>${result.string}
												</a>`;
								});

								node.html(content);
								table.append(node);

							}

							results = table.html();
							filemanager.slide('open', table.el);

						} else {
							filemanager.slide('close', table.el);
						}
						filemanager.saveSearchResults(searchString, searchType, fileExtensions, results);
						o('#filemanager-search-processing').hide();
						atheos.modal.resize();

					}
				});

			};

			o('#modal_content form').on('submit', listener);

		});


	};

	/////////////////////////////////////////////////////////////////
	// saveSearchResults
	/////////////////////////////////////////////////////////////////
	atheos.filemanager.saveSearchResults = function(searchText, searchType, fileExtensions, searchResults) {
		var lastSearched = {
			searchText: searchText,
			searchType: searchType,
			fileExtension: fileExtensions,
			searchResults: searchResults
		};
		localStorage.setItem('lastSearched', JSON.stringify(lastSearched));
	};
})(this);