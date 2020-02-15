//////////////////////////////////////////////////////////////////////////////80
// Chronometer
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Description: 
// The Chronometer Module sets global intervals that are published through
// Amplify subscriptions; allowing the client browser to only have a select few
// Intervals running while providing plugins the ability to use timed events.
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80
 

(function(global) {

	var atheos = global.atheos,
		amplify = global.amplify;

	amplify.subscribe('atheos.loaded', function() {
		atheos.chrono.init();
	});
	
	atheos.chrono = {

		kilo: '',
		mega: '',
		giga: '',

		init: function() {
			console.log('Chronometer Initialized');
			var chrono = this;
			kilo = setInterval(function() {
				amplify.publish('chrono.kilo');
			}, 1000);
			mega = setInterval(function() {
				amplify.publish('chrono.mega');
			}, 10000);
			giga = setInterval(function() {
				amplify.publish('chrono.giga');
			}, 100000);

		},


	};

}(this));