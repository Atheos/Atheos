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

		baseUrl: window.location.href,
		controller: 'controller.php',
		dialog: 'dialog.php',

		current: {
			projectName: '',
			projectPath: '',
			focusedEditor: '',
			focusedSession: ''
		},

		//////////////////////////////////////////////////////////////////////80
		// Initializes Atheos
		//////////////////////////////////////////////////////////////////////80
		init: function() {
			window.addEventListener('error', atheos.error);
			if (running) return;
			running = true;

			echo.setGlobalDest(atheos.controller);

			// Atheos has three levels of priority loading:
			//	Vital loads no matter what, always first
			//	Critical components should load on major
			//	Features should load on minor
			//	Plugins should load on extra
			carbon.publish('system.loadVital');

			// User is logged in
			if (!(oX('#login').exists() || oX('#installer').exists())) {
				atheos.restoreState();


			} else {
				Myth.init();
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
		},

		//////////////////////////////////////////////////////////////////////80
		// Loads users last state in a single request
		//////////////////////////////////////////////////////////////////////80
		restoreState: function() {
			carbon.publish('system.loadMajor');
			carbon.publish('system.loadMinor');
			carbon.publish('system.loadExtra');

			echo({
				data: {
					target: 'core',
					action: 'loadState'
				},
				settled: function(reply, status) {
					// 	atheos.toast.show(reply);
					if (status !== 200) return;
					var logSpan = oX('#last_login');
					if (reply.lastLogin && logSpan) {
						logSpan.find('span').text(reply.lastLogin);
					}

					if (reply.state) {
						atheos.filetree.rescanChildren = reply.state;
					}
					atheos.current.projectPath = reply.projectPath;
					atheos.current.projectName = reply.projectName;
					atheos.current.projectIsRepo = reply.projectIsRepo;

					atheos.settings.processSettings(reply.settings);

					atheos.filetree.setRoot();
					atheos.editor.openFiles(reply.openFiles);

				}
			});
		}
	};

	//////////////////////////////////////////////////////////////////////////80
	// Document listener
	//////////////////////////////////////////////////////////////////////////80
	document.addEventListener('DOMContentLoaded', atheos.init);

})();