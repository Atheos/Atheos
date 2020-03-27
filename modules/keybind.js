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

	//////////////////////////////////////////////////////////////////////
	// Bindings
	//////////////////////////////////////////////////////////////////////

	atheos.keybind = {

		init: function() {

			// Close Modals [Esc] ////////////////////////////////////////
			this.bind(27, function() {
				atheos.modal.unload();
			});

			// Save [CTRL+S] /////////////////////////////////////////////
			this.bind(83, function() {
				atheos.active.save();
			});

			// Open in browser [CTRL+O] //////////////////////////////////
			this.bind(79, function() {
				atheos.active.openInBrowser();
			});

			// Open Scout [CTRL+E] /////////////////////////////////////////////
			this.bind(69, function() {
				atheos.scout.search();
			});

			// Find [CTRL+F] /////////////////////////////////////////////
			this.bind(70, function() {
				atheos.editor.openSearch('find');
			});

			// GotoLine [CTRL+G] /////////////////////////////////////////////
			this.bind(71, function() {
				atheos.editor.promptLine();
			});

			// Replace [CTRL+R] //////////////////////////////////////////
			this.bind(82, function() {
				atheos.editor.openSearch('replace');
			});

			// Active List Previous [CTRL+UP] ////////////////////////////
			this.bind(38, function() {
				atheos.active.move('up');
			});

			// Active List Next [CTRL+DOWN] //////////////////////////////
			this.bind(40, function() {
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
		// CTRL Key Bind
		//////////////////////////////////////////////////////////////////////
		bind: function(key, callback, args) {
			document.addEventListener('keydown', function(e) {
				if (e.keyCode === key && (e.ctrlKey || e.metaKey)) {
					args = args || [];
					if (!(e.ctrlKey && e.altKey)) {
						e.preventDefault();
						callback.apply(this, args);
						return false;
					}
				}
			});
		}
	};

})(this);