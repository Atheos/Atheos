/*
	*  Copyright (c) Codiad & Kent Safranski (codiad.com), distributed
	*  as-is and without warranty under the MIT License. See
	*  [root]/license.txt for more. This information must remain intact.
	*/

(function(global, $) {


	var core = global.codiad = {},
		o = global.onyx;

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

		//Synthetic Login Overlay
		if (document.querySelector('#login')) {
			synthetic.init();
		} else {
			core.modal.init();
			core.sidebars.init();
			core.toast.init();

			window.addEventListener('resize', function() {
				var handleWidth = 10;

				var marginL, reduction;
				if (o("#sb-left").css('left') !== 0 && !core.sidebars.settings.leftLockedVisible) {
					marginL = handleWidth;
					reduction = 2 * handleWidth;
				} else {
					marginL = $("#sb-left").width();
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
				if (core.editor) {
					core.editor.resize();
					core.active.updateTabDropdownVisibility();
				}
			});

		}
	});

})(this, jQuery);