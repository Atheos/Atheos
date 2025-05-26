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
		inFocusPane: {
			get: () => inFocus.editorPane
		},
		inFocusEditor: {
			get: () => inFocus.editorPane ? inFocus.editorPane.aceEditor : null
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
				atheos.keybind.setKeyboard(self.settings.keyboardHandler);

				self.loopBehavior = storage('editor.loopBehavior') || self.loopBehavior;

				// This timeout is an effort to double check the tab visibility
				// after everything has been loaded. The default route has some 
				// minor issues on loading such that it doesn't quite meet spec
				setTimeout(self.updateTabDropdownVisibility, 500);

			});

			carbon.sub('chrono.byte', self.trackCursor);

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

				self.forEachInstance(function(int) {
					int.aceEditor.resize();
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

			var xEditorPane = oX('<div class="editorPane"></div>');

			var childID = null,
				splitContainer = null;

			// If no editor panes exist, we append directly to the root wrapper.
			log('hello');
			if (self.editorPanes.length === 0) {
				//   var xEditorWindow = oX('<div class="editorWindow"></div>');
				log('hello');
				oX('#EDITOR').append(xEditorPane);
				// editorWindow.append(xEditorPane);

				// Otherwise, we try to split the view into two editorPanes
			} else {

				var xFirstChild = atheos.inFocusPane.xEditorPane;

				childID = (where === 'top' || where === 'left') ? 0 : 1;
				var type = (where === 'top' || where === 'bottom') ? 'vertical' : 'horizontal';
				var children = [];

				children[childID] = xEditorPane.element;
				children[1 - childID] = xFirstChild.element;

				var parent = oX('<div class="editorWindow">');
				var splitter = oX('<div class="splitter">');
				// parent.css('height', xFirstChild.height());
				// parent.css('width', xFirstChild.width());

				parent.addClass(type);
				splitter.addClass(type);

				// xFirstChild.parent().append(parent);
				xFirstChild.replaceWith(parent);

				parent.append(children[0]);
				parent.append(splitter);
				parent.append(children[1]);

				// splitContainer = new SplitContainer(parent.element, children, type);

				// if (self.editorPanes.length > 1) {
				// 	var pContainer = atheos.inFocusEditor.splitContainer;
				// 	var idx = atheos.inFocusEditor.splitID;
				// 	pContainer.setChild(idx, splitContainer);
				// }
			}

			var aceEditor = new AceEditorInstance(new AceVirtualRenderer(xEditorPane.element));

			let editorPane = {
				aceEditor
			};


			var resizeEditor = () => aceEditor.resize();

			if (splitContainer) {
				editorPane.splitContainer = splitContainer;
				editorPane.splitID = childID;

				atheos.inFocusEditor.splitContainer = splitContainer;
				atheos.inFocusEditor.splitID = 1 - childID;

				oX(splitContainer.parent).on('h-resize', resizeEditor);
				oX(splitContainer.parent).on('v-resize', resizeEditor);

				if (self.editorPanes.length === 1) {
					var re = function() {
						self.editorPanes[0].aceEditor.resize();
					};
					oX(splitContainer.parent).on('h-resize', re);
					oX(splitContainer.parent).on('v-resize', re);
				}
			}

			editorPane.xEditorPane = xEditorPane;
			editorPane.element = xEditorPane.element;
			// self.changeListener(instance);
			aceEditor.on('change', () => atheos.sessionmanager.markChanged(editorPane.path));
			// 			self.bindKeys(editorPane);


			aceEditor.on('focus', function() {
				self.updateEditorFocus(editorPane, true);
			});

			atheos.keybind.addCustomCommands(aceEditor);

			self.editorPanes.push(editorPane);
			return editorPane;
		},


		//////////////////////////////////////////////////////////////////////80
		// Attachs a file editing session to an editing pane instance. 
		//
		//////////////////////////////////////////////////////////////////////80
		attachSession: function(file, editorPane) {
			// If no pane is provided, use the one currently in focus,
			editorPane = editorPane || atheos.inFocusPane;

			// First check if the file session is already attached to an editing pane
			// If it's not, then simply attach the session directly.
			// If it is open, THEN we create a proxy session for it. We use proxy sesssions 
			// so that each pane can have its own cursor and scroll position.
			// By 
			if (!editorPane) {
				editorPane = self.createEditorPane();
			}

			if (editorPane.path) {
				const oldSession = editorPane.aceEditor.getSession();
				let oldFile = atheos.sessionmanager.getFile(editorPane.path);
				if (oldFile) {
					let state = {
						element: editorPane.element,
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
			editorPane.aceEditor.setSession(proxySession);

			// Apply the user preferred settings
			editorPane.aceEditor.setOptions(self.settings);
			editorPane.aceEditor.setAnimatedScroll(true);

			editorPane.path = file.path;

			if (file.states.length) {
				let lastState = file.states.find(state => state.element === editorPane.element);
				if (lastState) {
					proxySession.getSelection().moveCursorToPosition(lastState.cursor);
					proxySession.getSelection().clearSelection();
					proxySession.setScrollTop(lastState.scrollTop);
					proxySession.setScrollLeft(lastState.scrollLeft);
				}
			}

			editorPane.aceEditor.focus();
		},

		//////////////////////////////////////////////////////////////////////80
		// Creates a new edit pane
		//////////////////////////////////////////////////////////////////////80
		addEditorPane: function(file, where) {
			let editorPane = self.createEditorPane(where);
			self.attachSession(file, editorPane);
		},

		//////////////////////////////////////////////////////////////////////80
		// Merge the current editorPanes by moving the inFocusPane
		//////////////////////////////////////////////////////////////////////80
		mergeEditorWindow: function() {
			const editorPane = atheos.inFocusPane;
			if (!editorPane) return;

			let xEditorPane = editorPane.xEditorPane;

			const xEditorWindow = xEditorPane.parent(),
				xSibling = xEditorPane.sibling('.editorPane');

			if (!xEditorWindow.exists() || !xEditorWindow.hasClass('editorWindow')) return;

			const index = self.editorPanes.findIndex(p => p.element === xSibling.element);

			if (index !== -1) {
				self.editorPanes[index].aceEditor.destroy();
				self.editorPanes.splice(index, 1);
			}

			// Replace the .editorWindow with the current pane
			xEditorWindow.replaceWith(xEditorPane);
			xEditorWindow.remove();
			xEditorPane.css('flex', null);
			atheos.inFocusEditor.focus();
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
		removeSession: function(session, replacementSession) {
			for (var k = 0; k < self.editorPanes.length; k++) {
				if (self.editorPanes[k].getSession().path === session.path) {
					self.editorPanes[k].attachSession(replacementSession);
				}
			}
			if (oX('#current_file').text() === session.path) {
				oX('#current_file').text(replacementSession.path);
			}

			atheos.textmode.setModeDisplay(replacementSession);
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
		forEachInstance: function(fn) {
			for (var k = 0; k < self.editorPanes.length; k++) {
				fn.call(self, self.editorPanes[k]);
			}
		},



		forEachPane: function(fn) {
			for (var k = 0; k < self.editorPanes.length; k++) {
				fn.call(self, self.editorPanes[k]);
			}
		},

		forEachAceEditor: function(fn) {
			for (var k = 0; k < self.editorPanes.length; k++) {
				fn.call(self, self.editorPanes[k].aceEditor);
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
		updateEditorFocus: function(editorPane) {
			editorPane = editorPane || self.inFocusPane;
			if (!editorPane) return;

			var path = editorPane.path;
			let file = atheos.sessionmanager.getFile(path);
			self.highlightEntry(path);

			inFocus.file = file;
			inFocus.editorPane = editorPane;

			path = (path.length < 30) ? path : '...' + path.substr(path.length - 30);

			oX('#current_file').text(path);
			atheos.textmode.setModeDisplay(editorPane.aceEditor.getSession());
		},



		setOption: function(opt, val, aceEditor) {
			if (aceEditor) return aceEditor.setOption(opt, val);
			self.forEachInstance(function(aceEditor) {
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
		// set keyboard handler
		//////////////////////////////////////////////////////////////////////80
		setKeyboard: function(val, aceEditor) {
			val = val === 'default' ? null : "ace/keyboard/" + val;
			self.setOption('keyboardHandler', val, aceEditor);
			atheos.keybind.setKeyboard(val);
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
					atheos.sessionmanager.close(path);

				} else if (e.which === 1) {

					// Left click not on an icon: Switch focus to file
					if (tagName !== 'I') {
						atheos.sessionmanager.focusOnFile(path);

						// Left click on an icon: Save or close file
					} else if (tagName === 'I') {
						// Save file
						if (node.hasClass('save')) {
							atheos.sessionmanager.save(path);

							// Close file
						} else if (node.hasClass('close')) {
							atheos.sessionmanager.close(path);
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

			if (newTabElement) {
				atheos.sessionmanager.focusOn(newTabElement.attr('data-path'));
				if (self.loopBehavior === 'loopBoth') {
					self.highlightEntry(path, direction);
				} else {
					self.highlightEntry(path);
				}
			}
		},

		highlightEntry: function(path, direction) {
			direction = direction || false;
			var active = self.tabList.findAll('.active');
			active.forEach(function(item) {
				item.removeClass('active');
			});

			var file = atheos.sessionmanager.activeFiles[path];
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

		/////////////////////////////////////////////////////////////////
		// Tiny helper functions
		/////////////////////////////////////////////////////////////////
		getPane: function(path) {
			let editorPane = 'File path not attached to pane';
			self.forEachPane(function(pane) {
				if (pane.path === path) editorPane = pane;
			})
			return editorPane;
		},

		getEditor: function(path) {
			let editorPane = self.getPane(path);
			return isString(editorPane) ? false : editorPane.aceEditor;
		},

	};

	carbon.subscribe('system.loadMajor', () => self.init());
	atheos.editor = self;
})();