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
// Amplify 'atheos.loaded' event.
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
		} else {

			var verbose = false;

			atheos.alert.init(verbose);
			atheos.chrono.init(verbose);
			// atheos.common.init(verbose);
			atheos.keybind.init(verbose);
			atheos.modal.init(verbose);
			atheos.sidebars.init(verbose);
			atheos.toast.init(verbose);

			amplify.publish('atheos.plugins');

			atheos.codiad.init();

		}
		amplify.publish('atheos.loaded');
	});

})(this);