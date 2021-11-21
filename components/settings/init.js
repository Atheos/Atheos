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
			echo({
				url: atheos.controller,
				data: {
					target: 'settings',
					action: 'load',
				},
				settled: function(status, reply) {
					if (status === 'success') {
						for (var key in reply) {
							storage(key, reply[key]);
						}
					}
					carbon.publish('settings.loaded', reply);
				}
			});

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
					storage(key, value);
					self.save(key, value);
					self.publish(key, value);
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
		},

		publish: function(setting, value) {
			var boolean = (value === 'true');

			if (value === null) {
				return toast('alert', 'You must choose a value');
			}

			switch (setting) {
				case 'active.loopBehavior':
					atheos.active.loopBehavior = value;
					break;

				case 'editor.theme':
					atheos.editor.setTheme(value);
					break;
				case 'editor.fontSize':
					atheos.editor.setFontSize(value);
					break;
				case 'editor.ligatures':
					atheos.editor.setCodeLigatures(boolean);
					break;
				case 'editor.highlightActiveLine':
					atheos.editor.setHighlightActiveLine(value);
					break;
				case 'editor.showPrintMargin':
					atheos.editor.setShowPrintMargin(value);
					break;
				case 'editor.printMarginColumn':
					atheos.editor.setPrintMarginColumn(value);
					break;
				case 'editor.displayIndentGuides':
					atheos.editor.setDisplayIndentGuides(value);
					break;

				case 'editor.showFoldWidgets':
					atheos.editor.setShowFoldWidgets(value);
					break;
				case 'editor.useWrapMode':
					atheos.editor.setUseWrapMode(value);
					break;
				case 'editor.useSoftTabs':
					atheos.editor.setUseSoftTabs(value);
					break;
				case 'editor.tabSize':
					atheos.editor.setTabSize(value);
					break;

				case 'filemanager.showHidden':
					if (atheos.filemanager.showHidden !== boolean) {
						atheos.filemanager.showHidden = boolean;
						atheos.filemanager.rescan();
					}
					break;
				case 'filemanager.openTrigger':
					atheos.filemanager.openTrigger = value;
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

			value = isNumber(value) ? parseInt(value, 10) : value;
			if (setting.includes('toast.stay')) {
				let key = setting.split('.').pop();
				atheos.toast.stayTimes[key] = value;
			}

			if (setting.includes('output.stay')) {
				let key = setting.split('.').pop();
				atheos.output.stayTimes[key] = value;
			}

		},

		//////////////////////////////////////////////////////////////////////80
		// Save Settings
		//////////////////////////////////////////////////////////////////////80
		save: function(key, value, hidden) {
			if (!key || (typeof(value) === 'undefined')) {
				return;
			}

			echo({
				url: atheos.controller,
				data: {
					target: 'settings',
					action: 'save',
					key,
					value
				},
				settled: function(status, reply) {
					if (status !== 'success') toast(status, reply);
					if (hidden) return;
					// self.displayStatus(reply);
					toast(status, 'Setting "' + key + '" saved.');

				}
			});

			carbon.publish('settings.save');
		},

		//////////////////////////////////////////////////////////////////////80
		// Save Settings
		//////////////////////////////////////////////////////////////////////80
		saveAll: function(key, value, hidden) {
			var children = oX('.settings panel').findAll('[data-setting]');
			children.forEach(function(child) {
				var key = oX(child).attr('data-setting'),
					value = storage(key);

				if (value === null) {
					return;
				}

				if (child.type === 'radio' || child.type === 'checkbox') {
					if (child.value() === value.toString()) {
						child.prop('checked', true);
					}
				} else {
					child.value(value);

				}
			});

			echo({
				url: atheos.controller,
				data: {
					target: 'settings',
					action: 'save',
					key,
					value
				},
				success: function(reply) {
					if (reply.status === 'error') {
						atheos.toast.show(reply);
					} else if (!hidden) {
						reply.text = 'Setting "' + key + '" saved.';
						self.displayStatus(reply);
					}
				}
			});

			carbon.publish('settings.save');
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
		}
	};

	atheos.settings = self;

})();