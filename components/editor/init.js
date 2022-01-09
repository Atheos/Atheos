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

	let eStorage = (k, v) => storage('editor.' + k, v);

	// Classes from Ace
	var VirtualRenderer = ace.require('ace/virtual_renderer').VirtualRenderer;
	var Editor = ace.require('ace/editor').Editor;
	var EditSession = ace.require('ace/edit_session').EditSession;
	var UndoManager = ace.require('ace/undomanager').UndoManager;

	var self = false;

	carbon.subscribe('system.loadMajor', () => atheos.editor.init());

	//////////////////////////////////////////////////////////////////////80
	//
	// Editor Component for atheos
	// ---------------------------
	// Manage the lifecycle of Editor instances
	//
	//////////////////////////////////////////////////////////////////////80

	atheos.editor = {

		// Editor instances - One instance corresponds to an editor
		// pane in the user interface. Different EditSessions
		// (ace/edit_session)
		instances: [],

		// Currently focused editor
		activeInstance: null,

		// Settings for Editor instances
		settings: {
			theme: 'atheos',
			fontSize: '13px',
			fontFamily: 'Ubuntu-Fira',
			highlightActiveLine: true,
			showPrintMargin: false,
			printMarginColumn: 80,
			displayIndentGuides: true,
			showFoldWidgets: true,
			useWrapMode: false,
			useSoftTabs: false,
			tabSize: 4
		},

		rootContainer: null,

		fileExtensionTextMode: {},

		init: function() {
			if (self) return;
			self = this;

			carbon.subscribe('settings.loaded', function() {
				// Retrieve editor settings from localeStorage
				for (let key in self.settings) {
					let temp = eStorage(key);
					if (temp !== null) self.settings[key] = temp;
				}
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
					int.resize();
				});

			});

			window.addEventListener('resize', function() {
				fX('#EDITOR').trigger('h-resize-root, v-resize-root');
			});
		},

		//////////////////////////////////////////////////////////////////////80		
		// Apply configuration settings
		//////////////////////////////////////////////////////////////////////80		
		applySettings: function(instance) {
			// Apply the basic configuration settings
			instance.setOptions({
				fontFamily: self.settings.fontFamily,
				enableBasicAutocompletion: true,
				enableSnippets: true,
				enableLiveAutocompletion: true
			});
			instance.setAnimatedScroll(true);

			// Apply the user preferred settings
			instance.setTheme('ace/theme/' + self.settings.theme);
			instance.setFontSize(self.settings.fontSize);
			instance.setHighlightActiveLine(self.settings.highlightActiveLine);
			instance.setShowPrintMargin(self.settings.showPrintMargin);
			instance.setPrintMarginColumn(self.settings.printMarginColumn);
			instance.setDisplayIndentGuides(self.settings.displayIndentGuides);
			instance.setShowFoldWidgets(self.settings.showFoldWidgets);
			instance.getSession().setUseWrapMode(self.settings.useWrapMode);
			instance.getSession().setUseSoftTabs(self.settings.useSoftTabs);
			instance.getSession().setTabSize(self.settings.tabSize);
		},

		//////////////////////////////////////////////////////////////////////80
		//
		// Create a new editor instance attached to given session
		//
		// Parameters:
		//   session - {EditSession} Session to be used for new Editor instance
		//
		//////////////////////////////////////////////////////////////////////80
		addInstance: function(session, where) {
			// This can be a little confusing to follow, took me a while. First,
			// keep in mind that Ace objects has their own .el property, which
			// holds an onyx object, that holds it's own raw element.

			// SplitContainer takes raw html elements and has it's own mini-dom
			// helper that has zero error checking in order to be as fast as
			// possible.

			var editor = oX('<div class="editor"></div>');

			var childID = null,
				splitContainer = null;

			if (self.instances.length === 0) {
				oX('#root-editor-wrapper').append(editor);
			} else {

				var firstChild = self.activeInstance.element;

				childID = (where === 'top' || where === 'left') ? 0 : 1;
				var type = (where === 'top' || where === 'bottom') ? 'vertical' : 'horizontal';
				var children = [];

				children[childID] = editor.element;
				children[1 - childID] = firstChild.element;

				var parent = oX('<div class="editor-wrapper">');
				parent.css('height', firstChild.height());
				parent.css('width', firstChild.width());

				parent.addClass('editor-wrapper-' + type);
				firstChild.parent().append(parent);

				splitContainer = new SplitContainer(parent.element, children, type);

				if (self.instances.length > 1) {
					var pContainer = self.activeInstance.splitContainer;
					var idx = self.activeInstance.splitID;
					pContainer.setChild(idx, splitContainer);
				}
			}

			var instance = ace.edit(editor.element);
			var resizeEditor = () => instance.resize();

			if (splitContainer) {
				instance.splitContainer = splitContainer;
				instance.splitID = childID;

				self.activeInstance.splitContainer = splitContainer;
				self.activeInstance.splitID = 1 - childID;

				oX(splitContainer.parent).on('h-resize', resizeEditor);
				oX(splitContainer.parent).on('v-resize', resizeEditor);

				if (self.instances.length === 1) {
					var re = function() {
						self.instances[0].resize();
					};
					oX(splitContainer.parent).on('h-resize', re);
					oX(splitContainer.parent).on('v-resize', re);
				}
			}

			instance.element = editor;
			self.setSession(session, instance);

			// self.changeListener(instance);
			instance.on('change', () => atheos.active.markChanged(instance.getSession().path));
			self.bindKeys(instance);

			self.instances.push(instance);

			instance.on('focus', function() {
				self.focus(instance, true);
			});

			return instance;
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
			self.instances = [];
			self.activeInstance = null;
		},

		//////////////////////////////////////////////////////////////////////80
		//
		// Detach EditSession session from all Editor instances replacing
		// them with replacementSession
		//
		//////////////////////////////////////////////////////////////////////80
		removeSession: function(session, replacementSession) {
			for (var k = 0; k < self.instances.length; k++) {
				if (self.instances[k].getSession().path === session.path) {
					self.instances[k].setSession(replacementSession);
				}
			}
			if (oX('#current_file').text() === session.path) {
				oX('#current_file').text(replacementSession.path);
			}

			atheos.textmode.setModeDisplay(replacementSession);
		},

		isOpen: function(session) {
			for (var k = 0; k < self.instances.length; k++) {
				if (self.instances[k].getSession().path === session.path) {
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
			for (var k = 0; k < self.instances.length; k++) {
				fn.call(self, self.instances[k]);
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
		setActive: function(instance) {
			if (!instance) return;
			self.activeInstance = instance;
			var path = instance.getSession().path;
			path = (path.length < 30) ? path : '...' + path.substr(path.length - 30);

			oX('#current_file').text(path);
			atheos.textmode.setModeDisplay(instance.getSession());
		},

		/////////////////////////////////////////////////////////////////
		//
		// Change the EditSession of Editor instance
		//
		// Parameters:
		//   session - {EditSession}
		//   instance - {Editor}
		//
		/////////////////////////////////////////////////////////////////
		setSession: function(session, instance) {
			instance = instance || self.activeInstance;
			if (!self.isOpen(session)) {
				if (!instance) {
					instance = self.addInstance(session);
				} else {
					instance.setSession(session);
				}
			} else {
				// Proxy session is required because scroll-position and
				// cursor position etc. are shared among sessions.

				var proxySession = new EditSession(session.getDocument(),
					session.getMode());
				proxySession.setUndoManager(new UndoManager());
				proxySession.path = session.path;
				proxySession.listItem = session.listItem;
				proxySession.serverMTime = session.serverMTime;
				if (!instance) {
					instance = self.addInstance(proxySession);
				} else {
					instance.setSession(proxySession);
				}
			}
			self.applySettings(instance);

			self.setActive(instance);
		},


		/////////////////////////////////////////////////////////////////
		//
		// Set contents of the editor
		//
		// Parameters:
		//   c - {String} content
		//   i - {Editor} (Defaults to active editor)
		//
		/////////////////////////////////////////////////////////////////

		setContent: function(c, i) {
			i = i || self.getActive();
			i.getSession().setValue(c);
		},


		/////////////////////////////////////////////////////////////////
		// Set the editor theme
		// For a list of themes supported by Ace - refer :
		//   https://github.com/ajaxorg/ace/tree/master/lib/ace/theme
		/////////////////////////////////////////////////////////////////
		setTheme: function(val, int) {
			if (int) return int.setTheme('ace/theme/' + val);
			self.forEachInstance(function(int) {
				int.setTheme('ace/theme/' + val);
			});
			self.settings.theme = val;
			eStorage('theme', val);
		},

		/////////////////////////////////////////////////////////////////
		// Set Font Size
		/////////////////////////////////////////////////////////////////
		setFontSize: function(val, int) {
			if (int) return int.setFontSize(val);
			self.forEachInstance(function(int) {
				int.setFontSize(val);
			});
			self.settings.fontSize = val;
			eStorage('fontSize', val);
		},

		/////////////////////////////////////////////////////////////////
		// Set Font Size
		/////////////////////////////////////////////////////////////////
		setCodeLigatures: function(val, int) {
			log(val);
			val = val ? 'Ubuntu-Fira' : 'Ubuntu-Mono';

			if (int) return int.setOption('fontFamily', val);


			self.forEachInstance(function(int) {
				int.setOption('fontFamily', val);
			});
			self.settings.fontFamily = val;
			eStorage('fontFamily', val);
		},

		/////////////////////////////////////////////////////////////////
		// Enable/disable Highlighting of active line
		/////////////////////////////////////////////////////////////////
		setHighlightActiveLine: function(val, int) {
			val = (val == 'true');
			if (int) return int.setHighlightActiveLine(val);
			self.forEachInstance(function(int) {
				int.setHighlightActiveLine(val);
			});
			self.settings.highlightActiveLine = val;
			eStorage('highlightActiveLine', val);
		},

		//////////////////////////////////////////////////////////////////////80
		// Show/Hide print margin indicator
		//////////////////////////////////////////////////////////////////////80
		setShowPrintMargin: function(val, int) {
			val = (val == 'true');
			if (int) return int.setShowPrintMargin(val);
			self.forEachInstance(function(int) {
				int.setShowPrintMargin(val);
			});
			self.settings.showPrintMargin = val;
			eStorage('showPrintMargin', val);
		},

		//////////////////////////////////////////////////////////////////////80
		// Set print margin column
		//////////////////////////////////////////////////////////////////////80
		setPrintMarginColumn: function(val, int) {
			val = parseInt(val, 10);
			if (int) return int.setPrintMarginColumn(val);
			self.forEachInstance(function(int) {
				int.setPrintMarginColumn(val);
			});
			self.settings.printMarginColumn = val;
			eStorage('printMarginColumn', val);
		},

		//////////////////////////////////////////////////////////////////////80
		// Show/Hide indent guides
		//////////////////////////////////////////////////////////////////////80
		setDisplayIndentGuides: function(val, int) {
			val = (val == 'true');
			if (int) return int.setDisplayIndentGuides(val);
			self.forEachInstance(function(int) {
				int.setDisplayIndentGuides(val);
			});
			self.settings.displayIndentGuides = val;
			eStorage('displayIndentGuides', val);
		},

		//////////////////////////////////////////////////////////////////////80
		// Enable/Disable Code Folding
		//////////////////////////////////////////////////////////////////////80
		setShowFoldWidgets: function(val, int) {
			val = (val == 'true');
			if (int) return int.setShowFoldWidgets(val);
			self.forEachInstance(function(int) {
				int.setShowFoldWidgets(val);
			});
			self.settings.showFoldWidgets = val;
			eStorage('showFoldWidgets', val);
		},

		//////////////////////////////////////////////////////////////////////80
		// Enable/Disable Line Wrapping
		//////////////////////////////////////////////////////////////////////80
		setUseWrapMode: function(val, int) {
			val = (val == 'true');
			if (int) return int.getSession().setUseWrapMode(val);
			self.forEachInstance(function(int) {
				int.getSession().setUseWrapMode(val);
			});
			self.settings.useWrapMode = val;
			eStorage('useWrapMode', val);
		},

		//////////////////////////////////////////////////////////////////////80
		// Enable or disable Soft Tabs
		//////////////////////////////////////////////////////////////////////80
		setUseSoftTabs: function(val, int) {
			val = (val == 'true');
			if (int) return int.getSession().setUseSoftTabs(val);
			self.forEachInstance(function(int) {
				int.getSession().setUseSoftTabs(val);
			});
			self.settings.useSoftTabs = val;
			eStorage('useSoftTabs', val);
		},

		//////////////////////////////////////////////////////////////////////80
		// set Tab Size
		//////////////////////////////////////////////////////////////////////80
		setTabSize: function(val, int) {
			val = parseInt(val, 10);
			if (int) return int.getSession().setTabSize(val);
			self.forEachInstance(function(int) {
				int.getSession().setTabSize(val);
			});
			self.settings.tabSize = val;
			eStorage('tabSize', val);
		},



		//////////////////////////////////////////////////////////////////////80
		// Built in Beautifer (WIP)
		//////////////////////////////////////////////////////////////////////80
		beautify: function() {
			var beautify = ace.require('ace/ext/beautify');
			var editor = self.activeInstance;
			beautify.beautify(editor.session);
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

		insertText: function(val, i) {
			i = i || self.getActive();
			if (!i) return;
			i.insert(val);
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

		gotoLine: function(line, i) {
			i = i || self.getActive();
			if (!i) return;
			i.scrollToLine(line, true, true);
			i.gotoLine(line, 0, true);
			self.focus();
		},

		//////////////////////////////////////////////////////////////////////80
		//
		// Focus an editor
		//
		// Parameters:
		//   i - {Editor} Editor instance (Defaults to current editor)
		//
		//////////////////////////////////////////////////////////////////////80
		focus: function(instance, dispatched) {
			instance = instance || self.getActive();
			if (!instance) return;

			self.setActive(instance);

			if (!dispatched) instance.focus();
			atheos.active.focus(instance.getSession().path);
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
			let i = atheos.editor.getActive();
			if (!i) return;
			let pos = i.getCursorPosition();
			oX('#cursor-position').html(`${i18n('Ln')}: ${pos.row + 1}&middot;${i18n('Col')}: ${pos.column}`);
		},

		//////////////////////////////////////////////////////////////////////80
		//
		// Setup Key bindings
		//
		// Parameters:
		//   i - {Editor}
		//
		//////////////////////////////////////////////////////////////////////80

		bindKeys: function(instance) {
			// instance.commands.addCommand({
			// 	name: "Beautify",
			// 	bindKey: {
			// 		win: "Ctrl-Alt-B",
			// 		mac: "Command-Alt-B"
			// 	},
			// 	exec: function() {
			// 		self.beautify();
			// 	}
			// });

			instance.commands.addCommand({
				name: 'Move Up',
				bindKey: {
					win: 'Ctrl-up',
					mac: 'Command-up'
				},
				exec: function(e) {
					atheos.active.move('up');
				}
			});

			instance.commands.addCommand({
				name: 'Move Down',
				bindKey: {
					win: 'Ctrl-down',
					mac: 'Command-up'
				},
				exec: function(e) {
					atheos.active.move('down');
				}
			});

		},

		/////////////////////////////////////////////////////////////////
		// Tiny helper functions
		/////////////////////////////////////////////////////////////////
		getActive: () => self.activeInstance,
		getSession: (i) => (i || self.activeInstance).getSession(),
		getSelection: (i) => (i || self.activeInstance).getSelection(),
		getSelectedText: (i) => (i || self.activeInstance).getCopyText(),
		getSelectionRange: (i) => (i || self.activeInstance).getSelection().getRange(),
		getDocument: (i) => (i || self.activeInstance).getSession().getDocument(),
		getContent: (i) => (i || self.activeInstance).getSession().getValue(),
	};

})();