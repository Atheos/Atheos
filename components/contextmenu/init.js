//////////////////////////////////////////////////////////////////////////////80
// FileManager
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
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

(function(global) {
	'use strict';
	var contextmenu = null;


	var atheos = global.atheos,
		amplify = global.amplify,
		oX = global.onyx;

	amplify.subscribe('atheos.loaded', () => atheos.contextmenu.init());

	atheos.contextmenu = {

		contextMenu: {},

		init: function() {
			contextmenu = this;

			var checkAnchor = function(node) {
				node = oX(node);
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
						node = oX(node.parent());
					}
				}
				return node;
			};

			// Initialize node listener
			oX('#file-manager').on('contextmenu', function(e) { // Context Menu
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
					name = node.find('span')[0].html();

				node.addClass('context-menu-active');

				var menu = oX('#contextmenu');
				var children = null;

				switch (type) {
					case 'directory':
						children = menu.find('.directory-only, .non-root');
						children.forEach((child) => child.show());

						children = menu.find('.file-only, .root-only');
						children.forEach((child) => child.hide());
						break;
					case 'file':
						children = menu.find('.directory-only, .root-only');
						children.forEach((child) => child.hide());

						children = menu.find('.file-only, .non-root');
						children.forEach((child) => child.show());
						break;
					case 'root':
						children = menu.find('.directory-only, .root-only');
						children.forEach((child) => child.show());

						children = menu.find('.file-only, .non-root');
						children.forEach((child) => child.hide());
						break;
				}

				children = menu.find('.no-external');
				if (atheos.project.isAbsPath(oX('#file-manager a[data-type="root"]').attr('data-path'))) {
					children.forEach((child) => child.hide());
				} else {
					children.forEach((child) => child.show());
				}

				// Show menu
				var top = e.pageY;
				var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
				if (top > windowHeight - menu.height()) {
					top -= menu.height();
				}
				if (top < 10) {
					top = 10;
				}

				var max = windowHeight - top - 10;

				menu.css({
					'top': top + 'px',
					'left': e.pageX + 'px',
					'max-height': max + 'px',
					'display': 'block'
				});

				menu.attr({
					'data-path': path,
					'data-type': type,
					'data-name': name
				});

				// Show faded 'paste' if nothing in clipboard
				if (atheos.filemanager.clipboard === '') {
					oX('#contextmenu i.fa-paste').parent().hide();
				} else {
					oX('#contextmenu i.fa-paste').parent().show();
				}

				var hideContextMenu;
				menu.on('mouseout', function() {
					hideContextMenu = setTimeout(function() {
						contextmenu.hide();
					}, 500);
				});

				menu.on('mouseover', function() {
					if (hideContextMenu) {
						clearTimeout(hideContextMenu);
					}
				});

				/* Notify listeners. */
				amplify.publish('contextmenu.show', {
					menu: menu,
					name: name,
					path: path,
					type: type
				});

				// Hide on click
				menu.on('click', function() {
					contextmenu.hide();
				});
			}
		},

		hide: function() {
			var menu = oX('#contextmenu');
			menu.hide();
			var active = oX('#file-manager a.context-menu-active');
			if (active) {
				active.removeClass('context-menu-active');
			}
			
			amplify.publish('contextmenu.hide', {
					menu: menu,
					name: menu.attr('data-name'),
					path: menu.attr('data-path'),
					type: menu.attr('data-type')				
			});
		},
	};

})(this);