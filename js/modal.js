'use strict';

(function(global, $, p) {

	var core = global.codiad,
		amplify = global.amplify,
		events = global.events;

	//////////////////////////////////////////////////////////////////////
	// Modal
	//////////////////////////////////////////////////////////////////////
	// Notes: 
	// In an effort of removing jquery and saving myself time, I removed
	// persistant modal functions, modal will always load center screen.
	//
	// I will re-add them later when I need them
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
	//////////////////////////////////////////////////////////////////////


	core.modal = {

		settings: {
			isModalVisible: false
		},

		init: function() {
			console.log('Modal Initialized');
		},

		createModal: function() {
			var modal = core.modal;
			var overlay = document.createElement('div'),
				wrapper = document.createElement('div'),
				content = document.createElement('div'),
				drag = document.createElement('i'),
				close = document.createElement('i');

			overlay.id = 'modal_overlay';
			overlay.addEventListener('click', function(event) {
				if (event.target.id !== 'modal_overlay') {
					return;
				}
				modal.unload();
			}, false);

			wrapper.id = 'modal_wrapper';
			content.id = 'modal_content';

			close.classList.add('icon-cancel');
			close.addEventListener('click', modal.unload, false);

			drag.classList.add('icon-arrows');
			drag.addEventListener('mousedown', function() {
				drag.classList.add('active');
				modal.drag(wrapper);
			}, false);

			wrapper.appendChild(close);
			wrapper.appendChild(drag);
			wrapper.appendChild(content);

			// overlay.appendChild(wrapper);
			document.body.appendChild(wrapper);

			document.body.appendChild(overlay);
			return p(wrapper);
		},

		load: function(width, url, data) {
			data = data || {};

			var wrapper = p('#modal_wrapper') || this.createModal(),
				content = p('#modal_content').sel;
			wrapper.style.top = '15%';

			wrapper.style.left = width ? 'calc(50% - ' + ((width + 300) / 2) + 'px)' : 'calc(50% - ' + (width / 2) + 'px)';
			wrapper.style.minWidth = width ? (width + 300) + 'px' : '400px';

			content.innerHTML = '<div id="modal_loading"></div>';

			this.loadProcess = ajax({
				url: url,
				data: data,
				success: function(data) {
					$(content).html(data);
					
					// p(content).html(data);
					// var script = p(p(content).find('script'));
					// if (script) {
					// 	eval(script.text());
					// }
					
					// Fix for Firefox autofocus goofiness
					var input = wrapper.find('input[autofocus="autofocus"]');
					if (input) {
						input.focus();
					}
				}
			});

			amplify.publish('modal.onLoad', {
				animationPerformed: false
			});

			wrapper.style.display = 'block';
			p('#modal_overlay').style.display = 'block';

			core.modal.settings.isModalVisible = true;
		},

		hideOverlay: function() {
			p('#modal_overlay').style.display = 'none';
		},
		hide: function() {
			var wrapper = p('#modal_wrapper'),
				overlay = p('#modal_overlay');

			wrapper.removeClass('modal-active');
			overlay.removeClass('modal-active');

			wrapper.addEventListener('transitionend', function() {
				wrapper.remove();
				overlay.remove();
			});


			core.editor.focus();
			core.modal.settings.isModalVisible = false;
		},
		unload: function() {

			amplify.publish('modal.onUnload', {
				animationPerformed: false
			});

			p('#modal_overlay').style.display = '';
			p('#modal_wrapper').style.display = '';
			p('#modal_content').empty();

			core.editor.focus();
			core.modal.settings.isModalVisible = false;

		},
		drag: function(wrapper) {
			//References: http://jsfiddle.net/8wtq17L8/ & https://jsfiddle.net/tovic/Xcb8d/

			var rect = wrapper.getBoundingClientRect(),
				mouseX = window.event.clientX,
				mouseY = window.event.clientY, // Stores x & y coordinates of the mouse pointer
				modalX = rect.left,
				modalY = rect.top; // Stores top, left values (edge) of the element

			function moveElement(event) {
				if (wrapper !== null) {
					wrapper.style.left = modalX + event.clientX - mouseX + 'px';
					wrapper.style.top = modalY + event.clientY - mouseY + 'px';
				}
			}

			// Destroy the object when we are done
			function removeListeners() {
				document.removeEventListener('mousemove', moveElement, false);
				document.removeEventListener('mouseup', removeListeners, false);
				p('.icon-arrows.active').removeClass('active');
			}

			// document.onmousemove = _move_elem;
			document.addEventListener('mousemove', moveElement, false);
			document.addEventListener('mouseup', removeListeners, false);
		}
	};

})(this, jQuery, pico);