//////////////////////////////////////////////////////////////////////////////80
// Macro: Create custom quick actions
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @daeks, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';

	let hr = {
		title: 'macro',
		type: 'file',
		fTypes: []
	};

	const self = {

		macros: [],
		//////////////////////////////////////////////////////////////////////80
		// Initilization
		//////////////////////////////////////////////////////////////////////80
		init: function() {
			self.load();

			fX('#macro_editor').on('click', function(e) {
				let target = oX(e.target);
				if (target.tagName !== 'A') return;
				e.preventDefault();

				let parent = target.parent('TR');
				if (target.hasClass('fa-save')) {
					self.save(parent);
				} else {
					self.delete(parent);
				}
			});


			fX('#macro_editor').on('change', function(e) {
				let target = oX(e.target);
				if (target.tagName !== 'INPUT' || target.type !== 'radio') return;
				e.preventDefault();
				log(e.target);

				let parent = target.parent('TR'),
					fTypeInput = parent.find('input[name="fTypes"]');

				if (target.value() === "file") {
					fTypeInput.prop('disabled', false);
				} else {
					fTypeInput.prop('disabled', true);
				}
			});


			carbon.sub('contextmenu.showFileMenu', self.showMenu);
		},

		//////////////////////////////////////////////////////////////////////80
		// Save Macro
		//////////////////////////////////////////////////////////////////////80
		showMenu: function(active) {
			let menu = oX('#contextmenu'),
				ext = active.extension,
				hrMade = false,
				macro = null;

			for (var i in self.macros) {
				if (!self.macros.hasOwnProperty(i)) continue;
				macro = extend({}, self.macros[i]);
				if (active.type !== macro.type) continue;
				if (macro.type === 'file' && !macro.fTypes.includes(ext)) continue;

				macro.action = "atheos.macro.execute";

				if (!hrMade) {
					hrMade = true;
					menu.append(self.createMenuItem(hr));
				}
				menu.append(self.createMenuItem(macro));
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Create Menu Item
		//////////////////////////////////////////////////////////////////////80
		createMenuItem: function(item) {
			let html = '';

			if (item.icon && item.action) {
				let icon = `<i class="${item.icon}"></i>`;

				html = `<a uuid="${item.uuid}" action="${item.action}">${icon + item.title}</a>\n`;
			} else {
				html = `<hr id="${item.title}">\n`;
			}
			return html;
		},

		//////////////////////////////////////////////////////////////////////80
		// Execute Macro
		//////////////////////////////////////////////////////////////////////80
		execute: function(anchor, item) {
			let path = anchor.path,
				uuid = item.attr('uuid'),
				i = self.findMacro(uuid);

			if (!i) return;

			let macro = self.macros[i];

			echo({
				data: {
					target: 'macro',
					action: 'execute',
					uuid: macro.uuid,
					path
				},
				settled: function(status, reply) {
					log(status, reply);
					output(status, reply);
					if (status !== 'success') return;
				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Save Macro
		//////////////////////////////////////////////////////////////////////80
		save: function(parent) {

			let macro = {
				uuid: parent.attr('id'),
				icon: "fas fa-magic",
				title: parent.find('input[name="title"]').value(),
				type: parent.find('input:checked').value(),
				fTypes: parent.find('input[name="fTypes"]').value(),
				command: parent.find('input[name="command"]').value()
			};

			macro.fTypes = macro.type === 'file' ? macro.fTypes : 'N/A';

			macro.target = 'macro';
			macro.action = 'save';

			echo({
				data: macro,
				settled: function(status, reply) {
					toast(status, reply);
					if (status !== 'success') return;

					let index = self.findMacro(macro.uuid);
					macro.fTypes = macro.fTypes.split(',');
					if (index) {
						self.macros[index] = macro;
					} else {
						self.macros[Object.keys(self.macros).length] = macro;
					}
				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Delete Macro
		//////////////////////////////////////////////////////////////////////80
		delete: function(parent) {

			let uuid = parent.attr('id');

			echo({
				data: {
					target: 'macro',
					action: 'delete',
					uuid,
				},
				settled: function(status, reply) {
					toast(status, reply);
					if (status !== 'success') return;
					let index = self.findMacro(uuid),
						row = oX('#' + uuid);
					if (index) delete self.macros[index];

					if (row) {
						row.remove();
					}
				}
			});
		},

		findMacro: function(uuid) {
			for (var i in self.macros) {
				if (!self.macros.hasOwnProperty(i)) continue;
				if (uuid === self.macros[i].uuid) return i;
			}
			return false;
		},

		//////////////////////////////////////////////////////////////////////80
		// Load Macros
		//////////////////////////////////////////////////////////////////////80
		load: function() {
			echo({
				data: {
					target: 'macro',
					action: 'load',
				},
				settled: function(status, reply) {
					if (status !== 'success') return;
					self.macros = reply;
				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Show Macro Menu
		//////////////////////////////////////////////////////////////////////80
		showMacro: function() {
			atheos.modal.load(750, {
				target: 'macro',
				action: 'openDialog'
			});
		},

		addRow: function() {
			let table = oX('#macro_editor');
			if (!table) return;

			let id = genID('macro');

			let row = `<tr id="${id}">`;
			row += '<td><input type="text" name="title"></input></td>';
			row += `<td><toggle>
				<input id="typeFile_${id}" value="file" name="type" type="radio" checked/>
				<label for="typeFile_${id}">${i18n("file")}</label>
				<input id="typeFolder_${id}" value="folder" name="type" type="radio"/>
				<label for="typeFolder_${id}">${i18n("folder")}</label>
				</toggle></td>`;
			row += '<td><input type="text" name="fTypes"></input></td>';
			row += '<td><input type="text" name="command"></input></td>';
			row += '<td><a class="fas fa-save"></a><a class="fas fa-times-circle"></a></td>';
			row += '</tr>';

			table.find('tbody').append(row);

		}
	};

	carbon.subscribe('system.loadMinor', () => self.init());
	atheos.macro = self;

})();