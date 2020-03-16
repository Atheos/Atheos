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
	var textmode = null;

	var atheos = global.atheos,
		amplify = global.amplify,
		ajax = global.ajax,
		oX = global.onyx;

	amplify.subscribe('atheos.loaded', () => atheos.textmode.init());

	atheos.textmode = {

		dialog: 'components/textmode/dialog.php',
		controller: 'components/textmode/controller.php',
		availableTextModes: [],

		init: function() {
			textmode = this;
			ajax({
				url: textmode.controller,
				type: 'post',
				data: {
					'action': 'getTextModes'
				},
				success: textmode.setEditorTextModes
			});
		},

		//////////////////////////////////////////////////////////////////
		// Send available text modes & file extensions to the Ace Editor.
		//////////////////////////////////////////////////////////////////
		setEditorTextModes: function(data) {
			data = JSON.parse(data);
			if (data.status !== 'error' && data.extensions !== undefined) {
				atheos.editor.clearFileExtensionTextMode();

				for (var ext in data.extensions) {
					atheos.editor.addFileExtensionTextMode(ext, data.extensions[ext]);
				}

				if (data.textModes !== undefined && data.textModes !== []) {
					textmode.availableTextModes = data.textModes;
				}

				/* Notify listeners. */
				amplify.publish('textmode.loaded');
			}
			atheos.toast[data.status](data.message);

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
				url: textmode.controller,
				type: 'post',
				data: data,
				success: textmode.setEditorTextModes
			});

		},

		//////////////////////////////////////////////////////////////////
		//Add a new insert line to the extensions table
		//////////////////////////////////////////////////////////////////
		addFieldToForm: function() {
			var extensions = oX('#textmodes');

			var code = '<tr><td><input type="text" name="extension" value="" /></td>';
			code += '<td><select name="textMode">';
			textmode.availableTextModes.forEach(mode => {
				code += '<option>' + mode + '</option>';
			});

			code += '</select></td></tr>';

			extensions.append(code);
		}
	};
})(this);