//////////////////////////////////////////////////////////////////////////////80
// System
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Description: 
// The System Module initializes the core Atheos object and puts the engine in
// motion, calling the initilization of other modules, and publishing the
// Amplify 'system.load[]' events.
//
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {


	var atheos = global.atheos = {},
		amplify = global.amplify;

	//////////////////////////////////////////////////////////////////////
	// Init
	//////////////////////////////////////////////////////////////////////
	document.addEventListener('DOMContentLoaded', function() {

		//Synthetic Login Overlay
		if (document.querySelector('#login')) {
			global.synthetic.init();
			atheos.user.init();
		} else if (document.querySelector('#installer')) {
			global.synthetic.init();
			atheos.install.init();

		} else {
			// Atheos has three levels of priority loading:
			//	Critical components should load on major
			//	Features should load on minor
			//	Plugins should load on extra
			amplify.publish('system.loadMajor');
			amplify.publish('system.loadMinor');
			amplify.publish('system.loadExtra');

			// Settings are initialized last in order to ensure all listeners are attached
			atheos.settings.init();
		}
	});

})(this);