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

			carbon.subscribe('settings.loaded, settings.save', function() {
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

			carbon.subscribe('active.save', self.delete);
			carbon.subscribe('active.open', self.check);
		},

		autosave: function() {
			if (!self.enabled || self.saving.length > 0) return;

			var changedTabs = atheos.active.unsavedChanges();
			if (!changedTabs) return;

			changedTabs.forEach(function(path) {
				let session = atheos.active.sessions[path];
				if (session.autosaved) return;
				self.save(session);
			});
		},

		check: function(path) {
			echo({
				data: {
					target: 'draft',
					action: 'check',
					path: path
				},
				settled: function(status, reply) {
					if (status !== 'success') return;

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
			let session = atheos.active.sessions[path];
			
			if(!session) return;

			echo({
				data: {
					target: 'draft',
					action: 'open',
					path: path
				},
				settled: function(status, reply) {
					if (status !== 'success') return;
					session.setValue(reply.content, 1);
				}
			});
		},

		save: function(session) {
			self.saving.push[session.path];

			let content = session.getValue();

			echo({
				data: {
					target: 'draft',
					action: 'save',
					path: session.path,
					content
				},
				settled: function(status, reply) {
					if (status !== 'success') return;


					let index = self.saving.indexOf(session.path);
					self.saving = self.saving.splice(index, 1);
					session.autosaved = true;

					if (self.verbose && self.saving.length === 0) {
						atheos.toast.show('success', 'Autosave to draft complete.');
					}

				}
			});
		}
	};
})(this);