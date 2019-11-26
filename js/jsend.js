'use strict';

(function(global){

    var core = global.codiad;

    //////////////////////////////////////////////////////////////////////
    // Parse JSEND Formatted Returns
	//////////////////////////////////////////////////////////////////////
	// Notes: 
	// I'm not exactly sure what jSend is but it looks like a standard of
	// JSON communication, needs more research.
	//												- Liam Siira
	//////////////////////////////////////////////////////////////////////

    core.jsend = {

        parse: function(data) { // (Data)
            var obj = JSON.parse(data);
            if (obj.debug !== undefined && Array.isArray(obj.debug)) {
                var debug = obj.debug.join('\nDEBUG: ');
                if(debug !== '') {
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
