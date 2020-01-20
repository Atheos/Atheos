(function(global, $) {

	var core = global.codiad,
		amplify = global.amplify,
		bioflux = global.bioflux,
		events = global.events;

	//////////////////////////////////////////////////////////////////////
	// Modal
	//////////////////////////////////////////////////////////////////////
	// Notes: 
	// In an effort of removing jquery and saving myself time, I removed
	// persistant modal functions, modal will always load center screen.
	//
	// I will re-add them later when need them
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
	//
	//												- Liam Siira
	//////////////////////////////////////////////////////////////////////


	core.modal = {

		settings: {
			isModalVisible: false
		},
		IDs: {
			overlay_id: 'modal_overlay',
			wrapper_id: 'modal_wrapper',
			content_id: 'modal_content',
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

			overlay.id = "modal_overlay";
			overlay.addEventListener('click', function(event) {
				if (event.target.id !== 'modal_overlay') return;
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
			return wrapper;
		},

		load: function(width, url, data) {
			data = data || {};

			var wrapper = bioflux.queryO('#modal_wrapper') || this.createModal(),
				content = wrapper.querySelector('#modal_content');
			wrapper.style.top = '15%';
			// resize - Kurim
			wrapper.style.left = width ? 'calc(50% - ' + ((width + 300) / 2) + 'px)' : 'calc(50% - ' + (width / 2) + 'px)';
			wrapper.style.minWidth = width ? (width + 300) + 'px' : '400px';

			content.innerHTML = '<div id="modal_loading"></div>';

			this.load_process = $.get(url, data, function(data) {
				$(content).html(data);
				// content.innerHTML = data;
				// var script = content.getElementsByTagName('script');
				// if (script) {
				// 	console.log(script);
				// 	console.log('Script Evaled');
				// 	eval(script.innerText);
				// }
				// Fix for Firefox autofocus goofiness
				var input = wrapper.querySelector('input[autofocus="autofocus"]');
				if (input) input.focus();
			});

			amplify.publish('modal.onLoad', {
				animationPerformed: false
			});

			wrapper.style.display = 'block';
			bioflux.queryO('#modal_overlay').style.display = 'block';

			// setTimeout(function() {
			// 	wrapper.classList.add('modal-active');
			// 	document.querySelector("#modal_overlay").classList.add('modal-active');
			// }, 10);

			core.modal.settings.isModalVisible = true;
		},

		hideOverlay: function() {
			bioflux.queryO("#modal_overlay").style.display = 'none';
		},
		hide: function() {
			var wrapper = bioflux.queryO('#modal_wrapper'),
				overlay = bioflux.queryO('#modal_overlay');

			wrapper.classList.remove('modal-active');
			overlay.classList.remove('modal-active');

			wrapper.addEventListener("transitionend", function() {
				wrapper.remove();
				overlay.remove();
			});


			core.editor.focus();
			core.modal.settings.isModalVisible = false;
		},
		unload: function() {

			$('#modal_content form').die('submit'); // Prevent form bubbling

			amplify.publish('modal.onUnload', {
				animationPerformed: false
			});

			bioflux.queryO('#modal_overlay').style.display = '';
			bioflux.queryO('#modal_wrapper').style.display = '';
			bioflux.queryO('#modal_content').innerHtml = '';

			core.editor.focus();
			core.modal.settings.isModalVisible = false;

		},
		drag: function(wrapper) {
			//References: http://jsfiddle.net/8wtq17L8/ & https://jsfiddle.net/tovic/Xcb8d/

			var rect = wrapper.getBoundingClientRect(),
				mouse_x = window.event.clientX,
				mouse_y = window.event.clientY, // Stores x & y coordinates of the mouse pointer
				modal_x = rect.left,
				modal_y = rect.top; // Stores top, left values (edge) of the element

			function move_element(event) {
				if (wrapper !== null) {
					wrapper.style.left = modal_x + event.clientX - mouse_x + 'px';
					wrapper.style.top = modal_y + event.clientY - mouse_y + 'px';
				}
			}

			// Destroy the object when we are done
			function remove_listeners() {
				document.removeEventListener('mousemove', move_element, false);
				document.removeEventListener('mouseup', remove_listeners, false);
				bioflux.queryO('.icon-arrows.active').classList.remove('active');
			}

			// document.onmousemove = _move_elem;
			document.addEventListener('mousemove', move_element, false);
			document.addEventListener('mouseup', remove_listeners, false);
		}
	};

})(this, jQuery);