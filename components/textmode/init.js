//////////////////////////////////////////////////////////////////////////////80
// TextMode Init
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @ccvca, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';

	const self = {

		extensionMap: {},
		availableModes: [],

		//////////////////////////////////////////////////////////////////////80
		// Component initialization
		//////////////////////////////////////////////////////////////////////80
		init: function() {
			echo({
				url: atheos.controller,
				data: {
					target: 'textmode',
					action: 'loadExtensionMap'
				},
				settled: function(reply, status) {
					if (status === 200) {
						self.extensionMap = reply.extensionMap;
						self.availableModes = reply.modes;
						self.createModeMenu();
					}
				}
			});

			atheos.common.initMenuHandler('#current_mode', '#changemode_menu');
		},

		//////////////////////////////////////////////////////////////////////80
		// Load textmodes and apply them to editor sessions.
		//////////////////////////////////////////////////////////////////////80
		setMode: function(path, aceSession) {
			let ext = pathinfo(path).extension.toLowerCase();
			let mode = atheos.textmode.selectMode(ext);

			atheos.common.loadScript('components/editor/ace-editor/mode-' + mode + '.js', function() {
				let aceModePath = 'ace/mode/' + mode;
				if (!ace.require(aceModePath)) {
					console.warn('Missing ACE mode:', mode);
				}
				if (aceSession) {
					aceSession.setMode(aceModePath);
				} else {
					let file = atheos.editor.activeFiles[path];
					if (file) file.aceSession.setMode('ace/mode/' + mode);

					for (let paneID in atheos.editor.editorPanes) {
						let editorPane = atheos.editor.editorPanes[paneID];
						if (editorPane.path === path) editorPane.getSession().setMode('ace/mode/' + mode);
					}
				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Create textmode menu on page load
		//////////////////////////////////////////////////////////////////////80
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
				var editSession = inFocus.editSession;

				// handle async mode change
				var fn = function() {
					self.setModeDisplay(editSession);
					editSession.removeListener('changeMode', fn);
				};
				editSession.on('changeMode', fn);

				editSession.setMode(newMode);
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
				settled: function(reply, status) {
					toast(status, reply.message);

					if (status === 200 && reply.extensions) {
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

	carbon.subscribe('system.loadMinor', () => self.init());
	atheos.textmode = self;
})();