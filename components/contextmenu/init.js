//////////////////////////////////////////////////////////////////////////////80
// Context Menu Init
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
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

(function() {
	'use strict';

	let menu = null;

	const self = {

		fileMenu: {},
		tabMenu: {},
		projectMenu: {},
		active: {},

		init: function() {
			menu = oX('#contextmenu');

			echo({
				data: {
					target: 'contextmenu',
					action: 'loadMenus'
				},
				settled: function(status, reply) {
					if (status !== 'success') return;
					// self.createFileMenu(reply.fileMenu);
					self.fileMenu = reply.fileMenu;
					self.tabMenu = reply.tabMenu;

					carbon.publish('contextmenu.requestItems');
				}
			});

			// Initialize self listener
			fX('#file-manager').on('contextmenu', function(e) { // Context Menu
				e.preventDefault();

				var active = oX('#file-manager a.context-menu-active');
				if (active) active.removeClass('context-menu-active');

				var anchor = atheos.filemanager.checkAnchor(e.target);
				self.showFileMenu(anchor);

				self.show(e);
				menu.addClass('fm');
			});

			fX('#ACTIVE').on('contextmenu', function(e) { // Context Menu
				e.preventDefault();

				var anchor = atheos.filemanager.checkAnchor(e.target);
				self.showTabMenu(anchor);

				self.show(e);
				menu.addClass('at');
			});

			// Hide on click for filemanager
			fX('#contextmenu.fm').on('click', function(e) {
				e.preventDefault();
				let target = oX(e.target),
					tagName = e.target.tagName;
				if (['HR', 'DIV'].includes(tagName)) return;
				target = tagName === 'A' ? target : target.parent('A');

				let parts = target.attr('action').split('.'),
					action;

				for (let part of parts) {
					action = action ? action[part] : window[part];
				}

				if (typeof action === 'function') {
					action(self.active, target);
					self.hide();
				}
			});

			// Keep the contextmenu open if the mouse only leaves for a second
			let hideTimeOut = false;
			fX('#contextmenu').on('mouseout, mouseover', function(e) {
				if (e.type === 'mouseout') {
					hideTimeOut = setTimeout(self.hide, 500);
				} else {
					clearTimeout(hideTimeOut);
				}
			});
		},

		createFileMenu: function(items) {
			let html = '';
			for (let item of items) {
				html += self.createMenuItem(item);
			}
			self.fileMenu = `<div id="fileMenu">${html}</div>`;
		},

		//////////////////////////////////////////////////////////////////////80
		// Create Menu Item
		//////////////////////////////////////////////////////////////////////80
		createMenuItem: function(item) {
			let html = '';

			if (item.icon && item.action) {
				let icon = `<i class="${item.icon}"></i>`;

				html = `<a action="${item.action}">${icon + item.title}</a>\n`;
			} else {
				html = `<hr id="${item.title}">\n`;
			}
			return html;
		},

		//////////////////////////////////////////////////////////////////////80
		// Show Context Menu
		//////////////////////////////////////////////////////////////////////80
		showFileMenu: function(anchor) {
			if (!anchor) return;


			let path = anchor.attr('data-path'),
				type = anchor.attr('data-type'),
				name = anchor.find('span').html(),
				isRepo = !isUndefined(anchor.find('i.repo-icon')),
				inRepo = atheos.codegit.findParentRepo(path),
				extension = type === 'folder' ? 'folder' : pathinfo(path).extension;

			anchor.addClass('context-menu-active');

			let html = '';
			for (let item of self.fileMenu) {
				if ('noRoot' in item && type === 'root') continue;

				if ('type' in item && item.type !== type) {
					if (type !== 'root' || item.type !== 'folder') continue;
				}

				if ('isRepo' in item && item.isRepo !== isRepo) continue;
				if ('inRepo' in item && item.inRepo !== (inRepo !== false)) continue;
				if ('fTypes' in item && !item.fTypes.includes(extension)) continue;

				html += self.createMenuItem(item);
			}

			menu.html(html);

			// Show faded 'paste' if nothing in clipboard
			if (type !== 'file' && atheos.filemanager.clipboard === '') {
				oX('#contextmenu i.fa-paste').parent().hide();
			}

			/* Notify listeners. */
			self.active = {
				path,
				type,
				name,
				isRepo,
				inRepo,
				extension
			};

			carbon.publish('contextmenu.showFileMenu', self.active);
		},

		showTabMenu: function(anchor) {
			if (!anchor) return;
			anchor = anchor.parent('li');

			var path = anchor.attr('data-path'),
				type = anchor.attr('data-type'),
				name = anchor.find('span').html();

			var html = '<a id="reload_file"><i class="fas fa-sync-alt"></i>Reload</a><a id="reset_file"><i class="fas fa-sync-alt"></i>Reset</a>';

			self.active = {
				path,
				type,
				name
			};

			menu.attr({
				'data-path': path,
				'data-type': type,
				'data-name': name
			});

			menu.html(html);

			carbon.publish('contextmenu.showTabMenu');

		},
		
		//////////////////////////////////////////////////////////////////////80
		// Show Context Menu
		//////////////////////////////////////////////////////////////////////80
		show: function(e) {
			menu.removeClass('fm at');
			var top = e.pageY;
			var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
			if (top > windowHeight - menu.height()) {
				top -= menu.height();
			}

			top = top < 10 ? 10 : top;

			var max = windowHeight - top - 10;

			menu.css({
				'top': top + 'px',
				'left': e.pageX + 'px',
				'max-height': max + 'px',
				'display': 'block'
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Hide Context Menu
		//////////////////////////////////////////////////////////////////////80
		hide: function() {
			menu.hide();
			self.active = false;
			carbon.publish('contextmenu.hide');
		}
	};

	carbon.subscribe('system.loadMinor', self.init);
	atheos.contextmenu = self;

})();