//////////////////////////////////////////////////////////////////////////////80
// Animation
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Notes:
// Atheos has a few animations that have either proven insanely difficult in CSS
// or simply not possible. Creating a single module to allow global access to
// these animations made the most sense.
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';

	var atheos = global.atheos,
		carbon = global.carbon;

	var self = null;

	carbon.subscribe('system.loadMinor', () => atheos.flow.init());


	atheos.flow = {

		init: function() {
			self = this;
		},

		slide: function(direction, target, duration = 500) {

			// var ogStyles = target.getAttribute('style');

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

		fade: function(direction, target, duration = 500) {

			// var ogStyles = target.getAttribute('style');

			//Source: https://w3bits.com/javascript-slidetoggle/
			target.style.transitionProperty = 'opacity';
			target.style.transitionDuration = duration + 'ms';

			var zeroStyles = function() {
				target.style.opacity = 0;
				target.style.removeProperty('display');
				// target.style.display = '';

			};

			if (direction === 'in') {
				zeroStyles();
				target.offsetHeight;
				target.style.opacity = 1;

				window.setTimeout(() => {
					target.style.removeProperty('opacity');
				}, duration);

			} else if (direction === 'out' || direction === 'remove') {
				// SlideUp (Close)
				zeroStyles();
				window.setTimeout(() => {
						target.style.display = 'none';
						if (direction === 'remove') {
							target.remove();
						}
					},
					duration);
			}
		}
	};

})(this);