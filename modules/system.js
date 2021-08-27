//////////////////////////////////////////////////////////////////////////////80
// System
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Description: 
// The System Module initializes the core Atheos object and puts the engine in
// motion, calling the initilization of other modules, and publishing the
// Amplify 'system.load[]' events.
//////////////////////////////////////////////////////////////////////////////80
// Suggestions:
//	Better customization of modifer keys
//////////////////////////////////////////////////////////////////////////////80

(function() {
	let running = false;

	window.atheos = {

		path: window.location.href,
		controller: 'controller.php',
		dialog: 'dialog.php',

		//////////////////////////////////////////////////////////////////////80
		// Initializes Atheos
		//////////////////////////////////////////////////////////////////////80
		init: function() {
			window.addEventListener('error', atheos.error);
			if (running) return;
			running = true;

			// Atheos has three levels of priority loading:
			//	Vital loads no matter what, always first
			//	Critical components should load on major
			//	Features should load on minor
			//	Plugins should load on extra
			carbon.publish('system.loadVital');

			// User is logged in
			if (!(oX('#login').exists() || oX('#installer').exists())) {
				carbon.publish('system.loadMajor');
				carbon.publish('system.loadMinor');
				carbon.publish('system.loadExtra');
				// Settings are initialized last in order to ensure all listeners are attached
				atheos.settings.init();

			} else {
				Synthetic.init();
				if (oX('#installer').exists()) {
					// Atheos hasn't been installed yet
					atheos.install.init();
				} else {
					// Atheos is installed, user is logging in
					atheos.user.init();
				}
			}

			log([
				'   _____   __   __                        ',
				'  /  _  \\_/  |_|  |__   ____  ____  ______',
				' /  /_\\  \\   __\\  |  \\_/ __ \\/  _ \\/  ___/',
				'/    |    \\  | |   Y  \\  ___(  <_> )___ \\ ',
				'\\____|__  /__| |___|  /\\___  >____/____  >',
				'        \\/          \\/     \\/          \\/ '
			].join('\n'));
		}
	};

	//////////////////////////////////////////////////////////////////////////80
	// Document listener
	//////////////////////////////////////////////////////////////////////////80
	document.addEventListener('DOMContentLoaded', atheos.init);

})();
