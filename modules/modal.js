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



(function(global, $) {
	'use strict';

	var atheos = global.atheos,
		ajax = global.ajax,
		amplify = global.amplify,
		oX = global.onyx;

	var self = null;


	atheos.modal = {

		modalVisible: false,

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

			var overlay = atheos.common.createOverlay('modal'),
				wrapper = oX('#modal_wrapper') || self.create(),
				content = oX('#modal_content');



			$('#modal_content form').die('submit'); // Prevent form bubbling

			wrapper.css({
				'top': '15%',
				'left': 'calc(50% - ' + (width / 2) + 'px)',
				'min-width': width + 'px',
				'height': ''
			});

			if (self.modalVisible) {
				self.setLoadingScreen();
			}

			ajax({
				url: url,
				type: 'GET',
				data: data,
				success: function(data) {
					$('#modal_content').html(data);

					wrapper.css({
						'height': ''
					});

					// oX(content).html(data);
					// var script = oX(oX(content).find('script'));
					// if (script) {
					// 	eval(script.text());
					// }

					// Fix for Firefox autofocus goofiness
					var input = wrapper.find('input[autofocus="autofocus"]')[0];
					if (input) {
						input.focus();
					}
					amplify.publish('modal.loaded');
				}
			});


			wrapper.show();
			overlay.show();

			self.modalVisible = true;
		},

		resize: function() {
			var wrapper = oX('#modal_wrapper');

			if (wrapper) {
				var width = wrapper.clientWidth();
				// width = width > 1000 ? 1000 : width;
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


			oX('#modal_content').off('submit');
			oX('#overlay').remove();
			oX('#modal_wrapper').hide();
			oX('#modal_content').empty();

			self.modalVisible = false;
			atheos.editor.focus();
		},

		setLoadingScreen: function(text) {
			text = text || 'Loading...';

			var wrapText = "";

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

			var screen = oX('#modal_wrapper');
			screen.css('height', screen.height() + 'px');
			oX('#modal_content').html(loading);
		},

		drag: function(wrapper) {
			//References: http://jsfiddle.net/8wtq17L8/ & https://jsfiddle.net/tovic/Xcb8d/

			var element = wrapper.el;

			var rect = wrapper.offset(),
				mouseX = window.event.clientX,
				mouseY = window.event.clientY, // Stores x & y coordinates of the mouse pointer
				modalX = rect.left,
				modalY = rect.top; // Stores top, left values (edge) of the element

			function moveElement(event) {
				if (element) {
					// console.log(wrapper);
					// wrapper.css({
					// 	'top': modalY + event.clientY - mouseY + 'px',
					// 	'left': modalX + event.clientX - mouseX + 'px'
					// });
					element.style.left = modalX + event.clientX - mouseX + 'px';
					element.style.top = modalY + event.clientY - mouseY + 'px';
				}
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

})(this, jQuery);