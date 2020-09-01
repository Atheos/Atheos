//////////////////////////////////////////////////////////////////////////////80
// i18n Init
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';

	var atheos = global.atheos;

	var self = null;

	atheos.i18n = {

		cache: {},

		//////////////////////////////////////////////////////////////////////80
		// Initilization
		//////////////////////////////////////////////////////////////////////80
		init: function() {
			self = this;

			window.i18n = Function.prototype.bind.call(atheos.i18n.translate);
			echo({
				url: atheos.controller,
				data: {
					target: 'i18n',
					action: 'init'
				},
				success: function(reply) {
					if (reply.status === 'error') {
						return;
					}
					self.cache = reply.cache;
				}
			});
		},

		//////////////////////////////////////////////////////////////////
		// Download Archive
		//////////////////////////////////////////////////////////////////
		translate: function(string, args) {
			if (!self.cache) {
				return string;
			}
			let result = string in self.cache ? self.cache[string] : string;
			return args ? result.replace('%s', args) : result;
		}
	};

})(this);