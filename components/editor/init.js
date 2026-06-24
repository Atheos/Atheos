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

	// FileHandle -> Represents the file on the server
	// AceSession -> Owns the editing session, such as history.
	// EditorPane -> Owns AceEditor Text Editor -> shows a proxy session of File
	// EditorWindow -> Can contain multiple Panes

	// Currently in focused 
	// TODO: Eventually reduce to only a path
	const inFocusState = {
		fileHandle: null,
		editorPane: null
	};

	window.inFocus = {};
	Object.defineProperties(inFocus, {
		fileHandle: {
			get: () => inFocusState.fileHandle
		},
		filePath: {
			get: () => inFocusState.fileHandle ? inFocusState.fileHandle.path : null
		},
		editorPane: {
			get: () => inFocusState.editorPane
		},
		paneID: {
			get: () => inFocusState.editorPane ? inFocusState.editorPane.paneID : null
		},
		editSession: {
			get: () => inFocusState.fileHandle ? inFocusState.fileHandle.aceSession : null
		},
	});

	// Classes from Ace
	var AceEditorInstance = ace.require('ace/editor').Editor;
	var AceVirtualRenderer = ace.require('ace/virtual_renderer').VirtualRenderer;
	var AceEditSession = ace.require('ace/edit_session').EditSession;
	var AceUndoManager = ace.require('ace/undomanager').UndoManager;

	const self = {

		// An array of Ace Editor Instances as panes on UI.
		editorPanes: {},

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
			// Prompt if a user tries to close window without saving all files
			window.onbeforeunload = function(e) {
				let changedPaths = self.getChangedPaths();
				if (changedPaths.length) {
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
		createEditorPane: function(where, splitTarget) {
			log('Create pane:', where);
			// This can be a little confusing to follow, took me a while. First,
			// keep in mind that Ace objects has their own .el property, which
			// holds an onyx object, that holds it's own raw element.

			var xEditorPane = oX('<div class="editorPane"></div>');

			if (self.paneIDs.length === 0) {
				// If no editor panes exist, we append directly to the root wrapper.
				oX('#EDITOR').append(xEditorPane);

			} else {
				// Otherwise, we try to split the view into two editorPanes

				// let firstEditorPane = inFocus.editorPane ? inFocus.editorPane : self.editorPanes[0];
				let firstEditorPane = inFocus.editorPane || Object.values(self.editorPanes)[0];
				var xFirstPane = firstEditorPane.xEditorPane;
				xFirstPane = splitTarget ? splitTarget.xEditorPane : xFirstPane;

				let childIndex = (where === 'top' || where === 'left') ? 0 : 1,
					splitType = (where === 'top' || where === 'bottom') ? 'vertical' : 'horizontal';
				var children = [];

				children[childIndex] = xEditorPane.element;
				children[1 - childIndex] = xFirstPane.element;

				var editorWindow = oX('<div class="editorWindow">');
				var splitter = oX('<div class="splitter">');

				editorWindow.addClass(splitType);
				splitter.addClass(splitType);

				xFirstPane.replaceWith(editorWindow);

				editorWindow.append(children[0]);
				editorWindow.append(splitter);
				editorWindow.append(children[1]);
			}

			let editorPane = new AceEditorInstance(new AceVirtualRenderer(xEditorPane.element));
			editorPane.paneID = 'pane_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
			xEditorPane.attr('data-paneID', editorPane.paneID);

			var resizeEditor = () => editorPane.resize();

			editorPane.xEditorPane = xEditorPane;
			editorPane.element = xEditorPane.element;
			editorPane.on('change', () => self.markChanged(editorPane.path));

			editorPane.on('focus', function() {
				self.syncSystemFocus(editorPane);
				self.trackCursor();
			});

			atheos.keybind.activateCustomCommands(editorPane);

			self.editorPanes[editorPane.paneID] = editorPane;
			return editorPane;
		},

		//////////////////////////////////////////////////////////////////////80
		//
		//////////////////////////////////////////////////////////////////////80
		serializeEditorPanes: function(xEditorNode) {
			xEditorNode = xEditorNode || oX('#EDITOR').children()[0];
			if (!xEditorNode.exists()) return null;

			if (xEditorNode.hasClass('editorPane')) {
				let aceEditor = self.editorPanes[xEditorNode.attr('data-paneID')];
				let paneSession = aceEditor.getSession();
				return {
					type: 'pane',
					paneID: aceEditor.paneID,
					path: aceEditor ? aceEditor.path : null,
					inFocus: inFocus.editorPane && aceEditor.paneID === inFocus.editorPane.paneID,
					cursor: paneSession.getSelection().getCursor(),
					scrollTop: paneSession.getScrollTop(),
					scrollLeft: paneSession.getScrollLeft()
				};
			}

			if (xEditorNode.hasClass('editorWindow')) {
				let direction = xEditorNode.hasClass('vertical') ? 'vertical' : 'horizontal';
				let childPanes = xEditorNode.children().filter(c => !c.hasClass('splitter'));
				return {
					type: 'split',
					direction,
					children: childPanes.map(c => self.serializeEditorPanes(c))
				};
			}

			return null;
		},


		//////////////////////////////////////////////////////////////////////80
		//
		//////////////////////////////////////////////////////////////////////80
		restorePaneTree: function(editorNode, targetPane) {
			if (!editorNode) return;

			if (editorNode.type === 'pane') {
				if (!editorNode.path) return;
				log('Restore node: ', editorNode.path);

				let pane = targetPane || self.createEditorPane();
				let fileHandle = self.activeFiles[editorNode.path];
				if (fileHandle) {
					self.attachFileToEditor(fileHandle, pane);
				}
				if (editorNode.inFocus) {
					inFocusState.aceEditor = pane;
					inFocusState.fileHandle = fileHandle;
					inFocusState.path = editorNode.path;
				}

				return pane;
			}

			if (editorNode.type === 'split') {
				log('Restore split.');
				let [first, second] = editorNode.children;
				let firstPane = self.restorePaneTree(first, targetPane);

				let where = editorNode.direction === 'vertical' ? 'bottom' : 'right';
				let secondPane = self.createEditorPane(where, firstPane);
				self.restorePaneTree(second, secondPane);
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Attachs a file editing session to an editing pane instance. 
		//////////////////////////////////////////////////////////////////////80
		attachFileToEditor: function(fileHandle, aceEditor) {
			// If no pane is provided, use the one currently in focus,
			aceEditor = aceEditor || inFocus.editorPane;

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
				const oldPaneSession = aceEditor.getSession();
				let oldFile = self.getFile(aceEditor.path);
				if (oldFile) {
					let state = {
						element: aceEditor.element,
						time: Date.now(),
						cursor: oldPaneSession.getSelection().getCursor(),
						scrollTop: oldPaneSession.getScrollTop(),
						scrollLeft: oldPaneSession.getScrollLeft()
					};
					oldFile.states[aceEditor.paneID] = state;
				}
			}
			var paneSession = new AceEditSession(fileHandle.aceSession.getDocument(),
				fileHandle.aceSession.getMode());

			log(fileHandle);
			log(fileHandle.path);

			atheos.textmode.setMode(fileHandle.path, paneSession);

			paneSession.setUndoManager(fileHandle.aceSession.getUndoManager());
			paneSession.path = fileHandle.path;
			aceEditor.setSession(paneSession);

			// Apply the user preferred settings
			aceEditor.setOptions(self.settings);
			aceEditor.setAnimatedScroll(true);

			aceEditor.path = fileHandle.path;

			if (fileHandle.states.length) {
				let lastState = fileHandle.states.find(state => state.element === aceEditor.element);
				if (lastState) {
					paneSession.getSelection().moveCursorToPosition(lastState.cursor);
					paneSession.getSelection().clearSelection();
					paneSession.setScrollTop(lastState.scrollTop);
					paneSession.setScrollLeft(lastState.scrollLeft);
				}
			}

			// Fixes firefox not focusing on pane during load.
			// Ensure editor is rendered
			aceEditor.resize(true);
			self.syncSystemFocus(aceEditor);
			// aceEditor.focus();
		},

		//////////////////////////////////////////////////////////////////////80
		// Creates a new edit pane
		//////////////////////////////////////////////////////////////////////80
		addEditorPane: function(fileHandle, where) {
			let aceEditor = self.createEditorPane(where);
			self.attachFileToEditor(fileHandle, aceEditor);
		},

		//////////////////////////////////////////////////////////////////////80
		// Merge the current editorPanes by moving the inFocusEditor
		//////////////////////////////////////////////////////////////////////80
		mergeEditorWindow: function() {
			const aceEditor = inFocus.editorPane;
			if (!aceEditor) return;

			let xEditorPane = aceEditor.xEditorPane;

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
		// Remove all Editor instances, clean up the DOM and the storage
		//////////////////////////////////////////////////////////////////////80
		exterminate: function() {
			for (var i = self.editorPanes.length - 1; i >= 0; i--) {
				self.editorPanes[i].destroy();
				self.editorPanes[i].xEditorPane.remove();
				self.editorPanes.splice(i, 1);
			}

			inFocusState.fileHandle = null;
			inFocusState.editorPane = null;

			oX('#current_file').html('');
			oX('#current_mode>span').html('');
			storage('editor.paneTree', '');
		},

		/////////////////////////////////////////////////////////////////
		// Syncs the focused editor to the rest of Atheos
		/////////////////////////////////////////////////////////////////
		syncSystemFocus: function(editorPane) {
			editorPane = editorPane || inFocus.editorPane;
			if (!editorPane) return;

			var filePath = editorPane.path;
			if (inFocus.editorPane && editorPane.paneID === inFocus.editorPane.paneID && filePath === inFocus.path) return;
			let fileHandle = self.getFile(filePath);
			atheos.tabmanager.highlightEntry(filePath);

			inFocusState.fileHandle = fileHandle;
			inFocusState.editorPane = editorPane;

			let display = (filePath.length < 30) ? filePath : '...' + filePath.substr(filePath.length - 30);

			oX('#current_file').text(display);
			atheos.textmode.setModeDisplay(editorPane.getSession());

			let paneTree = self.serializeEditorPanes();
			storage('editor.paneTree', paneTree);
			log(paneTree);

			let fileStates = {};
			for (let path in self.activeFiles) {
				fileStates[filePath] = self.activeFiles[filePath].states;
			}
			// log(fileStates);

			echo({
				url: atheos.controller,
				data: {
					target: 'editor',
					action: 'setFocus',
					path: filePath,
					paneTree,
					fileStates
				}
			});
			/* Notify listeners. */
			carbon.pub('active.focus', filePath);
		},

		//////////////////////////////////////////////////////////////////////80
		// Open multiple files; mostly used to restore last user state.
		//////////////////////////////////////////////////////////////////////80
		openFiles: function(files) {

			let savedTree = storage('editor.paneTree');
			log(savedTree);
			if (savedTree) {
				log(files);
				let filePromises = files.map((fileHandle) => {
					let ext = pathinfo(fileHandle.path).extension.toLowerCase();
					if (self.noOpen.indexOf(ext) > -1) return;

					let sessionPromise = ('content' in fileHandle) ? Promise.resolve(fileHandle) : self.fetchFile(fileHandle.path);

					return sessionPromise.then((reply) => {
						self.createEditSession(fileHandle.path, reply.content, reply.modifyTime, reply.loadHash, reply.mode);
					});
				});
				Promise.all(filePromises).then(function() {
					self.restorePaneTree(savedTree);
				});
			} else {
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
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Fetch file content and metadata
		//////////////////////////////////////////////////////////////////////80
		fetchFile: function(path) {
			let filePromise = new Promise((resolve, reject) =>
				echo({
					data: {
						target: 'editor',
						action: 'openFile',
						path,
						inFocus: false
					},
					settled: function(reply, status) {
						return status === 200 ? resolve(reply) : reject(status);
					}
				})
			);
			return filePromise;
		},

		//////////////////////////////////////////////////////////////////////80
		// Open File
		//////////////////////////////////////////////////////////////////////80
		openFile: function(path, focus, line) {
			log(path);
			focus = typeof focus !== 'undefined' ? focus : true;

			let ext = pathinfo(path).extension.toLowerCase();
			if (self.noOpen.indexOf(ext) > -1) return;

			if (focus && self.activeFiles[path]) return self.focusOnFile(path, line);
			atheos.textmode.setMode(path);
			return self.fetchFile(path).then((reply) => {
				self.createEditSession(path, reply.content, reply.modifyTime, reply.loadHash);

				if (focus) self.focusOnFile(path, line);
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Focus on opened file
		//////////////////////////////////////////////////////////////////////80
		focusOnFile: function(path, line) {
			log('focusOn', path);
			if (path === inFocus.path) return;
			log('new focus');
			atheos.editor.attachFileToEditor(self.activeFiles[path]);
			if (line) setTimeout(() => {
				atheos.editor.gotoLine(line);
			}, 500);
		},

		//////////////////////////////////////////////////////////////////////80
		// Create Edit Session
		//////////////////////////////////////////////////////////////////////80
		createEditSession: function(filePath, content, modifyTime, loadHash) {
			let aceSession = new AceEditSession(content),
				aceUndoManager = new AceUndoManager();


			atheos.textmode.setMode(filePath, aceSession);
			aceSession.setNewLineMode('unix');
			aceSession.setUndoManager(aceUndoManager);

			let fileHandle = {
				status: 'current',
				path: filePath,
				serverMTime: modifyTime,
				serverHash: loadHash,
				originalContent: content.slice(0),
				fileTab: atheos.tabmanager.createFileTab(filePath),
				aceSession: aceSession,
				aceUndo: aceUndoManager,
				states: {}
			};

			self.activeFiles[filePath] = fileHandle;
			carbon.publish('active.open', filePath);
			return fileHandle;
		},

		//////////////////////////////////////////////////////////////////////80
		// Mark changed
		//////////////////////////////////////////////////////////////////////80
		markChanged: function(filePath) {
			self.activeFiles[filePath].status = 'changed';
			self.activeFiles[filePath].autosaved = false;
			self.activeFiles[filePath].fileTab.addClass('changed');
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
				path = inFocus.filePath;
			}

			let fileHandle = self.getFile(path);
			log(path);
			if (isString(fileHandle)) return toast('error', fileHandle);
			log(fileHandle);


			var content = fileHandle.aceSession.getValue();
			fileHandle.newContent = content.slice(0);

			if (override) {
				self.saveContentToServer(fileHandle, 'override', fileHandle.newContent);
			} else if (fileHandle.originalContent.length === 0) {
				self.saveContentToServer(fileHandle, 'full', fileHandle.newContent);
			} else if (fileHandle.newContent.length === 0) {
				self.saveContentToServer(fileHandle, 'clear', 'clearContent');
			} else {
				atheos.workerManager.addTask({
					taskType: 'diff',
					id: path,
					original: fileHandle.originalContent,
					changed: fileHandle.newContent
				}, function(success, patchTxt) {
					let saveType = success ? 'patch' : 'full';
					if (success) {
						self.saveContentToServer(fileHandle, 'patch', patchTxt);
					} else {
						self.saveContentToServer(fileHandle, 'full', fileHandle.newContent);
					}
				}, self);
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Save file
		//////////////////////////////////////////////////////////////////////80
		saveContentToServer: function(fileHandle, saveType, newContent) {
			let handleSuccess = function(modifyTime) {
				fileHandle.originalContent = fileHandle.newContent;
				fileHandle.newContent = '';
				fileHandle.serverMTime = modifyTime;
				fileHandle.status = 'unchanged';
				if (fileHandle.fileTab) {
					fileHandle.fileTab.removeClass('changed');
				}
				carbon.publish('editor.saved', fileHandle.path);

				if (self.getChangedPaths().length === 0) {
					carbon.publish('editor.allSaved');
				}
			};

			// HLSiira: I'm uncertain why this If statement is here.
			if (newContent.length < 1) {
				return handleSuccess(fileHandle.serverMTime);
			}

			echo({
				data: {
					target: 'editor',
					action: 'saveFile',
					path: fileHandle.path,
					saveType,
					newContent,
					modifyTime: fileHandle.serverMTime,
					loadHash: fileHandle.serverHash
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
									self.remove(fileHandle.path);
									self.openFile(fileHandle.path);
								},
								'Save Anyway': function() {
									self.save(fileHandle.path, true);
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
				for (let paneID in self.editorPanes) {
					let editorPane = self.editorPanes[paneID];
					if (editorPane.path == path) {
						editorPane.path = null;
						self.attachFileToEditor(nextFile, editorPane);
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
					inFocus: inFocus.path === path
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
				var fileTab = self.activeFiles[oldPath].fileTab,
					anchor = fileTab.find('a');

				let info = pathinfo(newPath);
				anchor.html(`<span class="subtle">${info.directory.replace(/^\/+/g, '')}/</span>${info.basename}`);
				anchor.attr('data-path', newPath);
				anchor.attr('title', newPath);

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
		// Insert text into aceEditor
		//////////////////////////////////////////////////////////////////////80
		insertText: function(val, aceEditor) {
			aceEditor = aceEditor || inFocus.editorPane;
			if (!aceEditor) return;
			aceEditor.insert(val);
		},

		//////////////////////////////////////////////////////////////////////80
		// Select all text in file
		//////////////////////////////////////////////////////////////////////80
		selectAllText: function(aceEditor) {
			aceEditor = aceEditor || inFocus.editorPane;
			if (!aceEditor) return;
			aceEditor.execCommand("selectall");
		},

		//////////////////////////////////////////////////////////////////////80
		// Cut selected text to client clipboard
		//////////////////////////////////////////////////////////////////////80
		cutToClipboard: function(aceEditor) {
			aceEditor = aceEditor || inFocus.editorPane;
			if (!aceEditor) return;
			const selection = aceEditor.getSelection();
			const range = selection.getRange();

			if (range.isEmpty()) return;

			navigator.clipboard.writeText(aceEditor.getCopyText())
				.then(() => {
					aceEditor.session.remove(range);
					selection.clearSelection();
				});
		},

		//////////////////////////////////////////////////////////////////////80
		// Copy selected text to client clipboard
		//////////////////////////////////////////////////////////////////////80
		copyToClipboard: function(aceEditor) {
			aceEditor = aceEditor || inFocus.editorPane;
			if (!aceEditor) return;
			navigator.clipboard.writeText(aceEditor.getCopyText());
		},

		//////////////////////////////////////////////////////////////////////80
		// Paste text from client clipboard to location
		//////////////////////////////////////////////////////////////////////80
		pasteFromClipboard: function(val, aceEditor) {
			navigator.clipboard.readText()
				.then(text => {
					self.insertText(text);
				});
		},

		//////////////////////////////////////////////////////////////////////80
		// Open AceEditor's Find Window
		//////////////////////////////////////////////////////////////////////80
		openFind: function(aceEditor) {
			aceEditor = aceEditor || inFocus.editorPane;
			if (!aceEditor) return;
			inFocus.editorPane.execCommand('find');
		},
		//////////////////////////////////////////////////////////////////////80
		// Open AceEditor's Replace Window
		//////////////////////////////////////////////////////////////////////80
		openReplace: function(aceEditor) {
			aceEditor = aceEditor || inFocus.editorPane;
			if (!aceEditor) return;
			inFocus.editorPane.execCommand('replace');
		},
		//////////////////////////////////////////////////////////////////////80
		// Open AceEditor's Goto Line Window
		//////////////////////////////////////////////////////////////////////80
		openGotoLine: function(aceEditor) {
			aceEditor = aceEditor || inFocus.editorPane;
			if (!aceEditor) return;
			inFocus.editorPane.execCommand('gotoline');
		},

		//////////////////////////////////////////////////////////////////////80
		// Move the cursor to a particular line
		//////////////////////////////////////////////////////////////////////80
		gotoLine: function(line, aceEditor) {
			aceEditor = aceEditor || inFocus.editorPane;
			if (!aceEditor) return;
			aceEditor.scrollToLine(line, true, true);
			aceEditor.gotoLine(line, 0, true);
			aceEditor.focus();
		},

		//////////////////////////////////////////////////////////////////////80
		// Setup Cursor Tracking
		//////////////////////////////////////////////////////////////////////80
		trackCursor: function(editorPane) {
			editorPane = editorPane || inFocus.editorPane;

			if (!editorPane) return;
			let pos = editorPane.getCursorPosition();


			let aceSession = editorPane.getSession();

			let state = {
				time: Date.now(),
				cursor: aceSession.getSelection().getCursor(),
				scrollTop: aceSession.getScrollTop(),
				scrollLeft: aceSession.getScrollLeft()
			};
			self.activeFiles[editorPane.path].states[editorPane.paneID] = state;


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
		// Tiny helper functions
		//////////////////////////////////////////////////////////////////////80
		getFile: function(path) {
			return (path && !self.activeFiles[path]) ? 'File path not open.' : self.activeFiles[path];
		},

		getAceSession: function(path) {
			let file = self.getFile(path);
			return isString(file) ? false : file.aceSession;
		},
		getAceEditor: function(key) {
			log(key);
			let index;

			const panes = Object.values(self.editorPanes);
			if (isString(key)) return panes.find(p => p.path === key) || null;
			if (isElement(key)) return panes.find(p => p.element === key) || null;
			return null;


			if (isString(key)) {
				// If search key is a string, assume its a path
				index = self.editorPanes.findIndex(p => p.path === key);
			} else if (isElement(key)) {
				index = self.editorPanes.findIndex(p => p.element === key);
			}

			return index >= 0 ? self.editorPanes[index] : null;
		}
	};


	Object.defineProperties(self, {
		paneIDs: {
			get: () => Object.keys(self.editorPanes)
		},
		activePaths: {
			get: () => Object.keys(self.activeFiles)
		}
	});

	carbon.subscribe('system.loadMajor', () => self.init());
	atheos.editor = self;
})();