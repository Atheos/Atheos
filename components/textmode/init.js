//////////////////////////////////////////////////////////////////////////////80
// TextMode Init
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @ccvca, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';

	var atheos = global.atheos;

	var self = null;

	carbon.subscribe('system.loadMinor', () => atheos.textmode.init());

	atheos.textmode = {

		extensionMap: {},
		availableModes: [],

		init: function() {
			self = this;

			echo({
				url: atheos.controller,
				data: {
					target: 'textmode',
					action: 'loadExtensionMap'
				},
				success: function(reply) {
					if (reply.status === 'success') {
						delete reply.status;
						self.extensionMap = reply.extensionMap;
						self.availableModes = reply.modes;
						self.createModeMenu();
					}
				}
			});

			atheos.common.initMenuHandler('#current_mode', '#changemode_menu');

		},

		createModeMenu: function() {
			var menu = oX('#changemode_menu');

			var modeOptions = [];
			var maxOptionsColumn = 15;
			var firstOption = 0;

			var max;

			self.availableModes.sort();
			self.availableModes.forEach((mode) => {
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

			fX('#changemode_menu').on('click', function(e) {
				e.stopPropagation();
				var node = oX(e.target);
				var tagName = e.target.tagName;
				if (tagName !== 'A') {
					return false;
				}

				var newMode = 'ace/mode/' + node.text();
				var activeSession = atheos.editor.activeInstance.getSession();

				// handle async mode change
				var fn = function() {
					self.setModeDisplay(activeSession);
					activeSession.removeListener('changeMode', fn);
				};
				activeSession.on('changeMode', fn);

				activeSession.setMode(newMode);
			});
		},

		/////////////////////////////////////////////////////////////////
		//
		// Select file mode by extension case insensitive
		//
		// Parameters:
		// extension - {String} File extension
		//
		/////////////////////////////////////////////////////////////////
		selectMode: function(extension) {
			if (typeof(extension) !== 'string') {
				return 'text';
			}
			extension = extension.toLowerCase();

			if (extension in self.extensionMap) {
				return self.extensionMap[extension];
			} else if (self.availableModes.includes(extension)) {
				return extension;
			} else {
				return 'text';
			}
		},

		setModeDisplay: function(session) {
			if (!session) {
				return;
			}
			var currMode = session.getMode().$id;
			if (currMode) {
				currMode = currMode.substring(currMode.lastIndexOf('/') + 1);
				oX('#current_mode>span').html(currMode);
			} else {
				oX('#current_mode>span').html('text');
			}
		},
		//////////////////////////////////////////////////////////////////
		// Save the extensions to the server.
		//////////////////////////////////////////////////////////////////
		saveExtensions: function() {
			var form = oX('#textmodes');
			var modes = form.findAll('input, select');

			var data = {
				target: 'textmode',
				action: 'saveExtensionMap',
				map: {
					extension: [],
					textmode: []
				}
			};

			for (var i = 0; i < modes.length; i++) {
				var field = modes[i].element;

				if (field.name !== 'extension' && field.name !== 'textmode') {
					continue;
				}

				data.map[field.name].push(field.value);
			}
			data.map = JSON.stringify(data.map);

			echo({
				url: atheos.controller,
				data: data,
				settled: function(status, reply) {
					atheos.toast.show(status, reply.message);

					if (status !== 'error' && reply.extensions) {
						self.setEditorTextModes(reply);
					}
				}
			});

		},

		//////////////////////////////////////////////////////////////////
		//Add a new insert line to the extensions table
		//////////////////////////////////////////////////////////////////
		addFieldToForm: function() {
			var extensions = oX('#textmodes');

			var html = '<tr><td><input type="text" name="extension" value="" /></td>';
			html += '<td><select name="textmode">';
			self.availableModes.forEach((mode) => {
				html += '<option>' + mode + '</option>';
			});

			html += '</select></td></tr>';

			extensions.append(html);
		}
	};
})(this);