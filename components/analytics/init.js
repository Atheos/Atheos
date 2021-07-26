//////////////////////////////////////////////////////////////////////////////80
// Analytics Init
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';

	const self = {
		home: null,
		data: null,

		//////////////////////////////////////////////////////////////////////80
		// Initilization
		//////////////////////////////////////////////////////////////////////80
		init: function() {
			echo({
				data: {
					target: 'analytics',
					action: 'init'
				},
				settled: function(status, reply) {
					if (status === 'notice') {
						return toast(status, reply);
					} else if (status === 'success') {
						self.home = reply.home;
						self.send(reply.data);
					}
				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Send Analytics to endpoint
		//////////////////////////////////////////////////////////////////////80
		send(data) {
			echo({
				url: self.home,
				data
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Opt In or Out of analytics collection
		//////////////////////////////////////////////////////////////////////80		
		changeOpt(value) {
			echo({
				data: {
					target: 'analytics',
					action: 'changeOpt',
					enabled: value
				},
				settled: function(status, reply) {
					// storage('analytics.enabled', value);
					toast(status, reply);
				}
			});
		}
	};

	carbon.subscribe('system.loadExtra', () => self.init());
	atheos.analytics = self;

})();