//////////////////////////////////////////////////////////////////////////////80
// Keybind
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/LICENSE.md for more.
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

(function() {

	let self = false;

	carbon.subscribe('system.loadMinor', () => atheos.keybind.init());

	//////////////////////////////////////////////////////////////////////////80
	// Default Bindings
	//////////////////////////////////////////////////////////////////////////80////////////////////////////////////
	// HotKey  | Function                                | HotKey             | Function                           |
	// ------- | --------------------------------------- | ------------------ | ---------------------------------- |
	// ESC     | Close any open dialogs / Exit multiedit | CTRL+Space bar     | Autocomplete                       |
	// CTRL+S  | Save current file                       | ALT+UP             | Move current line(s) up            |
	// CTRL+O  | Open current file in browser            | ALT+DOWN           | Move current line(s) down          |
	// CTRL+F  | Find in current editor                  | ALT+Shift+UP       | Copy current line(s) above current |
	// CTRL+R  | Find & Replace/All in current editor    | ALT+Shift+DOWN     | Copy current line(s) below current |
	// CTRL+H  | Advanced Search / Search & Replace      | CTRL+UP            | Switch to previous tab             |
	// CTRL+A  | Select All                              | CTRL+DOWN          | Switch to next tab                 |
	// CTRL+D  | Delete current line(s)                  | CTRL+Z             | Undo                               |
	// CTRL+P  | Find matching element [{()}]            | CTRL+Y             | Redo                               |
	// CTRL+L  | Go To Line                              | ALT+0              | Fold all                           |
	// CTRL+\[ | Decrease current line(s) indent         | ALT+Shift+0        | Unfold all                         |
	// CTRL+]  | Increase current line(s) indent         | CTRL+/             | Comment Line                       |
	//////////////////////////////////////////////////////////////////////////80////////////////////////////////////

	atheos.keybind = {

		bindings: {},

		init: function() {
			if (self) return;
			self = this;

			document.addEventListener('keydown', self.handler);

			// Close Modals [Esc] ////////////////////////////////////////////80
			self.bind(27, false, atheos.modal.unload);

			// Save [CTRL+S] /////////////////////////////////////////////////80
			self.bind(83, 'ctrl', atheos.active.save);

			// Open in browser [CTRL+O] //////////////////////////////////////80
			self.bind(79, 'ctrl', atheos.filemanager.openInBrowser);

			// Open Scout [CTRL+E] ///////////////////////////////////////////80
			self.bind(69, 'ctrl', atheos.scout.probe);

			// Close [CTRL+Q] ////////////////////////////////////////////////80
			self.bind(81, 'ctrl', atheos.active.close);

			// Find [CTRL+F] /////////////////////////////////////////////////80
			self.bind(70, 'ctrl', function() {
				let editor = atheos.editor.activeInstance;
				editor.execCommand('find');
			});

			// GotoLine [CTRL+G] /////////////////////////////////////////////80
			self.bind(71, 'ctrl', function() {
				let editor = atheos.editor.activeInstance;
				editor.execCommand('gotoline');
			});

			// Replace [CTRL+R] //////////////////////////////////////////////80
			self.bind(82, 'ctrl', function() {
				let editor = atheos.editor.activeInstance;
				editor.execCommand('replace');
			});

			// Active List Previous [CTRL+UP] ////////////////////////////////80
			self.bind(38, 'ctrl', function() {
				atheos.active.move('up');
			});

			// Active List Next [CTRL+DOWN] //////////////////////////////////80
			self.bind(40, 'ctrl', function() {
				atheos.active.move('down');
			});

			// Merge Editor Vertically [CTRL+M] //////////////////////////////80
			self.bind(77, 'ctrl', function() {
				let activeSession = atheos.editor.getSession();
				atheos.editor.exterminate();
				atheos.editor.addInstance(activeSession);
			});

			// Split Editor Horizonally [CTRL+;] /////////////////////////////80
			self.bind(186, 'ctrl', function() {
				atheos.editor.addInstance(atheos.editor.getSession(), 'right');
			});

			// Split Editor Vertically [CTRL+Shift+;] ////////////////////////80
			self.bind(186, 'alt', function() {
				atheos.editor.addInstance(atheos.editor.getSession(), 'bottom');
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Key Bind
		//////////////////////////////////////////////////////////////////////80
		bind: function(key, cmd, callback, args) {
			if (!(key in self.bindings)) {
				self.bindings[key] = [];
			}

			self.bindings[key].push({
				args: args || [],
				cmd: cmd ? cmd.split(' ') : [],
				callback
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Key Rebind
		//////////////////////////////////////////////////////////////////////80
		rebind: function(oldKey, newKey) {
			if (oldKey in self.bindings) {
				self.bindings[newKey] = self.bindings[oldKey];
				delete self.bindings[oldKey];
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Event Handler
		//////////////////////////////////////////////////////////////////////80
		handler: function(e) {
			if (!(e.keyCode in self.bindings)) return;

			self.bindings[e.keyCode].forEach(function(bind) {
				if (bind.cmd.includes('alt') !== e.altKey) return;
				if (bind.cmd.includes('ctrl') !== (e.ctrlKey || e.metaKey)) return;
				if (bind.cmd.includes('shift') !== e.shiftKey) return;

				e.preventDefault();
				e.stopPropagation();

				bind.callback.apply(this, bind.args);
			});
		}
	};

})();