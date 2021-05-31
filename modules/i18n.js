//////////////////////////////////////////////////////////////////////////////80
// i18n Init
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';

	const node = {

		cache: {},

		//////////////////////////////////////////////////////////////////////80
		// Initilization
		//////////////////////////////////////////////////////////////////////80
		init: function() {
			window.i18n = Function.prototype.bind.call(node.translate);
			echo({
				data: {
					target: 'i18n',
					action: 'init'
				},
				settled: function(status, reply) {
					if (status !== 'success') return;
					node.cache = reply.cache;
				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Translate
		//////////////////////////////////////////////////////////////////////80
		translate: function(string, args) {
			if (!node.cache) return string;

			let result = string in node.cache ? node.cache[string] : string;
			return args ? result.replace('%s', args) : result;
		}
	};

	carbon.subscribe('system.loadVital', () => node.init());
	atheos.i18n = node;

})();