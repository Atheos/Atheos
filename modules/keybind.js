//////////////////////////////////////////////////////////////////////////////80
// Keybind
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Description:
// Keybinding module for adding keyboard shortcuts to functions. Exposes bind()
// and rebind() to global for use by plugins.
//////////////////////////////////////////////////////////////////////////////80
// Suggestions:
//	Better customization of modifer keys
//////////////////////////////////////////////////////////////////////////////80
// Usage:
//  - ctrl: Ctrl key is also pressed (CMD on Macs)
//  -  alt: Alt key is also pressed
//
//	atheos.keybind.add(87, 'ctrl', function(text) {
//		console.log("This will log when Ctrl + W is pressed:" + text);
//	}, ['Custom Message']);
//////////////////////////////////////////////////////////////////////////////80
// Default Bindings
//////////////////////////////////////////////////////////////////////////////80
// HotKey             | Function                                
// ------------------ | -------------------------------------------------- |
// ESC                | Close any open dialogs / Exit multiedit            |
// CTRL+S             | Save current file                                  |
// CTRL+O             | Open current file in browser                       |
// CTRL+F             | Find in current editor                             |
// CTRL+R             | Find & Replace/All in current editor               |
// CTRL+H             | Advanced Search / Search & Replace                 |
// CTRL+A             | Select All                                         |
// CTRL+D             | Delete current line(s)                             |
// CTRL+P             | Find matching element [{()}]                       |
// CTRL+L             | Go To Line                                         |
// CTRL+\[            | Decrease current line(s) indent                    |
// CTRL+]             | Increase current line(s) indent                    |
// CTRL+Space bar     | Autocomplete                                       |
// ALT+UP             | Move current line(s) up                            |
// ALT+DOWN           | Move current line(s) down                          |
// ALT+Shift+UP       | Copy current line(s) above current                 |
// ALT+Shift+DOWN     | Copy current line(s) below current                 |
// CTRL+UP            | Switch to previous tab                             |
// CTRL+DOWN          | Switch to next tab                                 |
// CTRL+Z             | Undo                                               |
// CTRL+Y             | Redo                                               |
// ALT+0              | Fold all                                           |
// ALT+Shift+0        | Unfold all                                         |
// CTRL+/             | Comment Line                                       |
//////////////////////////////////////////////////////////////////////////////80

// Open in browser [CTRL+O] //////////////////////////////////////80
// self.bind(79, 'ctrl', atheos.filetree.openInBrowser);

