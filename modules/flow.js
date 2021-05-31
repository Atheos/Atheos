//////////////////////////////////////////////////////////////////////////////80
// Flow Animations
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Description: 
//	Flow contains a few tiny animations that are used throught Atheos that can't
//	can't be replicated via CSS, by designing as a module, it allows it to be 
//	used by anything throughout the project.
//////////////////////////////////////////////////////////////////////////////80
// Suggestions:
//	- Add the DragMove logic here to allow further movement
//////////////////////////////////////////////////////////////////////////////80
// Usage:
//	atheos.flow.slide('open', dropDownMenu, 500)
//	atheos.flow.fade('out', dropDownMenu, 500)
//
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';

	const self = {

		//////////////////////////////////////////////////////////////////////80
		// Slide open and closed animation, think dropdown
		//////////////////////////////////////////////////////////////////////80
		slide: function(direction, target, duration = 500) {
			//Source: https://w3bits.com/javascript-slidetoggle/

			target.style.overflow = 'hidden';
			target.style.transitionProperty = 'height, margin, padding';
			target.style.transitionDuration = duration + 'ms';

			var zeroStyles = function() {
				target.style.height = 0;
				target.style.paddingTop = 0;
				target.style.paddingBottom = 0;
				target.style.marginTop = 0;
				target.style.marginBottom = 0;
			};

			if (direction === 'open') {
				//SlideDown (Open)
				target.style.removeProperty('display');

				var display = window.getComputedStyle(target).display;
				display = display === 'none' ? 'block' : display;

				target.style.display = display;
				var height = target.offsetHeight;

				zeroStyles();
				target.offsetHeight;
				target.style.boxSizing = 'border-box';
				target.style.height = height + 'px';
				target.style.removeProperty('padding-top');
				target.style.removeProperty('padding-bottom');
				target.style.removeProperty('margin-top');
				target.style.removeProperty('margin-bottom');
				window.setTimeout(() => {
					target.setAttribute('style', '');
				}, duration);
			} else if (direction === 'close' || direction === 'remove') {
				// SlideUp (Close)
				target.style.boxSizing = 'border-box';
				target.style.height = target.offsetHeight + 'px';
				target.offsetHeight;
				zeroStyles();
				window.setTimeout(() => {
						target.setAttribute('style', '');
						target.style.display = 'none';
						if (direction === 'remove') {
							target.remove();
						}
					},
					duration);
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Fade animation
		//////////////////////////////////////////////////////////////////////80
		fade: function(direction, target, duration = 500) {
			//Source: https://w3bits.com/javascript-slidetoggle/

			target.style.transitionProperty = 'opacity';
			target.style.transitionDuration = duration + 'ms';

			var zeroStyles = function() {
				target.style.opacity = 0;
				target.style.removeProperty('display');
			};

			if (direction === 'in') {
				zeroStyles();
				target.offsetHeight;
				target.style.opacity = 1;

				window.setTimeout(() => {
					target.style.removeProperty('opacity');
				}, duration);

			} else if (direction === 'out' || direction === 'remove') {
				zeroStyles();
				window.setTimeout(() => {
					target.style.display = 'none';
					if (direction === 'remove') {
						target.remove();
					}
				}, duration);
			}
		}
	};

	atheos.flow = self;

})();