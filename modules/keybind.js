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

	let self = false,
		bindings = {};

	carbon.subscribe('system.loadMinor', () => atheos.keybind.init());

	//////////////////////////////////////////////////////////////////////////80
	// Default Bindings
	//////////////////////////////////////////////////////////////////////////80
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
	//////////////////////////////////////////////////////////////////////////80

	atheos.keybind = {

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
			let data = {
				args: args || [],
				cmd: cmd ? cmd.split(' ') : [],
				callback
			};
			(bindings[key] = bindings[key] || []).push(data);
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
		handler: function(e) {
			if (!(e.keyCode in bindings)) return;

			bindings[e.keyCode].forEach(function(bind) {
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