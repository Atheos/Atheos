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

	let eStorage = (k, v) => storage('editor.' + k, v);

	// Classes from Ace
	var AceEditorInstance = ace.require('ace/editor').Editor;
	var AceVirtualRenderer = ace.require('ace/virtual_renderer').VirtualRenderer;
	var AceEditSession = ace.require('ace/edit_session').EditSession;
	var AceUndoManager = ace.require('ace/undomanager').UndoManager;

	const self = {

		tabList: oX('#active_file_tabs'),
		dropDownMenu: oX('#active_file_dropdown'),
		loopBehavior: 'loopActive',
		dropDownOpen: false,

		// An array of Ace Editor Instances as panes on UI.
		editorPanes: [],

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

		fileExtensionTextMode: {},

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


			self.updateTabDropdownVisibility();
			self.initTabListeners();
			self.initSplitterListener();

			atheos.common.initMenuHandler('#tab_dropdown', '#active_file_dropdown', ['fa-chevron-circle-down', 'fa-chevron-circle-up']);

			fX('#tab_close').on('click', function(e) {
				e.stopPropagation();
				self.closeAll();
			});

			carbon.subscribe('settings.loaded', function() {
				// Retrieve editor settings from localeStorage
				for (let key in self.settings) {
					let temp = eStorage(key);
					if (temp !== null) self.settings[key] = temp;
				}

				self.loopBehavior = storage('editor.loopBehavior') || self.loopBehavior;

				// This timeout is an effort to double check the tab visibility
				// after everything has been loaded. The default route has some 
				// minor issues on loading such that it doesn't quite meet spec
				setTimeout(self.updateTabDropdownVisibility, 500);

			});

			carbon.sub('chrono.kilo', self.trackCursor);

			var editor = oX('#EDITOR');

			//////////////////////////////////////////////////////////////////80
			// h-resize & v-resize events are custom events triggered solely for
			// use in allowing you to resize split containers. The -root events
			// are triggered throughout Atheos as needed, and cascade down into 
			// any split containers. - Liam Siira
			//////////////////////////////////////////////////////////////////80
			fX('#EDITOR').on('h-resize-root, v-resize-root', function(e) {
				var wrapper = oX('#EDITOR .editor-wrapper');
				if (wrapper) {
					if (e.type === 'h-resize-root') {
						wrapper.css('width', editor.width());
						fX('#EDITOR .editor-wrapper').trigger('h-resize');
					} else {
						wrapper.css('height', editor.height());
						fX('#EDITOR .editor-wrapper').trigger('v-resize');
					}
				}

				self.forEachAceEditor(function(int) {
					int.resize();
				});

			});

			window.addEventListener('resize', function() {
				fX('#EDITOR').trigger('h-resize-root, v-resize-root');
			});
			window.onresize = self.updateTabDropdownVisibility;
		},


		initSplitterListener: function() {
			fX('#EDITOR .splitter').on('mousedown', function(e) {
				let splitter = e.target;
				e.stopPropagation();

				const prev = splitter.previousElementSibling;
				const next = splitter.nextElementSibling;

				let isHorizontal = oX(splitter).hasClass('horizontal');

				const start = isHorizontal ? e.clientX : e.clientY;
				const prevRect = prev.getBoundingClientRect();
				const nextRect = next.getBoundingClientRect();

				const total = (isHorizontal ? prevRect.width + nextRect.width : prevRect.height + nextRect.height);

				// function updateSiblings(e) {
				function onMouseMove(e) {
					const current = isHorizontal ? e.clientX : e.clientY;
					const delta = current - start;
					const newPrev = Math.max(50, (isHorizontal ? prevRect.width : prevRect.height) + delta);
					const container = splitter.parentElement.getBoundingClientRect();
					const percent = (newPrev / (isHorizontal ? container.width : container.height)) * 100;
					prev.style.flex = `0 0 ${percent}%`;
					// 	next.style.flex = `1 1 0%`; // Let it fill the rest					
					// 	const newNext = total - newPrev;

					// 	prev.style.flex = `0 0 ${newPrev}px`;
					// 	next.style.flex = `0 0 ${newNext}px`;
				}

				// let timeout = false;
				// function onMouseMove(e) {
				// 	if (timeout === false) {
				// 		// In an attempt at optimization, I am setting a timeout on
				// 		// the moveTarget such that it runs only once every 50ms
				// 		timeout = setTimeout(() => updateSiblings(e), 50);
				// 	}
				// }

				function onMouseUp() {
					document.removeEventListener('mousemove', onMouseMove);
					document.removeEventListener('mouseup', onMouseUp);
				}

				document.addEventListener('mousemove', onMouseMove);
				document.addEventListener('mouseup', onMouseUp);
			});
		},



		//////////////////////////////////////////////////////////////////////80
		// Creates a new edit pane
		//////////////////////////////////////////////////////////////////////80
		createEditorPane: function(where) {
			// This can be a little confusing to follow, took me a while. First,
			// keep in mind that Ace objects has their own .el property, which
			// holds an onyx object, that holds it's own raw element.

			// SplitContainer takes raw html elements and has it's own mini-dom
			// helper that has zero error checking in order to be as fast as
			// possible.

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

			// 			if (splitContainer) {
			// 				editorPane.splitContainer = splitContainer;
			// 				editorPane.splitID = childID;

			// 				atheos.inFocusEditor.splitContainer = splitContainer;
			// 				atheos.inFocusEditor.splitID = 1 - childID;

			// 				oX(splitContainer.parent).on('h-resize', resizeEditor);
			// 				oX(splitContainer.parent).on('v-resize', resizeEditor);

			// 				if (self.editorPanes.length === 1) {
			// 					var re = function() {
			// 						self.editorPanes[0].aceEditor.resize();
			// 					};
			// 					oX(splitContainer.parent).on('h-resize', re);
			// 					oX(splitContainer.parent).on('v-resize', re);
			// 				}
			// 			}

			aceEditor.xElement = xElement;
			aceEditor.element = xElement.element;
			// self.changeListener(instance);
			aceEditor.on('change', () => self.markChanged(aceEditor.path));
			// 			self.bindKeys(editorPane);


			aceEditor.on('focus', function() {
				self.trackCursor();
				self.updateEditorFocus(aceEditor, true);
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

			if (aceEditor.path) {
				const oldSession = aceEditor.getSession();
				let oldFile = self.getFile(aceEditor.path);
				if (oldFile) {
					let state = {
						element: aceEditor.element,
						time: Date.now(),
						cursor: oldSession.getSelection().getCursor(),
						scrollTop: oldSession.getScrollTop(),
						scrollLeft: oldSession.getScrollLeft()
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
		//
		// Remove all Editor instances and clean up the DOM
		//
		//////////////////////////////////////////////////////////////////////80
		exterminate: function() {
			var editors = oX('#EDITOR').findAll('.editor, .editor-wrapper');
			editors.forEach((editor) => {
				editor.remove();
			});
			oX('#current_file').html('');
			oX('#current_mode>span').html('');
			self.editorPanes = [];
			atheos.inFocusEditor = null;
		},

		//////////////////////////////////////////////////////////////////////80
		//
		// Detach EditSession session from all Editor instances replacing
		// them with replacementSession
		//
		//////////////////////////////////////////////////////////////////////80
		removeSession: function(path, newPath) {

			// 			if (oX('#current_file').text() === session.path) {
			// 				oX('#current_file').text(replacementSession.path);
			// 			}

			// 			atheos.textmode.setModeDisplay(replacementSession);
		},

		isAttached: function(file) {
			for (var k = 0; k < self.editorPanes.length; k++) {
				if (self.editorPanes[k].getSession().path === file.path) {
					return true;
				}
			}
			return false;
		},

		/////////////////////////////////////////////////////////////////
		//
		// Convenience function to iterate over Editor instances
		//
		// Parameters:
		//   fn - {Function} callback called with each member as an argument
		//
		/////////////////////////////////////////////////////////////////
		forEachAceEditor: function(fn) {
			for (var k = 0; k < self.editorPanes.length; k++) {
				fn.call(self, self.editorPanes[k]);
			}
		},

		/////////////////////////////////////////////////////////////////
		//
		// Set an editor instance as active
		//
		// Parameters:
		//   i - {Editor}
		//
		/////////////////////////////////////////////////////////////////
		updateEditorFocus: function(aceEditor) {
			aceEditor = aceEditor || self.inFocusEditor;
			if (!aceEditor) return;

			var path = aceEditor.path;
			let file = self.getFile(path);
			self.highlightEntry(path);

			inFocus.file = file;
			inFocus.aceEditor = aceEditor;

			path = (path.length < 30) ? path : '...' + path.substr(path.length - 30);

			oX('#current_file').text(path);
			atheos.textmode.setModeDisplay(aceEditor.getSession());
		},



		setOption: function(opt, val, aceEditor) {
			if (aceEditor) return aceEditor.setOption(opt, val);
			self.forEachAceEditor(function(aceEditor) {
				aceEditor.setOption(opt, val);
			});
			self.settings[opt] = val;
			eStorage(opt, val);
		},

		/////////////////////////////////////////////////////////////////
		// Set Font Size
		/////////////////////////////////////////////////////////////////
		setCodeLigatures: function(val, aceEditor) {
			val = val ? 'Ubuntu-Fira' : 'Ubuntu-Mono';
			self.setOption('fontFamily', val, aceEditor);
		},

		//////////////////////////////////////////////////////////////////////80
		//
		// Insert text
		//
		// Parameters:
		//   val - {String} Text to be inserted
		//   i - {Editor} (Defaults to active editor)
		//
		//////////////////////////////////////////////////////////////////////80
		insertText: function(val, aceEditor) {
			aceEditor = aceEditor || atheos.inFocusEditor;
			if (!aceEditor) return;
			aceEditor.insert(val);
		},

		//////////////////////////////////////////////////////////////////////80
		//
		// Move the cursor to a particular line
		//
		// Parameters:
		//   line - {Number} Line number
		//   i - {Editor} Editor instance
		//
		//////////////////////////////////////////////////////////////////////80

		gotoLine: function(line, aceEditor) {
			aceEditor = aceEditor || atheos.inFocusEditor;
			if (!aceEditor) return;
			aceEditor.scrollToLine(line, true, true);
			aceEditor.gotoLine(line, 0, true);
			aceEditor.focus();
		},


		//////////////////////////////////////////////////////////////////////80
		//
		// Setup Cursor Tracking
		//
		// Parameters:
		//   i - {Editor} (Defaults to active editor)
		//
		//////////////////////////////////////////////////////////////////////80
		trackCursor: function() {
			var col = i18n('Col');
			let i = atheos.inFocusEditor;
			if (!i) return;
			let pos = i.getCursorPosition();
			oX('#cursor-position').html(`${i18n('Ln')}: ${pos.row + 1}&middot;${i18n('Col')}: ${pos.column}`);
		},

		initTabListeners: function() {
			var activeListener = function(e) {
				e.stopPropagation();

				var tagName = e.target.tagName;
				var node = oX(e.target);

				if (tagName === 'UL') return;

				var path = node.attr('data-path');
				if (['I', 'A', 'SPAN'].indexOf(tagName) > -1) {
					path = node.parent('LI').attr('data-path');
				}

				if (e.which === 2) {
					// Middle click anywhere closes file
					self.close(path);

				} else if (e.which === 1) {

					// Left click not on an icon: Switch focus to file
					if (tagName !== 'I') {
						self.focusOnFile(path);

						// Left click on an icon: Save or close file
					} else if (tagName === 'I') {
						// Save file
						if (node.hasClass('save')) {
							self.save(path);

							// Close file
						} else if (node.hasClass('close')) {
							self.close(path);
							// 		self.updateTabDropdownVisibility();
						}
					}
				}
			};

			fX('#active_file_tabs').on('click, auxclick', function(e) {
				activeListener(e);
			});

			fX('#active_file_dropdown').on('click, auxclick', function(e) {
				activeListener(e);
			});

			fX('#active_file_tabs').on('mousedown', self.handleDrag);

			fX('#active_file_tabs').on('dragstart', blackhole);

		},

		handleDrag: function(e) {
			// Inspired By: https://codepen.io/fitri/pen/VbrZQm
			// Made with love by @fitri
			// & https://github.com/io-developer/js-dragndrop
			e.stopPropagation();

			var target = e.target;
			var origin, sibling;

			var dragZone = self.tabList.element;
			var clone, startEX, startEY, startMX, startMY, timeout;

			var xMax, yMax;

			function moveTarget(e) {
				timeout = false;

				var swap = [].slice.call(dragZone.querySelectorAll('.draggable'));

				swap = swap.filter((item) => {
					var rect = item.getBoundingClientRect();
					if (e.clientX < rect.left || e.clientX >= rect.right) return false;
					return (item !== clone);
				});

				if (swap.length === 0) return;

				swap = swap[swap.length - 1];
				if (dragZone.contains(swap)) {
					swap = swap !== target.nextSibling ? swap : swap.nextSibling;
					if (swap) {
						swap.parentNode.insertBefore(target, swap);
					}
				}
			}

			function dragMove(e) {
				var x = startEX + e.screenX - startMX;
				x = (x > xMax) ? xMax : ((x < 0) ? 0 : x);
				clone.style.left = (x - dragZone.scrollLeft) + 'px';
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
				clone.style.left = (startEX - dragZone.scrollLeft) + 'px';
				clone.style.top = (startEY - dragZone.scrollTop) + 'px';
				clone.style.position = 'absolute';
				clone.style.cursor = 'grabbing';

				dragZone.append(clone);
				target.style.opacity = 0;

				xMax = dragZone.offsetWidth - clone.offsetWidth;
				yMax = dragZone.offsetHeight - clone.offsetHeight;

				document.addEventListener('mousemove', dragMove);
			}

			function dragEnd() {
				clearTimeout(timeout);
				target.style.opacity = '';
				if (clone) clone.remove();
				if (target.parentNode !== origin) {
					if (sibling) {
						sibling.after(target);
					} else {
						origin.append(target);
					}
				}
				document.removeEventListener('mousemove', dragMove);
				document.removeEventListener('mouseup', dragEnd);
			}

			target = target.closest('.draggable');
			if (!target || !dragZone) return;

			origin = target.parentNode;
			sibling = target.previousSibling;

			timeout = setTimeout(dragStart, 200);
			document.addEventListener('mouseup', dragEnd);
		},

		//////////////////////////////////////////////////////////////////////80
		// Move Up or down (Key Combo)
		//////////////////////////////////////////////////////////////////////80
		cycleFocus: function(direction) {
			var nextPath = self.getNextFileTab(direction);
			if (nextPath) {
				self.attachFileToEditor(self.activeFiles[nextPath]);
				if (self.loopBehavior === 'loopBoth') {
					self.highlightEntry(nextPath, direction);
				} else {
					self.highlightEntry(nextPath);
				}
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Find next file tab
		//////////////////////////////////////////////////////////////////////80
		getNextFileTab: function(direction) {

			var activeTabs = self.tabList.findAll('li');
			if (self.loopBehavior === 'loopBoth') {
				var dropDownChildren = self.dropDownMenu.findAll('li');
				activeTabs = activeTabs.concat(dropDownChildren);
			}

			var currentTab = false;

			activeTabs.forEach(function(tab, i) {
				currentTab = tab.hasClass('active') ? i : currentTab;
			});

			if (currentTab === false || activeTabs.length === 0) {
				return;
			}

			var newTabElement = null;

			if (direction === 'up') {
				currentTab = (currentTab === 0) ? (activeTabs.length - 1) : (currentTab - 1);
				newTabElement = activeTabs[currentTab];
			} else {
				currentTab = (currentTab + 1) % activeTabs.length;
				newTabElement = activeTabs[currentTab];
			}
			return newTabElement.attr('data-path')
		},

		highlightEntry: function(path, direction) {
			direction = direction || false;
			var active = self.tabList.findAll('.active');
			active.forEach(function(item) {
				item.removeClass('active');
			});

			var file = self.activeFiles[path];
			var dropDown = self.dropDownMenu.find('[data-path="' + path + '"]');

			if (dropDown.exists()) {
				var fileTab = file.fileTab;
				self.moveTab(self.tabList, fileTab, direction);

				var tab;
				if (direction === 'up') {
					tab = self.tabList.find('li:last-child');
				} else {
					tab = self.tabList.find('li:first-child');
				}
				self.moveTab(self.dropDownMenu, tab, direction);
			}
			file.fileTab.addClass('active');
		},

		//////////////////////////////////////////////////////////////////////80
		// Move tab between Active & Dropdown
		//////////////////////////////////////////////////////////////////////80
		moveTab: function(destination, fileTab, direction) {
			direction = direction || false;

			if (direction === 'up') {
				destination.prepend(fileTab);
			} else {
				destination.append(fileTab);
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Add newly opened file to list
		//////////////////////////////////////////////////////////////////////80
		createFileTab: function(path) {
			/* If the tab list would overflow with the new tab. Move the
				* first tab to dropdown, then add a new tab. */
			if (self.isTabListOverflowed(true)) {
				var tab = self.tabList.find('li:first-child');
				self.moveTab(self.dropDownMenu, tab);
			}

			var fileTab = self.createListItem(path);
			self.tabList.append(fileTab);
			atheos.editor.updateTabDropdownVisibility();

			return fileTab;
		},

		//////////////////////////////////////////////////////////////////////80
		// Is the activeTabs overflowed
		//////////////////////////////////////////////////////////////////////80
		isTabListOverflowed: function(includeFictiveTab) {
			includeFictiveTab = includeFictiveTab || false;

			var tabs = self.tabList.findAll('li');
			var count = includeFictiveTab ? tabs.length + 1 : tabs.length;

			if (count <= 1) {
				return false;
			}

			var tabWidth = count * tabs[0].width(true);

			//	If we subtract the width of the left side bar, of the right side
			//	bar handle and of the tab dropdown handle to the window width,
			//	do we have enough room for the tab list? Its kind of complicated
			//	to handle all the offsets, so afterwards we add a fixed offset
			//	just to be sure. 

			var availableWidth = oX('#ACTIVE').width();

			var iconWidths = oX('#tab_dropdown').width() * 2;

			var room = availableWidth - (iconWidths + tabWidth + 50);

			return (room < 0);
		},

		//////////////////////////////////////////////////////////////////////80
		// Update tab visibility
		//////////////////////////////////////////////////////////////////////80
		updateTabDropdownVisibility: function() {
			var fileTab;

			while (self.isTabListOverflowed()) {
				fileTab = self.tabList.find('li:last-child');
				if (fileTab.exists()) {
					self.moveTab(self.dropDownMenu, fileTab);
				} else {
					break;
				}
			}

			while (!self.isTabListOverflowed(true)) {
				fileTab = self.dropDownMenu.find('li:last-child');
				if (fileTab.exists()) {
					self.moveTab(self.tabList, fileTab);
				} else {
					break;
				}
			}

			if (self.dropDownMenu.findAll('li').length > 0) {
				oX('#tab_dropdown').show();
			} else {
				oX('#tab_dropdown').hide();
			}

			if (self.tabList.findAll('li').length > 1) {
				oX('#tab_close').show();
			} else {
				oX('#tab_close').hide();
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Factory
		//////////////////////////////////////////////////////////////////////80
		createListItem: function(path) {
			var info = pathinfo(path);

			var item = `<li class="draggable" data-path="${path}">
			<a title="${path}"><span class="subtle">${info.directory}/</span>${info.basename}</a>
			<i class="save fas fa-save"></i><i class="close fas fa-times-circle"></i>
			</li>`;

			item = oX(item);
			return item;
		},

		// Path to EditSession instance mapping
		activeFiles: {},

		noOpen: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'exe', 'zip', 'tar', 'tar.gz'],

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
					target: 'editor',
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
			aceSession.setNewLineMode('unix');
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
					target: 'editor',
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

		remove: function(path) {
			log(path);
			if (!(path in self.activeFiles)) {
				return;
			}
			var file = self.activeFiles[path];


			/* Select all the tab tumbs except the one which is to be removed. */
			var tabs = atheos.editor.tabList.findAll('li');

			if (tabs.length === 0) {
				atheos.editor.exterminate();
			}
			var nextFilePath = self.getNextFileTab('up');
			atheos.editor.removeSession(path, nextFilePath);

			self.forEachAceEditor(function(aceEditor) {
				if (aceEditor.path === path) {
					self.attachFileToEditor(self.activeFiles[nextFilePath], aceEditor);
				}
			});

			file.fileTab.remove();
			atheos.editor.updateTabDropdownVisibility();
			delete self.activeFiles[path];

			echo({
				url: atheos.controller,
				data: {
					target: 'editor',
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
					target: 'editor',
					action: 'removeAll'
				}
			});
		},

		reload: function(path) {
			if (!path && atheos.contextmenu.active) {
				path = atheos.contextmenu.active.path;
			}

			let session = self.getAceSession(path);
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

			let file = self.getFile(path);
			if (isString(file)) return toast('error', file);

			let session = self.getAceSession(file.path);
			session.setValue(session.originalContent);
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