/*
	*  Copyright (c) Codiad & Kent Safranski (codiad.com), distributed
	*  as-is and without warranty under the MIT License. See
	*  [root]/license.txt for more. This information must remain intact.
	*/

(function(global, $) {


	var core = global.codiad = {};

	//////////////////////////////////////////////////////////////////////
	// loadScript instead of getScript (checks and balances and shit...)
	//////////////////////////////////////////////////////////////////////

	$.loadScript = function(url, arg1, arg2) {
		// console.trace('Custom LoadScripts');
		var cache = true,
			callback = null;
		//arg1 and arg2 can be interchangable
		if ($.isFunction(arg1)) {
			callback = arg1;
			cache = arg2 || cache;
		} else {
			cache = arg1 || cache;
			callback = arg2 || callback;
		}

		var load = true;
		//check all existing script tags in the page for the url
		jQuery('script[type="text/javascript"]')
			.each(function() {
				return load = (url != $(this)
					.attr('src'));
			});
		if (load) {
			//didn't find it in the page, so load it
			jQuery.ajax({
				type: 'GET',
				url: url,
				success: callback,
				dataType: 'script',
				cache: cache
			});
		} else {
			//already loaded so just call the callback
			if (jQuery.isFunction(callback)) {
				callback.call(this);
			}
		}
	};

	//////////////////////////////////////////////////////////////////////
	// Init
	//////////////////////////////////////////////////////////////////////
	document.addEventListener("DOMContentLoaded", function() {
		// Console fix for IE
		if (typeof(console) === 'undefined') {
			console = {};
			console.log = console.error = console.info = console.debug = console.warn = console.trace = console.dir = console.dirxml = console.group = console.groupEnd = console.time = console.timeEnd = console.assert = console.profile = function() {};
		}
		// Sliding sidebars
		core.sidebars.init();

		// Messages
		core.message.init();

		//HexOverlay
		synthetic.init();

		events.on('click', '#settings', function() {
			core.settings.show();
		});
		// $('#settings').click(function() {
		// 	core.settings.show();
		// });
	});

})(this, jQuery);