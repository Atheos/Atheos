/*
	*  Copyright (c) atheos, distributed
	*  as-is and without warranty under the MIT License. See
	*  [root]/license.txt for more. This information must remain intact.
	*/

(function(global, $) {
	var atheos = global.atheos,
		amplify = global.amplify,
		o = global.onyx;


	amplify.subscribe('atheos.loaded', function(settings) {
		atheos.settings.init();
	});

	atheos.settings = {

		controller: 'components/settings/controller.php',

		init: function() {
			/*
				*  Storage Event:
				*  Note: Event fires only if change was made in different window and not in this one
				*  Details: http://dev.w3.org/html5/webstorage/#dom-localstorage
				*  
				*  Workaround for Storage-Event:
				*/
			$('body').append('<iframe src="components/settings/dialog.php?action=iframe"></iframe>');
			$('#settings_open').on('click', function() {
				atheos.settings.show();
			});
			this.load();

		},

		liveChange: function(target) {

			var setting = target.attr('data-setting');

			var value = target.value();
			var boolean = (value === 'true');
			var int = (!isNaN(parseFloat(value)) && isFinite(value)) ? parseInt(value, 10) : 0;

			console.log(setting);

			if (value === null) {
				atheos.toast.alert("You Must Choose A Value");
				return;
			} else {
				switch (setting) {
					case 'atheos.editor.theme':
						atheos.editor.setTheme(value);
						break;
					case 'atheos.editor.fontSize':
						atheos.editor.setFontSize(value);
						break;
					case 'atheos.editor.highlightLine':
						atheos.editor.setHighlightLine(value);
						break;
					case 'atheos.editor.indentGuides':
						atheos.editor.setIndentGuides(boolean);
						break;
					case 'atheos.editor.printMargin':
						atheos.editor.setPrintMargin(boolean);
						break;
					case 'atheos.editor.printMarginColumn':
						atheos.editor.setPrintMarginColumn(int);
						break;
					case 'atheos.editor.wrapMode':
						atheos.editor.setWrapMode(boolean);
						break;
					case 'atheos.editor.rightSidebarTrigger':
						atheos.editor.setRightSidebarTrigger(boolean);
						break;
					case 'atheos.editor.fileManagerTrigger':
						atheos.editor.setFileManagerTrigger(boolean);
						break;
					case 'atheos.editor.persistentModal':
						atheos.editor.setPersistentModal(boolean);
						break;
					case "atheos.editor.softTabs":
						atheos.editor.setSoftTabs(boolean);
						break;
					case "atheos.editor.tabSize":
						atheos.editor.setTabSize(value);
						break;
				}
			}
		},

		//////////////////////////////////////////////////////////////////
		// Save Settings
		//////////////////////////////////////////////////////////////////
		save: function(notify) {
			var key, settings = {};
			var systemRegex = /^atheos/;
			var pluginRegex = /^atheos.plugin/;


			var syncSystem = (localStorage.getItem('atheos.settings.system.sync') === "true");
			var syncPlugin = (localStorage.getItem('atheos.settings.plugin.sync') === "true");
			
			var panel = o('#settings #panel_view');

			if (syncSystem || syncPlugin) {
				for (var i = 0; i < localStorage.length; i++) {
					key = localStorage.key(i);
					if (systemRegex.test(key) && !pluginRegex.test(key) && syncSystem) {
						settings[key] = localStorage.getItem(key);
					}
					if (pluginRegex.test(key) && syncPlugin) {
						settings[key] = localStorage.getItem(key);
					}
				}
			}

			settings['atheos.settings.system.sync'] = syncSystem;
			settings['atheos.settings.plugin.sync'] = syncPlugin;

			$.post(this.controller + '?action=save', {
				settings: JSON.stringify(settings)
			}, function(data) {
				parsed = atheos.jsend.parse(data);
			});

			/* Notify listeners */
			if (notify) {
				amplify.publish('settings.save');
			}

		},
		
		saveOld: function(notify) {
			var key, settings = {};
			var systemRegex = /^atheos/;
			var pluginRegex = /^atheos.plugin/;


			var syncSystem = (localStorage.getItem('atheos.settings.system.sync') === "true");
			var syncPlugin = (localStorage.getItem('atheos.settings.plugin.sync') === "true");

			if (syncSystem || syncPlugin) {
				for (var i = 0; i < localStorage.length; i++) {
					key = localStorage.key(i);
					if (systemRegex.test(key) && !pluginRegex.test(key) && syncSystem) {
						settings[key] = localStorage.getItem(key);
					}
					if (pluginRegex.test(key) && syncPlugin) {
						settings[key] = localStorage.getItem(key);
					}
				}
			}

			settings['atheos.settings.system.sync'] = syncSystem;
			settings['atheos.settings.plugin.sync'] = syncPlugin;

			$.post(this.controller + '?action=save', {
				settings: JSON.stringify(settings)
			}, function(data) {
				parsed = atheos.jsend.parse(data);
			});

			/* Notify listeners */
			if (notify) {
				amplify.publish('settings.save');
			}

		},

		//////////////////////////////////////////////////////////////////
		// Load Settings
		//////////////////////////////////////////////////////////////////

		load: function() {
			$.get(this.controller + '?action=load', function(data) {
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
			var settings = this;
			atheos.modal.load(800, 'components/settings/dialog.php?action=settings');

			atheos.modal.ready.then(function() {

				o('#modal_wrapper').on('change', function(e) {
					var target = o(e.target);
					var tagName = target.el.tagName;
					var type = target.el.type;
					if (tagName === 'SELECT' || (tagName === 'INPUT' && type === 'checkbox')) {
						settings.liveChange(target);
						settings.save(false);
					}
				});

				o('#panel_menu').on('click', function(e) {
					var target = o(e.target);
					var tagName = target.el.tagName;
					if (tagName === 'A') {
						settings.showTab(target.attr('data-file'));
					}
				});


				$('.settings-view .config-menu li').click(function() {});


				if (typeof(dataFile) == 'string') {
					settings.showTab(dataFile);
				} else {
					settings.loadTabValues('components/settings/settings.editor.php');
				}
				/* Notify listeners */
				amplify.publish('settings.dialog.show', {});
			});
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
			var settings = this;
			if (typeof(dataFile) === 'string') {

				settings.save(false);

				o('#panel_menu .active').removeClass('active');
				o('#panel_menu a[data-file="' + dataFile + '"]').addClass('active');

				o('#panel_view').empty();

				//Load panel
				// $('#settings panel_view').append('<div class="panel active" data-file="' + dataFile + '"></div>');
				$('#panel_view').load(dataFile, function() {
					//TODO Show and hide loading information
					/* Notify listeners */
					var name = $('.settings-view .config-menu li[data-file="' + dataFile + '"]').attr('data-name');
					amplify.publish('settings.dialog.tab_loaded', name);
					settings.loadTabValues(dataFile);
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