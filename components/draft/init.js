//////////////////////////////////////////////////////////////////////////////80
// Draft Init
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Isaac Brown, @basilgohar, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';

	var atheos = global.atheos;

	var self = null;

	carbon.subscribe('system.loadMinor', () => atheos.draft.init());

	atheos.draft = {

		enabled: true,
		interval: 300000,
		verbose: false,

		throttle: null,

		saving: [],

		init: function() {
			self = this;

			carbon.subscribe('settings.loaded, settings.saved', function() {
				self.enabled = storage('draft.enabled') === false ? false : self.enabled;
				self.verbose = storage('draft.verbose') === true ? true : self.verbose;
				
				let interval = storage('draft.interval');
				interval = isNumber(interval) ? interval : self.interval;
				if (isFunction(self.throttle)) {
					carbon.unsubscribe('chrono.kilo', self.throttle);
				}

				self.throttle = throttle(self.autosave, interval);
				carbon.subscribe('chrono.kilo', self.throttle);
			});

			carbon.subscribe('editor.saved', self.delete);
			carbon.subscribe('active.open', self.check);
		},

		autosave: function() {
			if (!self.enabled || self.saving.length > 0) return;

			let changedPaths = atheos.editor.getChangedPaths();
			if (!changedPaths.length) return;

			changedPaths.forEach(function(path) {
				let file = atheos.editor.getFile(path);
				if (file.autosaved) return;
				self.save(file);
			});
		},

		check: function(path) {
			echo({
				data: {
					target: 'draft',
					action: 'check',
					path: path
				},
				settled: function(reply, status) {
					if (status !== 200) return;

					atheos.alert.show({
						banner: 'Draft found!',
						data: path,
						message: 'Would you like to load the draft file instead?\n\n' +
							'Either option will delete the draft on the server.',
						actions: {
							'Load Draft': function() {
								self.open(path);
							},
							'Discard Draft': function() {
								self.delete(path);
							}
						}
					});

				}
			});
		},

		delete: function(path) {
			echo({
				data: {
					target: 'draft',
					action: 'delete',
					path: path
				}
			});
		},

		open: function(path) {
			let file = atheos.editor.getFile(path);
			
			if(!file) return;

			echo({
				data: {
					target: 'draft',
					action: 'open',
					path: path
				},
				settled: function(reply, status) {
					if (status !== 200) return;
					file.aceSession.setValue(reply.content, 1);
					atheos.editor.markChanged(path);
					atheos.editor.focusOnFile(path);
				}
			});
		},

		save: function(file) {
			self.saving.push[file.path];

			let content = file.aceSession.getValue();

			echo({
				data: {
					target: 'draft',
					action: 'save',
					path: file.path,
					content
				},
				settled: function(reply, status) {
					if (status !== 200) return;


					let index = self.saving.indexOf(file.path);
					self.saving = self.saving.splice(index, 1);
					file.autosaved = true;

					if (self.verbose && self.saving.length === 0) {
						atheos.toast.show('success', 'Autosave to draft complete.');
					}

				}
			});
		}
	};
})(this);