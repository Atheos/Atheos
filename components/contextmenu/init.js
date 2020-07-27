/*jshint esversion: 6 */

//////////////////////////////////////////////////////////////////////////////80
// Context Menu Init
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80
// Notes: 
// The context menu should become an object stored within the filemanager, and
// constructed based on the fules specified therein. The OBJ is created, and then
// added to by each plugin based on it's requirements. The OBJ could even be 
// cached.
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';

	var self = null;
	var menu = null;

	var atheos = global.atheos,
		amplify = global.amplify;

	amplify.subscribe('system.loadMinor', () => atheos.contextmenu.init());

	atheos.contextmenu = {

		contextMenu: {},
		baseMenu: '',

		init: function() {
			self = this;
			menu = oX('#contextmenu');

			self.baseMenu = menu.html();

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
						node = node.find('a');
					} else {
						node = oX(node.parent());
					}
				}
				return node;
			};

			// Initialize node listener
			oX('#file-manager').on('contextmenu', function(e) { // Context Menu
				e.preventDefault();
				menu.html(self.baseMenu);
				var active = oX('#file-manager a.context-menu-active');
				if (active) {
					active.removeClass('context-menu-active');
				}
				self.adjust(checkAnchor(e.target));
				self.show(e);
			});
			oX('#editor-top-bar').on('contextmenu', function(e) { // Context Menu
				e.preventDefault();
				self.topBarMenu(checkAnchor(e.target));
				self.show(e);
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Show Context Menu
		//////////////////////////////////////////////////////////////////////80
		show: function(e, node) {
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

			self.keepOpen();

		},

		//////////////////////////////////////////////////////////////////////80
		// Show Context Menu
		//////////////////////////////////////////////////////////////////////80
		adjust: function(node) {
			if (!node) {
				return;
			}
			var path = node.attr('data-path'),
				type = node.attr('data-type'),
				name = node.find('span').html();

			node.addClass('context-menu-active');

			var menu = oX('#contextmenu');
			var children = null;

			switch (type) {
				case 'directory':
					children = menu.findAll('.directory-only, .non-root');
					children.forEach((child) => child.show());

					children = menu.findAll('.file-only, .root-only');
					children.forEach((child) => child.hide());
					break;
				case 'file':
					children = menu.findAll('.directory-only, .root-only');
					children.forEach((child) => child.hide());

					children = menu.findAll('.file-only, .non-root');
					children.forEach((child) => child.show());
					break;
				case 'root':
					children = menu.findAll('.directory-only, .root-only');
					children.forEach((child) => child.show());

					children = menu.findAll('.file-only, .non-root');
					children.forEach((child) => child.hide());
					break;
			}

			children = menu.findAll('.no-external');
			if (atheos.common.isAbsPath(oX('#file-manager a[data-type="root"]').attr('data-path'))) {
				children.forEach((child) => child.hide());
			} else {
				children.forEach((child) => child.show());
			}

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



			/* Notify listeners. */
			amplify.publish('contextmenu.show', {
				menu: menu,
				name: name,
				node: node,
				path: path,
				type: type
			});

			// Hide on click
			menu.on('click', function() {
				self.hide();
			});
		},

		keepOpen: function() {
			var hideContextMenu;
			menu.on('mouseout', function() {
				hideContextMenu = setTimeout(function() {
					self.hide();
				}, 500);
			});

			menu.on('mouseover', function() {
				if (hideContextMenu) {
					clearTimeout(hideContextMenu);
				}
			});
		},

		topBarMenu: function(node) {
			if (!node) {
				return;
			}
			node = node.parent('li');

			var path = node.attr('data-path'),
				type = node.attr('data-type'),
				name = node.find('span').html(),
				active = node.hasClass('active');

			var html = '<a class="directory-only" onclick="atheos.active.reload(onyx(\'#contextmenu\').attr(\'data-path\'), ' + active +');" style="display: block;"><i class="fas fa-sync-alt"></i>Reload</a>';

			menu.attr({
				'data-path': path,
				'data-type': type,
				'data-name': name
			});

			menu.html(html);
		},

		//////////////////////////////////////////////////////////////////////80
		// Hide Context Menu
		//////////////////////////////////////////////////////////////////////80
		hide: function() {
			menu.hide();
			menu.off('*');

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