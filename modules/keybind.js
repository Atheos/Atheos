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

		init: function() {
			self = this;

			// Close Modals [Esc] ////////////////////////////////////////
			self.bind(false, 27, function() {
				atheos.modal.unload();
			});

			// Save [CTRL+S] /////////////////////////////////////////////
			self.bind(true, 83, function() {
				atheos.active.save();
			});

			// Open in browser [CTRL+O] //////////////////////////////////
			self.bind(true, 79, function() {
				atheos.filemanager.openInBrowser();
			});

			// Open Scout [CTRL+E] /////////////////////////////////////////////
			self.bind(true, 69, function() {
				atheos.scout.probe();
			});

			// Find [CTRL+F] /////////////////////////////////////////////
			self.bind(true, 70, function() {
				atheos.editor.openSearch('find');
			});

			// GotoLine [CTRL+G] /////////////////////////////////////////////
			self.bind(true, 71, function() {
				atheos.editor.promptLine();
			});

			// Replace [CTRL+R] //////////////////////////////////////////
			self.bind(true, 82, function() {
				atheos.editor.openSearch('replace');
			});

			// Close [CTRL+W] //////////////////////////////////////////
			self.bind(true, 87, function() {
				atheos.active.close();
			});

			// Active List Previous [CTRL+UP] ////////////////////////////
			self.bind(true, 38, function() {
				atheos.active.move('up');
			});

			// Active List Next [CTRL+DOWN] //////////////////////////////
			self.bind(true, 40, function() {
				atheos.active.move('down');
			});

			// Autocomplete [CTRL+SPACE] /////////////////////////////////
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
			document.addEventListener('keydown', function(e) {
				if (e.keyCode === key && (e.ctrlKey === ctrl)) {
					if (!(e.ctrlKey && e.altKey)) {
						e.preventDefault();

						args = args || [];
						callback.apply(this, args);
						return false;
					}
				}
			});
		}
	};

})(this);