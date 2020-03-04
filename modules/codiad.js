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

	//////////////////////////////////////////////////////////////////////
	// Collection of wrapper functions for depreciated calls.
	//////////////////////////////////////////////////////////////////////

	var atheos = global.atheos,
		amplify = global.amplify,
		$ = global.jQuery;
		
	global.codiad = global.atheos;

	atheos.codiad = {
		init: function() {
			global.codiad.message = global.atheos.toast;



			//////////////////////////////////////////////////////////////////////
			// File-Manager
			//////////////////////////////////////////////////////////////////////

			atheos.filemanager.getShortName = function(path) {
				return atheos.common.getNodeName(path);
			};

			atheos.filemanager.getExtension = function(path) {
				return atheos.common.getNodeExtension(path);
			};

			atheos.filemanager.getType = function(path) {
				return atheos.common.getNodeType(path);
			};
		}


	};





	$.loadScript = function(url, arg1, arg2) {
		console.warn('$.loadScript is depreciated, please use "atheos.common.loadScript"');
		atheos.common.loadScript(url, arg1, arg2);
	};

	$.ctrl = function(key, callback, args) {
		console.warn('$.ctrl is depreciated, please use "atheos.keybind.bind"');
		atheos.keybind.bind(key, callback, args);
	};


	amplify.subscribe('contextmenu.onShow', function(obj) {
		console.warn('[Deprecation] context-menu amplify event: please subscribe to contextMenu');
		amplify.publish('context-menu.onShow', obj);
	});
})(this);