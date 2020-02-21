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
// This module can be removed. It parses the JSON reponse, looks for debug data,
// then returns the OBJ, or it strips the error info and send back 'error'. All
// of this logic should be handled in the request ajax.
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80
(function(global) {
	'use strict';

	var atheos = global.atheos;

	atheos.jsend = {

		parse: function(data) {
			// console.trace('JSend Parsed');
			var obj = JSON.parse(data);
			if (obj.debug !== undefined && Array.isArray(obj.debug)) {
				var debug = obj.debug.join('\nDEBUG: ');
				if (debug !== '') {
					debug = 'DEBUG: ' + debug;
				}
				console.log(debug);
			}
			if (obj.status == 'error') {
				atheos.toast.error(obj.message);
				return 'error';
			} else {
				return obj.data;
			}
		}

	};

})(this);