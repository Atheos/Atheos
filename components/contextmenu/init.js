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
// The context menu should become an object stored within the filetree, and
// constructed based on the fules specified therein. The OBJ is created, and then
// added to by each plugin based on it's requirements. The OBJ could even be 
// cached.
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80
(function() {
	'use strict';

	let xContextMenu = null,
		lastActive = null;

	const self = {

		fileTreeItems: [],
		fileTabItems: [],
		editorItems: [],
		activeItem: {},

		init: function() {
			xContextMenu = oX('#contextmenu');

			echo({
				data: {
					target: 'contextmenu',
					action: 'loadMenus'
				},
				settled: function(reply, status) {
					if (status !== 200) return;
					log(reply);

					self.fileTreeItems = (typeof reply.fileTreeItems !== 'undefined') ? reply.fileTreeItems : [];
					self.fileTabItems = (typeof reply.fileTabItems !== 'undefined') ? reply.fileTabItems : [];
					self.editorItems = (typeof reply.editorItems !== 'undefined') ? reply.editorItems : [];

					carbon.publish('contextmenu.requestItems');
				}
			});

			// Initialize filetree event listener
			fX('#WORKSPACE').on('contextmenu', function(e) { // Context Menu
				if (lastActive) lastActive.removeClass('context-menu-active');

				let xTarget = oX(e.target),
					menuType = false;

				if (xTarget.parent('#FILETREE').exists()) { // Right click on FileTree
					menuType = 'FileTreeMenu';

				} else if (xTarget.parent('#FILETABS').exists()) {
					menuType = 'FileTabMenu';

				} else if (xTarget.parent('#EDITOR').exists()) {
					menuType = 'Editor';

				} else {
					return;
				}

				e.preventDefault();
				let html = '';
				if (menuType === 'FileTreeMenu' || menuType === 'FileTabMenu') {
					var anchor = atheos.filetree.checkAnchor(e.target);
					if (!anchor) return;
					anchor.addClass('context-menu-active');
					log(anchor.element);

					let path = anchor.attr('data-path');

					if (menuType === 'FileTreeMenu') {
						html = self.buildFileTreeMenu(anchor, path);
					} else if (menuType === 'FileTabMenu') {
						html = self.buildFileTabMenu(anchor, path);
					}

					lastActive = anchor;
				} else if (menuType === 'Editor') {
					html = self.buildEditorMenu();
				}

				xContextMenu.html(html);
				self.activeItem.menuType = menuType;
				carbon.publish('contextmenu.show' + menuType, self.activeItem);
				log(menuType);
				self.showMenu(e);
			});

			self.initTouchEvents();

			// Click events for context menu
			fX('#contextmenu').on('click', function(e) {
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
					if (self.activeItem.menuType === 'FileTreeMenu') {
						action(self.activeItem, target);
					} else if (self.activeItem.menuType === 'FileTabMenu') {
						action(self.activeItem.path);
					} else if (self.activeItem.menuType === 'Editor') {
						action(self.activeItem.path);
					}
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

		//////////////////////////////////////////////////////////////////////80
		// Build File Tree Context Menu
		//////////////////////////////////////////////////////////////////////80
		buildFileTreeMenu: function(anchor, path) {

			let type = anchor.attr('data-type'),
				name = anchor.find('span').html(),
				isRepo = !isUndefined(anchor.find('i.repo-icon')),
				inRepo = atheos.codegit.findParentRepo(path),
				extension = type === 'folder' ? 'folder' : pathinfo(path).extension;

			let html = '';
			for (let item of self.fileTreeItems) {
				if ('noRoot' in item && type === 'root') continue;

				if ('type' in item && item.type !== type) {
					if (type !== 'root' || item.type !== 'folder') continue;
				}

				if ('isRepo' in item && item.isRepo !== isRepo) continue;
				if ('inRepo' in item && item.inRepo !== (inRepo !== false)) continue;
				if ('fTypes' in item && !item.fTypes.includes(extension)) continue;

				if (item.title === 'paste' && atheos.filetree.clipboard === '') continue;

				html += self.createMenuItem(item);
			}

			/* Notify listeners. */
			self.activeItem = {
				path,
				type,
				name,
				isRepo,
				inRepo,
				extension
			};
			return html;
		},

		//////////////////////////////////////////////////////////////////////80
		// Build File Tab Menu
		//////////////////////////////////////////////////////////////////////80		
		buildFileTabMenu: function(anchor, path) {
			let html = '';
			for (let item of self.fileTabItems) {
				html += self.createMenuItem(item);
			}
			self.activeItem = {
				path
			};
			return html;
		},
		//////////////////////////////////////////////////////////////////////80
		// Build Editor Menu
		//////////////////////////////////////////////////////////////////////80		
		buildEditorMenu: function(anchor, path) {
			let html = '';
			for (let item of self.editorItems) {
				html += self.createMenuItem(item);
			}
			self.activeItem = {
				path
			};
			return html;
		},

		//////////////////////////////////////////////////////////////////////80
		// Show Context Menu
		//////////////////////////////////////////////////////////////////////80
		showMenu: function(e) {
			var top = e.pageY;
			var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
			if (top > windowHeight - xContextMenu.height()) {
				top -= xContextMenu.height();
			}

			top = top < 10 ? 10 : top;

			var max = windowHeight - top - 10;

			xContextMenu.css({
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
			if (lastActive) lastActive.removeClass('context-menu-active');

			xContextMenu.hide();
			self.active = false;
			carbon.publish('contextmenu.hide');
		},

		//////////////////////////////////////////////////////////////////////80
		// Initialize touch events
		//////////////////////////////////////////////////////////////////////80
		initTouchEvents: function() {
			let touchTimer;

			function showContextMenu(e) {
				e.preventDefault();

				const touch = e.changedTouches[0];
				const contextMenuEvent = new MouseEvent('contextmenu', {
					bubbles: true,
					cancelable: true,
					view: window,
					clientX: touch.clientX,
					clientY: touch.clientY
				});

				touch.target.dispatchEvent(contextMenuEvent);
			}

			document.addEventListener('touchstart', (e) => {
				touchTimer = setTimeout(() => {
					showContextMenu(e);
				}, 500); // milliseconds before opening context menu
			});

			document.addEventListener('touchend', (e) => {
				clearTimeout(touchTimer);
			});
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
		}



	};

	carbon.subscribe('system.loadMinor', self.init);
	atheos.contextmenu = self;

})();