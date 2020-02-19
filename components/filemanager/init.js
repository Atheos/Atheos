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

(function(global, $) {
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
						node = node.find('a');
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
					let icon = node.find('.expand');
					if (icon && !icon.hasClass('none')) {
						if (icon.hasClass('fa-plus')) {
							icon.removeClass('fa-plus');
							icon.addClass('fa-minus');
						} else {
							icon.removeClass('fa-minus');
							icon.addClass('fa-plus');
						}
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
			var fileManager = this;
			rescan = rescan || false;

			var node = $('#file-manager a[data-path="' + path + '"]');
			if (node.hasClass('open') && !rescan) {
				node.parent('li').children('ul').slideUp(300, function() {
					$(this).remove();
					node.removeClass('open');
				});
			} else {
				node.children('.expand').addClass('loading');
				$.get(this.controller + '?action=index&path=' + encodeURIComponent(path), function(response) {
					node.addClass('open');
					response = JSON.parse(response);
					if (response.status != 'error') {
						/* Notify listener */
						fileManager.indexFiles = response.data.index;

						var files = fileManager.indexFiles;
						if (files.length > 0) {
							if (node.parent().children('i').hasClass('fa-plus')) {
								node.parent().children('i').removeClass('fa-plus').addClass('fa-minus');
							}
							var display = 'display:none;';
							if (rescan) {
								display = '';
							}
							var appendage = '<ul style="' + display + '">';

							files.forEach(function(file) {
								appendage += fileManager.createDirectoryItem(file.path, file.type, file.size);
							});

							appendage += '</ul>';
							if (rescan) {
								node.parent('li').children('ul').remove();
							}
							$(appendage).insertAfter(node);
							if (!rescan) {
								node.siblings('ul').slideDown(300);
							}
						}
						amplify.publish("filemanager.onIndex", {
							path: path,
							files: fileManager.indexFiles
						});
					}
					node.children('.expand').removeClass('loading');
					if (rescan && fileManager.rescanChildren.length > fileManager.rescanCounter) {
						fileManager.rescan(fileManager.rescanChildren[fileManager.rescanCounter++]);
					} else {
						fileManager.rescanChildren = [];
						fileManager.rescanCounter = 0;
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

			var fileClass = type == 'directory' ? 'fa fa-folder medium-blue' : fileIcons.getClassWithColor(name);

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
				var node = o('#file-manager a[data-path="' + path + '"]').el;
				var children = node.querySelectorAll('a.open');

				for (var i = 0; i < children.length; i++) {
					this.rescanChildren.push(children[i].getAttribute('data-path'));
				}
			}

			this.openDir(path, true);
		},

		//////////////////////////////////////////////////////////////////
		// Open File
		//////////////////////////////////////////////////////////////////

		openFile: function(path, focus) {
			focus = focus || true;

			// var node = o('#file-manager a[data-path="' + path + '"]');
			var ext = atheos.helpers.getNodeExtension(path).toLowerCase();

			if (this.noOpen.indexOf(ext) < 0) {
				ajax({
					url: this.controller + '?action=open&path=' + encodeURIComponent(path),
					success: function(response) {
						response = JSON.parse(response);
						if (response.status !== 'error') {
							atheos.active.open(path, response.data.content, response.data.mtime, false, focus);
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
									message: "Yes",
									fnc: function() {
										atheos.active.close(path);
										atheos.active.removeDraft(path);
										fileManager.openFile(path);
									}
								},
								negative: {
									message: "No",
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
			if (patch.length > 0)
				this.saveModifications(path, {
					patch: patch,
					mtime: mtime
				}, callbacks);
			else if (typeof callbacks.success === 'function') {
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
				var nodeName = atheos.helpers.getNodeName(this.clipboard);
				var type = this.getType(this.clipboard);

				if (duplicate) {
					nodeName = "copy_of_" + nodeName;
				}
				ajax({
					url: `${this.controller}?action=duplicate&path=${encodeURIComponent(this.clipboard)}'&destination='${encodeURIComponent(path + '/' + nodeName)}`,
					success: function(response) {
						response = JSON.parse(response);
						if (response.status !== 'error') {
							fileManager.createObject(path, path + '/' + nodeName, type);
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

			} else if (path == this.clipboard) {
				atheos.toast.error('Cannot Paste Directory Into Itself');

			} else {
				var nodeName = atheos.helpers.getNodeName(fileManager.clipboard);

				if (o('#file-manager a[data-path="' + path + '/' + nodeName + '"]').exists()) {

					atheos.alert.show({
						banner: "Path already exists!",
						message: 'Would you like to overwrite or duplicate the file?',
						data: `/${path}/${nodeName}`,
						actions: [{
								message: "Overwrite",
								fnc: function() {
									console.log('Overwrite');
									fileManager.processPaste(path, false);
								}
							},
							{
								message: "Duplicate",
								fnc: function() {
									console.log('Duplicate');
									fileManager.processPaste(path, true);
								}
							}
						]
					});
				} else {
					fileManager.processPaste(path, false);
				}
			}
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
				if (parentNode.hasClass('open') && parentNode.data('type') === 'directory') { // Only append node if parent is open (and a directory)

					var node = this.createDirectoryItem(path, type, 0);

					if (parentNode.siblings('ul').length) { // UL exists, other children to play with
						parentNode.siblings('ul').append(node);
					} else {
						var list = o('<ul>').append(node);
						parentNode.append(list);
						// $('<ul>' + node + '</ul>').insertAfter(parentNode);
					}
				} else {
					parentNode.find('.expand').replaceClass('none', 'fa fa-plus');
				}
			}
		},


		//////////////////////////////////////////////////////////////////
		// Rename
		//////////////////////////////////////////////////////////////////

		rename: function(path) {
			var nodeName = atheos.helpers.getNodeName(path);
			var type = this.getNodeType(path);
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
							new_name: newName
						},
						success: function(response) {
							response = JSON.parse(response);
							if (response.status !== 'error') {
								atheos.toast.success('File Renamed');
								var node = o('#file-manager a[data-path="' + path + '"]'),
									icon = node.find('i:nth-child(2)'),
									span = node.find('span');
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
							if (response != 'error') {
								var node = o('#file-manager a[data-path="' + path + '"]');
								node.parent('li').remove();
								// Close any active files
								$('#active-files a')
									.each(function() {
										var curPath = $(this)
											.attr('data-path');
										if (curPath.indexOf(path) === 0) {
											atheos.active.remove(curPath);
										}
									});
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
			$('#download')
				.attr('src', 'components/filemanager/download.php?path=' + encodeURIComponent(path) + '&type=' + type);
		},

		//////////////////////////////////////////////////////////////////
		// Return type
		//////////////////////////////////////////////////////////////////

		getNodeType: function(path) {
			return o('#file-manager a[data-path="' + path + '"]').attr('data-type');
		}
	};

})(this, jQuery);





//////////////////////////////////////////////////////////////////
// These are the search functions that I personally have never used
// but once accidently and need to fix and look into, but might end
// up being within their own component.
//////////////////////////////////////////////////////////////////
(function(global, $) {
	// 'use strict';
	var atheos = global.atheos,
		amplify = global.amplify,
		ajax = global.ajax,
		o = global.onyx;
	//////////////////////////////////////////////////////////////////
	// Search
	//////////////////////////////////////////////////////////////////
	atheos.filemanager.search = function(path) {
		atheos.modal.load(500, this.dialog, {
			action: 'search',
			path: path
		});
		atheos.modal.ready.then(function() {
			var lastSearched = JSON.parse(localStorage.getItem("lastSearched"));
			if (lastSearched) {
				$('#modal_content form input[name="search_string"]').val(lastSearched.searchText);
				$('#modal_content form input[name="search_file_type"]').val(lastSearched.fileExtension);
				$('#modal_content form select[name="search_type"]').val(lastSearched.searchType);
				if (lastSearched.searchResults !== '') {
					$('#filemanager-search-results').slideDown().html(lastSearched.searchResults);
				}
			}
		});
		atheos.modal.hideOverlay();
		var _this = this;
		$('#modal_content form')
			.die('submit')
			.live('submit', function(e) {
				$('#filemanager-search-processing')
					.show();
				e.preventDefault();
				var searchString = $('#modal_content form input[name="search_string"]').val();
				var fileExtensions = $('#modal_content form input[name="search_file_type"]').val();
				var searchFileType = $.trim(fileExtensions);
				if (searchFileType !== '') {
					//season the string to use in find command
					searchFileType = "\\(" + searchFileType.replace(/\s+/g, "\\|") + "\\)";
				}
				var searchType = $('#modal_content form select[name="search_type"]').val();
				$.post(_this.controller + '?action=search&path=' + encodeURIComponent(path) + '&type=' + searchType, {
					search_string: searchString,
					search_file_type: searchFileType
				}, function(data) {
					var searchResponse = atheos.jsend.parse(data);
					var results = '';
					if (searchResponse != 'error') {
						$.each(searchResponse.index, function(key, val) {
							// Cleanup file format
							if (val.file.substr(-1) == '/') {
								val.file = val.file.substr(0, val.file.substr.length - 1);
							}
							val.file = val.file.replace('//', '/');
							// Add result
							results += '<div><a onclick="codiad.filemanager.openFile(\'' + val.result + '\');setTimeout( function() { codiad.active.gotoLine(' + val.line + '); }, 500);codiad.modal.unload();">Line ' + val.line + ': ';
							val.file += '</a></div>';
						});
						$('#filemanager-search-results')
							.slideDown()
							.html(results);
					} else {
						$('#filemanager-search-results')
							.slideUp();
					}
					_this.saveSearchResults(searchString, searchType, fileExtensions, results);
					$('#filemanager-search-processing')
						.hide();
				});
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
		localStorage.setItem("lastSearched", JSON.stringify(lastSearched));
	};
})(this, jQuery);