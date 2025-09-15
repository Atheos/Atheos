//////////////////////////////////////////////////////////////////////////////80
// Settings Init
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';

	const self = {

		//////////////////////////////////////////////////////////////////////80
		// Initilization
		//////////////////////////////////////////////////////////////////////80
		init: function() {
			fX('#dialog .settings').on('change', function(e) {
				var target = oX(e.target);
				var tagName = target.tagName;
				var type = target.type;

				var key = target.attr('data-setting'),
					value;

				if (tagName === 'SELECT') {
					value = target.value();

				} else if (tagName === 'INPUT' && type === 'checkbox') {
					value = target.prop('checked');

				} else if (tagName === 'INPUT' && type === 'radio') {
					value = target.value();

				} else {
					return;
				}

				if (key === 'analytics.enabled') {
					atheos.analytics.changeOpt(value);
				} else {
					self.save(key, value);
				}
			});

			fX('#dialog .settings menu').on('click', function(e) {
				var target = oX(e.target);
				var tagName = target.tagName;
				if (tagName === 'A') {
					self.showTab(target);
				}
			});
		},

		processSettings: function(settings) {
			for (var key in settings) {
				storage(key, settings[key]);
			}
			carbon.publish('settings.loaded', settings);
		},


		//////////////////////////////////////////////////////////////////////80
		// Save Settings
		//////////////////////////////////////////////////////////////////////80
		save: function(key, value, hidden) {
			if (!key || (typeof(value) === 'undefined')) {
				return;
			}

			value = value === 'true' ? true : value === 'false' ? false : value;


			echo({
				url: atheos.controller,
				data: {
					target: 'settings',
					action: 'save',
					key,
					value
				},
				settled: function(reply, status) {
					if (!hidden) toast(status, reply);
					if (status !== 200) return;
					storage(key, value);
					self.publish(key, value, hidden);
					// 	toast(status, 'Setting "' + key + '" saved.');
					// 	reply.text = 'Setting "' + key + '" saved.';
					// 	self.displayStatus(reply);
				}
			});

		},

		publish: function(setting, value, hidden) {

			if (setting == 'editor.ligatures') {
				atheos.editor.setCodeLigatures(value);
			} else if (setting == 'editor.keyboardHandler') {
				atheos.keybind.setGlobalKeyboard(value);

			} else if (setting.startsWith('editor.')) {
				let option = setting.replace('editor.', '');
				atheos.editor.setOption(option, value);
			} else {
				switch (setting) {
					case 'editor.loopBehavior':
						atheos.editor.loopBehavior = value;
						break;
					case 'filetree.showHidden':
						if (atheos.filetree.showHidden !== value) {
							atheos.filetree.showHidden = value;
							atheos.filetree.rescan();
						}
						break;
					case 'filetree.openTrigger':
						atheos.filetree.openTrigger = value;
						break;
					case 'project.openTrigger':
						atheos.project.openTrigger = value;
						break;
					case 'sidebars.leftTrigger':
						atheos.sidebars.sbLeft.trigger = value;
						break;
					case 'sidebars.rightTrigger':
						atheos.sidebars.sbRight.trigger = value;
						break;
					case 'toast.location':
						atheos.toast.setLocation(value);
						break;
					case 'output.location':
						atheos.output.setLocation(value);
						break;
				}
			}
			value = isNumber(value) ? parseInt(value, 10) : value;
			if (setting.includes('toast.stay')) {
				let key = setting.split('.').pop();
				atheos.toast.stayTimes[key] = value;
			}

			if (setting.includes('output.stay')) {
				let key = setting.split('.').pop();
				atheos.output.stayTimes[key] = value;
			}

			carbon.publish('settings.saved');
		},

		//////////////////////////////////////////////////////////////////////80
		// Display Save Status
		//////////////////////////////////////////////////////////////////////80
		displayStatus: debounce(function(reply) {
			atheos.toast.show(reply);
		}, 1000),

		//////////////////////////////////////////////////////////////////////80
		// Show Setting Dialog
		//////////////////////////////////////////////////////////////////////80
		show: function(dataFile) {
			atheos.modal.load(800, {
				target: 'settings',
				action: 'openDialog',
				callback: function() {
					if (typeof(dataFile) === 'string') {
						self.showTab(dataFile);
					} else {
						self.loadTabValues();
					}
				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Show Datafile Tab
		//////////////////////////////////////////////////////////////////////80
		showTab: function(target) {
			self.save(false);

			var dest = target.attr('data-panel') || target.attr('data-file');

			if (target.attr('data-panel')) {
				echo({
					url: atheos.dialog,
					data: {
						target: 'settings',
						action: 'loadPanel',
						panel: dest
					},
					success: function(reply) {
						oX('.settings menu .active').removeClass('active');
						oX('.settings menu a[data-panel="' + dest + '"]').addClass('active');
						oX('.settings panel').html(reply);
						self.loadTabValues();
					}
				});

			} else if (target.attr('data-file')) {
				echo({
					url: dest,
					success: function(reply) {
						oX('.settings panel').html(reply);
						self.loadTabValues(dataFile);
					}
				});
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Load Settings of Specific Tab
		//////////////////////////////////////////////////////////////////////80
		loadTabValues: function() {
			var children = oX('.settings panel').findAll('[data-setting]');
			children.forEach(function(child) {
				var key = oX(child).attr('data-setting'),
					type = child.type,
					value = storage(key);

				if (value === null) {
					return;
				}

				if (type === 'radio') {
					if (child.value() === value.toString()) {
						child.prop('checked', true);
					}
				} else if (type === 'checkbox') {
					child.prop('checked', value);
				} else {
					child.value(value);
				}
			});
		}
	};
	carbon.subscribe('system.loadMajor', () => self.init());
	atheos.settings = self;

})();