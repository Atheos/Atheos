//////////////////////////////////////////////////////////////////////////////80
// Parse JSEND Formatted Returns
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Notes: 
// I'm not exactly sure what jSend is but it looks like a standard of
// JSON communication, needs more research.
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80
(function(global) {
	'use strict';

	var core = global.codiad;

	core.jsend = {

		parse: function(data) {
			console.log('JSend Parsed');
			var obj = JSON.parse(data);
			if (obj.debug !== undefined && Array.isArray(obj.debug)) {
				var debug = obj.debug.join('\nDEBUG: ');
				if (debug !== '') {
					debug = 'DEBUG: ' + debug;
				}
				console.log(debug);
			}
			if (obj.status == 'error') {
				core.toast.error(obj.message);
				return 'error';
			} else {
				return obj.data;
			}
		}

	};

})(this);