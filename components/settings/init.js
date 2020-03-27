/*jshint esversion: 6 */

//////////////////////////////////////////////////////////////////////////////80
// Settings
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function(global, $) {
	'use strict';

	var atheos = global.atheos,
		amplify = global.amplify,
		oX = global.onyx,
		storage = atheos.storage;

	var self = null;


	amplify.subscribe('atheos.loaded', () => atheos.settings.init());

	atheos.settings = {

		controller: 'components/settings/controller.php',
		dialog: 'components/settings/dialog.php',

		init: function() {
			self = this;
			/*
				*  Storage Event:
				*  Note: Event fires only if change was made in different window and not in this one
				*  Details: http://dev.w3.org/html5/webstorage/#dom-localstorage
				*  Reason: If a user has multiple Atheos windows open, all using the same local storage,
				*  	and makes settings changes, using an iFrame will allow Atheos to detect those
				*		changes. I think. It doesn't exactly make sense honestly, but that's my only guess.
				*  
				*  Workaround for Storage-Event:
				*/
			$('body').append('<iframe src="components/settings/dialog.php?action=iframe"></iframe>');


			oX('#settings_open').on('click', function() {
				atheos.settings.show();
			});
			this.load();
		},


		publish: function(setting, value) {

			var boolean = (value === 'true');
			var int = (!isNaN(parseFloat(value)) && isFinite(value)) ? parseInt(value, 10) : 0;

			if (value === null) {
				atheos.toast.alert("You Must Choose A Value");
				return;
			} else {
				switch (setting) {
					case 'editor.theme':
						atheos.editor.setTheme(value);
						break;
					case 'editor.fontSize':
						atheos.editor.setFontSize(value);
						break;
					case 'editor.highlightLine':
						atheos.editor.setHighlightLine(value);
						break;
					case 'editor.indentGuides':
						atheos.editor.setIndentGuides(boolean);
						break;
					case 'editor.printMargin':
						atheos.editor.setPrintMargin(boolean);
						break;
					case 'editor.printMarginColumn':
						atheos.editor.setPrintMarginColumn(int);
						break;
					case 'editor.wrapMode':
						atheos.editor.setWrapMode(boolean);
						break;
					case 'editor.rightSidebarTrigger':
						atheos.editor.setRightSidebarTrigger(boolean);
						break;
					case 'editor.fileManagerTrigger':
						atheos.editor.setFileManagerTrigger(boolean);
						break;
					case 'editor.persistentModal':
						atheos.editor.setPersistentModal(boolean);
						break;
					case 'editor.softTabs':
						atheos.editor.setSoftTabs(boolean);
						break;
					case 'editor.tabSize':
						atheos.editor.setTabSize(value);
						break;
				}
			}
		},

		//////////////////////////////////////////////////////////////////
		// Save Settings
		//////////////////////////////////////////////////////////////////
		save: function(target) {
			if (target) {
				var setting = target.attr('data-setting');
				var value = target.value();
				self.publish(setting, value);
			} else {
				var settings = {};
				var systemRegex = /^atheos/;
				var pluginRegex = /^atheos.plugin/;


				var syncSystem = storage('syncSystem');
				var syncPlugin = storage('syncPlugin');

				var panel = oX('#settings #panel_view');

				if (syncSystem || syncPlugin) {
					for (var i = 0; i < localStorage.length; i++) {
						var key = localStorage.key(i);
						if (systemRegex.test(key) && !pluginRegex.test(key) && syncSystem) {
							settings[key] = localStorage.getItem(key);
						}
						if (pluginRegex.test(key) && syncPlugin) {
							settings[key] = localStorage.getItem(key);
						}
					}
				}

				// atheos.common.serialize(panel);

				settings.syncSystem = syncSystem;
				settings.syncPlugin = syncPlugin;

				// console.log(settings);

				$.post(self.controller + '?action=save', {
					settings: JSON.stringify(settings)
				}, function(data) {
					var parsed = atheos.jsend.parse(data);
				});

				amplify.publish('settings.save');

			}

		},

		//////////////////////////////////////////////////////////////////
		// Load Settings
		//////////////////////////////////////////////////////////////////

		load: function() {
			$.get(self.controller + '?action=load', function(data) {
				var parsed = atheos.jsend.parse(data);
				if (parsed !== 'error') {
					$.each(parsed, function(i, item) {
						localStorage.setItem(i, item);
					});
					amplify.publish('settings.loaded', parsed);
				}
			});
		},

		//////////////////////////////////////////////////////////////////
		//
		// Show Settings Dialog
		//
		//  Parameter
		//
		//  dataFile - {String} - Location of settings file based on BASE_URL
		//
		//////////////////////////////////////////////////////////////////

		show: function(dataFile) {
			var listener = function() {
				oX('#modal_wrapper').on('change', function(e) {
					var target = oX(e.target);
					var tagName = target.el.tagName;
					var type = target.el.type;
					if (tagName === 'SELECT' || (tagName === 'INPUT' && type === 'checkbox')) {
						self.save(target);
					}
				});

				oX('#panel_menu').on('click', function(e) {
					var target = oX(e.target);
					var tagName = target.el.tagName;
					if (tagName === 'A') {
						self.showTab(target.attr('data-file'));
					}
				});

				$('.settings-view .config-menu li').click(function() {});

				if (typeof(dataFile) == 'string') {
					self.showTab(dataFile);
				} else {
					self.loadTabValues('components/settings/settings.editor.php');
				}
			};
			amplify.subscribe('modal.loaded', listener);
			atheos.modal.load(800, self.dialog + '?action=settings');

		},

		//////////////////////////////////////////////////////////////////
		//
		// {Private} Show Specific Tab
		//
		//  Parameter
		//
		//  dataFile - {String} - Location of settings file based on BASE_URL
		//
		//////////////////////////////////////////////////////////////////

		showTab: function(dataFile) {
			if (typeof(dataFile) === 'string') {

				self.save(false);

				oX('#panel_menu .active').removeClass('active');
				oX('#panel_menu a[data-file="' + dataFile + '"]').addClass('active');

				oX('#panel_view').empty();

				//Load panel
				// $('#settings panel_view').append('<div class="panel active" data-file="' + dataFile + '"></div>');
				$('#panel_view').load(dataFile, function() {
					//TODO Show and hide loading information
					self.loadTabValues(dataFile);
				});

			}
		},

		//////////////////////////////////////////////////////////////////
		//
		// {Private} Load Settings of Specific Tab
		//
		//  Parameter
		//
		//  dataFile - {String} - Location of settings file based on BASE_URL
		//
		//////////////////////////////////////////////////////////////////
		loadTabValues: function(dataFile) {
			//Load settings
			var key, value;
			$('.settings-view .panel[data-file="' + dataFile + '"] .setting').each(function(i, item) {
				key = $(item).attr('data-setting');
				value = localStorage.getItem(key);
				if (value !== null) {
					$(item).val(value);
				}
			});
		}
	};

})(this, jQuery);