(function() {
	'use strict';

	const keymaps = {
		closeModal: {
			fn: () => atheos.modal.unload(),
			default: 'Esc', // Esc
			emacs: [],
			sublime: [],
			vimEx: []
		},
		saveFile: {
			fn: () => atheos.sessionmanager.save(),
			default: 'Ctrl-S', // Ctrl+S
			emacs: [],
			sublime: [],
			vimEx: ['write', 'w']
		},
		saveAllFiles: {
			fn: () => atheos.sessionmanager.saveAll(),
			default: 'Ctrl-Shift-S', // Ctrl+Shift+S
			emacs: [],
			sublime: [],
			vimEx: ['wa']
		},
		saveCloseFile: {
			fn: () => {
				atheos.sessionmanager.save();
				atheos.sessionmanager.close();
			},
			// default: [83, 'ctrl'],			// Ctrl+S
			emacs: [],
			sublime: [],
			vimEx: ['wq']
		},
		closeFile: {
			fn: () => atheos.sessionmanager.close(),
			default: 'Ctrl-Q', // Ctrl+Q
			emacs: [],
			sublime: [],
			vimEx: ['close', 'clo']
		},
		openScout: {
			fn: () => atheos.scout.openSearch(),
			default: 'Ctrl-E', // Ctrl+E
			emacs: [],
			sublime: [],
			vimEx: []
		},
		findText: {
			fn: () => {
				let editor = atheos.inFocusEditor;
				editor.execCommand('find');
			},
			default: 'Ctrl-F', // Ctrl+F
			emacs: [],
			sublime: [],
			vimEx: []
		},
		gotoLine: {
			fn: () => {
				let editor = atheos.inFocusEditor;
				editor.execCommand('gotoline');
			},
			default: 'Ctrl-G', // Ctrl+G
			emacs: [],
			sublime: [],
			vimEx: []
		},
		replaceText: {
			fn: () => {
				let editor = atheos.inFocusEditor;
				editor.execCommand('replace');
			},
			default: 'Ctrl-R', // Ctrl+R
			emacs: [],
			sublime: [],
			vimEx: []
		},
		cycleFocusUp: {
			fn: () => atheos.editor.cycleFocus('up'),
			default: 'Ctrl-Up', // Ctrl+UP
			emacs: [],
			sublime: [],
			vimEx: []
		},
		cycleFocusDown: {
			fn: () => atheos.editor.cycleFocus('down'),
			default: 'Ctrl-Down', // Ctrl+DOWN
			emacs: [],
			sublime: [],
			vimEx: []
		},
		splitEditorHorizontally: {
			fn: () => atheos.editor.addEditorPane(atheos.inFocusFile, 'right'),
			default: 'Ctrl-;', // Ctrl+;
			emacs: [],
			sublime: [],
			vimEx: ['sp']
		},
		splitEditorVertically: {
			fn: () => atheos.editor.addEditorPane(atheos.inFocusFile, 'bottom'),
			default: 'Alt+;', // Alt+;
			emacs: [],
			sublime: [],
			vimEx: ['vs']
		},

		mergeEditorWindow: {
			fn: () => atheos.editor.mergeEditorWindow(atheos.inFocusPane),
			default: 'Ctrl-M', // Ctrl+M
			emacs: [],
			sublime: [],
			vimEx: []
		},

		mergeAllEditorWindows: {
			fn: () => {
				let activeFile = atheos.inFocusFile;
				atheos.editor.exterminate();
				atheos.editor.addEditorPane(activeFile);
			},
			default: 'Ctrl-Shift-M', // Ctrl+M
			emacs: [],
			sublime: [],
			vimEx: []
		},
		testKeybinding: {
			fn: (cm, input) => {
				log(input.args);
			},
			default: null, // Alt+;
			emacs: [],
			sublime: [],
			vimEx: ['log']

		}
	};

	let activeBindings = {};

	let activeMode = 'default';

	const self = {

		setKeyboard: function(mode) {
			mode = mode == null ? 'default' : mode;
			atheos.editor.forEachAceEditor(function(aceEditor) {
				aceEditor.commands.commands = {};
				if (mode == 'default') {
					self.setDefaultKeybindings(aceEditor);
				}
			});

			if (mode == "vim") {
				self.activateVimKeybindings();
			}
		},

		addCustomCommands: function(aceEditor) {
			if (activeMode === 'default') {
				self.addDefaultKeybindings(aceEditor);
			}


		},

		add: function(name, binding) {
			keymaps[name] = binding;
		},

		//////////////////////////////////////////////////////////////////////80
		// Key Rebind
		//////////////////////////////////////////////////////////////////////80
		rebind: function(oldKey, newKey) {
			if (oldKey in bindings) delete bindings[oldKey];
			bindings[newKey] = bindings[oldKey];
		},

		addDefaultKeybindings: function(aceEditor) {

			Object.entries(keymaps).forEach(([name, binding]) => {
				if (!binding.default) return;
				const winKey = binding.default; // e.g., 'Ctrl-S'
				// Translate key for Mac
				let macKey = winKey.replace(/Ctrl/g, 'Command').replace(/Alt/g, 'Option');
				let key = binding.default[0];
				aceEditor.commands.addCommand({
					name: name,
					bindKey: {
						win: winKey,
						mac: macKey
					},
					// exec: binding.fn,
					// exec: () => binding.fn(),
					exec: () => binding.fn.call(null),
					readOnly: true
				});
			});
		},

		activateVimKeybindings: function() {
			ace.config.setModuleUrl("ace/keyboard/vim", "/components/editor/ace-editor/keybinding-vim.js");

			ace.config.loadModule("ace/keyboard/vim", function(module) {
				const Vim = module.Vim;

				Object.values(keymaps).forEach((binding) => {
					if ('vimEx' in binding && binding.vimEx.length > 0) {
						let key = binding.vimEx[0],
							alias = binding.vimEx.length > 1 ? binding.vimEx[1] : binding.vimEx[0];
						Vim.defineEx(key, alias, binding.fn);
					} else if ('vimNorm' in binding && binding.vimNorm > 0) {
						let key = binding.vimEx[0],
							alias = binding.vimEx.length > 1 ? binding.vimEx[1] : binding.vimEx[0];
						// Vim.mapCommand(",r", "normal", "run-current", {}, {
						// 	exec: () => runCurrentFile()
						// });
					}
				});

			});
		}
	};

	// carbon.subscribe('system.loadMinor', () => self.init());
	atheos.keybind = self;

})();