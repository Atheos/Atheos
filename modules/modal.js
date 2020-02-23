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
// Event propagation from the overlay and the interactions within
// the modal seem to be a bit twisted up. Once I sort out all the
// plugins & components into a cohesive system, I'll need to clean
// this mess up.
//
// It looks like the modal loader handles event management & even
// loading the content for each modal, while I know a lot of the 
// plugins seem to as well, this will have to be optimized.
//
// *Sigh* The jquery HTML function for loading the content also
// executes the script tags contained within, which is a nightmare in
// my opinion. I think the idea was to containerize each component &
// only call it when it's loaded. The two options I can think of are
// create my own version of that function, or load all javascript from
// the start.
//
// Modal module currently called from:
//	Sidebars.js: Keep leftsidebar open if modal is open
//	Settings/init.js: Check for AJAX return promise
//	FileManager/init.js: Check for AJAX return promise
//
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80



(function(global, $) {

	'use strict';


	var atheos = global.atheos,
		ajax = global.ajax,
		amplify = global.amplify,
		o = global.onyx;

	atheos.modal = {

		settings: {
			isModalVisible: false
		},

		init: function(verbose) {
			if (verbose) {
				console.log('Modal Initialized');
			}
		},

		create: function() {
			var modal = atheos.modal;
			var overlay = o('<div>'),
				wrapper = o('<div>'),
				content = o('<div>'),
				drag = o('<i>'),
				close = o('<i>');

			overlay.attr('id', 'modal_overlay');
			overlay.on('click', function(event) {
				if (event.target.id !== 'modal_overlay') {
					return;
				}
				modal.unload();
			}, false);

			wrapper.attr('id', 'modal_wrapper');
			content.attr('id', 'modal_content');

			close.addClass('icon-cancel');
			close.on('click', modal.unload);

			drag.addClass('icon-arrows');
			drag.on('mousedown', function() {
				drag.addClass('active');
				modal.drag(wrapper);
			}, false);

			wrapper.append(close);
			wrapper.append(drag);
			wrapper.append(content);

			// overlay.appendChild(wrapper);
			document.body.appendChild(wrapper.el);

			document.body.appendChild(overlay.el);
			return wrapper;
		},

		load: function(width, url, data) {
			data = data || {};
			width = width > 400 ? width : 400;

			var wrapper = o('#modal_wrapper') || this.create(),
				content = o('#modal_content');

			$('#modal_content form').die('submit'); // Prevent form bubbling

			wrapper.css({
				'top': '15%',
				'left': 'calc(50% - ' + (width / 2) + 'px)',
				'min-width': width + 'px'
			});

			content.html('<div id="modal_loading"></div>');


			this.ready = ajax({
				url: url,
				data: data,
				success: function(data) {
					$('#modal_content').html(data);

					// o(content).html(data);
					// var script = o(o(content).find('script'));
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
			o('#modal_overlay').show();

			this.settings.isModalVisible = true;
		},

		resize: function() {

			var wrapper = o('#modal_wrapper'),
				content = o('#modal_content');


			if (wrapper && content) {
				var width = wrapper.clientWidth();
				wrapper.css({
					'top': '15%',
					'left': 'calc(50% - ' + (width / 2) + 'px)',
					'min-width': width + 'px'
				});
			}
		},

		hideOverlay: function() {
			o('#modal_overlay').hide();
		},
		hide: function() {
			var wrapper = o('#modal_wrapper'),
				overlay = o('#modal_overlay');

			wrapper.removeClass('modal-active');
			overlay.removeClass('modal-active');

			wrapper.on('transitionend', function() {
				wrapper.remove();
				overlay.remove();
			});


			atheos.editor.focus();
			this.settings.isModalVisible = false;
		},
		unload: function() {
			amplify.publish('modal.unload');
			
			o('#modal_content form').off('submit');
			o('#modal_overlay').hide();
			o('#modal_wrapper').hide();
			o('#modal_content').empty();


			atheos.modal.settings.isModalVisible = false;
			atheos.editor.focus();

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
				o('.icon-arrows').removeClass('active');
			}

			// document.onmousemove = _move_elem;
			document.addEventListener('mousemove', moveElement, false);
			document.addEventListener('mouseup', removeListeners, false);
			window.addEventListener('selectstart', disableSelect);

		}
	};

})(this, jQuery);