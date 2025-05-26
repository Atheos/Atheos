//////////////////////////////////////////////////////////////////////////////80
// Session Manager Component
//////////////////////////////////////////////////////////////////////////////80
// Manages the currently active file edit sessions, strictly focused on file
// content.
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';

	var AceEditSession = ace.require('ace/edit_session').EditSession;
	var AceUndoManager = ace.require('ace/undomanager').UndoManager;

	const self = {
		// Path to EditSession instance mapping
		activeFiles: {},

		noOpen: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'exe', 'zip', 'tar', 'tar.gz'],

		init: function() {
			fX('#auxSaveFile').on('click', () => self.save());
			fX('#auxReloadFile').on('click', () => self.reload());
			fX('#auxResetFile').on('click', () => self.reset());

			// Prompt if a user tries to close window without saving all files
			window.onbeforeunload = function(e) {
				let changedPaths = self.getUnsavedChanges();
				if (changedPaths) {
					self.focusOnFile(changedPaths[0]);
					e = e || window.event;
					var errMsg = 'You have unsaved files.';

					// For IE and Firefox prior to version 4
					if (e) {
						e.returnValue = errMsg;
					}

					// For rest
					return errMsg;
				}
			};
		},

		getUnsavedChanges() {
			var changedPaths = [];

			for (let path in self.activeFiles) {
				if (self.activeFiles[path].status === 'changed') {
					changedPaths.push(path);
				}
			}

			return (changedPaths.length > 0) ? changedPaths : false;
		},


		//////////////////////////////////////////////////////////////////////80
		// Open multiple files; mostly used to restore last user state.
		//////////////////////////////////////////////////////////////////////80
		openFiles: function(files) {
			var key, item, focusFound;
			for (key in files) {
				item = files[key];
				if (item.status === 'inFocus' && !focusFound) {
					self.openFile(item.path, true);
					focusFound = true;
				} else {
					self.openFile(item.path, false);
				}
			}
		},


		//////////////////////////////////////////////////////////////////////80
		// Open File
		//////////////////////////////////////////////////////////////////////80
		openFile: function(path, inFocus, line) {
			inFocus = typeof(inFocus) !== 'undefined' ? inFocus : true;

			let ext = pathinfo(path).extension.toLowerCase();
			if (self.noOpen.indexOf(ext) > -1) return;

			if (inFocus && self.activeFiles[path]) {
				self.focusOnFile(path, line);
				self.sendFocusToServer(path);
				return;
			}

			let mode = atheos.textmode.selectMode(ext);

			// Load the textmode for syntax highlighting prior to loading
			// file content to ensure that the highlighter is ready when 
			// content is being loaded into the editor pane.
			atheos.common.loadScript('components/editor/ace-editor/mode-' + mode + '.js', function() {
				self.loadFile(path, mode, inFocus, line);
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Load File
		//////////////////////////////////////////////////////////////////////80
		loadFile: function(path, mode, inFocus, line) {
			echo({
				data: {
					target: 'sessionmanager',
					action: 'openFile',
					path: path,
					inFocus: inFocus
				},
				settled: function(reply, status) {
					if (status !== 200) return;
					self.createEditSession(path, reply.content, reply.modifyTime, mode);
					if (inFocus) {
						self.focusOnFile(path, line);
					}
				}
			});
		},

		createEditSession: function(path, content, modifyTime, mode) {
			let aceSession = new AceEditSession(content),
				aceUndoManager = new AceUndoManager();

			let aceModePath = 'ace/mode/' + mode;
			if (!ace.require(aceModePath)) {
				console.warn('Missing ACE mode:', mode);
			}
			aceSession.setMode(aceModePath);

			aceSession.setMode('ace/mode/' + mode);
			aceSession.setUndoManager(aceUndoManager);

			let file = {
				status: 'current',
				path: path,
				serverMTime: modifyTime,
				originalContent: content.slice(0),
				fileTab: atheos.editor.createFileTab(path),
				aceSession: aceSession,
				aceUndo: aceUndoManager,
				states: []
			};

			self.activeFiles[path] = file;
			carbon.publish('active.open', path);
			return file;
		},

		getFile: function(path) {
			return (path && !self.activeFiles[path]) ? 'File path not open.' : self.activeFiles[path];
		},

		getSession: function(path) {
			let file = self.getFile(path);
			return isString(file) ? false : file.aceSession;
		},

		//////////////////////////////////////////////////////////////////////80
		// Check if opened by another user
		//////////////////////////////////////////////////////////////////////80
		check: function(path) {
			echo({
				url: atheos.controller,
				data: {
					target: 'sessionmanager',
					action: 'check',
					path: path
				},
				settled: function(reply, status) {
					if (status === 151) {
						toast(status, reply);
					}
				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Focus on opened file
		//////////////////////////////////////////////////////////////////////80
		focusOnFile: function(path, line) {
			if (path !== atheos.inFocusPath) {
				atheos.editor.attachSession(self.activeFiles[path]);
				if (line) setTimeout(atheos.editor.gotoLine(line), 500);
			}
			/* Check for users registered on the file. */
			self.check(path);

			/* Notify listeners. */
			carbon.publish('active.focus', path);
		},

		sendFocusToServer: function(path) {
			echo({
				url: atheos.controller,
				data: {
					target: 'sessionmanager',
					action: 'setFocus',
					path: path
				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Mark changed
		//////////////////////////////////////////////////////////////////////80
		markChanged: function(path) {
			self.activeFiles[path].status = 'changed';
			self.activeFiles[path].autosaved = false;
			self.activeFiles[path].fileTab.addClass('changed');
		},

		//////////////////////////////////////////////////////////////////////80
		// Save all files
		//////////////////////////////////////////////////////////////////////80
		saveAll: function() {
			for (var fileSession in self.activeFiles) {
				if (self.activeFiles[fileSession].status === 'changed') {
					self.save(fileSession);
				}
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Save active editor
		// I'm pretty sure the save methods are magic and should
		// be worshipped.
		//////////////////////////////////////////////////////////////////////80
		save: function(path, override) {
			if (!path && atheos.contextmenu.active) {
				path = atheos.contextmenu.active.path;
			}
			if (!path) {
				path = atheos.inFocusPath;
			}

			let file = self.getFile(path);
			if (isString(file)) return toast('error', file);

			var content = file.aceSession.getValue();
			file.newContent = content.slice(0);

			if (override) {
				self.saveModifications(path, 'override', file.newContent);
			} else if (file.originalContent.length === 0) {
				self.saveModifications(path, 'full', file.newContent);
			} else if (file.newContent.length === 0) {
				self.saveModifications(path, 'clear', 'clearContent');
			} else {
				atheos.workerManager.addTask({
					taskType: 'diff',
					id: path,
					original: file.originalContent,
					changed: file.newContent
				}, function(success, patch) {
					let saveType = success ? 'patch' : 'full';
					if (success) {
						self.saveModifications(file, 'patch', patch);
					} else {
						self.saveModifications(file, 'full', file.newContent);
					}
				}, self);
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Save file
		// I'm pretty sure the save methods on this are magic and should
		// be worshipped.
		//////////////////////////////////////////////////////////////////////80
		saveModifications: function(file, saveType, newContent) {
			let handleSuccess = function(modifyTime) {
				file.originalContent = file.newContent;
				file.newContent = '';
				file.serverMTime = modifyTime;
				file.status = 'unchanged';
				if (file.fileTab) {
					file.fileTab.removeClass('changed');
				}
				carbon.publish('session.saved', file.path);
			};

			if (newContent.length < 1) {
				return handleSuccess(file.serverMTime);
			}

			echo({
				data: {
					target: 'sessionmanager',
					action: 'saveFile',
					path: file.path,
					saveType,
					newContent,
					modifyTime: file.serverMTime
				},
				settled: function(reply, status) {
					if (status === 200) {
						toast('success', 'File saved');
						handleSuccess(reply.modifyTime);
					} else if (reply.text === 'out of sync') {
						atheos.alert.show({
							banner: 'File changed on server!',
							message: 'Would you like to load the updated file?\n' +
								'Pressing "Save Anyway" will cause your changes to override\n' +
								'the server\'s copy.',
							actions: {
								'Reload File': function() {
									atheos.sessionmanager.remove(path);
									self.openFile(path);
								},
								'Save Anyway': function() {
									atheos.sessionmanager.save(file.path, true);
								}
							}
						});
					} else {
						toast('error', 'File could not be saved');
					}
				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Close file
		//////////////////////////////////////////////////////////////////////80
		close: function(path) {
			let file = self.getFile(path);
			if (isString(file)) return toast('error', file);

			var basename = pathinfo(path).basename;

			if (file.status === 'changed') {
				var dialog = {
					banner: 'Close unsaved file?',
					data: basename,
					actions: {
						'Save & Close': function() {
							carbon.publish('active.close', path);
							self.save(path);
							self.remove(path);
						},
						'Discard Changes': function() {
							carbon.publish('active.close', path);
							self.remove(path);
						},
						'Cancel': function() {
							// Cancel
						}
					}
				};

				atheos.alert.show(dialog);

			} else {
				carbon.publish('active.close', path);
				self.remove(path);
			}
		},

		closeAll: function() {
			var changedTabs = '';

			for (var path in self.activeFiles) {
				if (self.activeFiles[path].status === 'changed') {
					var basename = pathinfo(path).basename;
					changedTabs += basename + '\n';
				}
			}

			if (changedTabs !== '') {
				var dialog = {
					banner: 'Close unsaved file?',
					data: changedTabs,
					actions: {
						'Save All & Close': function() {
							carbon.publish('active.closeAll');
							self.saveAll();
							self.removeAll();
						},
						'Discard Changes': function() {
							carbon.publish('active.closeAll');
							self.removeAll();
						},
						'Cancel': function() {
							// Cancel
						}
					}
				};
				atheos.alert.show(dialog);
			} else {
				self.removeAll();
			}
		},

		remove: function(path) {
			if (!(path in self.activeFiles)) {
				return;
			}
			var file = self.activeFiles[path];

			file.fileTab.remove();
			atheos.editor.updateTabDropdownVisibility();

			/* Select all the tab tumbs except the one which is to be removed. */
			var tabs = atheos.editor.tabList.findAll('li');

			if (tabs.length === 0) {
				atheos.editor.exterminate();
			} else if (path === atheos.inFocusPath) {

				var nextFilePath = tabs[0].attr('data-path');
				var nextFile = self.activeFiles[nextFilePath];
				// atheos.editor.removeSession(session, nextSession);

				self.focusOnFile(nextFilePath);
			}
			delete self.activeFiles[path];

			echo({
				url: atheos.controller,
				data: {
					target: 'sessionmanager',
					action: 'remove',
					path: path
				}
			});
		},

		removeAll: function() {
			for (var path in self.activeFiles) {
				var session = self.activeFiles[path];
				session.fileTab.remove();

				delete self.activeFiles[path];
			}

			atheos.editor.updateTabDropdownVisibility();
			atheos.editor.exterminate();
			echo({
				url: atheos.controller,
				data: {
					target: 'sessionmanager',
					action: 'removeAll'
				}
			});
		},

		reload: function(path) {
			if (!path && atheos.contextmenu.active) {
				path = atheos.contextmenu.active.path;
			}

			let session = self.getSession(path);
			if (isString(session)) return toast('error', session);
			path = session.path;

			echo({
				data: {
					target: 'filetree',
					action: 'open',
					path: path
				},
				settled: function(reply, status) {
					if (status !== 200) return toast('error', 'Unable to reload file.');
					session.serverMTime = reply.modifyTime;
					session.originalContent = reply.content;
					session.setValue(reply.content);
					session.status = 'current';
					if (session.fileTab) {
						session.fileTab.removeClass('changed');
					}
					toast('success', 'File reloaded from server.');
				}
			});
		},

		reset: function(path) {
			if (!path && atheos.contextmenu.active) {
				path = atheos.contextmenu.active.path;
			}

			let session = self.getSession(path);
			if (isString(session)) return toast('error', session);
			path = session.path;

			session.setValue(session.originalContent);
			session.status = 'current';
			if (session.fileTab) {
				session.fileTab.removeClass('changed');
			}
			toast('success', 'File reset from cache.');
		},

		//////////////////////////////////////////////////////////////////////80
		// Rename tab to new name
		//////////////////////////////////////////////////////////////////////80
		rename: function(oldPath, newPath) {
			var switchSessions = function(oldPath, newPath) {
				var fileTab = self.activeFiles[oldPath].fileTab;
				fileTab.attr('data-path', newPath);
				var title = newPath;
				if (atheos.common.isAbsPath(newPath)) {
					title = newPath.substring(1);
				}

				let info = pathinfo(newPath);
				fileTab.find('a').html(`<span class="subtle">${info.directory.replace(/^\/+/g, '')}/</span>${info.basename}`);

				self.activeFiles[newPath] = self.activeFiles[oldPath];
				self.activeFiles[newPath].path = newPath;

				delete self.activeFiles[oldPath];
			};

			if (self.activeFiles[oldPath]) {
				// A file was renamed
				switchSessions.apply(self, [oldPath, newPath]);

				// pass new sessions instance to setactive
				for (var k = 0; k < atheos.editor.instances.length; k++) {
					if (atheos.editor.instances[k].getSession().path === newPath) {
						atheos.editor.setFocusOn(atheos.editor.instances[k]);
					}
				}

				var newSession = self.activeFiles[newPath];

				// Change Editor Mode
				var ext = pathinfo(newPath).extension;
				var mode = atheos.textmode.selectMode(ext);

				// handle async mode change
				var fn = function() {
					atheos.textmode.setModeDisplay(newSession);
					newSession.removeListener('changeMode', fn);
				};

				newSession.on('changeMode', fn);
				newSession.setMode('ace/mode/' + mode);
			} else {
				// A folder was renamed
				var newKey;
				for (var key in self.activeFiles) {
					newKey = key.replace(oldPath, newPath);
					if (newKey !== key) {
						switchSessions.apply(self, [key, newKey]);
					}
				}
			}

			echo({
				url: atheos.controller,
				data: {
					target: 'sessionmanager',
					action: 'rename',
					path: oldPath,
					newPath: newPath
				},
				settled: function(reply, status) {
					if (status !== 200) return;
					carbon.publish('active.onRename', {
						'oldPath': oldPath,
						'newPath': newPath
					});
				}
			});
		},
	};

	carbon.subscribe('system.loadMajor', () => self.init());
	atheos.sessionmanager = self;

})();