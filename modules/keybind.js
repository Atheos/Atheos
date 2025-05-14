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
// self.bind(79, 'ctrl', atheos.filemanager.openInBrowser);

(function() {
	'use strict';

	const keymaps = {
		closeModal: {
			fn: () => atheos.modal.unload(),
		    default: [27],					// Esc
		    emacs  : [],     
		    sublime: [],     
		    vimEx : []     
		},
		saveFile: {
			fn: () => atheos.active.save(),
		    default: [83, 'ctrl'],			// Ctrl+S
		    emacs  : [],     
		    sublime: [],     
		    vimEx : ['write', 'w']     
		},
		saveAllFiles: {
			fn: () => atheos.active.saveAll(),
		    default: [83, 'ctrl shift'],			// Ctrl+Shift+S
		    emacs  : [],     
		    sublime: [],     
		    vimEx : ['wa']     
		},
		saveCloseFile: {
			fn: () => {
				atheos.active.save();
				atheos.active.close();
			},
		    // default: [83, 'ctrl'],			// Ctrl+S
		    emacs  : [],     
		    sublime: [],     
		    vimEx : ['wq']     
		},
		closeFile: {
			fn: () => atheos.active.close(),
		    default: [81, 'ctrl'],			// Ctrl+Q
		    emacs  : [],     
		    sublime: [],     
		    vimEx : ['close', 'clo']     
		},
		openScout: {
			fn: () => atheos.scout.openSearch(),
		    default: [69, 'ctrl'],			// Ctrl+E
		    emacs  : [],     
		    sublime: [],     
		    vimEx : []     
		},
		findText: {
			fn: () => {
				let editor = atheos.editor.activeInstance;
				editor.execCommand('find');				
			},
		    default: [70, 'ctrl'],			// Ctrl+F
		    emacs  : [],     
		    sublime: [],     
		    vimEx : []     
		},
		gotoLine: {
			fn: () => {
				let editor = atheos.editor.activeInstance;
				editor.execCommand('gotoline');		
			},
		    default: [71, 'ctrl'],			// Ctrl+G
		    emacs  : [],     
		    sublime: [],     
		    vimEx : []     
		},
		replaceText: {
			fn: () => {
				let editor = atheos.editor.activeInstance;
				editor.execCommand('replace');
			},
		    default: [82, 'ctrl'],			// Ctrl+R
		    emacs  : [],     
		    sublime: [],     
		    vimEx : []     
		},
		switchActiveLeft: {
			fn: () => atheos.active.move('up'),
		    default: [30, 'ctrl'],			// Ctrl+UP
		    emacs  : [],     
		    sublime: [],     
		    vimEx : []     
		},
		switchActiveRight: {
			fn: () => atheos.active.move('down'),
		    default: [40, 'ctrl'],			// Ctrl+DOWN
		    emacs  : [],     
		    sublime: [],     
		    vimEx : []     
		},
		mergeAllEditors: {
			fn: () => {
				let activeSession = atheos.editor.getSession();
				atheos.editor.exterminate();
				atheos.editor.addInstance(activeSession);			
			},
		    default: [77, 'ctrl'],			// Ctrl+M
		    emacs  : [],     
		    sublime: [],     
		    vimEx : []     
		},
		splitEditorHorizontally: {
			fn: () => atheos.editor.addInstance(atheos.editor.getSession(), 'right'),
		    default: [186, 'ctrl'],			// Ctrl+;
		    emacs  : [],     
		    sublime: [],     
		    vimEx : ['sp']     
		},
		splitEditorVertically: {
			fn: () => atheos.editor.addInstance(atheos.editor.getSession(), 'bottom'),
		    default: [186, 'alt'],			// Alt+;
		    emacs  : [],     
		    sublime: [],     
		    vimEx : ['vs']     
		},		
		testKeybinding: {
			fn: (cm, input) => {
				log(input.args);
			},
		    default: [],			// Alt+;
		    emacs  : [],     
		    sublime: [],     
		    vimEx : ['log']     
			
		}
	};

	let activeBindings = {};

	const self = {

		setKeybindings: function(mode) {
			log('activating keybinding');
			if (mode == "default") {
				self.activateDefaultKeybindings();
			} else if (mode == "vim") {
				self.activateVimKeybindings();
			}
		},
		
		//////////////////////////////////////////////////////////////////////80
		// Key Rebind
		//////////////////////////////////////////////////////////////////////80
		rebind: function(oldKey, newKey) {
			if (oldKey in bindings) delete bindings[oldKey];
			bindings[newKey] = bindings[oldKey];
		},

		//////////////////////////////////////////////////////////////////////80
		// Event Handler
		//////////////////////////////////////////////////////////////////////80
		defaultHandler: function(e) {
			if (!(e.keyCode in activeBindings)) return;
			activeBindings[e.keyCode].forEach(function(bind) {
				if (bind.cmd.includes('alt') !== e.altKey) return;
				if (bind.cmd.includes('ctrl') !== (e.ctrlKey || e.metaKey)) return;
				if (bind.cmd.includes('shift') !== e.shiftKey) return;
				e.preventDefault();
				e.stopPropagation();
				bind.callback.apply(this, bind.args);
			});
		},

		activateDefaultKeybindings: function() {
			activeBindings = {};
			document.addEventListener('keydown', self.defaultHandler);
			Object.values(keymaps).forEach((binding) => {
				if (!binding.default) return;
				let key = binding.default[0];
				let data = {
					args: binding.args || [],
					cmd: binding.default.length > 1 ? binding.default[1].split(' ') : [],
					callback: binding.fn
				};					
				(activeBindings[key] = activeBindings[key] || []).push(data);
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