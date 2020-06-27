/*jshint esversion: 6 */

//////////////////////////////////////////////////////////////////////////////80
// i18n Init
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';

	var atheos = global.atheos,
		amplify = global.amplify,
		echo = global.echo,
		oX = global.onyx;

	var self = null;

	// amplify.subscribe('system.loadMajor', () => atheos.i18n.init());

	atheos.i18n = {

		controller: 'components/i18n/controller.php',
		dialog: 'components/i18n/dialog.php',
		cache: {},

		//////////////////////////////////////////////////////////////////////80
		// Initilization
		//////////////////////////////////////////////////////////////////////80
		init: function() {
			self = this;

			window.i18n = Function.prototype.bind.call(atheos.i18n.translate);

			// return new Promise(resolve => {

			echo({
				url: self.controller,
				data: {
					action: 'init'
				},
				success: function(reply) {
					if (reply.status === 'error') {
						return;
					}
					self.cache = reply.cache;
					// resolve(self);
				}
			});
			// });
		},

		//////////////////////////////////////////////////////////////////////80
		// Initilization
		//////////////////////////////////////////////////////////////////////80
		loadRaw: function(lang) {
			echo({
				url: self.controller,
				data: {
					action: 'show',
					lang
				},
				success: function(reply) {
					if (reply.status === 'success') {
						log(reply.data);

					}
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

// function vsprintf(string, args) {
// 	args = 
// }