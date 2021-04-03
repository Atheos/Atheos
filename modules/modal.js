//////////////////////////////////////////////////////////////////////////////80
// Modal
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/LICENSE.md for more.
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

	const node = {

		modalVisible: false,
		fadeDuration: 500,

		init: function() {
			fX('#modal_wrapper .close').on('click', node.unload);
			fX('#modal_wrapper .drag').on('mousedown', node.drag);
		},

		create: function() {

			let html = '<div id="modal_wrapper"><i class="close fas fa-times-circle"></i><i class="drag fas fa-arrows-alt"></i><div id="modal_content"></div></div>';

			let div = document.createElement('div');
			div.innerHTML = html;
			let wrapper = oX(div.firstChild);
			document.body.appendChild(wrapper.el);
			return wrapper;
		},

		load: function(width, data) {
			data = data || {};
			width = width > 400 ? width : 400;

			var listener, callback;

			if (data.listener && isFunction(data.listener)) {
				listener = data.listener;
				delete data.listener;
			}

			if (data.callback && isFunction(data.callback)) {
				callback = data.callback;
				delete data.callback;
			}

			var overlay = atheos.common.showOverlay('modal', true),
				wrapper = oX('#modal_wrapper') || node.create(),
				content = oX('#modal_content');

			wrapper.css({
				'top': '15%',
				'left': 'calc(50% - ' + (width / 2) + 'px)',
				'min-width': width + 'px',
				'height': ''
			});

			var loadTimeout;
			if (node.modalVisible) {
				loadTimeout = setTimeout(node.setLoadingScreen, 1000);
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
					var input = wrapper.find('input[autofocus="autofocus"]');
					if (input) input.focus();

					if (listener && wrapper.find('form')) {
						fX('#modal_wrapper form').on('submit', listener);
					}
					if (callback) {
						callback(wrapper);
					}
					carbon.publish('modal.loaded');
				}
			});

			if (!node.modalVisible) {
				atheos.flow.fade('in', wrapper.el, node.fadeDuration);
				atheos.flow.fade('in', overlay.el, node.fadeDuration);
			}
			node.modalVisible = true;
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

			var form = oX('#modal_content form'),
				overlay = oX('#overlay'),
				wrapper = oX('#modal_wrapper'),
				content = oX('#modal_content');

			fX('#modal_wrapper form').off('*');
			if (overlay) {
				atheos.flow.fade('remove', overlay.el, node.fadeDuration);
			}
			if (wrapper) {
				atheos.flow.fade('out', wrapper.el, node.fadeDuration);
			}

			if (content) {
				content.off('*');
				setTimeout(content.empty, (node.fadeDuration + 100));
			}

			node.modalVisible = false;
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

			var screen = oX('#modal_content');
			screen.css('height', screen.height() + 'px');
			screen.html(loading);
		},

		drag: function(e) {
			//References: http://jsfiddle.net/8wtq17L8/ & https://jsfiddle.net/tovic/Xcb8d/
			let element = e.target.closest('#modal_wrapper'),
				wrapper = oX(element),
				drag = oX(e.target);

			if (!wrapper) return;

			drag.addClass('active');

			var rect = wrapper.offset(),
				mouseX = window.event.clientX,
				mouseY = window.event.clientY,
				// Stores x & y coordinates of the mouse pointer
				modalX = rect.left,
				modalY = rect.top; // Stores top, left values (edge) of the element

			function moveElement(event) {
				element.style.left = modalX + event.clientX - mouseX + 'px';
				element.style.top = modalY + event.clientY - mouseY + 'px';
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

	carbon.subscribe('system.loadMinor', () => node.init());
	atheos.modal = node;

})();