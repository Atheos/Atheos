//////////////////////////////////////////////////////////////////////////////80
// TextMode
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @ccvca, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';
	var atheos = global.atheos,
		amplify = global.amplify,
		ajax = global.ajax,
		oX = global.onyx;

	var self = null;

	amplify.subscribe('atheos.loaded', () => atheos.textmode.init());

	atheos.textmode = {

		dialog: 'components/textmode/dialog.php',
		controller: 'components/textmode/controller.php',
		availableTextModes: [], //Should be extensions
		defaultTextModes: [], //Should be availableTextModes
		textModeMenuOpen: false,


		init: function() {
			self = this;

			ajax({
				url: self.controller,
				data: {
					'action': 'getTextModes'
				},
				success: function(data) {
					self.setEditorTextModes(data);
				}
			});

			ajax({
				url: self.controller,
				data: {
					'action': 'loadAceTextModes'
				},
				success: function(reply) {
					if (reply.status === 'success') {
						delete reply.status;
						for (var key in reply) {
							self.defaultTextModes.push(reply[key]);
						}
						self.createModeMenu();

					}
				}
			});

			atheos.common.initMenuHandler(oX('#current_mode'), oX('#changemode-menu'));


			// oX('#current_mode').on('click', function(e) {
			// 	e.stopPropagation();
			// 	if (self.textModeMenuOpen) {
			// 		self.hideModeMenu();
			// 	} else {
			// 		self.showModeMenu();
			// 	}
			// });
		},

		showModeMenu: function() {
			var menu = oX('#changemode-menu');
			atheos.flow.slide('open', menu.el, 200);
			window.addEventListener('click', self.hideModeMenu);
			self.textModeMenuOpen = true;
		},

		hideModeMenu: function() {
			var menu = oX('#changemode-menu');
			atheos.flow.slide('close', menu.el, 200);
			window.removeEventListener('click', self.hideModeMenu);
			self.textModeMenuOpen = false;
		},


		createModeMenu: function() {
			var menu = oX('#changemode-menu');

			var modeColumns = [];
			var modeOptions = [];
			var maxOptionsColumn = 15;
			var firstOption = 0;

			var max;

			self.defaultTextModes.sort();
			self.defaultTextModes.forEach((mode) => {
				modeOptions.push('<li><a>' + mode + '</a></li>');

			});

			var html = '<table><tr>';
			while (true) {
				html += '<td><ul>';
				if ((modeOptions.length - firstOption) < maxOptionsColumn) {
					max = modeOptions.length;
				} else {
					max = firstOption + maxOptionsColumn;
				}
				var currentcolumn = modeOptions.slice(firstOption, max);
				for (var option in currentcolumn) {
					html += currentcolumn[option];
				}
				html += '</ul></td>';
				firstOption = firstOption + maxOptionsColumn;
				if (firstOption >= modeOptions.length) {
					break;
				}
			}

			html += '</tr></table>';
			menu.html(html);

			$('#changemode-menu a').click(function(e) {
				e.stopPropagation();
				var newMode = 'ace/mode/' + $(e.currentTarget).text();
				var actSession = self.activeInstance.getSession();

				// handle async mode change
				var fn = function() {
					self.setModeDisplay(actSession);
					actSession.removeListener('changeMode', fn);
				};
				actSession.on('changeMode', fn);

				actSession.setMode(newMode);
				atheos.flow.slide('close', menu.el, 200);

			});
		},

		//////////////////////////////////////////////////////////////////
		// Send available text modes & file extensions to the Ace Editor.
		//////////////////////////////////////////////////////////////////
		setEditorTextModes: function(data) {
			atheos.editor.clearFileExtensionTextMode();
			for (var ext in data.extensions) {
				atheos.editor.addFileExtensionTextMode(ext, data.extensions[ext]);
			}

			if (data.textModes !== undefined && data.textModes !== []) {
				self.availableTextModes = data.textModes;
			}
			/* Notify listeners. */
			amplify.publish('textmode.loaded');

		},

		//////////////////////////////////////////////////////////////////
		// Save the extensions to the server.
		//////////////////////////////////////////////////////////////////
		saveExtensions: function() {
			var form = oX('#modal_content form').el;
			var len = form.elements.length;

			var data = {
				'action': 'setTextModes'
			};

			for (var i = 0; i < len; i++) {
				var field = form.elements[i];

				if (field.name !== 'extension' && field.name !== 'textmode') {
					continue;
				}

				if (data[field.name]) {
					data[field.name].push(field.value);
				} else {
					data[field.name] = [field.value];
				}
			}

			ajax({
				url: self.controller,
				data: data,
				success: function(data) {
					atheos.toast[data.status](data.message);
					if (data.status !== 'error' && data.extensions !== undefined) {
						self.setEditorTextModes(data);
					}
				}
			});

		},

		//////////////////////////////////////////////////////////////////
		//Add a new insert line to the extensions table
		//////////////////////////////////////////////////////////////////
		addFieldToForm: function() {
			var extensions = oX('#textmodes');

			var code = '<tr><td><input type="text" name="extension" value="" /></td>';
			code += '<td><select name="textMode">';
			self.availableTextModes.forEach(mode => {
				code += '<option>' + mode + '</option>';
			});

			code += '</select></td></tr>';

			extensions.append(code);
		}
	};
})(this);