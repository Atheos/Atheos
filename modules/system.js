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
// Notes:
// This file also houses the wrapper functions for older APIs to get to newer
// newer systems, while pushing warnings about said depreciation.
//
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {


	var atheos = global.core = global.atheos = global.codiad = {},
		amplify = global.amplify,
		o = global.onyx;

	//////////////////////////////////////////////////////////////////////
	// Init
	//////////////////////////////////////////////////////////////////////
	document.addEventListener('DOMContentLoaded', function() {

		//Synthetic Login Overlay
		if (document.querySelector('#login')) {
			global.synthetic.init();
		} else {
			atheos.confirm.init();
			atheos.helpers.init();
			atheos.modal.init();
			atheos.sidebars.init();
			atheos.storage.init();
			atheos.toast.init();

			amplify.publish('atheos.loaded', {});


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

				o('#root-editor-wrapper').css({
					'height': (o('body').clientHeight() - 57) + 'px'
				});

				// Run resize command to fix render issues
				if (atheos.editor) {
					atheos.editor.resize();
					atheos.active.updateTabDropdownVisibility();
				}
			});

		}
	});

})(this);



(function(global) {
	//////////////////////////////////////////////////////////////////////
	// Collection of wrapper functions for depreciated calls.
	//////////////////////////////////////////////////////////////////////

	var atheos = global.atheos,
		$ = global.jQuery;

	$.loadScript = function(url, arg1, arg2) {
		console.warn('$.loadScript is depreciated, please use "atheos.helpers.loadScript"');
		atheos.helpers.loadScript(url, arg1, arg2);
	};

	$.ctrl = function(key, callback, args) {
		console.warn('$.ctrl is depreciated, please use "atheos.keybind.bind"');
		atheos.keybind.bind(key, callback, args);
	};

})(this);