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
		amplify = global.amplify,
		o = global.onyx;

	//////////////////////////////////////////////////////////////////////
	// Init
	//////////////////////////////////////////////////////////////////////
	document.addEventListener('DOMContentLoaded', function() {

		//Synthetic Login Overlay
		if (document.querySelector('#login')) {
			global.synthetic.init();
			amplify.publish('atheos.loaded');
		} else {
			var verbose = false;

			atheos.alert.init(verbose);
			atheos.chrono.init(verbose);
			atheos.helpers.init(verbose);
			atheos.keybind.init(verbose);
			atheos.modal.init(verbose);
			atheos.sidebars.init(verbose);
			atheos.storage.init(verbose);
			atheos.toast.init(verbose);

			amplify.publish('atheos.loaded');
			amplify.publish('atheos.plugins');
			
			atheos.codiad.init();

			window.addEventListener('resize', function() {
				var handleWidth = 10;

				var marginL, reduction;
				if (o('#sb-left').css('left') !== 0 && !atheos.sidebars.settings.leftLockedVisible) {
					marginL = handleWidth;
					reduction = 2 * handleWidth;
				} else {
					marginL = o('#sb-left').clientWidth();
					reduction = marginL + handleWidth;
				}

				o('#editor-region').css({
					'margin-left': marginL + 'px'
				});

				o('#editor-region').css({
					'margin-left': marginL + 'px',
					'height': (o('body').clientHeight()) + 'px'
				});

				// o('#root-editor-wrapper').css({
				// 	'height': (o('body').clientHeight() - 56) + 'px'
				// });

				// Run resize command to fix render issues
				if (atheos.editor) {
					atheos.editor.resize();
					atheos.active.updateTabDropdownVisibility();
				}
			});

		}
	});

})(this);