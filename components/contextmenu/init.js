//////////////////////////////////////////////////////////////////////////////80
// FileManager
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Notes: 
// Goodness this file is very complex; it's going to take a very long time
// to really get a grasp of what's going on in this file and how to 
// refactor it.
// The context menu should become an object stored within the filemanager, and
// constructed based on the fules specified therein. The OBJ is created, and then
// added to by each plugin based on it's requirements. The OBJ could even be 
// cached.
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

(function(global, $) {
	// 'use strict';
	var atheos = global.atheos,
		amplify = global.amplify,
		o = global.onyx;

	amplify.subscribe('atheos.loaded', function(settings) {
		atheos.contextmenu.init();
	});




	atheos.contextmenu = {

		noOpen: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'exe', 'zip', 'tar', 'tar.gz'],
		noBrowser: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],

		controller: 'components/filemanager/controller.php',
		dialog: 'components/filemanager/dialog.php',
		dialogUpload: 'components/filemanager/dialog_upload.php',

		contextMenu: {},

		init: function() {
			var checkAnchor = function(node) {
				node = o(node);
				//////////////////////////////////////////////////////////////////
				// This tagname business is due to the logical but annoying way
				// event delegation is handled. I keep trying to avoid organizing
				// the css in a better way for the file manager, and this is the
				// result.
				//////////////////////////////////////////////////////////////////
				var tagName = node.el.tagName;
				if (tagName === 'UL') {
					return false;
				} else if (tagName !== 'A') {
					if (tagName === 'LI') {
						node = node.find('a')[0];
					} else {
						node = o(node.parent());
					}
				}
				return node;
			};

			// Initialize node listener
			o('#file-manager').on('contextmenu', function(e) { // Context Menu
				e.preventDefault();
				atheos.contextmenu.show(e, checkAnchor(e.target));
			});
		},

		//////////////////////////////////////////////////////////////////
		// Context Menu
		//////////////////////////////////////////////////////////////////

		show: function(e, node) {
			if (node) {
				var path = node.attr('data-path'),
					type = node.attr('data-type'),
					name = node.html();

				node.addClass('context-menu-active');


				// Selective options
				switch (type) {
					case 'directory':
						$('#context-menu .directory-only, #context-menu .non-root').show();
						$('#context-menu .file-only, #context-menu .root-only').hide();
						break;
					case 'file':
						$('#context-menu .directory-only, #context-menu .root-only').hide();
						$('#context-menu .file-only,#context-menu .non-root').show();
						break;
					case 'root':
						$('#context-menu .directory-only, #context-menu .root-only').show();
						$('#context-menu .non-root, #context-menu .file-only').hide();
						break;
				}

				if (atheos.project.isAbsPath(o('#file-manager a[data-type="root"]').attr('data-path'))) {
					$('#context-menu .no-external').hide();
				} else {
					$('#context-menu .no-external').show();
				}

				// Show menu
				var top = e.pageY;
				if (top > $(window).height() - $('#context-menu').height()) {
					top -= $('#context-menu').height();
				}
				if (top < 10) {
					top = 10;
				}

				var max = $(window).height() - top - 10;
				var menu = o('#context-menu');

				menu.css({
					'top': top + 'px',
					'left': e.pageX + 'px',
					'max-height': max + 'px',
					'display': 'block'
				});

				menu.attr('data-path', path);
				menu.attr('data-type', type);
				menu.attr('data-name', name);

				// Show faded 'paste' if nothing in clipboard
				if (this.clipboard === '') {
					$('#context-menu a[content="Paste"]').addClass('disabled');
				} else {
					$('#context-menu a[data-action="paste"]').removeClass('disabled');
				}

				var contextMenu = this;

				var hideContextMenu;
				o('#context-menu').on('mouseout', function() {
					hideContextMenu = setTimeout(function() {
						contextMenu.hide();
					}, 500);
				});

				o('#context-menu').on('mouseover', function() {
					if (hideContextMenu) {
						clearTimeout(hideContextMenu);
					}
				});

				/* Notify listeners. */
				amplify.publish('contextmenu.onShow', {
					path: path,
					type: type
				});

				// Hide on click
				o('#context-menu').on('click', function() {
					contextMenu.hide();
				});
			}
		},

		hide: function() {
			console.trace('test');
			o('#context-menu').hide();
			var active = o('#file-manager a.context-menu-active');
			if (active) {
				active.removeClass('context-menu-active');
			}
			amplify.publish('contextMenu.onHide');
			amplify.publish('context-menu.onHide');

		},


		//////////////////////////////////////////////////////////////////
		// Return type
		//////////////////////////////////////////////////////////////////

		getType: function(path) {
			return o('#file-manager a[data-path="' + path + '"]').attr('data-type');
		},


		//////////////////////////////////////////////////////////////////
		// Upload
		//////////////////////////////////////////////////////////////////

		uploadToNode: function(path) {
			atheos.modal.load(500, this.dialogUpload, {
				path: path
			});
		},

		//////////////////////////////////////////////////////////////////
		// Download
		//////////////////////////////////////////////////////////////////

		download: function(path) {
			var type = this.getType(path);
			o('#download').attr('src', 'components/filemanager/download.php?path=' + encodeURIComponent(path) + '&type=' + type);
		}
	};

})(this, jQuery);