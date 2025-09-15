//////////////////////////////////////////////////////////////////////////////80
// Splitter
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Description:
// Small module to handle resizing editor panes, primarily to reduce editor.js
// size during refactor; most likely will be merged back at a later date.
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';

	const self = {

		//////////////////////////////////////////////////////////////////////80
		// Init
		//////////////////////////////////////////////////////////////////////80
		init: function() {
			fX('#EDITOR .splitter').on('mousedown', function(e) {
				let splitter = e.target;
				e.stopPropagation();

				const prev = splitter.previousElementSibling;
				const next = splitter.nextElementSibling;

				let isHorizontal = oX(splitter).hasClass('horizontal');

				const start = isHorizontal ? e.clientX : e.clientY;
				const prevRect = prev.getBoundingClientRect();
				const nextRect = next.getBoundingClientRect();

				const total = (isHorizontal ? prevRect.width + nextRect.width : prevRect.height + nextRect.height);

				// function updateSiblings(e) {
				function onMouseMove(e) {
					const current = isHorizontal ? e.clientX : e.clientY;
					const delta = current - start;
					const newPrev = Math.max(50, (isHorizontal ? prevRect.width : prevRect.height) + delta);
					const container = splitter.parentElement.getBoundingClientRect();
					const percent = (newPrev / (isHorizontal ? container.width : container.height)) * 100;
					prev.style.flex = `0 0 ${percent}%`;
				}

				// let timeout = false;
				// function onMouseMove(e) {
				// 	if (timeout === false) {
				// 		// In an attempt at optimization, I am setting a timeout on
				// 		// the moveTarget such that it runs only once every 50ms
				// 		timeout = setTimeout(() => updateSiblings(e), 50);
				// 	}
				// }

				function onMouseUp() {
					document.removeEventListener('mousemove', onMouseMove);
					document.removeEventListener('mouseup', onMouseUp);
				}

				document.addEventListener('mousemove', onMouseMove);
				document.addEventListener('mouseup', onMouseUp);
			});
		}
	};

	carbon.subscribe('system.loadMinor', () => self.init());
	atheos.splitter = self;

})();