//////////////////////////////////////////////////////////////////////////////80
// Market
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Description: 
// The Market component handles all plugin related tasks. Not really much else
// to say about it without repeating myself.
//
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';

	var atheos = global.atheos,
		amplify = global.amplify,
		echo = global.echo,
		oX = global.onyx;

	amplify.subscribe('system.loadMinor', () => atheos.market.init());

	var self = null;

	atheos.market = {

		controller: 'components/market/controller.php',
		dialog: 'components/market/dialog.php',
		home: null,
		cache: null,
		addons: null,

		init: function() {
			self = this;

			echo({
				url: self.controller,
				data: {
					action: 'init'
				},
				success: function(data) {
					self.home = data.market;
					self.cache = data.cache;
					self.addons = data.addons;

					self.loadMarket();
				}
			});
		},

		loadMarket: function() {
			var cache = self.cache,
				oneWeekAgo = Date.now() - (604800000);

			if (!cache || new Date(cache.date) < oneWeekAgo) {
				echo({
					url: self.home,
					success: function(data) {
						self.cache = {
							data: data,
							date: Date.now('YYYY-MM-DD')
						};
						self.saveCache();
					}
				});
			}
			var temp = {};

			if (!cache || !cache.data || !types.isArray(cache.data)) {
				return;
			}
			
			cache.data.forEach(function(plugin) {
				temp[plugin.name] = {
					author: plugin.author,
					name: plugin.name,
					description: plugin.description,
					category: plugin.category,
					status: plugin.status,
					type: plugin.type,
					url: plugin.url,
					version: plugin.version
				};
			});

			// for (var key in self.addons) {
			// 	addon = self.addons[key];

			// 	if (temp.hasOwnProperty(key)) {
			// 		var iVersion = addon.version,
			// 			uVersion = temp[key].version;

			// 		if (self.compareVersions(iVersion, uVersion) < 0) {
			// 			addon = temp[key];
			// 			addon.status = 'updatable';
			// 		}

			// 		delete self.cache[key];
			// 	}
			// }

			self.cache = temp;

		},

		saveCache: function() {
			echo({
				url: self.controller,
				data: {
					action: 'saveCache',
					string: JSON.stringify(self.cache),
					cache: self.cache
				}
			});
		},

		//////////////////////////////////////////////////////////////////
		// Open marketplace
		//////////////////////////////////////////////////////////////////

		list: function(type, note) {
			atheos.modal.load(1000, self.dialog, {
				action: 'list',
				type: type,
				note: note
			});

			var listener = function() {
				self.renderMarket();

				var manualRepo = oX('#manual_repo');

				oX('#manual_install').on('click', function(e) {
					e.preventDefault();
					if (manualRepo.value()) {
						// Install Manually
					}
				});

				manualRepo.on('keypress', function(e) {
					var keyCode = e.keyCode || e.which;
					if (keyCode === '13') {
						e.preventDefault();
						// Install Manually
					}
				});
			};

			amplify.subscribe('modal.loaded', listener);
		},

		//////////////////////////////////////////////////////////////////
		// Render Market
		//////////////////////////////////////////////////////////////////
		renderMarket: function() {
			var market = oX('#market_table');

			var table = `<thead><tr>
				<th>Name</th>
				<th>Description</th>
				<th>Author</th>
				<th>Actions</th>
				</tr></thead>
				`;

			var key, addon, element;

			element = '<tr><td colspan="4"><h2>Installed<h2></td></tr>';
			table += element;


			// log(self.addons);
			// log(self.cache);
			for (key in self.addons) {
				addon = self.addons[key];

				if (self.cache.hasOwnProperty(key)) {
					var iVersion = addon.version,
						uVersion = self.cache[key].version;

					if (self.compareVersions(iVersion, uVersion) < 0) {
						addon = self.cache[key];
						addon.status = 'updatable';
					}

					delete self.cache[key];
				}

				if (addon.status === 'updatable') {
					addon.action = `<a class="fas fa-sync-alt" onclick="atheos.market.update('${key}');return false;"></a>`;
					addon.action += `<a class="fas fa-times-circle" onclick="atheos.market.uninstall('${key}');return false;"></a>`;
				} else {
					addon.action = `<a class="fas fa-times-circle" onclick="atheos.market.uninstall('${key}');return false;"></a>`;
				}

				addon.action += `<a class="fas fa-external-link-alt" onclick="atheos.market.openLink('${key}');return false;"></a>`;


				element = `<tr>
				<td>${addon.name}</td>
				<td>${addon.description}</td>
				<td>${addon.author}</td>
				<td>${addon.action}</td>
				</tr>
				`;

				table += element;
			}

			element = '<tr><td colspan="4"><h2>Available<h2></td></tr>';
			table += element;

			for (key in self.cache) {
				addon = self.cache[key];

				addon.action = `<a class="fas fa-plus-circle" onclick="atheos.market.install('${key}');return false;"></a>`;
				addon.action += `<a class="fas fa-external-link-alt" onclick="atheos.market.openLink('${key}');return false;"></a>`;

				element = `<tr>
				<td>${addon.name}</td>
				<td>${addon.description}</td>
				<td>${addon.author}</td>
				<td>${addon.action}</td>
				</tr>
				`;

				table += element;
			}

			market.html(table);

			// self.addons.forEach(function(addon) {

			// });
		},

		findAddon: function(name) {
			var addon = false;
			if (self.cache.hasOwnProperty(name)) {
				addon = self.cache[name];

			} else if (self.addons.hasOwnProperty(name)) {
				addon = self.addons[name];

			}
			return addon;
		},

		compareVersions: function(v1, v2) {
			// Src: https://helloacm.com/the-javascript-function-to-compare-version-number-strings/
			if (typeof v1 !== 'string') {
				return false;
			}
			if (typeof v2 !== 'string') {
				return false;
			}
			v1 = v1.split('.');
			v2 = v2.split('.');
			const k = Math.min(v1.length, v2.length);
			for (let i = 0; i < k; ++i) {
				v1[i] = parseInt(v1[i], 10);
				v2[i] = parseInt(v2[i], 10);
				if (v1[i] > v2[i]) {
					return 1;
				}
				if (v1[i] < v2[i]) {
					return -1;
				}
			}
			return v1.length === v2.length ? 0 : (v1.length < v2.length ? -1 : 1);
		},



		//////////////////////////////////////////////////////////////////
		// Search marketplace
		//////////////////////////////////////////////////////////////////
		search: function(e, query, note) {
			var key = e.charCode || e.keyCode || e.which;
			if (query !== '' && key === 13) {
				atheos.modal.load(800, self.dialog, {
					action: 'list',
					query: query,
					note: note
				});
			}
		},

		//////////////////////////////////////////////////////////////////
		// Open in browser
		//////////////////////////////////////////////////////////////////                
		openLink: function(name) {
			var addon = self.findAddon(name);
			if (addon) {
				window.open(addon.url, '_newtab');
			}
		},

		//////////////////////////////////////////////////////////////////
		// Install
		//////////////////////////////////////////////////////////////////
		install: function(name, manual) {
			var addon = self.findAddon(name);

			if (!addon) {
				atheos.toast.show('error', 'No Repository URL');
				return;
			}

			atheos.modal.setLoadingScreen('Installing ' + name + '...');

			echo({
				url: self.controller,
				data: {
					action: 'install',
					type: addon.type,
					name: addon.name,
					repo: addon.url
				},
				success: function(data) {
					atheos.toast.show(data);
					atheos.market.list();

				}
			});

		},

		//////////////////////////////////////////////////////////////////
		// Remove
		//////////////////////////////////////////////////////////////////
		remove: function(name) {
			var addon = self.findAddon(name);
			if (!addon) {
				atheos.toast.show('error', 'No Repository URL');
				return;
			}

			atheos.modal.setLoadingScreen('Deleting ' + name + '...');
			echo({
				url: self.controller,
				data: {
					action: 'remote',
					type: addon.type,
					name: addon.name
				},
				success: function(data) {
					atheos.toast.show(data);
					atheos.market.list();
				}
			});
		},

		//////////////////////////////////////////////////////////////////
		// Update
		//////////////////////////////////////////////////////////////////
		update: function(name) {
			var addon = self.findAddon(name);
			if (!addon) {
				atheos.toast.show('error', 'No Repository URL');
				return;
			}

			atheos.modal.setLoadingScreen('Updating ' + name + '...');

			echo({
				url: self.controller,
				data: {
					action: 'update',
					type: addon.type,
					name: addon.name,
					repo: addon.url
				},
				success: function(data) {
					atheos.toast.show(data);
					atheos.market.list();

				}
			});
		},
	};
})(this);