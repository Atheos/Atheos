/*
	*  Copyright (c) atheos & Kent Safranski (atheos.com), distributed
	*  as-is and without warranty under the MIT License. See
	*  [root]/license.txt for more. This information must remain intact.
	*/

(function(global) {



	var ace = global.ace,
		atheos = global.atheos,
		storage = atheos.storage;

	// Classes from Ace
	var VirtualRenderer = ace.require('ace/virtual_renderer').VirtualRenderer;
	var Editor = ace.require('ace/editor').Editor;
	var EditSession = ace.require('ace/edit_session').EditSession;
	var UndoManager = ace.require('ace/undomanager').UndoManager;

	var self = null;

	amplify.subscribe('system.loadMajor', () => atheos.editor.init());

	//////////////////////////////////////////////////////////////////
	//
	// Editor Component for atheos
	// ---------------------------
	// Manage the lifecycle of Editor instances
	//
	//////////////////////////////////////////////////////////////////

	atheos.editor = {

		/// Editor instances - One instance corresponds to an editor
		/// pane in the user interface. Different EditSessions
		/// (ace/edit_session)
		instances: [],

		/// Currently focussed editor
		activeInstance: null,

		// Settings for Editor instances
		settings: {
			theme: 'atheos',
			fontSize: '13px',
			printMargin: false,
			printMarginColumn: 80,
			highlightLine: true,
			indentGuides: true,
			wrapMode: false,
			softTabs: false,
			tabSize: 4
		},

		rootContainer: null,

		fileExtensionTextMode: {},

		init: function() {
			self = this;

			this.cursorTracking();

			var editor = oX('#editor-region');

			//////////////////////////////////////////////////////////////////80
			// h-resize & v-resize events are custom events triggered solely for
			// use in allowing you to resize split containers. The -root events
			// are triggered throughout Atheos as needed, and cascade down into 
			// any split containers. - Liam Siira
			//////////////////////////////////////////////////////////////////80
			editor.on('h-resize-root, v-resize-root', function(e) {
				var wrapper = oX('#editor-region .editor-wrapper');
				if (wrapper) {
					if (e.type === 'h-resize-root') {
						wrapper.css('width', editor.width());
						wrapper.trigger('h-resize');
					} else {
						wrapper.css('height', editor.height());
						wrapper.trigger('v-resize');
					}
				}

			});

			window.addEventListener('resize', function() {
				editor.trigger('h-resize-root, v-resize-root');
			});
		},

		//////////////////////////////////////////////////////////////////
		//
		// Retrieve editor settings from localStorage
		//
		//////////////////////////////////////////////////////////////////
		getSettings: function() {
			var settings = ['theme', 'fontSize', 'tabSize', 'printMargin', 'printMarginColumn', 'highlightLine', 'indentGuides', 'wrapMode', 'softTabs'];
			settings.forEach(function(key) {
				var local = storage('editor.' + key);
				if (local !== null) {
					self.settings[key] = local;
				}
			});
		},

		/////////////////////////////////////////////////////////////////
		//
		// Apply configuration settings
		//
		// Parameters:
		//   i - {Editor}
		//
		/////////////////////////////////////////////////////////////////
		applySettings: function(instance) {
			// Check user-specified settings
			self.getSettings();

			// Apply the current configuration settings:
			instance.setTheme('ace/theme/' + self.settings.theme);
			instance.setOptions({
				// fontFamily: 'VictorMono-Bold',
				fontFamily: 'Ubuntu-Fira',
				enableBasicAutocompletion: true,
				enableSnippets: true,
				enableLiveAutocompletion: true
			});
			instance.setAnimatedScroll(true);

			instance.setFontSize(self.settings.fontSize);
			instance.setPrintMarginColumn(self.settings.printMarginColumn);
			instance.setShowPrintMargin(self.settings.printMargin);
			instance.setHighlightActiveLine(self.settings.highlightLine);
			instance.setDisplayIndentGuides(self.settings.indentGuides);
			instance.getSession().setUseWrapMode(self.settings.wrapMode);
			self.setTabSize(self.settings.tabSize, instance);
			self.setSoftTabs(self.settings.softTabs, instance);
		},


		beautify: function() {
			var beautify = ace.require('ace/ext/beautify');
			var editor = self.activeInstance;
			beautify.beautify(editor.session);
		},

		//////////////////////////////////////////////////////////////////
		//
		// Create a new editor instance attached to given session
		//
		// Parameters:
		//   session - {EditSession} Session to be used for new Editor instance
		//
		//////////////////////////////////////////////////////////////////
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

			if (this.instances.length === 0) {
				oX('#root-editor-wrapper').append(editor);
			} else {

				var firstChild = this.activeInstance.el;

				childID = (where === 'top' || where === 'left') ? 0 : 1;
				var type = (where === 'top' || where === 'bottom') ? 'vertical' : 'horizontal';
				var children = [];

				children[childID] = editor.el;
				children[1 - childID] = firstChild.el;

				var parent = oX('<div class="editor-wrapper">');
				parent.css('height', firstChild.height());
				parent.css('width', firstChild.width());

				parent.addClass('editor-wrapper-' + type);
				firstChild.parent().append(parent);

				splitContainer = new SplitContainer(parent.el, children, type);

				if (this.instances.length > 1) {
					var pContainer = this.activeInstance.splitContainer;
					var idx = this.activeInstance.splitID;
					pContainer.setChild(idx, splitContainer);
				}
			}

			// var i = ace.edit(editor[0]);
			var instance = ace.edit(editor.el);
			var resizeEditor = function() {
				instance.resize();
			};

			if (splitContainer) {
				instance.splitContainer = splitContainer;
				instance.splitID = childID;

				this.activeInstance.splitContainer = splitContainer;
				this.activeInstance.splitID = 1 - childID;

				oX(splitContainer.parent).on('h-resize', resizeEditor);
				oX(splitContainer.parent).on('v-resize', resizeEditor);

				if (this.instances.length === 1) {
					var re = function() {
						self.instances[0].resize();
					};
					oX(splitContainer.parent).on('h-resize', re);
					oX(splitContainer.parent).on('v-resize', re);
				}
			}

			instance.el = editor;
			this.setSession(session, instance);

			this.changeListener(instance);
			// this.cursorTracking(instance);
			this.bindKeys(instance);

			this.instances.push(instance);

			instance.on('focus', function() {

				self.focus(instance);
			});

			return instance;
		},

		//////////////////////////////////////////////////////////////////
		//
		// Remove all Editor instances and clean up the DOM
		//
		//////////////////////////////////////////////////////////////////
		exterminate: function() {
			var editors = oX('#editor-region').findAll('.editor, .editor-wrapper');
			editors.forEach((editor) => {
				editor.remove();
			});
			oX('#current_file').html('');
			oX('#current_mode>span').html('');
			self.instances = [];
			self.activeInstance = null;
		},

		//////////////////////////////////////////////////////////////////
		//
		// Detach EditSession session from all Editor instances replacing
		// them with replacementSession
		//
		//////////////////////////////////////////////////////////////////
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
		forEach: function(fn) {
			for (var k = 0; k < self.instances.length; k++) {
				fn.call(self, self.instances[k]);
			}
		},

		/////////////////////////////////////////////////////////////////
		//
		// Get the currently active Editor instance
		//
		// In a multi-pane setup this would correspond to the
		// editor pane user is currently working on.
		//
		/////////////////////////////////////////////////////////////////
		getActive: function() {
			return self.activeInstance;
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
			if (instance) {
				self.activeInstance = instance;
				var path = instance.getSession().path;
				path = (path.length < 30) ? path : '...' + path.substr(path.length - 30);

				oX('#current_file').text(path);
				atheos.textmode.setModeDisplay(instance.getSession());
			}
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
			instance = instance || this.activeInstance;
			if (!this.isOpen(session)) {
				if (!instance) {
					instance = this.addInstance(session);
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
				proxySession.listThumb = session.listThumb;
				proxySession.tabThumb = session.tabThumb;
				if (!instance) {
					instance = this.addInstance(proxySession);
				} else {
					instance.setSession(proxySession);
				}
			}
			this.applySettings(instance);

			this.setActive(instance);
		},

		/////////////////////////////////////////////////////////////////
		//
		// Set the editor theme
		//
		// Parameters:
		//   t - {String} theme eg. twilight, cobalt etc.
		//   i - {Editor} Editor instance (If omitted, Defaults to all editors)
		//
		// For a list of themes supported by Ace - refer :
		//   https://github.com/ajaxorg/ace/tree/master/lib/ace/theme
		//
		// TODO: Provide support for custom themes
		//
		/////////////////////////////////////////////////////////////////

		setTheme: function(t, i) {
			if (i) {
				// If a specific instance is specified, change the theme for
				// this instance
				i.setTheme('ace/theme/' + t);
			} else {
				// Change the theme for the existing editor instances
				// and make it the default for new instances
				this.settings.theme = t;
				for (var k = 0; k < this.instances.length; k++) {
					this.instances[k].setTheme('ace/theme/' + t);
				}
			}
			// LocalStorage
			localStorage.setItem('atheos.editor.theme', t);
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
			i = i || this.getActive();
			i.getSession().setValue(c);
		},

		/////////////////////////////////////////////////////////////////
		//
		// Set Font Size
		//
		// Set the font for all Editor instances and remember
		// the value for Editor instances to be created in
		// future
		//
		// Parameters:
		//   s - {Number} font size
		//   i - {Editor} Editor instance  (If omitted, Defaults to all editors)
		//
		/////////////////////////////////////////////////////////////////

		setFontSize: function(s, i) {
			if (i) {
				i.setFontSize(s);
			} else {
				this.settings.fontSize = s;
				this.forEach(function(i) {
					i.setFontSize(s);
				});
			}
			// LocalStorage
			localStorage.setItem('atheos.editor.fontSize', s);
		},


		/////////////////////////////////////////////////////////////////
		//
		// Enable/disable Highlighting of active line
		//
		// Parameters:
		//   h - {Boolean}
		//   i - {Editor} Editor instance ( If left out, setting is
		//                    applied to all editors )
		//
		/////////////////////////////////////////////////////////////////

		setHighlightLine: function(h, i) {
			if (i) {
				i.setHighlightActiveLine(h);
			} else {
				this.settings.highlightLine = h;
				this.forEach(function(i) {
					i.setHighlightActiveLine(h);
				});
			}
			// LocalStorage
			localStorage.setItem('atheos.editor.highlightLine', h);
		},

		//////////////////////////////////////////////////////////////////
		//
		// Show/Hide print margin indicator
		//
		// Parameters:
		//   p - {Number} print margin column
		//   i - {Editor}  (If omitted, Defaults to all editors)
		//
		//////////////////////////////////////////////////////////////////

		setPrintMargin: function(p, i) {
			if (i) {
				i.setShowPrintMargin(p);
			} else {
				this.settings.printMargin = p;
				this.forEach(function(i) {
					i.setShowPrintMargin(p);
				});
			}
			// LocalStorage
			localStorage.setItem('atheos.editor.printMargin', p);
		},

		//////////////////////////////////////////////////////////////////
		//
		// Set print margin column
		//
		// Parameters:
		//   p - {Number} print margin column
		//   i - {Editor}  (If omitted, Defaults to all editors)
		//
		//////////////////////////////////////////////////////////////////

		setPrintMarginColumn: function(p, i) {
			if (i) {
				i.setPrintMarginColumn(p);
			} else {
				this.settings.printMarginColumn = p;
				this.forEach(function(i) {
					i.setPrintMarginColumn(p);
				});
			}
			// LocalStorage
			localStorage.setItem('atheos.editor.printMarginColumn', p);
		},

		//////////////////////////////////////////////////////////////////
		//
		// Show/Hide indent guides
		//
		// Parameters:
		//   g - {Boolean}
		//   i - {Editor}  (If omitted, Defaults to all editors)
		//
		//////////////////////////////////////////////////////////////////

		setIndentGuides: function(g, i) {
			if (i) {
				i.setDisplayIndentGuides(g);
			} else {
				this.settings.indentGuides = g;
				this.forEach(function(i) {
					i.setDisplayIndentGuides(g);
				});
			}
			// LocalStorage
			localStorage.setItem('atheos.editor.indentGuides', g);
		},

		//////////////////////////////////////////////////////////////////
		//
		// Enable/Disable Code Folding
		//
		// Parameters:
		//   f - {Boolean}
		//   i - {Editor}  (If omitted, Defaults to all editors)
		//
		//////////////////////////////////////////////////////////////////

		setCodeFolding: function(f, i) {
			if (i) {
				i.setFoldStyle(f);
			} else {
				this.forEach(function(i) {
					i.setFoldStyle(f);
				});
			}
		},

		//////////////////////////////////////////////////////////////////
		//
		// Enable/Disable Line Wrapping
		//
		// Parameters:
		//   w - {Boolean}
		//   i - {Editor}  (If omitted, Defaults to all editors)
		//
		//////////////////////////////////////////////////////////////////

		setWrapMode: function(w, i) {
			if (i) {
				i.getSession().setUseWrapMode(w);
			} else {
				this.forEach(function(i) {
					i.getSession().setUseWrapMode(w);
				});
			}
			// LocalStorage
			localStorage.setItem('atheos.editor.wrapMode', w);
		},

		//////////////////////////////////////////////////////////////////
		//
		// set Tab Size
		//
		// Parameters:
		//   s - size
		//   i - {Editor}  (If omitted, Defaults to all editors)
		//
		//////////////////////////////////////////////////////////////////

		setTabSize: function(s, i) {
			if (i) {
				i.getSession().setTabSize(parseInt(s, 10));
			} else {
				this.forEach(function(i) {
					i.getSession().setTabSize(parseInt(s, 10));
				});
			}
			// LocalStorage
			localStorage.setItem('atheos.editor.tabSize', s);

		},

		//////////////////////////////////////////////////////////////////
		//
		// Enable or disable Soft Tabs
		//
		// Parameters:
		//   t - true / false
		//   i - {Editor}  (If omitted, Defaults to all editors)
		//
		//////////////////////////////////////////////////////////////////

		setSoftTabs: function(t, i) {
			if (i) {
				i.getSession().setUseSoftTabs(t);
			} else {
				this.forEach(function(i) {
					i.getSession().setUseSoftTabs(t);
				});
			}
			// LocalStorage
			localStorage.setItem('atheos.editor.softTabs', t);

		},

		//////////////////////////////////////////////////////////////////
		//
		// Get content from editor
		//
		// Parameters:
		//   i - {Editor} (Defaults to active editor)
		//
		//////////////////////////////////////////////////////////////////

		getContent: function(i) {
			i = i || this.getActive();
			if (!i) return;
			var content = i.getSession().getValue();
			if (!content) {
				content = ' ';
			} // Pass something through
			return content;
		},

		//////////////////////////////////////////////////////////////////
		//
		// Resize the editor - Trigger the editor to readjust its layout
		// esp if the container has been resized manually.
		//
		// Parameters:
		//   i - {Editor} (Defaults to active editor)
		//
		//////////////////////////////////////////////////////////////////

		resize: function(i) {
			i = i || this.getActive();
			if (!i) return;
			i.resize();
		},

		//////////////////////////////////////////////////////////////////
		//
		// Mark the instance as changed (in the user interface)
		// upon change in the document content.
		//
		// Parameters:
		//   i - {Editor}
		//
		//////////////////////////////////////////////////////////////////

		changeListener: function(i) {
			var self = this;
			i.on('change', function() {
				atheos.active.markChanged(self.getActive().getSession().path);
			});
		},

		//////////////////////////////////////////////////////////////////
		//
		// Get Selected Text
		//
		// Parameters:
		//   i - {Editor} (Defaults to active editor)
		//
		//////////////////////////////////////////////////////////////////

		getSelectedText: function(i) {
			i = i || this.getActive();
			if (!i) return;
			return i.getCopyText();
		},

		//////////////////////////////////////////////////////////////////
		//
		// Insert text
		//
		// Parameters:
		//   val - {String} Text to be inserted
		//   i - {Editor} (Defaults to active editor)
		//
		//////////////////////////////////////////////////////////////////

		insertText: function(val, i) {
			i = i || this.getActive();
			if (!i) return;
			i.insert(val);
		},

		//////////////////////////////////////////////////////////////////
		//
		// Move the cursor to a particular line
		//
		// Parameters:
		//   line - {Number} Line number
		//   i - {Editor} Editor instance
		//
		//////////////////////////////////////////////////////////////////

		gotoLine: function(line, i) {
			i = i || this.getActive();
			if (!i) return;
			i.scrollToLine(line, true, true);
			i.gotoLine(line, 0, true);
			self.focus();
		},

		//////////////////////////////////////////////////////////////////
		//
		// Focus an editor
		//
		// Parameters:
		//   i - {Editor} Editor instance (Defaults to current editor)
		//
		//////////////////////////////////////////////////////////////////

		focus: function(i) {
			i = i || this.getActive();
			this.setActive(i);
			if (!i) return;
			i.focus();
			atheos.active.focus(i.getSession().path);
			// this.cursorTracking(i);
		},

		//////////////////////////////////////////////////////////////////
		//
		// Setup Cursor Tracking
		//
		// Parameters:
		//   i - {Editor} (Defaults to active editor)
		//
		//////////////////////////////////////////////////////////////////

		cursorTracking: function(i) {
			var col = global.i18n('Col');
			amplify.subscribe('chrono.kilo', function() {
				var i = atheos.editor.getActive();
				if (i) {
					var pos = i.getCursorPosition();
					oX('#cursor-position').html(`${i18n('Ln')}: ${pos.row + 1}&middot;${col}: ${pos.column}`);
				}
			});
		},

		//////////////////////////////////////////////////////////////////
		//
		// Setup Key bindings
		//
		// Parameters:
		//   i - {Editor}
		//
		//////////////////////////////////////////////////////////////////

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

		}
	};

})(this);