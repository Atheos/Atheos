//////////////////////////////////////////////////////////////////////////////80
// Keybind
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Description:
// Keybinding module for adding keyboard shortcuts to functions. Exposes init()
// and bind() to global for use by plugins.
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {

	var atheos = global.atheos,
		amplify = global.amplify;

	var self = null;

	amplify.subscribe('system.loadMinor', () => atheos.keybind.init());


	//////////////////////////////////////////////////////////////////////
	// Bindings
	//////////////////////////////////////////////////////////////////////

	atheos.keybind = {

		bindings: {},

		init: function() {
			self = this;

			document.addEventListener('keydown', self.handler);

			// Close Modals [Esc] ////////////////////////////////////////////80
			self.bind(false, 27, function() {
				atheos.modal.unload();
			});
			
			// Open CodeGit [Ctrl + C] ////////////////////////////////////////////80
			self.bind(true, 67, function() {
				atheos.codegit.showCodeGit();
			});

			// Save [CTRL+S] /////////////////////////////////////////////////80
			self.bind(true, 83, function() {
				atheos.active.save();
			});

			// Open in browser [CTRL+O] //////////////////////////////////////80
			self.bind(true, 79, function() {
				atheos.filemanager.openInBrowser();
			});

			// Open Scout [CTRL+E] ///////////////////////////////////////////80
			self.bind(true, 69, function() {
				atheos.scout.probe();
			});

			// Find [CTRL+F] /////////////////////////////////////////////////80
			// self.bind(true, 70, function() {
			// 	atheos.editor.openSearch('find');
			// });

			// GotoLine [CTRL+L] /////////////////////////////////////////////80
			self.bind(true, 76, function() {
				atheos.editor.promptLine();
			});

			// Replace [CTRL+R] //////////////////////////////////////////////80
			self.bind(true, 82, function() {
				atheos.editor.openSearch('replace');
			});

			// Close [CTRL+Q] ////////////////////////////////////////////////80
			self.bind(true, 81, function() {
				atheos.active.close();
			});

			// Active List Previous [CTRL+UP] ////////////////////////////////80
			self.bind(true, 38, function() {
				atheos.active.move('up');
			});

			// Active List Next [CTRL+DOWN] //////////////////////////////////80
			self.bind(true, 40, function() {
				atheos.active.move('down');
			});

			// Autocomplete [CTRL+SPACE] /////////////////////////////////////80
			// $.ctrl(32, function() {
			//     atheos.autocomplete.suggest();
			// });

			// this.bind(71, function() {
			// 	if (atheos.finder) {
			// 		atheos.finder.expandFinder();
			// 	}
			// });
		},

		//////////////////////////////////////////////////////////////////////
		// Key Bind
		//////////////////////////////////////////////////////////////////////
		bind: function(ctrl, key, callback, args) {
			self.bindings[key] = {
				args: args || [],
				ctrl,
				callback
			};
		},

		rebind: function(oldKey, newKey) {
			if (oldKey in self.bindings) {
				self.bindings[newKey] = self.bindings[oldKey];
				delete self.bindings[oldKey];
			}
		},

		handler: function(e) {
			if (e.keyCode in self.bindings) {
				let bind = self.bindings[e.keyCode];
				if (e.ctrlKey === bind.ctrl) {
					if (!(e.ctrlKey && e.altKey)) {
						e.preventDefault();
						e.stopPropagation();

						bind.callback.apply(this, bind.args);
						return false;
					}
				}
			}
		}
	};

})(this);