//////////////////////////////////////////////////////////////////////////////80
// Modal
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
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

(function(global) {
	'use strict';

	var atheos = global.atheos,
		amplify = global.amplify,
		echo = global.echo;

	var self = null;

	amplify.subscribe('system.loadMinor', () => atheos.modal.init());

	atheos.modal = {

		modalVisible: false,
		fadeDuration: 500,

		init: function() {
			self = this;
		},

		create: function() {
			var wrapper = oX('<div>'),
				content = oX('<div>'),
				drag = oX('<i>'),
				close = oX('<i>');

			wrapper.attr('id', 'modal_wrapper');
			content.attr('id', 'modal_content');

			close.addClass('close fas fa-times-circle');
			close.on('click', self.unload);

			drag.addClass('drag fas fa-arrows-alt');
			drag.on('mousedown', function() {
				drag.addClass('active');
				self.drag(wrapper);
			}, false);

			wrapper.append(close);
			wrapper.append(drag);
			wrapper.append(content);

			document.body.appendChild(wrapper.el);

			return wrapper;
		},

		load: function(width, url, data) {
			data = data || {};
			width = width > 400 ? width : 400;

			var listener, callback;

			if (data.listener && types.isFunction(data.listener)) {
				listener = data.listener;
				delete data.listener;
			}

			if (data.callback && types.isFunction(data.callback)) {
				callback = data.callback;
				delete data.callback;
			}

			var overlay = atheos.common.createOverlay('modal', true),
				wrapper = oX('#modal_wrapper') || self.create(),
				content = oX('#modal_content');


			wrapper.css({
				'top': '15%',
				'left': 'calc(50% - ' + (width / 2) + 'px)',
				'min-width': width + 'px',
				'height': ''
			});

			var loadTimeout;
			if (self.modalVisible) {
				loadTimeout = setTimeout(self.setLoadingScreen, 1000);
			}
			if (content.find('form')) {
				content.find('form').off('submit');
			}
			echo({
				url: url,
				data: data,
				success: function(reply) {
					if (reply.status && reply.status === 'error') {
						return;
					}
					clearTimeout(loadTimeout);
					content.html(reply);
					content.css('height', '');

					// Fix for Firefox autofocus goofiness
					var input = wrapper.find('input[autofocus="autofocus"]');
					if (input) {
						input.focus();
					}
					amplify.publish('modal.loaded');
					if (listener && wrapper.find('form')) {
						wrapper.find('form').on('submit', listener);
					}
					if (callback) {
						callback(wrapper);
					}
				}
			});

			if (!self.modalVisible) {
				atheos.flow.fade('in', wrapper.el, self.fadeDuration);
				atheos.flow.fade('in', overlay.el, self.fadeDuration);
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

		unload: function() {
			amplify.publish('modal.unload');
			amplify.unsubscribeAll('modal.loaded');

			var form = oX('#modal_content form'),
				overlay = oX('#overlay'),
				wrapper = oX('#modal_wrapper'),
				content = oX('#modal_content');


			if (form) {
				form.off('*');
			}
			if (overlay) {
				atheos.flow.fade('remove', overlay.el, self.fadeDuration);
			}
			if (wrapper) {
				atheos.flow.fade('out', wrapper.el, self.fadeDuration);
			}

			if (content) {
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

			var screen = oX('#modal_content');
			screen.css('height', screen.height() + 'px');
			screen.html(loading);
		},

		drag: function(wrapper) {
			//References: http://jsfiddle.net/8wtq17L8/ & https://jsfiddle.net/tovic/Xcb8d/
			if (!wrapper) {
				return;
			}
			var element = wrapper.el;

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
				oX('#modal_wrapper .drag').removeClass('active');
			}

			// document.onmousemove = _move_elem;
			document.addEventListener('mousemove', moveElement, false);
			document.addEventListener('mouseup', removeListeners, false);
			window.addEventListener('selectstart', disableSelect);

		}
	};

})(this);