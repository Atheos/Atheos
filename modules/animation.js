//////////////////////////////////////////////////////////////////////////////80
// Animation
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Notes: 
// Atheos has a few animations that have either proven insanely difficult in CSS
// or simply not possible. Creating a single module to allow global access to
// these animations made the most sense.
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';
	var atheos = global.atheos;

	atheos.animation = {

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

			if (window.getComputedStyle(target).display === 'none' || direction === 'open') {
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
			} else {
				// SlideUp (Close)
				target.style.boxSizing = 'border-box';
				target.style.height = target.offsetHeight + 'px';
				target.offsetHeight;
				zeroStyles();
				window.setTimeout(() => {
					target.setAttribute('style', '');
					target.style.display = 'none';
				}, duration);
			}
		}


	};

})(this);