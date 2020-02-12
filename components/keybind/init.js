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

	var core = global.codiad,
		amplify = global.amplify;
		
	amplify.subscribe('core.loaded', function(settings) {
		core.keybind.init();
	});
	//////////////////////////////////////////////////////////////////////
	// Bindings
	//////////////////////////////////////////////////////////////////////

	core.keybind = {

		init: function() {

			// Close Modals //////////////////////////////////////////////
			document.addEventListener('keyup', function(e) {
				if (e.keyCode === 27) {
					core.modal.unload();
				}
			});

			// Save [CTRL+S] /////////////////////////////////////////////
			this.bind(83, function() {
				core.active.save();
			});

			// Open in browser [CTRL+O] //////////////////////////////////
			this.bind(79, function() {
				core.active.openInBrowser();
			});

			// Find [CTRL+F] /////////////////////////////////////////////
			this.bind(70, function() { 
				core.editor.openSearch('find');
			});

			// Replace [CTRL+R] //////////////////////////////////////////
			this.bind(82, function() {
				core.editor.openSearch('replace');
			});

			// Active List Previous [CTRL+UP] ////////////////////////////
			this.bind(38, function() {
				core.active.move('up');
			});

			// Active List Next [CTRL+DOWN] //////////////////////////////
			this.bind(40, function() {
				core.active.move('down');
			});

			// Autocomplete [CTRL+SPACE] /////////////////////////////////
			// $.ctrl(32, function() {
			//     core.autocomplete.suggest();
			// });

			this.bind(71, function() {
				if (core.finder) {
					core.finder.expandFinder();
				}
			});
		},

		//////////////////////////////////////////////////////////////////////
		// CTRL Key Bind
		//////////////////////////////////////////////////////////////////////
		bind: function(key, callback, args) {
			document.addEventListener('keydown', function(e) {
				if (e.keyCode === key && (e.ctrlKey || e.metaKey)) {
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