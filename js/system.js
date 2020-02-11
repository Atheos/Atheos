/*
	*  Copyright (c) Codiad & Kent Safranski (codiad.com), distributed
	*  as-is and without warranty under the MIT License. See
	*  [root]/license.txt for more. This information must remain intact.
	*/

(function(global, $) {


	var core = global.core = global.codiad = {},
		o = global.onyx;

	//////////////////////////////////////////////////////////////////////
	// loadScript instead of getScript (checks and balances and shit...)
	//////////////////////////////////////////////////////////////////////

	$.loadScript = function(url, arg1, arg2) {
		console.trace('Custom LoadScript');
		core.helpers.loadScript(url,arg1,arg2);
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
			amplify.publish('core.loaded', {});

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