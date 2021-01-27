//////////////////////////////////////////////////////////////////////////////80
// Chronometer
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Description: 
// The Chronometer Module sets global intervals that are published through
// Amplify subscriptions; allowing the client browser to only have a select few
// Intervals running while providing plugins the ability to use timed events.
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80


(function(global) {

	var atheos = global.atheos,
		carbon = global.carbon;

	var self = null;

	carbon.subscribe('system.loadMinor', () => atheos.chrono.init());

	atheos.chrono = {

		kilo: '',
		mega: '',
		giga: '',

		init: function() {
			self = this;
			self.kilo = setInterval(function() {
				carbon.publish('chrono.kilo');
			}, 1000);
			self.mega = setInterval(function() {
				carbon.publish('chrono.mega');
			}, 10000);
			self.giga = setInterval(function() {
				carbon.publish('chrono.giga');
			}, 100000);
		},
	};
}(this));