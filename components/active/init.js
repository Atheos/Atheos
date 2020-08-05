//////////////////////////////////////////////////////////////////////////////80
// Active Init
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/license.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {

	var ace = global.ace,
		atheos = global.atheos;

	var self = null;

	var EditSession = ace.require('ace/edit_session').EditSession;
	var UndoManager = ace.require('ace/undomanager').UndoManager;

	amplify.subscribe('system.loadMajor', () => atheos.active.init());

	//////////////////////////////////////////////////////////////////////80
	//
	// Active Files Component for atheos
	// ---------------------------------
	// Track and manage EditSession instaces of files being edited.
	//
	//////////////////////////////////////////////////////////////////////80
	atheos.active = {

		tabList: oX('#tab-list-active-files'),
		dropDownMenu: oX('#dropdown-list-active-files'),

		// Path to EditSession instance mapping
		sessions: {},

		loopBehavior: 'loopActive',
		dropDownOpen: false,

		init: function() {
			self = this;

			self.updateTabDropdownVisibility();
			self.initTabListeners();

			atheos.common.initMenuHandler(oX('#tab_dropdown'), self.dropDownMenu, ['fa-chevron-circle-down', 'fa-chevron-circle-up']);

			oX('#tab_close').on('click', function(e) {
				e.stopPropagation();
				self.closeAll();
			});

			echo({
				url: atheos.controller,
				data: {
					target: 'active',
					action: 'list'
				},
				success: function(reply) {
					if (reply.status !== 'success') {
						return;
					}
					delete reply.status;
					var focused = false;
					for (var key in reply) {
						var item = reply[key];
						focused = item.status === 'focus' ? true : focused;
						atheos.filemanager.openFile(item.path, item.status === 'focus');
					}
					if (focused !== true) {
						var keys = Object.keys(reply);
						if (keys.length > 0) {
							atheos.filemanager.openFile(reply[0].path, true);
						}
					}

				}
			});

			// Prompt if a user tries to close window without saving all files
			window.onbeforeunload = function(e) {
				if (self.hasUnsavedChanges()) {
					e = e || window.event;
					var errMsg = 'You have unsaved files.';

					// For IE and Firefox prior to version 4
					if (e) {
						e.returnValue = errMsg;
					}

					// For rest
					return errMsg;
				}
			};

			window.onresize = self.updateTabDropdownVisibility;

			amplify.subscribe('settings.loaded', function() {
				self.loopBehavior = atheos.storage('active.loopBehavior') || self.loopBehavior;

				// This timeout is an effort to double check the tab visibility
				// after everything has been loaded. The default route has some 
				// minor issues on loading such that it doesn't quite meet spec
				setTimeout(self.updateTabDropdownVisibility, 500);
			});
		},

		hasUnsavedChanges() {
			var changedTabs = [];
			var path;

			for (path in self.sessions) {
				if (self.sessions[path].status === 'changed') {
					changedTabs.push(path);
				}
			}

			if (changedTabs.length > 0) {
				self.focus(changedTabs[0]);
				return changedTabs;
			}

			return false;
		},

		initTabListeners: function() {
			var activeListener = function(e) {
				e.stopPropagation();

				var tagName = e.target.tagName;
				var node = oX(e.target);

				if (tagName === 'UL') {
					return;
				}
				if (['I', 'A', 'SPAN'].indexOf(tagName) > -1) {
					node = node.parent('LI');
				}

				var path = node.attr('data-path');

				//LeftClick = Open
				if (e.which === 1 && tagName !== 'I') {
					self.focus(path);

					//MiddleClick = Close
				} else if (e.which === 2 || tagName === 'I') {
					var activePath = self.getPath();

					self.close(path);
					if (activePath !== null && activePath !== path) {
						self.focus(activePath);
					}
					self.updateTabDropdownVisibility();
				}
			};

			self.tabList.on('click, auxclick', function(e) {
				activeListener(e);
			});

			self.dropDownMenu.on('click, auxclick', function(e) {
				activeListener(e);
			});

			self.tabList.on('mousedown', function(e) {
				var options = {
					dragZone: self.tabList.el,
					direction: 'horizontal'
				};
				atheos.flow.dragNdrop(e, options);
			});
		},

		open: function(path, content, modifyTime, focus) {
			if (focus === undefined) {
				focus = true;
			}

			if (self.isOpen(path)) {
				if (focus) {
					self.focus(path);
				}
				return;
			}
			var ext = pathinfo(path).extension;
			var mode = atheos.textmode.selectMode(ext);

			var fn = function() {
				//var session = new EditSession(content, new Mode());
				var session = new EditSession(content);
				session.setMode('ace/mode/' + mode);
				session.setUndoManager(new UndoManager());
				session.path = path;
				session.serverMTime = modifyTime;
				self.sessions[path] = session;
				session.untainted = content.slice(0);

				if (focus) {
					atheos.editor.setSession(session);
				}

				self.add(path, session, focus);
				/* Notify listeners. */
				amplify.publish('active.open', path);
			};

			// Assuming the mode file has no dependencies
			atheos.common.loadScript('components/editor/ace-editor/mode-' + mode + '.js', fn);
		},

		isOpen: function(path) {
			return !!self.sessions[path];
		},


		//////////////////////////////////////////////////////////////////////80
		// Get active editor path
		//////////////////////////////////////////////////////////////////////80

		getPath: function() {
			try {
				return atheos.editor.getActive().getSession().path;
			} catch (e) {
				return null;
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Check if opened by another user
		//////////////////////////////////////////////////////////////////////80

		check: function(path) {
			echo({
				url: atheos.controller,
				data: {
					target: 'active',
					action: 'check',
					path: path
				},
				success: function(reply) {
					if (reply.status === 'warning') {
						atheos.toast.show(reply);
					}
				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Add newly opened file to list
		//////////////////////////////////////////////////////////////////////80

		add: function(path, session, focus) {
			if (focus === undefined) {
				focus = true;
			}

			session.status = 'current';

			/* If the tab list would overflow with the new tab. Move the
				* first tab to dropdown, then add a new tab. */
			if (self.isTabListOverflowed(true)) {
				var tab = self.tabList.find('li:first-child');
				self.moveTab(self.dropDownMenu, tab);
			}

			var listItem = self.createListItem(path);
			self.tabList.append(listItem);
			session.listItem = listItem;

			self.updateTabDropdownVisibility();

			echo({
				url: atheos.controller,
				data: {
					target: 'active',
					action: 'add',
					path: path
				}
			});

			if (focus) {
				self.focus(path);
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Focus on opened file
		//////////////////////////////////////////////////////////////////////80

		focus: function(path, direction) {
			direction = direction || false;

			self.highlightEntry(path, direction);

			if (path !== self.getPath()) {
				atheos.editor.setSession(self.sessions[path]);

				echo({
					url: atheos.controller,
					data: {
						target: 'active',
						'action': 'setFocus',
						'path': path
					}
				});
			}

			/* Check for users registered on the file. */
			self.check(path);

			/* Notify listeners. */
			amplify.publish('active.focus', path);
		},

		highlightEntry: function(path, direction) {
			direction = direction || false;

			var active = self.tabList.findAll('.active');
			active.forEach(function(item) {
				item.removeClass('active');
			});

			var session = self.sessions[path];
			var dropDown = self.dropDownMenu.find('[data-path="' + path + '"]');

			if (dropDown) {
				var listItem = session.listItem;
				self.moveTab(self.tabList, listItem, direction);

				var tab;
				if (direction === 'up') {
					tab = self.tabList.find('li:last-child');
				} else {
					tab = self.tabList.find('li:first-child');
				}
				self.moveTab(self.dropDownMenu, tab, direction);
			}

			session.listItem.addClass('active');
		},

		//////////////////////////////////////////////////////////////////////80
		// Mark changed
		//////////////////////////////////////////////////////////////////////80

		markChanged: function(path) {
			self.sessions[path].status = 'changed';
			self.sessions[path].listItem.addClass('changed');
		},

		//////////////////////////////////////////////////////////////////////80
		// Save active editor
		// I'm pretty sure the save methods are magic and should
		// be worshipped.
		//////////////////////////////////////////////////////////////////////80

		save: function(path) {
			/* Notify listeners. */
			amplify.publish('active.save', path);

			if ((path && !self.isOpen(path)) || (!path && !atheos.editor.getActive())) {
				atheos.toast.show('error', 'No open files.');
				return;
			}
			var session = path ? self.sessions[path] : atheos.editor.getActive().getSession();
			var content = session.getValue();
			var newContent = content.slice(0);
			path = session.path;

			var handleSuccess = function(mtime) {
				var session = atheos.active.sessions[path];
				if (typeof session !== 'undefined') {
					session.untainted = newContent;
					session.serverMTime = mtime;
					session.status = 'current';
					if (session.listItem) {
						session.listItem.removeClass('changed');
					}
				}
			};
			// Replicate the current content so as to avoid
			// discrepancies due to content changes during
			// computation of diff

			if (session.serverMTime && session.untainted) {
				atheos.workerManager.addTask({
					taskType: 'diff',
					id: path,
					original: session.untainted,
					changed: newContent
				}, function(success, patch) {
					if (success) {
						atheos.filemanager.savePatch(path, patch, session.serverMTime, {
							success: handleSuccess
						});
					} else {
						atheos.filemanager.saveFile(path, newContent, {
							success: handleSuccess
						});
					}
				}, self);
			} else {
				atheos.filemanager.saveFile(path, newContent, {
					success: handleSuccess
				});
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Save all files
		//////////////////////////////////////////////////////////////////////80
		saveAll: function() {
			for (var session in self.sessions) {
				if (self.sessions[session].status === 'changed') {
					self.save(session);
				}
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Close file
		//////////////////////////////////////////////////////////////////////80
		close: function(path) {
			if ((path && !self.isOpen(path)) || (!path && !atheos.editor.getActive())) {
				atheos.toast.show('error', 'No open files');
				return;
			}
			var session = path ? self.sessions[path] : atheos.editor.getActive().getSession();
			path = session.path;
			var basename = pathinfo(path).basename;

			if (session.status === 'changed') {
				var dialog = {
					banner: 'Close unsaved file?',
					data: basename,
					actions: {
						'Save & Close': function() {
							amplify.publish('active.close', path);
							self.save(path);
							self.remove(path);
						},
						'Discard Changes': function() {
							amplify.publish('active.close', path);
							self.remove(path);
						},
						'Cancel': function() {
							// Cancel
						}
					}
				};

				atheos.alert.show(dialog);

			} else {
				amplify.publish('active.close', path);
				self.remove(path);
			}
		},

		closeAll: function() {
			var changedTabs = '';

			for (var path in self.sessions) {
				if (self.sessions[path].status === 'changed') {
					var basename = pathinfo(path).basename;
					changedTabs += basename + '\n';
				}
			}

			if (changedTabs !== '') {
				var dialog = {
					banner: 'Close unsaved file?',
					data: changedTabs,
					actions: {
						'Save All & Close': function() {
							amplify.publish('active.closeAll');
							self.saveAll();
							self.removeAll();
						},
						'Discard Changes': function() {
							amplify.publish('active.closeAll');
							self.removeAll();
						},
						'Cancel': function() {
							// Cancel
						}
					}
				};
				atheos.alert.show(dialog);
			} else {
				self.removeAll();
			}
		},

		remove: function(path) {
			if (!(path in self.sessions)) {
				return;
			}
			var session = self.sessions[path];

			session.listItem.remove();
			self.updateTabDropdownVisibility();

			/* Select all the tab tumbs except the one which is to be removed. */
			var tabs = self.tabList.findAll('li');

			if (tabs.length === 0) {
				atheos.editor.exterminate();
			} else {

				var nextFocus = tabs[0].attr('data-path');
				var nextSession = self.sessions[nextFocus];
				atheos.editor.removeSession(session, nextSession);

				self.focus(nextFocus);
			}
			delete self.sessions[path];

			echo({
				url: atheos.controller,
				data: {
					target: 'active',
					action: 'remove',
					path: path
				}
			});
		},

		removeAll: function() {
			for (var path in self.sessions) {
				var session = self.sessions[path];
				session.listItem.remove();

				delete self.sessions[path];
			}

			self.updateTabDropdownVisibility();
			atheos.editor.exterminate();
			echo({
				url: atheos.controller,
				data: {
					target: 'active',
					action: 'removeAll'
				}
			});
		},

		reload: function(path, focus) {
			log(focus);

			self.close(path);
			atheos.filemanager.openFile(path, focus);
		},

		//////////////////////////////////////////////////////////////////////80
		// Rename tab to new name
		//////////////////////////////////////////////////////////////////////80
		rename: function(oldPath, newPath) {
			var switchSessions = function(oldPath, newPath) {
				var listItem = self.sessions[oldPath].listItem;
				listItem.attr('data-path', newPath);
				var title = newPath;
				if (atheos.common.isAbsPath(newPath)) {
					title = newPath.substring(1);
				}

				listItem.find('.file-name').text(title);

				self.sessions[newPath] = self.sessions[oldPath];
				self.sessions[newPath].path = newPath;

				delete self.sessions[oldPath];
			};

			if (self.sessions[oldPath]) {
				// A file was renamed
				switchSessions.apply(self, [oldPath, newPath]);

				// pass new sessions instance to setactive
				for (var k = 0; k < atheos.editor.instances.length; k++) {
					if (atheos.editor.instances[k].getSession().path === newPath) {
						atheos.editor.setActive(atheos.editor.instances[k]);
					}
				}

				var newSession = self.sessions[newPath];

				// Change Editor Mode
				var ext = pathinfo(newPath).extension;
				var mode = atheos.textmode.selectMode(ext);

				// handle async mode change
				var fn = function() {
					atheos.textmode.setModeDisplay(newSession);
					newSession.removeListener('changeMode', fn);
				};

				newSession.on('changeMode', fn);
				newSession.setMode('ace/mode/' + mode);
			} else {
				// A folder was renamed
				var newKey;
				for (var key in self.sessions) {
					newKey = key.replace(oldPath, newPath);
					if (newKey !== key) {
						switchSessions.apply(self, [key, newKey]);
					}
				}
			}

			echo({
				url: atheos.controller,
				data: {
					target: 'active',
					action: 'rename',
					path: oldPath,
					newPath: newPath
				},
				success: function() {
					amplify.publish('active.onRename', {
						'oldPath': oldPath,
						'newPath': newPath
					});
				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Move Up or down (Key Combo)
		//////////////////////////////////////////////////////////////////////80
		move: function(direction) {

			var activeTabs = self.tabList.findAll('li');
			if (self.loopBehavior === 'loopBoth') {
				var dropDownChildren = self.dropDownMenu.findAll('li');
				activeTabs = activeTabs.concat(dropDownChildren);
			}

			var index = false;

			activeTabs.forEach(function(tab, i) {
				index = tab.hasClass('active') ? i : index;
			});

			if (index === false || activeTabs.length === 0) {
				return;
			}

			var newActive = null;

			if (direction === 'up') {
				index = (index === 0) ? (activeTabs.length - 1) : (index - 1);
				newActive = activeTabs[index];
			} else {
				index = (index + 1) % activeTabs.length;
				newActive = activeTabs[index];
			}

			if (newActive) {
				if (self.loopBehavior === 'loopBoth') {
					self.focus(newActive.attr('data-path'), direction);
				} else {
					self.focus(newActive.attr('data-path'));
				}
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Move tab between Active & Dropdown
		//////////////////////////////////////////////////////////////////////80
		moveTab: function(destination, listItem, direction) {
			direction = direction || false;

			if (direction === 'up') {
				destination.prepend(listItem);
			} else {
				destination.append(listItem);
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Is the activeTabs overflowed
		//////////////////////////////////////////////////////////////////////80
		isTabListOverflowed: function(includeFictiveTab) {
			includeFictiveTab = includeFictiveTab || false;

			var tabs = self.tabList.findAll('li');
			var count = includeFictiveTab ? tabs.length + 1 : tabs.length;

			if (count <= 1) {
				return false;
			}

			var tabWidth = count * tabs[0].width(true);

			//	If we subtract the width of the left side bar, of the right side
			//	bar handle and of the tab dropdown handle to the window width,
			//	do we have enough room for the tab list? Its kind of complicated
			//	to handle all the offsets, so afterwards we add a fixed offset
			//	just to be sure. 

			var availableWidth = oX('#editor-top-bar').width();

			var iconWidths = oX('#tab_dropdown').width() * 2;

			var room = availableWidth - (iconWidths + tabWidth + 50);

			return (room < 0);
		},

		//////////////////////////////////////////////////////////////////////80
		// Update tab visibility
		//////////////////////////////////////////////////////////////////////80
		updateTabDropdownVisibility: function() {
			var listItem;

			while (self.isTabListOverflowed()) {
				listItem = self.tabList.find('li:last-child');
				if (listItem) {
					self.moveTab(self.dropDownMenu, listItem);
				} else {
					break;
				}
			}

			while (!self.isTabListOverflowed(true)) {
				listItem = self.dropDownMenu.find('li:last-child');
				if (listItem) {
					self.moveTab(self.tabList, listItem);
				} else {
					break;
				}
			}

			if (self.dropDownMenu.findAll('li').length > 0) {
				oX('#tab_dropdown').show();
			} else {
				oX('#tab_dropdown').hide();
			}

			if (self.tabList.findAll('li').length > 1) {
				oX('#tab_close').show();
			} else {
				oX('#tab_close').hide();
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Factory
		//////////////////////////////////////////////////////////////////////80
		createListItem: function(path) {
			var split = pathinfo(path);

			// For some reason, leaving the leading slash on a path causes the
			// leading slash to be moved to the end of the element, as in at the
			// end of the file name and subsequently needs to be removed first.
			var item = '<li class="draggable" data-path="' + path + '"><a><span  class="subtle">' +
				split.directory.replace(/^\/+/g, '') + '/</span>' + split.basename +
				'</a><i class="close fas fa-times-circle"></i></li>';

			item = oX(item);

			return item;
		}

	};

})(this);