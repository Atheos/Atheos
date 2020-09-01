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
		amplify = global.amplify;

	var self = null;

	amplify.subscribe('system.loadMinor', () => atheos.flow.init());


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
		},

		dragNdrop: function(event, options) {
			// Inspired By: https://codepen.io/fitri/pen/VbrZQm
			// Made with love by @fitri
			// & https://github.com/io-developer/js-dragndrop

			options = options || {};
			var target = event.target;
			var origin, sibling;

			var dragZone = options.dragZone;
			var clone, startEX, startEY, startMX, startMY, timeout;

			var xMax, yMax;
			var xAxis = (options.direction !== 'vertical') ? true : false,
				yAxis = (options.direction !== 'horizontal') ? true : false;

			function setPos(x, y) {
				x = (x > xMax) ? xMax : ((x < 0) ? 0 : x);
				y = (y > yMax) ? yMax : ((y < 0) ? 0 : y);

				clone.style.left = (x - dragZone.scrollLeft) + 'px';
				clone.style.top = (y - dragZone.scrollTop) + 'px';
			}

			function moveTarget(event) {
				timeout = false;

				var swap = [].slice.call(dragZone.querySelectorAll('.draggable'));

				swap = swap.filter((item) => {
					var rect = item.getBoundingClientRect();
					if (xAxis && (event.clientX < rect.left || event.clientX >= rect.right)) {
						return false;
					}
					if (yAxis && (event.clientY < rect.top || event.clientY >= rect.bottom)) {
						return false;
					}
					if (item === clone) {
						return false;
					}
					return true;
				});

				if (swap.length === 0) {
					return;
				} else {
					swap = swap[swap.length - 1];
				}

				if (dragZone.contains(swap)) {
					swap = swap !== target.nextSibling ? swap : swap.nextSibling;
					if (swap) {
						swap.parentNode.insertBefore(target, swap);
					}
				}
			}

			function dragMove(event) {
				var x,
					y;

				x = xAxis ? startEX + event.screenX - startMX : startEX;
				y = yAxis ? startEY + event.screenY - startMY : startEY;

				setPos(x, y);
				if (timeout === false) {
					// In an attempt at optimization, I am setting a timeout
					// on the moveTarget such that it runs only once every
					// 100ms.
					timeout = setTimeout(() => moveTarget(event), 50);
				}
			}

			function dragStart() {
				timeout = false;

				event.stopPropagation();

				startEX = target.offsetLeft;
				startEY = target.offsetTop;

				startMX = event.screenX;
				startMY = event.screenY;

				clone = target.cloneNode(true);
				clone.style.left = (startEX - dragZone.scrollLeft) + 'px';
				clone.style.top = (startEY - dragZone.scrollTop) + 'px';
				clone.style.position = 'absolute';
				clone.style.cursor = 'grabbing';

				dragZone.append(clone);
				target.style.opacity = 0;

				xMax = dragZone.offsetWidth - clone.offsetWidth;
				yMax = dragZone.offsetHeight - clone.offsetHeight;

				document.addEventListener('mousemove', dragMove);
			}

			function dragEnd() {
				clearTimeout(timeout);
				target.style.opacity = '';
				if (clone) {
					clone.remove();
				}
				if (target.parentNode !== origin && options.drop && !options.drop(target)) {
					// This is a callback function that if returns false,
					// it will undo the dragNDrop... hopefully.
					// Undo Drag
					if (sibling) {
						sibling.after(target);
					} else {
						origin.append(target);
					}
				}
				document.removeEventListener('mousemove', dragMove);
				document.removeEventListener('mouseup', dragEnd);
			}

			if (!target.classList.contains('draggable')) {
				target = target.closest('.draggable');
			}

			if (!target || !dragZone) {
				return;
			}

			origin = target.parentNode;
			sibling = target.previousSibling;

			timeout = setTimeout(() => dragStart(), 200);
			document.addEventListener('mouseup', dragEnd);

		},

		handleDrag: function(item, event) {
			// Source: https://codepen.io/fitri/pen/VbrZQm?editors=1010
			// Made with love by @fitri

			const selectedItem = item,
				list = selectedItem.parentNode,
				x = event.clientX,
				y = event.clientY;

			selectedItem.style.opacity = 0;

			selectedItem.classList.add('dragActive');
			let swapItem = document.elementFromPoint(x, y) === null ? selectedItem : document.elementFromPoint(x, y);

			if (swapItem.tagName !== 'LI' && swapItem.parentNode.tagName === 'LI') {
				swapItem = swapItem.parentNode;
			}

			if (list === swapItem.parentNode) {
				swapItem = swapItem !== selectedItem.nextSibling ? swapItem : swapItem.nextSibling;
				list.insertBefore(selectedItem, swapItem);
			}
		},

		handleDrop: function(item) {
			// Source: https://codepen.io/fitri/pen/VbrZQm?editors=1010
			// Made with love by @fitri

			item.style.opacity = 1;
			item.classList.remove('dragActive');
		}
	};

})(this);