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
	// 'use strict';
	var atheos = global.atheos,
		amplify = global.amplify,
		ajax = global.ajax,
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
						this.index(node.attr('data-path'));
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
		// Return type
		//////////////////////////////////////////////////////////////////

		getType: function(path) {
			return $('#file-manager a[data-path="' + path + '"]')
				.attr('data-type');
		},

		//////////////////////////////////////////////////////////////////
		// Create node in file tree
		// This function doesn't seem to be called ever. - Liam Siira
		// This function is used during the new file creation. Probably can be
		// used elsewhere, like the intiation.
		//////////////////////////////////////////////////////////////////

		createDirectoryItem: function(parent, path, type) {
			var parentNode = $('#file-manager a[data-path="' + parent + '"]');
			if (!$('#file-manager a[data-path="' + path + '"]').length) { // Doesn't already exist
				if (parentNode.hasClass('open') && parentNode.data('type') === 'directory') { // Only append node if parent is open (and a directory)
					var shortName = atheos.helpers.file.getShortName(path);
					var nodeClass = 'none';
					var fileClass = type == "directory" ? "fa fa-folder medium-blue" : FileIcons.getClassWithColor(shortName);
					fileClass = fileClass || 'fa fa-file medium-green';

					var appendage = `<li>
										<a data-type="${type}" data-path="${path}">
											<i class="expand ${nodeClass}"></i>
											<i class="${fileClass}"></i>
											<span>${shortName}</span>
										</a>
									</li>`;

					if (parentNode.siblings('ul').length) { // UL exists, other children to play with
						parentNode.siblings('ul').append(appendage);
					} else {
						$('<ul>' + appendage + '</ul>').insertAfter(parentNode);
					}
				} else {
					parentNode.parent().children('span').removeClass('none');
					parentNode.parent().children('span').addClass('plus');
				}
			}
		},

		//////////////////////////////////////////////////////////////////
		// Create Object
		//////////////////////////////////////////////////////////////////

		createNode: function(path, type) {
			atheos.modal.load(250, this.dialog, {
				action: 'create',
				type: type,
				path: path
			});
			$('#modal_content form')
				.die('submit')
				.live('submit', function(e) {
					e.preventDefault();
					var shortName = $('#modal_content form input[name="object_name"]')
						.val();
					var path = $('#modal_content form input[name="path"]')
						.val();
					var type = $('#modal_content form input[name="type"]')
						.val();
					var createPath = path + '/' + shortName;
					$.get(atheos.filemanager.controller + '?action=create&path=' + encodeURIComponent(createPath) + '&type=' + type, function(data) {
						var createResponse = atheos.jsend.parse(data);
						if (createResponse != 'error') {
							atheos.toast.success(type.charAt(0)
								.toUpperCase() + type.slice(1) + ' Created');
							atheos.modal.unload();
							// Add new element to filemanager screen
							atheos.filemanager.createDirectoryItem(path, createPath, type);
							if (type == 'file') {
								atheos.filemanager.openFile(createPath, true);
							}
							/* Notify listeners. */
							amplify.publish('filemanager.onCreate', {
								createPath: createPath,
								path: path,
								shortName: shortName,
								type: type
							});
						}
					});
				});
		},

		//////////////////////////////////////////////////////////////////
		// Loop out all files and folders in directory path
		//////////////////////////////////////////////////////////////////

		indexFiles: [],

		index: function(path, rescan) {
			var _this = this;
			if (rescan === undefined) {
				rescan = false;
			}
			node = $('#file-manager a[data-path="' + path + '"]');
			if (node.hasClass('open') && !rescan) {
				node.parent('li')
					.children('ul')
					.slideUp(300, function() {
						$(this)
							.remove();
						node.removeClass('open');
					});
			} else {
				node.children('.expand').addClass('loading');
				$.get(this.controller + '?action=index&path=' + encodeURIComponent(path), function(data) {
					node.addClass('open');
					var objectsResponse = atheos.jsend.parse(data);
					if (objectsResponse != 'error') {
						/* Notify listener */
						_this.indexFiles = objectsResponse.index;
						amplify.publish("filemanager.onIndex", {
							path: path,
							files: _this.indexFiles
						});
						var files = _this.indexFiles;
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
								file.path = file.name;
								file.name = file.name.replace(path, '').split('/').join('');

								file.class = file.type == "directory" ? "fa fa-folder medium-blue" : FileIcons.getClassWithColor(file.name);
								file.class = file.class || 'fa fa-file medium-green';
								var nodeClass = 'none';
								if (file.type == 'file') {
									file.ext = ' ext-' + name.split('.').pop();
								}
								if (file.type == 'directory' && file.size > 0) {
									nodeClass = 'fa fa-plus';
								}

								// appendage += '<li><span class="' + nodeClass + '"></span><a class="' + file.class + '" data-type="' + file.type + '" data-path="' + file.path + '">' + file.name + '</a></li>';

								appendage += `<li>
											<a data-type="${file.type}" data-path="${file.path}">
											<i class="expand ${nodeClass}"></i>
											<i class="${file.class}"></i>
											<span>${file.name}</span>
											</a></li>`;
							});

							appendage += '</ul>';
							if (rescan) {
								node.parent('li')
									.children('ul')
									.remove();
							}
							$(appendage)
								.insertAfter(node);
							if (!rescan) {
								node.siblings('ul')
									.slideDown(300);
							}
						}
					}
					node.children('.expand').removeClass('loading');
					if (rescan && _this.rescanChildren.length > _this.rescanCounter) {
						_this.rescan(_this.rescanChildren[_this.rescanCounter++]);
					} else {
						_this.rescanChildren = [];
						_this.rescanCounter = 0;
					}
				});
			}
		},

		rescanChildren: [],

		rescanCounter: 0,

		rescan: function(path) {
			var _this = this;
			if (this.rescanCounter === 0) {
				// Create array of open directories
				node = $('#file-manager a[data-path="' + path + '"]');
				node.parent()
					.find('a.open')
					.each(function() {
						_this.rescanChildren.push($(this)
							.attr('data-path'));
					});
			}

			this.index(path, true);
		},

		//////////////////////////////////////////////////////////////////
		// Open File
		//////////////////////////////////////////////////////////////////

		openFile: function(path, focus) {
			if (focus === undefined) {
				focus = true;
			}
			var node = $('#file-manager a[data-path="' + path + '"]');
			var ext = atheos.helpers.file.getExtension(path);
			if ($.inArray(ext.toLowerCase(), this.noOpen) < 0) {
				node.children('.expand').addClass('loading');
				$.get(this.controller + '?action=open&path=' + encodeURIComponent(path), function(data) {
					var openResponse = atheos.jsend.parse(data);
					if (openResponse != 'error') {
						node.children('.expand').removeClass('loading');
						atheos.active.open(path, openResponse.content, openResponse.mtime, false, focus);
					}
				});
			} else {
				if (!atheos.project.isAbsPath(path)) {
					if ($.inArray(ext.toLowerCase(), this.noBrowser) < 0) {
						this.download(path);
					} else {
						this.openInModal(path);
					}
				} else {
					atheos.toast.error(i18n('Unable to open file in Browser'));
				}
			}
		},

		//////////////////////////////////////////////////////////////////
		// Open in browser
		//////////////////////////////////////////////////////////////////

		openInBrowser: function(path) {
			$.ajax({
				url: this.controller + '?action=open_in_browser&path=' + encodeURIComponent(path),
				success: function(data) {
					var openIBResponse = atheos.jsend.parse(data);
					if (openIBResponse != 'error') {
						window.open(openIBResponse.url, '_newtab');
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
		//////////////////////////////////////////////////////////////////
		saveModifications: function(path, data, callbacks) {
			callbacks = callbacks || {};
			var _this = this,
				action, data;
			var notifySaveErr = function() {
				atheos.toast.error(i18n('File could not be saved'));
				if (typeof callbacks.error === 'function') {
					var context = callbacks.context || _this;
					callbacks.error.apply(context, [data]);
				}
			}
			$.post(this.controller + '?action=modify&path=' + encodeURIComponent(path), data, function(resp) {
				resp = $.parseJSON(resp);
				if (resp.status == 'success') {
					atheos.toast.success(i18n('File saved'));
					if (typeof callbacks.success === 'function') {
						var context = callbacks.context || _this;
						callbacks.success.call(context, resp.data.mtime);
					}
				} else {
					if (resp.message == 'Client is out of sync') {
						atheos.confirm.showConfirm({
							message: 'The server has a more updated copy of the file.\n' +
								'Would you like to retreieve an updated copy of the file?\n' +
								'Pressing no will cause your changes to override the\n' +
								'server\'s copy upon next save.',
							confirm: {
								message: "Yes",
								fnc: function() {
									atheos.active.close(path);
									atheos.active.removeDraft(path);
									_this.openFile(path);
								}
							},
							deny: {
								message: "No",
								fnc: function() {
									var session = atheos.editor.getActive().getSession();
									session.serverMTime = null;
									session.untainted = null;
								}
							}
						});
					} else atheos.toast.error('File could not be saved');
					if (typeof callbacks.error === 'function') {
						var context = callbacks.context || _this;
						callbacks.error.apply(context, [resp.data]);
					}
				}
			}).error(notifySaveErr);
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
			atheos.toast.success(i18n('Copied to Clipboard'));
		},

		//////////////////////////////////////////////////////////////////
		// Paste
		//////////////////////////////////////////////////////////////////

		paste: function(path) {
			var _this = this;
			if (this.clipboard == '') {
				atheos.toast.error(i18n('Nothing in Your Clipboard'));
			} else if (path == this.clipboard) {
				atheos.toast.error(i18n('Cannot Paste Directory Into Itself'));
			} else {
				var shortName = atheos.helpers.file.getShortName(_this.clipboard);
				if ($('#file-manager a[data-path="' + path + '/' + shortName + '"]')
					.length) { // Confirm overwrite?
					atheos.modal.load(400, this.dialog, {
						action: 'overwrite',
						path: path + '/' + shortName
					});
					$('#modal_content form')
						.die('submit')
						.live('submit', function(e) {
							e.preventDefault();
							var duplicate = false;
							if ($('#modal-content form select[name="or_action"]').val() == 1) {
								duplicate = true;
								console.log('Dup!');
							}
							_this.processPasteNode(path, duplicate);
						});
				} else { // No conflicts; proceed...
					_this.processPasteNode(path, false);
				}
			}
		},

		processPasteNode: function(path, duplicate) {
			var _this = this;
			var shortName = atheos.helpers.file.getShortName(this.clipboard);
			var type = this.getType(this.clipboard);
			if (duplicate) {
				shortName = "copy_of_" + shortName;
			}
			$.get(this.controller + '?action=duplicate&path=' +
				encodeURIComponent(this.clipboard) + '&destination=' +
				encodeURIComponent(path + '/' + shortName),
				function(data) {
					var pasteResponse = atheos.jsend.parse(data);
					if (pasteResponse != 'error') {
						_this.createObject(path, path + '/' + shortName, type);
						atheos.modal.unload();
						/* Notify listeners. */
						amplify.publish('filemanager.onPaste', {
							path: path,
							shortName: shortName,
							duplicate: duplicate
						});
					}
				});
		},

		//////////////////////////////////////////////////////////////////
		// Rename
		//////////////////////////////////////////////////////////////////

		rename: function(path) {
			var shortName = atheos.helpers.file.getShortName(path);
			var type = this.getType(path);
			var _this = this;
			atheos.modal.load(250, this.dialog, {
				action: 'rename',
				path: path,
				short_name: shortName,
				type: type
			});
			$('#modal_content form')
				.die('submit')
				.live('submit', function(e) {
					e.preventDefault();
					var newName = $('#modal_content form input[name="object_name"]').val();
					// Build new path
					var arr = path.split('/');
					var temp = new Array();
					for (i = 0; i < arr.length - 1; i++) {
						temp.push(arr[i])
					}
					var newPath = temp.join('/') + '/' + newName;
					$.get(_this.controller, {
						action: 'modify',
						path: path,
						new_name: newName
					}, function(data) {
						var renameResponse = atheos.jsend.parse(data);
						if (renameResponse != 'error') {
							atheos.toast.success(type.charAt(0).toUpperCase() + type.slice(1) + ' Renamed');
							var node = $('#file-manager a[data-path="' + path + '"]'),
								icon = node.find('i:nth-child(2)'),
								span = node.find('span');
							// Change pathing and name for node
							node.attr('data-path', newPath);
							span.html(newName);
							if (type == 'file') { // Change icons for file
								icon.removeClass();
								icon.addClass(FileIcons.getClassWithColor(newName));
							} else { // Change pathing on any sub-files/directories
								_this.repathSubs(path, newPath);
							}
							// Change any active files
							atheos.active.rename(path, newPath);
							atheos.modal.unload();
						}

					});
				});
		},

		repathSubs: function(oldPath, newPath) {
			$('#file-manager a[data-path="' + newPath + '"]')
				.siblings('ul')
				.find('a')
				.each(function() {
					// Hit the children, hit 'em hard
					var curPath = $(this)
						.attr('data-path');
					var revisedPath = curPath.replace(oldPath, newPath);
					$(this)
						.attr('data-path', revisedPath);
				});
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
						success: function(data) {
							var deleteResponse = atheos.jsend.parse(data);
							if (deleteResponse != 'error') {
								var node = o('#file-manager a[data-path="' + path + '"]');
								node.parent('li').remove();
								// Close any active files
								$('#active-files a')
									.each(function() {
										var curPath = $(this)
											.attr('data-path');
										if (curPath.indexOf(path) == 0) {
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
				if (lastSearched.searchResults != '') {
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
				searchString = $('#modal_content form input[name="search_string"]')
					.val();
				fileExtensions = $('#modal_content form input[name="search_file_type"]')
					.val();
				searchFileType = $.trim(fileExtensions);
				if (searchFileType != '') {
					//season the string to use in find command
					searchFileType = "\\(" + searchFileType.replace(/\s+/g, "\\|") + "\\)";
				}
				searchType = $('#modal_content form select[name="search_type"]')
					.val();
				$.post(_this.controller + '?action=search&path=' + encodeURIComponent(path) + '&type=' + searchType, {
					search_string: searchString,
					search_file_type: searchFileType
				}, function(data) {
					searchResponse = atheos.jsend.parse(data);
					var results = '';
					if (searchResponse != 'error') {
						$.each(searchResponse.index, function(key, val) {
							// Cleanup file format
							if (val['file'].substr(-1) == '/') {
								val['file'] = val['file'].substr(0, str.length - 1);
							}
							val['file'] = val['file'].replace('//', '/');
							// Add result
							results += '<div><a onclick="codiad.filemanager.openFile(\'' + val['result'] + '\');setTimeout( function() { codiad.active.gotoLine(' + val['line'] + '); }, 500);codiad.modal.unload();">Line ' + val['line'] + ': '
							val['file'] + '</a></div>';
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