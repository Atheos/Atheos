//////////////////////////////////////////////////////////////////////////////80
// Keybind
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Description:
// Keybinding module for adding keyboard shortcuts to functions. Exposes init()
// and bind() to global for use by plugins.
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {

	var atheos = global.atheos,
		carbon = global.carbon;

	var self = null;

	carbon.subscribe('system.loadMinor', () => atheos.keybind.init());


	//////////////////////////////////////////////////////////////////////
	// Bindings
	//////////////////////////////////////////////////////////////////////

	atheos.keybind = {

		bindings: {},

		init: function() {
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

			// Merge Editor Vertically [CTRL+M] ////////////////////////80
			self.bind(77, 'ctrl', function() {
				var activeSession = atheos.editor.activeInstance.getSession();
				atheos.editor.exterminate();
				atheos.editor.addInstance(activeSession);
			});

			// Split Editor Horizonally [CTRL+;] /////////////////////////////80
			self.bind(186, 'ctrl', function() {
				atheos.editor.addInstance(atheos.editor.activeInstance.getSession(), 'right');
			});

			// Split Editor Vertically [CTRL+Shift+;] ////////////////////////80
			self.bind(186, 'alt', function() {
				atheos.editor.addInstance(atheos.editor.activeInstance.getSession(), 'bottom');
			});
		},

		//////////////////////////////////////////////////////////////////////
		// Key Bind
		//////////////////////////////////////////////////////////////////////
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

		rebind: function(oldKey, newKey) {
			if (oldKey in self.bindings) {
				self.bindings[newKey] = self.bindings[oldKey];
				delete self.bindings[oldKey];
			}
		},

		handler: function(e) {
			if (e.keyCode in self.bindings) {
				self.bindings[e.keyCode].forEach(function(bind) {
					if (bind.cmd.includes('alt') !== e.altKey) {
						return;
					} else if (bind.cmd.includes('ctrl') !== (e.ctrlKey || e.metaKey)) {
						return;
					} else if (bind.cmd.includes('shift') !== e.shiftKey) {
						return;
					}

					e.preventDefault();
					e.stopPropagation();

					bind.callback.apply(this, bind.args);
				});


			}
		}
	};

})(this);