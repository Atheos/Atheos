//////////////////////////////////////////////////////////////////////////////80
// Storage
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Description: 
// The Storage module is a wrapper around the default LocalStorage in JS to
// compress some of the key-values. I'll admit, the goal of this module is a
// little silly, but I'd like to think it makes the code a little cleaner and 
// nicer to work with in the long haul. It might save me only a 20-30 characters
// per file, but that will add up over time.
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80


(function(global) {

	var atheos = global.atheos,
		amplify = global.amplify;

	amplify.subscribe('atheos.loaded', function() {
		atheos.storage.init();
	});

	atheos.storage = {

		init: function() {
			console.log('Storage Initialized');
		},

		set: function(key, value) {
			localStorage.setItem('atheos.' + key, value);
		},
		get: function(key, value) {
			return localStorage.getItem('atheos.' + key, value);
		}


	};

}(this));