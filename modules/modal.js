//////////////////////////////////////////////////////////////////////////////80
// Modal
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Notes:
// In an effort of removing jquery and saving myself time, I removed persistant
// modal functions, modal will always load center screen; I can re-add them
// later if I decide that it was important.
//
// *Sigh* The jquery HTML function for loading the content also
// executes the script tags contained within, which is a nightmare in
// my opinion. I think the idea was to containerize each component &
// only call it when it's loaded. The two options I can think of are
// create my own version of that function, or load all javascript from
// the start.
//
// Modal module currently called from:
//	Literally everywhere.
//
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';

	const self = {

		modalVisible: false,
		fadeDuration: 500,

		init: function() {
			fX('#dialog .close').on('click', self.unload);
			fX('#dialog .drag').on('mousedown', self.drag);
		},

		create: function() {

			let html = '<div id="dialog"><i class="close fas fa-times-circle"></i><i class="drag fas fa-arrows-alt"></i><section id="content"></section></div>';

			let div = document.createElement('div');
			div.innerHTML = html;
			let wrapper = oX(div.firstChild);
			document.body.appendChild(wrapper.element);
			return wrapper;
		},

		load: function(width, data) {
			data = data || {};
			width = width > 400 ? width : 400;

			let callback, listener;

			if (data.callback && isFunction(data.callback)) {
				callback = data.callback;
				delete data.callback;
			}

			if (data.listener && isFunction(data.listener)) {
				listener = data.listener;
				delete data.listener;
			}

			var overlay = atheos.common.showOverlay('modal', true),
				dialog = oX('#dialog').exists() || self.create(),
				content = oX('#content');

			if (content) content.html('');

			dialog.css({
				'top': '15%',
				'left': 'calc(50% - ' + (width / 2) + 'px)',
				'min-width': width + 'px',
				'height': ''
			});

			dialog.attr('target', data.target);
			dialog.attr('action', data.action);

			var loadTimeout;
			if (self.modalVisible) {
				loadTimeout = setTimeout(self.setLoadingScreen, 1000);
			}

			echo({
				url: data.url || atheos.dialog,
				data: data,
				settled: function(status, reply) {
					if (status !== 'success') return;

					clearTimeout(loadTimeout);
					content.html(reply);
					content.css('height', '');

					// Fix for Firefox autofocus goofiness
					var input = dialog.find('input[autofocus="autofocus"]');
					if (input) input.focus();

					if (listener && dialog.find('form')) {
						fX('#dialog form').on('submit', listener);
					}

					if (callback) {
						callback(dialog);
					}
					carbon.publish('dialog.loaded');
				}
			});

			if (!self.modalVisible) {
				atheos.flow.fade('in', dialog.element, self.fadeDuration);
				atheos.flow.fade('in', overlay.element, self.fadeDuration);
			}
			self.modalVisible = true;
		},

		resize: function() {
			var wrapper = oX('#modal_wrapper');

			if (wrapper) {
				var width = wrapper.clientWidth();
				wrapper.css({
					'top': '15%',
					'left': 'calc(50% - ' + (width / 2) + 'px)',
					'min-width': width + 'px'
				});
			}
		},

		unload: function(e) {
			carbon.publish('modal.unload');

			var form = oX('#dialog form'),
				overlay = oX('#overlay'),
				wrapper = oX('#dialog'),
				content = oX('#content');

			fX('#dialog form').off('*');
			if (overlay.exists()) {
				atheos.flow.fade('remove', overlay.element, self.fadeDuration);
			}
			if (wrapper.exists()) {
				atheos.flow.fade('out', wrapper.element, self.fadeDuration);
			}

			if (content.exists()) {
				content.off('*');
				setTimeout(content.empty, (self.fadeDuration + 100));
			}

			self.modalVisible = false;
			atheos.editor.focus();
		},

		setLoadingScreen: function(text) {
			text = text || 'Loading...';

			var wrapText = '';

			for (var i = 0; i < text.length; i++) {
				wrapText += '<em>' + text.charAt(i) + '</em>';
			}

			var loading = `
			<div class="loader">
			<div class="ring"></div>
			<div class="ring"></div>
			<div class="dot"></div>
			<h2>${wrapText}</h2>
			</div>
			`;

			loading = `<div class="loader"><h2>${wrapText}</h2><span class="dual-ring"></span></div>`;

			var screen = oX('#content');
			screen.css('height', screen.height() + 'px');
			screen.html(loading);
		},

		drag: function(e) {
			//References: http://jsfiddle.net/8wtq17L8/ & https://jsfiddle.net/tovic/Xcb8d/
			let element = e.target.closest('#dialog'),
				wrapper = oX(element),
				drag = oX(e.target);

			if (!wrapper) return;

			drag.addClass('active');

			let rect = wrapper.offset(),
				mouseX = window.event.clientX,
				mouseY = window.event.clientY,
				// Stores x & y coordinates of the mouse pointer
				modalX = rect.left,
				modalY = rect.top; // Stores top, left values (edge) of the element

			let newX = 0,
				newY = 0,
				minY = 1,
				minX = 1,
				maxY = document.body.clientHeight - wrapper.height(),
				maxX = document.body.clientWidth - wrapper.width();

			// log(minY, minX);
			// log(maxY, maxX);
			// log(document.body.clientHeight, document.body.clientWidth);

			function moveElement(event) {
				newX = modalX + event.clientX - mouseX;
				newY = modalY + event.clientY - mouseY;
				element.style.left = (newX > maxX ? maxX : (newX < minX ? minX : newX)) + 'px';
				element.style.top = (newY > maxY ? maxY : (newY < minY ? minY : newY)) + 'px';
			}

			function disableSelect(e) {
				e.preventDefault();
			}

			// Destroy the object when we are done
			function removeListeners() {
				document.removeEventListener('mousemove', moveElement, false);
				document.removeEventListener('mouseup', removeListeners, false);
				window.removeEventListener('selectstart', disableSelect);
				drag.removeClass('active');
			}

			// document.onmousemove = _move_elem;
			document.addEventListener('mousemove', moveElement, false);
			document.addEventListener('mouseup', removeListeners, false);
			window.addEventListener('selectstart', disableSelect);

		}
	};

	carbon.subscribe('system.loadMinor', () => self.init());
	atheos.modal = self;

})();