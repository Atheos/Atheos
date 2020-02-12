/*
	*  Copyright (c) Codiad & Kent Safranski (codiad.com), distributed
	*  as-is and without warranty under the MIT License. See
	*  [root]/license.txt for more. This information must remain intact.
	*/


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
				if (e.keyCode == 27) {
					codiad.modal.unload();
				}
			});

			// Save [CTRL+S] /////////////////////////////////////////////
			this.bind('83', function() {
				codiad.active.save();
			});

			// Open in browser [CTRL+O] //////////////////////////////////
			this.bind('79', function() {
				codiad.active.openInBrowser();
			});

			// Find [CTRL+F] /////////////////////////////////////////////
			this.bind('70', function() {
				codiad.editor.openSearch('find');
			});

			// Replace [CTRL+R] //////////////////////////////////////////
			this.bind('82', function() {
				codiad.editor.openSearch('replace');
			});

			// Active List Previous [CTRL+UP] ////////////////////////////
			this.bind('38', function() {
				codiad.active.move('up');
			});

			// Active List Next [CTRL+DOWN] //////////////////////////////
			this.bind('40', function() {
				codiad.active.move('down');
			});

			// Autocomplete [CTRL+SPACE] /////////////////////////////////
			// $.ctrl('32', function() {
			//     codiad.autocomplete.suggest();
			// });

			this.bind('71', function() {
				if (codiad.finder) {
					codiad.finder.expandFinder();
				}
			});
		},

		//////////////////////////////////////////////////////////////////////
		// CTRL Key Bind
		//////////////////////////////////////////////////////////////////////
		bind: function(key, callback, args) {
			document.addEventListener('keydown', function(e) {
				if (!args) args = [];
				if (e.keyCode == key && (e.ctrlKey || e.metaKey)) {
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