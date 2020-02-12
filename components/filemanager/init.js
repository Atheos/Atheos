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
	var core = global.codiad,
		amplify = global.amplify,
		o = global.onyx;

	amplify.subscribe('core.loaded', function(settings) {
		core.filemanager.init();
	});




	core.filemanager = {

		clipboard: '',

		noOpen: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'exe', 'zip', 'tar', 'tar.gz'],
		noBrowser: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],

		controller: 'components/filemanager/controller.php',
		dialog: 'components/filemanager/dialog.php',
		dialogUpload: 'components/filemanager/dialog_upload.php',

		init: function() {
			//Prevent text selection in fie-manager
			// $('#file-manager').on('selectstart', false);

			// Initialize node listener
			this.nodeListener();
			// Load uploader
			core.helpers.loadScript('components/filemanager/upload_scripts/jquery.ui.widget.js', true);
			core.helpers.loadScript('components/filemanager/upload_scripts/jquery.iframe-transport.js', true);
			core.helpers.loadScript('components/filemanager/upload_scripts/jquery.fileupload.js', true);
		},

		//////////////////////////////////////////////////////////////////
		// Listen for click events on nodes
		//////////////////////////////////////////////////////////////////

		nodeListener: function() {
			var _this = this;

			var nodeFunctions = (function(node) {
				node = o(node);
				if (node.attr('data-type') === 'directory' || node.attr('data-type') === 'root') {
					this.index(node.attr('data-path'));
				} else {
					this.openFile(node.attr('data-path'));
				}
				let icon = node.find('.expand');
				if (icon && icon.hasClass('none')) {
					if (icon.hasClass('fa-plus')) {
						icon.removeClass('fa-plus');
						icon.addClass('fa-minus');
					} else {
						icon.removeClass('fa-minus');
						icon.addClass('fa-plus');
					}
				}
			}).bind(this);

			o('#file-manager').on('click', function(e) {
				if (!core.editor.settings.fileManagerTrigger) {
					nodeFunctions(e.target);
				}
			});
			o('#file-manager').on('dblclick', function(e) {
				if (core.editor.settings.fileManagerTrigger) {
					nodeFunctions(e.target);
				}
			});

			o('#file-manager').on("contextmenu", function(e) { // Context Menu
				e.preventDefault();
				core.filemanager.contextMenuShow(e);
			});
		},

		//////////////////////////////////////////////////////////////////
		// Context Menu
		//////////////////////////////////////////////////////////////////

		contextMenuShow: function(e) {
			var node = o(e.target),
				path = node.attr('data-path'),
				type = node.attr('data-type'),
				name = node.html();

			node.addClass('context-menu-active');


			// Selective options
			switch (type) {
				case 'directory':
					$('#context-menu .directory-only, #context-menu .non-root').show();
					$('#context-menu .file-only, #context-menu .root-only').hide();
					break;
				case 'file':
					$('#context-menu .directory-only, #context-menu .root-only').hide();
					$('#context-menu .file-only,#context-menu .non-root').show();
					break;
				case 'root':
					$('#context-menu .directory-only, #context-menu .root-only').show();
					$('#context-menu .non-root, #context-menu .file-only').hide();
					break;
			}
			if (core.project.isAbsPath(o('#file-manager a[data-type="root"]').attr('data-path'))) {
				$('#context-menu .no-external').hide();
			} else {
				$('#context-menu .no-external').show();
			}
			// Show menu
			var top = e.pageY;
			if (top > $(window).height() - $('#context-menu').height()) {
				top -= $('#context-menu').height();
			}
			if (top < 10) {
				top = 10;
			}
			var max = $(window).height() - top - 10;

			var menu = o('#context-menu');

			menu.css({
				'top': top + 'px',
				'left': e.pageX + 'px',
				'max-height': max + 'px',
				'display': 'block'
			});
			menu.attr('data-path', path);
			menu.attr('data-type', type);
			menu.attr('data-name', name);
			// Show faded 'paste' if nothing in clipboard
			if (this.clipboard === '') {
				$('#context-menu a[content="Paste"]').addClass('disabled');
			} else {
				$('#context-menu a[data-action="paste"]').removeClass('disabled');
			}
			// Hide menu
			// $('#file-manager, #editor-region')
			//     .on('mouseover', function() {
			//         _this.contextMenuHide();
			//     });
			var _this = this;

			var hideContextMenu;
			$('#context-menu')
				.on('mouseleave', function() {
					hideContextMenu = setTimeout(function() {
						_this.contextMenuHide();
					}, 500);
				});
			$('#context-menu')
				.on('mouseover', function() {
					if (hideContextMenu) clearTimeout(hideContextMenu);
				});
			/* Notify listeners. */
			amplify.publish('context-menu.onShow', {
				e: e,
				path: path,
				type: type
			});
			// Hide on click
			$('#context-menu a')
				.click(function() {
					_this.contextMenuHide();
				});
		},

		contextMenuHide: function() {
			$('#context-menu')
				.fadeOut(200);
			$('#file-manager a')
				.removeClass('context-menu-active');
			/* Notify listeners. */
			amplify.publish('context-menu.onHide');
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

		createObject: function(parent, path, type) {
			var parentNode = $('#file-manager a[data-path="' + parent + '"]');
			if (!$('#file-manager a[data-path="' + path + '"]').length) { // Doesn't already exist
				if (parentNode.hasClass('open') && parentNode.data('type') === 'directory') { // Only append node if parent is open (and a directory)
					var shortName = core.helpers.file.getShortName(path);
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
					var objectsResponse = core.jsend.parse(data);
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
			var ext = core.helpers.file.getExtension(path);
			if ($.inArray(ext.toLowerCase(), this.noOpen) < 0) {
				node.children('.expand').addClass('loading');
				$.get(this.controller + '?action=open&path=' + encodeURIComponent(path), function(data) {
					var openResponse = core.jsend.parse(data);
					if (openResponse != 'error') {
						node.children('.expand').removeClass('loading');
						core.active.open(path, openResponse.content, openResponse.mtime, false, focus);
					}
				});
			} else {
				if (!core.project.isAbsPath(path)) {
					if ($.inArray(ext.toLowerCase(), this.noBrowser) < 0) {
						this.download(path);
					} else {
						this.openInModal(path);
					}
				} else {
					core.toast.error(i18n('Unable to open file in Browser'));
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
					var openIBResponse = core.jsend.parse(data);
					if (openIBResponse != 'error') {
						window.open(openIBResponse.url, '_newtab');
					}
				},
				async: false
			}); 
		},
		openInModal: function(path) {
			core.modal.load(250, this.dialog, {
				action: 'preview',
				path: path
			}); 
		},
		saveModifications: function(path, data, callbacks) {
			callbacks = callbacks || {};
			var _this = this,
				action, data;
			var notifySaveErr = function() {
				core.toast.error(i18n('File could not be saved')); 
				if (typeof callbacks.error === 'function') {
					var context = callbacks.context || _this;
					callbacks.error.apply(context, [data]);
				}
			} 
			$.post(this.controller + '?action=modify&path=' + encodeURIComponent(path), data, function(resp) {
				resp = $.parseJSON(resp);
				if (resp.status == 'success') {
					core.toast.success(i18n('File saved'));
					if (typeof callbacks.success === 'function') {
						var context = callbacks.context || _this;
						callbacks.success.call(context, resp.data.mtime);
					}
				} else {
					if (resp.message == 'Client is out of sync') {
						core.confirm.showConfirm({
							message: 'The server has a more updated copy of the file.\n' +
								'Would you like to retreieve an updated copy of the file?\n' +
								'Pressing no will cause your changes to override the\n' +
								'server\'s copy upon next save.',
							confirm: {
								message: "Yes",
								fnc: function() {
									core.active.close(path);
									core.active.removeDraft(path);
									_this.openFile(path); 
								} 
							},
							deny: {
								message: "No",
								fnc: function() {
									var session = core.editor.getActive().getSession();
									session.serverMTime = null;
									session.untainted = null;
								}
							}
						});
						// var reload = confirm(
						// 	"Server has a more updated copy of the file. Would " +
						// 	"you like to refresh the contents ? Pressing no will " +
						// 	"cause your changes to override the server's copy upon " +
						// 	"next save."
						// );
						// if (reload) {
						// 	core.active.close(path);
						// 	core.active.removeDraft(path);
						// 	_this.openFile(path);
						// } else {
						// 	var session = core.editor.getActive().getSession();
						// 	session.serverMTime = null;
						// 	session.untainted = null;
						// }
					} else core.toast.error(i18n('File could not be saved'));
					if (typeof callbacks.error === 'function') {
						var context = callbacks.context || _this;
						callbacks.error.apply(context, [resp.data]);
					}
				}
			}).error(notifySaveErr);
		},
		//////////////////////////////////////////////////////////////////
		// Save file
		//////////////////////////////////////////////////////////////////

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
		// Create Object
		//////////////////////////////////////////////////////////////////

		createNode: function(path, type) {
			core.modal.load(250, this.dialog, {
				action: 'create',
				type: type,
				path: path
			});
			$('#modal_content form')
				.live('submit', function(e) {
					e.preventDefault();
					var shortName = $('#modal_content form input[name="object_name"]')
						.val();
					var path = $('#modal_content form input[name="path"]')
						.val();
					var type = $('#modal_content form input[name="type"]')
						.val();
					var createPath = path + '/' + shortName;
					$.get(core.filemanager.controller + '?action=create&path=' + encodeURIComponent(createPath) + '&type=' + type, function(data) {
						var createResponse = core.jsend.parse(data);
						if (createResponse != 'error') {
							core.toast.success(type.charAt(0)
								.toUpperCase() + type.slice(1) + ' Created');
							core.modal.unload();
							// Add new element to filemanager screen
							core.filemanager.createObject(path, createPath, type);
							if (type == 'file') {
								core.filemanager.openFile(createPath, true);
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
		// Copy to Clipboard
		//////////////////////////////////////////////////////////////////

		copyNode: function(path) {
			this.clipboard = path;
			core.toast.success(i18n('Copied to Clipboard'));
		},

		//////////////////////////////////////////////////////////////////
		// Paste
		//////////////////////////////////////////////////////////////////

		pasteNode: function(path) {
			var _this = this;
			if (this.clipboard == '') {
				core.toast.error(i18n('Nothing in Your Clipboard'));
			} else if (path == this.clipboard) {
				core.toast.error(i18n('Cannot Paste Directory Into Itself'));
			} else {
				var shortName = core.helpers.file.getShortName(_this.clipboard);
				if ($('#file-manager a[data-path="' + path + '/' + shortName + '"]')
					.length) { // Confirm overwrite?
					core.modal.load(400, this.dialog, {
						action: 'overwrite',
						path: path + '/' + shortName
					});
					$('#modal_content form')
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
			var shortName = core.helpers.file.getShortName(this.clipboard);
			var type = this.getType(this.clipboard);
			if (duplicate) {
				shortName = "copy_of_" + shortName;
			}
			$.get(this.controller + '?action=duplicate&path=' +
				encodeURIComponent(this.clipboard) + '&destination=' +
				encodeURIComponent(path + '/' + shortName),
				function(data) {
					var pasteResponse = core.jsend.parse(data);
					if (pasteResponse != 'error') {
						_this.createObject(path, path + '/' + shortName, type);
						core.modal.unload();
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

		renameNode: function(path) {
			var shortName = core.helpers.file.getShortName(path);
			var type = this.getType(path);
			var _this = this;
			core.modal.load(250, this.dialog, {
				action: 'rename',
				path: path,
				short_name: shortName,
				type: type
			});
			$('#modal_content form')
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
						var renameResponse = core.jsend.parse(data);
						if (renameResponse != 'error') {
							core.toast.success(type.charAt(0).toUpperCase() + type.slice(1) + ' Renamed');
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
							core.active.rename(path, newPath);
							core.modal.unload();
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

		deleteNode: function(path) {
			var _this = this;
			core.modal.load(400, this.dialog, {
				action: 'delete',
				path: path
			});
			$('#modal_content form')
				.live('submit', function(e) {
					e.preventDefault();
					$.get(_this.controller + '?action=delete&path=' + encodeURIComponent(path), function(data) {
						var deleteResponse = core.jsend.parse(data);
						if (deleteResponse != 'error') {
							var node = $('#file-manager a[data-path="' + path + '"]');
							node.parent('li')
								.remove();
							// Close any active files
							$('#active-files a')
								.each(function() {
									var curPath = $(this)
										.attr('data-path');
									if (curPath.indexOf(path) == 0) {
										core.active.remove(curPath);
									}
								});
						}
						core.modal.unload();
					});
				});
		},

		//////////////////////////////////////////////////////////////////
		// Search
		//////////////////////////////////////////////////////////////////

		search: function(path) {
			core.modal.load(500, this.dialog, {
				action: 'search',
				path: path
			});
			core.modal.loadProcess.then(function() {
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
			core.modal.hideOverlay();
			var _this = this;
			$('#modal_content form')
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
						searchResponse = core.jsend.parse(data);
						var results = '';
						if (searchResponse != 'error') {
							$.each(searchResponse.index, function(key, val) {
								// Cleanup file format
								if (val['file'].substr(-1) == '/') {
									val['file'] = val['file'].substr(0, str.length - 1);
								}
								val['file'] = val['file'].replace('//', '/');
								// Add result
								results += '<div><a onclick="codiad.filemanager.openFile(\'' + val['result'] + '\');setTimeout( function() { codiad.active.gotoLine(' + val['line'] + '); }, 500);codiad.modal.unload();">Line ' + val['line'] + ': ' + val['file'] + '</a></div>';
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
		},

		/////////////////////////////////////////////////////////////////
		// saveSearchResults
		/////////////////////////////////////////////////////////////////
		saveSearchResults: function(searchText, searchType, fileExtensions, searchResults) {
			var lastSearched = {
				searchText: searchText,
				searchType: searchType,
				fileExtension: fileExtensions,
				searchResults: searchResults
			};
			localStorage.setItem("lastSearched", JSON.stringify(lastSearched));
		},
		//////////////////////////////////////////////////////////////////
		// Upload
		//////////////////////////////////////////////////////////////////

		uploadToNode: function(path) {
			core.modal.load(500, this.dialogUpload, {
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