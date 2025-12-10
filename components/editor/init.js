//////////////////////////////////////////////////////////////////////////////80
// Editor Init
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';

	// File -> Represents the file on the server
	// AceSession -> Owns the editing session, such as history.
	// EditorPane -> Owns AceEditor Text Editor -> shows a proxy session of File
	// EditorWindow -> Can contain multiple Panes

	// Currently in focused 
	const inFocus = {
		file: null,
		editorPane: null,
		aceEditor: null
	};

	Object.defineProperties(atheos, {
		inFocusFile: {
			get: () => inFocus.file
		},
		inFocusPath: {
			get: () => inFocus.file ? inFocus.file.path : null
		},
		inFocusSession: {
			get: () => inFocus.file ? inFocus.file.aceSession : null
		},
		inFocusEditor: {
			get: () => inFocus.aceEditor
		}
	});

	// Classes from Ace
	var AceEditorInstance = ace.require('ace/editor').Editor;
	var AceVirtualRenderer = ace.require('ace/virtual_renderer').VirtualRenderer;
	var AceEditSession = ace.require('ace/edit_session').EditSession;
	var AceUndoManager = ace.require('ace/undomanager').UndoManager;

	const self = {

		// An array of Ace Editor Instances as panes on UI.
		editorPanes: [],
		// Path to EditSession instance mapping
		activeFiles: {},

		noOpen: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'exe', 'zip', 'tar', 'tar.gz'],
		// Settings applied to each editor pane/instance
		settings: {
			theme: 'ace/theme/atheos',
			fontSize: '13px',
			fontFamily: 'Ubuntu-Fira',
			highlightActiveLine: true,
			behavioursEnabled: true, // Autopair, such as adding closing brakets
			enableBasicAutocompletion: true,
			enableLiveAutocompletion: true,
			enableSnippets: true,
			showPrintMargin: false,
			printMarginColumn: 80,
			scrollPastEnd: 0.5,
			displayIndentGuides: true,
			showFoldWidgets: true,
			showInvisibles: false,
			wrap: false, // Enable / disable line wrap
			useSoftTabs: false,
			tabSize: 4,
			keyboardHandler: null
		},

		init: function() {
			fX('#auxSaveFile').on('click', () => self.save());
			fX('#auxReloadFile').on('click', () => self.reload());
			fX('#auxResetFile').on('click', () => self.reset());

			// Prompt if a user tries to close window without saving all files
			window.onbeforeunload = function(e) {
				let changedPaths = self.getChangedPaths();
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

			carbon.subscribe('settings.loaded', function() {
				// Retrieve editor settings from localStorage
				for (let key in self.settings) {
					let temp = storage('editor.' + key);
					if (temp !== null) self.settings[key] = temp;
				}
			});

			carbon.sub('chrono.kilo', self.trackCursor);
		},


		//////////////////////////////////////////////////////////////////////80
		// Creates a new edit pane
		//////////////////////////////////////////////////////////////////////80
		createEditorPane: function(where) {
			// This can be a little confusing to follow, took me a while. First,
			// keep in mind that Ace objects has their own .el property, which
			// holds an onyx object, that holds it's own raw element.

			var xElement = oX('<div class="editorPane"></div>');

			var childID = null,
				splitContainer = null;

			if (self.editorPanes.length === 0) {
				// If no editor panes exist, we append directly to the root wrapper.
				oX('#EDITOR').append(xElement);

			} else {
				// Otherwise, we try to split the view into two editorPanes

				var xFirstChild = atheos.inFocusEditor.xElement;

				childID = (where === 'top' || where === 'left') ? 0 : 1;
				var type = (where === 'top' || where === 'bottom') ? 'vertical' : 'horizontal';
				var children = [];

				children[childID] = xElement.element;
				children[1 - childID] = xFirstChild.element;

				var parent = oX('<div class="editorWindow">');
				var splitter = oX('<div class="splitter">');

				parent.addClass(type);
				splitter.addClass(type);

				xFirstChild.replaceWith(parent);

				parent.append(children[0]);
				parent.append(splitter);
				parent.append(children[1]);
			}

			let aceEditor = new AceEditorInstance(new AceVirtualRenderer(xElement.element));

			var resizeEditor = () => aceEditor.resize();

			aceEditor.xElement = xElement;
			aceEditor.element = xElement.element;
			aceEditor.on('change', () => self.markChanged(aceEditor.path));

			aceEditor.on('focus', function() {
				self.trackCursor();
				self.updateEditorFocus(aceEditor);
			});

			atheos.keybind.activateCustomCommands(aceEditor);

			self.editorPanes.push(aceEditor);
			return aceEditor;
		},


		//////////////////////////////////////////////////////////////////////80
		// Attachs a file editing session to an editing pane instance. 
		//////////////////////////////////////////////////////////////////////80
		attachFileToEditor: function(file, aceEditor) {
			// If no pane is provided, use the one currently in focus,
			aceEditor = aceEditor || atheos.inFocusEditor;

			// First check if the file session is already attached to an editing pane
			// If it's not, then simply attach the session directly.
			// If it is open, THEN we create a proxy session for it. We use proxy sesssions 
			// so that each pane can have its own cursor and scroll position.
			// By 
			if (!aceEditor) {
				aceEditor = self.createEditorPane();
			}

			// If the aceEditor is already attached to a file session
			//   Save the session cursor location
			if (aceEditor.path) {
				const oldProxySession = aceEditor.getSession();
				let oldFile = self.getFile(aceEditor.path);
				if (oldFile) {
					let state = {
						element: aceEditor.element,
						time: Date.now(),
						cursor: oldProxySession.getSelection().getCursor(),
						scrollTop: oldProxySession.getScrollTop(),
						scrollLeft: oldProxySession.getScrollLeft()
					};
					oldFile.states.push(state);
				}
			}
			var proxySession = new AceEditSession(file.aceSession.getDocument(),
				file.aceSession.getMode());

			proxySession.setUndoManager(file.aceSession.getUndoManager());
			proxySession.path = file.path;
			aceEditor.setSession(proxySession);

			// Apply the user preferred settings
			aceEditor.setOptions(self.settings);
			aceEditor.setAnimatedScroll(true);

			aceEditor.path = file.path;

			if (file.states.length) {
				let lastState = file.states.find(state => state.element === aceEditor.element);
				if (lastState) {
					proxySession.getSelection().moveCursorToPosition(lastState.cursor);
					proxySession.getSelection().clearSelection();
					proxySession.setScrollTop(lastState.scrollTop);
					proxySession.setScrollLeft(lastState.scrollLeft);
				}
			}

			aceEditor.focus();
		},

		//////////////////////////////////////////////////////////////////////80
		// Creates a new edit pane
		//////////////////////////////////////////////////////////////////////80
		addEditorPane: function(file, where) {
			let aceEditor = self.createEditorPane(where);
			self.attachFileToEditor(file, aceEditor);
		},

		//////////////////////////////////////////////////////////////////////80
		// Merge the current editorPanes by moving the inFocusEditor
		//////////////////////////////////////////////////////////////////////80
		mergeEditorWindow: function() {
			const aceEditor = atheos.inFocusEditor;
			if (!aceEditor) return;

			let xEditorPane = aceEditor.xElement;

			const xEditorWindow = xEditorPane.parent(),
				xSibling = xEditorPane.sibling('.editorPane');

			if (!xEditorWindow.exists() || !xEditorWindow.hasClass('editorWindow')) return;

			const index = self.editorPanes.findIndex(p => p.element === xSibling.element);

			if (index !== -1) {
				self.editorPanes[index].destroy();
				self.editorPanes.splice(index, 1);
			}

			// Replace the .editorWindow with the current pane
			xEditorWindow.replaceWith(xEditorPane);
			xEditorWindow.remove();
			xEditorPane.css('flex', null);
			aceEditor.focus();

		},

		//////////////////////////////////////////////////////////////////////80
		// Merge all Editor instances
		//////////////////////////////////////////////////////////////////////80
		mergeAllEditorWindows: function() {
			while (self.editorPanes.length > 1) {
				self.mergeEditorWindow();
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Remove all Editor instances and clean up the DOM
		//////////////////////////////////////////////////////////////////////80
		exterminate: function() {
			for (var i = 0; i < self.editorPanes.length; i++) {
				self.editorPanes[i].destroy();
				self.editorPanes[i].xElement.remove();
				self.editorPanes.splice(i, 1);
			}

			inFocus.file = null;
			inFocus.editorPane = null;
			inFocus.aceEditor = null;
			oX('#current_file').html('');
			oX('#current_mode>span').html('');
		},

		/////////////////////////////////////////////////////////////////
		// Set an editor instance as active
		/////////////////////////////////////////////////////////////////
		updateEditorFocus: function(aceEditor) {
			aceEditor = aceEditor || self.inFocusEditor;
			if (!aceEditor) return;

			var path = aceEditor.path;
			let file = self.getFile(path);
			atheos.tabmanager.highlightEntry(path);

			inFocus.file = file;
			inFocus.aceEditor = aceEditor;

			path = (path.length < 30) ? path : '...' + path.substr(path.length - 30);

			oX('#current_file').text(path);
			atheos.textmode.setModeDisplay(aceEditor.getSession());
		},


		/////////////////////////////////////////////////////////////////
		// Set option on AceEditor instance
		/////////////////////////////////////////////////////////////////
		setOption: function(opt, val, aceEditor) {
			if (aceEditor) return aceEditor.setOption(opt, val);
			for (var i = 0; i < self.editorPanes.length; i++) {
				self.editorPanes[i].setOption(opt, val);
			}
			self.settings[opt] = val;
			storage('editor.' + opt, val);
		},

		//////////////////////////////////////////////////////////////////////80
		// Insert text
		//////////////////////////////////////////////////////////////////////80
		insertText: function(val, aceEditor) {
			aceEditor = aceEditor || atheos.inFocusEditor;
			if (!aceEditor) return;
			aceEditor.insert(val);
		},

		//////////////////////////////////////////////////////////////////////80
		// Move the cursor to a particular line
		//////////////////////////////////////////////////////////////////////80
		gotoLine: function(line, aceEditor) {
			aceEditor = aceEditor || atheos.inFocusEditor;
			if (!aceEditor) return;
			aceEditor.scrollToLine(line, true, true);
			aceEditor.gotoLine(line, 0, true);
			aceEditor.focus();
		},

		//////////////////////////////////////////////////////////////////////80
		// Setup Cursor Tracking
		//////////////////////////////////////////////////////////////////////80
		trackCursor: function() {
			var col = i18n('Col');
			let i = atheos.inFocusEditor;
			if (!i) return;
			let pos = i.getCursorPosition();
			oX('#cursor-position').html(`${i18n('Ln')}: ${pos.row + 1}&middot;${i18n('Col')}: ${pos.column}`);
		},

		//////////////////////////////////////////////////////////////////////80
		// Return list of all modified files
		//////////////////////////////////////////////////////////////////////80
		getChangedPaths: function() {
			var changedPaths = [];
			for (let path in self.activeFiles) {
				if (self.activeFiles[path].status === 'changed') {
					changedPaths.push(path);
				}
			}
			return changedPaths;
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
				echo({
					data: {
						target: 'editor',
						action: 'openFile',
						path: path,
						inFocus: inFocus
					},
					settled: function(reply, status) {
						if (status !== 200) return;
						self.createEditSession(path, reply.content, reply.modifyTime, reply.loadHash, mode);
						if (inFocus) {
							self.focusOnFile(path, line);
						}
					}
				});
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Create Edit Session
		//////////////////////////////////////////////////////////////////////80
		createEditSession: function(path, content, modifyTime, loadHash, mode) {
			let aceSession = new AceEditSession(content),
				aceUndoManager = new AceUndoManager();

			let aceModePath = 'ace/mode/' + mode;
			if (!ace.require(aceModePath)) {
				console.warn('Missing ACE mode:', mode);
			}
			aceSession.setMode(aceModePath);

			aceSession.setMode('ace/mode/' + mode);
			aceSession.setNewLineMode('unix');
			aceSession.setUndoManager(aceUndoManager);

			let file = {
				status: 'current',
				path: path,
				serverMTime: modifyTime,
				serverHash: loadHash,
				originalContent: content.slice(0),
				fileTab: atheos.tabmanager.createFileTab(path),
				aceSession: aceSession,
				aceUndo: aceUndoManager,
				states: []
			};

			self.activeFiles[path] = file;
			carbon.publish('active.open', path);
			return file;
		},

		//////////////////////////////////////////////////////////////////////80
		// Check if opened by another user
		//////////////////////////////////////////////////////////////////////80
		check: function(path) {
			echo({
				url: atheos.controller,
				data: {
					target: 'editor',
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
				atheos.editor.attachFileToEditor(self.activeFiles[path]);
				if (line) setTimeout(atheos.editor.gotoLine(line), 500);
			}
			/* Check for users registered on the file. */
			self.check(path);

			/* Notify listeners. */
			carbon.publish('active.focus', path);
		},

		//////////////////////////////////////////////////////////////////////80
		// Send focus status to server
		//////////////////////////////////////////////////////////////////////80
		sendFocusToServer: function(path) {
			echo({
				url: atheos.controller,
				data: {
					target: 'editor',
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
				self.saveModifications(file, 'full', file.newContent);
			} else if (file.newContent.length === 0) {
				self.saveModifications(file, 'clear', 'clearContent');
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
					target: 'editor',
					action: 'saveFile',
					path: file.path,
					saveType,
					newContent,
					modifyTime: file.serverMTime,
					loadHash: file.serverHash
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
									self.remove(path);
									self.openFile(path);
								},
								'Save Anyway': function() {
									self.save(file.path, true);
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

		//////////////////////////////////////////////////////////////////////80
		// Remove an active file session
		//////////////////////////////////////////////////////////////////////80
		remove: function(path) {
			if (!(path in self.activeFiles)) {
				return;
			}

			// Grab reference to file being closed
			var file = self.activeFiles[path];

			// Grab reference to all currently open tab elements.
			var tabs = atheos.tabmanager.tabList.findAll('li');
			// Select the next filepath to be in focus from the tab list.

			var nextFile = atheos.tabmanager.getNextFile('up');
			file.fileTab.remove();
			atheos.tabmanager.updateTabDropdownVisibility();
			delete self.activeFiles[path];

			if (tabs.length === 1) {
				// If only one tab is open, close all editor panes
				atheos.editor.exterminate();
			} else {
				// If more than one tab is open, swap to next file
				// Loop thru editor panes and swap each to next file path
				for (var i = 0; i < self.editorPanes.length; i++) {
					if (self.editorPanes[i].path === path) {
						self.editorPanes[i].path = null;
						self.attachFileToEditor(nextFile.path, self.editorPanes[i]);
					}
				}
			}

			echo({
				url: atheos.controller,
				data: {
					target: 'editor',
					action: 'remove',
					path: path
				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Remove all active file sessions
		//////////////////////////////////////////////////////////////////////80
		removeAll: function() {
			for (var path in self.activeFiles) {
				var file = self.activeFiles[path];
				file.fileTab.remove();

				delete self.activeFiles[path];
			}

			atheos.tabmanager.updateTabDropdownVisibility();
			atheos.editor.exterminate();
			echo({
				url: atheos.controller,
				data: {
					target: 'editor',
					action: 'removeAll'
				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Reload file content
		//////////////////////////////////////////////////////////////////////80
		reload: function(path) {
			if (!path && atheos.contextmenu.active) {
				path = atheos.contextmenu.active.path;
			}

			let file = self.getFile(path);
			if (isString(file)) return toast('error', file);

			echo({
				data: {
					target: 'editor',
					action: 'openFile',
					path: path,
					inFocus: atheos.inFocusPath === path
				},
				settled: function(reply, status) {
					if (status !== 200) return toast('error', 'Unable to reload file.');
					file.serverMTime = reply.modifyTime;
					file.originalContent = reply.content;
					file.aceSession.setValue(reply.content);

					file.status = 'current';
					if (file.fileTab) {
						file.fileTab.removeClass('changed');
					}
					toast('success', 'File reloaded from server.');
				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Reset file content
		//////////////////////////////////////////////////////////////////////80
		reset: function(path) {
			if (!path && atheos.contextmenu.active) {
				path = atheos.contextmenu.active.path;
			}

			let file = self.getFile(path);
			if (isString(file)) return toast('error', file);

			file.aceSession.setValue(file.originalContent);

			file.status = 'current';
			if (file.fileTab) {
				file.fileTab.removeClass('changed');
			}
			toast('success', 'File reset from cache.');
		},

		//////////////////////////////////////////////////////////////////////80
		// Rename tab to new name
		//////////////////////////////////////////////////////////////////////80
		rename: function(oldPath, newPath) {
			var makeRename = function(oldPath, newPath) {

				// Update fileTab
				var fileTab = self.activeFiles[oldPath].fileTab;
				fileTab.attr('data-path', newPath);

				let info = pathinfo(newPath);
				fileTab.find('a').html(`<span class="subtle">${info.directory.replace(/^\/+/g, '')}/</span>${info.basename}`);

				// Switch activeFiles path key; remove old key
				self.activeFiles[newPath] = self.activeFiles[oldPath];
				self.activeFiles[newPath].path = newPath;
				delete self.activeFiles[oldPath];

				// Update editor panes to use new path where open
				for (var i = 0; i < self.editorPanes.length; i++) {
					if (self.editorPanes[i].path === oldPath) {
						self.editorPanes[i].path = newPath;

						// Update text mode, in case of extension change
						var ext = pathinfo(newPath).extension;
						var mode = atheos.textmode.selectMode(ext);
						atheos.textmode.setModeDisplay(self.editorPanes[i].getSession());
					}
				}
			};

			if (self.activeFiles[oldPath]) { // A currently active file was renamed
				// Switch the activeFiles to use the new path
				makeRename.apply(self, [oldPath, newPath]);
			} else { // A folder was renamed

				oldPath = oldPath.endsWith('/') ? oldPath : oldPath + '/';
				newPath = newPath.endsWith('/') ? newPath : newPath + '/';
				for (var actvePath in self.activeFiles) {
					if (actvePath.startsWith(oldPath)) {
						let newActivePath = actvePath.replace(oldPath, newPath);
						makeRename.apply(self, [actvePath, newActivePath]);
					}
				}
			}

			echo({
				url: atheos.controller,
				data: {
					target: 'editor',
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

		/////////////////////////////////////////////////////////////////
		// Tiny helper functions
		/////////////////////////////////////////////////////////////////
		getFile: function(path) {
			return (path && !self.activeFiles[path]) ? 'File path not open.' : self.activeFiles[path];
		},

		getAceSession: function(path) {
			let file = self.getFile(path);
			return isString(file) ? false : file.aceSession;
		},
		getAceEditor: function(key) {
			let index;

			if (isString(key)) {
				// If search key is a string, assume its a path
				index = self.editorPanes.findIndex(p => p.path === key);
			} else if (isElement(key)) {
				index = self.editorPanes.findIndex(p => p.element === key);
			}

			return index >= 0 ? self.editorPanes[index] : null;
		}

	};

	carbon.subscribe('system.loadMajor', () => self.init());
	atheos.editor = self;
})();