/*jshint esversion: 6 */

//////////////////////////////////////////////////////////////////////////////80
// Active
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {

	var ace = global.ace,
		atheos = global.atheos,
		ajax = global.ajax,
		amplify = global.amplify,
		oX = global.onyx;

	var self = null;

	var EditSession = ace.require('ace/edit_session').EditSession;
	var UndoManager = ace.require('ace/undomanager').UndoManager;

	amplify.subscribe('system.loadMajor', () => atheos.active.init());

	//////////////////////////////////////////////////////////////////
	//
	// Active Files Component for atheos
	// ---------------------------------
	// Track and manage EditSession instaces of files being edited.
	//
	//////////////////////////////////////////////////////////////////

	atheos.active = {

		controller: 'components/active/controller.php',

		tabList: oX('#tab-list-active-files'),
		dropDownMenu: oX('#dropdown-list-active-files'),

		// Path to EditSession instance mapping
		sessions: {},

		// History of opened files
		history: [],


		loopBehavior: 'loopActive',
		dropDownOpen: false,

		init: function() {
			self = this;

			self.initTabDropdownMenu();
			self.updateTabDropdownVisibility();
			self.initTabListeners();

			ajax({
				url: self.controller,
				data: {
					action: 'list'
				},
				success: function(reply) {
					if (reply.status !== 'success') {
						return;
					}
					delete reply.status;
					for (var path in reply) {
						var focused = reply[path] === 'focus' ? true : false;
						atheos.filemanager.openFile(path, focused);
					}

				}
			});

			// Prompt if a user tries to close window without saving all files
			window.onbeforeunload = function(e) {
				var changed = self.tabList.findAll('li.changed');
				changed = changed.concat(self.dropDownMenu.findAll('li.changed'));
				if (changed.length > 0) {
					var path = changed[0].attr('data-path');
					self.focus(path);
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
			});
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

			// self.dropDownMenu.on('drag', function(e) {
			// 	atheos.ux.handleDrag(e.target, e);
			// });

			// self.dropDownMenu.on('dragend', function(e) {
			// 	atheos.ux.handleDrop(e.target, e);
			// });
		},

		//////////////////////////////////////////////////////////////////
		// Dropdown Menu
		//////////////////////////////////////////////////////////////////

		initTabDropdownMenu: function() {
			var toggleDropDown = oX('#tab_dropdown');
			var closeAll = oX('#tab_close');

			self.dropDownMenu.hide();

			toggleDropDown.on('click', function(e) {
				e.stopPropagation();
				if (self.dropDownOpen) {
					self.hideDropDownMenu();
				} else {
					self.showDropDownMenu();
				}
			});

			closeAll.on('click', function(e) {
				e.stopPropagation();
				self.closeAll();
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

			var ext = atheos.common.getNodeExtension(path);
			var mode = atheos.editor.selectMode(ext);

			var fn = function() {
				//var session = new EditSession(content, new Mode());
				var session = new EditSession(content);
				session.setMode("ace/mode/" + mode);
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


		//////////////////////////////////////////////////////////////////
		// Get active editor path
		//////////////////////////////////////////////////////////////////

		getPath: function() {
			try {
				return atheos.editor.getActive()
					.getSession()
					.path;
			} catch (e) {
				return null;
			}
		},

		//////////////////////////////////////////////////////////////////
		// Check if opened by another user
		//////////////////////////////////////////////////////////////////

		check: function(path) {
			ajax({
				url: self.controller,
				data: {
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

		//////////////////////////////////////////////////////////////////
		// Add newly opened file to list
		//////////////////////////////////////////////////////////////////

		add: function(path, session, focus) {
			if (focus === undefined) {
				focus = true;
			}

			session.status = 'current';

			/* If the tab list would overflow with the new tab. Move the
				* first tab to dropdown, then add a new tab. */
			if (self.isTabListOverflowed(true)) {
				var tab = self.tabList.find('li:first-child');
				self.moveTabToDropdownMenu(tab);
			}

			var listItem = self.createListItem(path);
			self.tabList.append(listItem);
			session.listItem = listItem;

			self.updateTabDropdownVisibility();

			ajax({
				url: self.controller,
				data: {
					action: 'add',
					path: path
				}
			});

			if (focus) {
				self.focus(path);
			}
		},

		//////////////////////////////////////////////////////////////////
		// Focus on opened file
		//////////////////////////////////////////////////////////////////

		focus: function(path, direction) {
			direction = direction || false;

			self.highlightEntry(path, direction);

			if (path !== self.getPath()) {
				atheos.editor.setSession(self.sessions[path]);
				self.history.push(path);
				ajax({
					url: self.controller,
					data: {
						'action': 'focused',
						'path': path
					}
				});
			}

			/* Check for users registered on the file. */
			self.check(path);

			/* Notify listeners. */
			amplify.publish('active.onFocus', path);
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
				self.moveDropdownMenuItemToTab(listItem, direction);

				var tab;
				if (direction === 'up') {
					tab = self.tabList.find('li:last-child');
				} else {
					tab = self.tabList.find('li:first-child');
				}
				self.moveTabToDropdownMenu(tab, direction);
			}

			session.listItem.addClass('active');
		},

		//////////////////////////////////////////////////////////////////
		// Mark changed
		//////////////////////////////////////////////////////////////////

		markChanged: function(path) {
			self.sessions[path].status = 'changed';
			self.sessions[path].listItem.addClass('changed');
		},

		//////////////////////////////////////////////////////////////////
		// Save active editor
		// I'm pretty sure the save methods are magic and should
		// be worshipped.
		//////////////////////////////////////////////////////////////////

		save: function(path) {
			/* Notify listeners. */
			amplify.publish('active.onSave', path);

			if ((path && !self.isOpen(path)) || (!path && !atheos.editor.getActive())) {
				atheos.toast.show('error', 'No Open Files to save');
				return;
			}
			var session;
			if (path) {
				session = self.sessions[path];
			} else {
				session = atheos.editor.getActive().getSession();
			}
			var content = session.getValue();
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

			var newContent = content.slice(0);
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

		//////////////////////////////////////////////////////////////////
		// Save all files
		//////////////////////////////////////////////////////////////////
		saveAll: function() {
			for (var session in self.sessions) {
				if (self.sessions[session].status === 'changed') {
					self.save(session);
				}
			}
		},

		//////////////////////////////////////////////////////////////////
		// Clsoe file
		//////////////////////////////////////////////////////////////////
		close: function(path) {
			if (!self.isOpen(path)) return;
			var session = self.sessions[path];

			var fileName = atheos.common.splitDirectoryAndFileName(path).fileName;

			if (session.status === 'changed') {
				var dialog = {
					banner: 'Close unsaved file?',
					data: fileName,
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
					var fileName = atheos.common.splitDirectoryAndFileName(path).fileName;
					changedTabs += fileName + '\n';
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
			var session = self.sessions[path];

			session.listItem.remove();
			self.updateTabDropdownVisibility();

			/* Remove closed path from history */
			var temp = [];
			self.history.forEach(function(item) {
				if (path !== item) {
					temp.push(item);
				}
			});
			self.history = temp;

			/* Select all the tab tumbs except the one which is to be removed. */
			var tabs = self.tabList.findAll('li');

			if (tabs.length === 0) {
				atheos.editor.exterminate();
			} else {

				var nextFocus = '';
				if (self.history.length > 0) {
					nextFocus = self.history[self.history.length - 1];
				} else {
					nextFocus = tabs[0].attr('data-path');
				}
				var nextSession = self.sessions[nextFocus];
				atheos.editor.removeSession(session, nextSession);

				self.focus(nextFocus);
			}
			delete self.sessions[path];

			ajax({
				url: self.controller,
				data: {
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
			self.history = [];
			self.updateTabDropdownVisibility();
			atheos.editor.exterminate();
			ajax({
				url: self.controller,
				data: {
					action: 'removeAll'
				}
			});
		},

		//////////////////////////////////////////////////////////////////
		// Process rename
		//////////////////////////////////////////////////////////////////

		rename: function(oldPath, newPath) {

			var switchSessions = function(oldPath, newPath) {
				var listItem = self.sessions[oldPath].listItem;
				listItem.attr('data-path', newPath);
				var title = newPath;
				if (atheos.project.isAbsPath(newPath)) {
					title = newPath.substring(1);
				}

				listItem.find('.file-name').text(title);

				self.sessions[newPath] = self.sessions[oldPath];
				self.sessions[newPath].path = newPath;

				delete self.sessions[oldPath];
				//Rename history
				for (var i = 0; i < self.history.length; i++) {
					if (self.history[i] === oldPath) {
						self.history[i] = newPath;
					}
				}
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
				var ext = atheos.common.getNodeExtension(newPath);
				var mode = atheos.editor.selectMode(ext);

				// handle async mode change
				var fn = function() {
					atheos.editor.setModeDisplay(newSession);
					newSession.removeListener('changeMode', fn);
				};

				newSession.on("changeMode", fn);
				newSession.setMode("ace/mode/" + mode);
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

			ajax({
				url: self.controller,
				data: {
					action: 'rename',
					path: oldPath,
					newPath: newPath
				},
				success: function() {
					amplify.publish('active.onRename', {
						"oldPath": oldPath,
						"newPath": newPath
					});
				}
			});
		},

		//////////////////////////////////////////////////////////////////
		// Move Up (Key Combo)
		//////////////////////////////////////////////////////////////////
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

		showDropDownMenu: function() {
			oX('#tab_dropdown').replaceClass('fa-chevron-circle-down', 'fa-chevron-circle-up');
			atheos.flow.slide('open', self.dropDownMenu.el);
			window.addEventListener('click', self.hideDropDownMenu);
			self.dropDownOpen = true;
		},

		hideDropDownMenu: function() {
			oX('#tab_dropdown').replaceClass('fa-chevron-circle-up', 'fa-chevron-circle-down');
			atheos.flow.slide('close', self.dropDownMenu.el);
			window.removeEventListener('click', self.hideDropDownMenu);
			self.dropDownOpen = false;
		},

		moveTabToDropdownMenu: function(oldListItem, direction) {
			direction = direction || false;

			var path = oldListItem.attr('data-path');

			var listItem = self.createListItem(path);

			if (direction === 'up') {
				self.dropDownMenu.prepend(listItem);
			} else {
				self.dropDownMenu.append(listItem);
			}

			if (oldListItem.hasClass("changed")) {
				listItem.addClass("changed");
			}

			self.sessions[path].listItem = listItem;
			oldListItem.remove();

		},

		moveDropdownMenuItemToTab: function(oldListItem, direction) {
			direction = direction || false;

			var path = oldListItem.attr('data-path');

			var listItem = self.createListItem(path);

			if (direction === 'up') {
				self.tabList.prepend(listItem);
			} else {
				self.tabList.append(listItem);
			}

			if (oldListItem.hasClass("changed")) {
				listItem.addClass("changed");
			}

			if (oldListItem.hasClass("active")) {
				listItem.addClass("active");
			}

			self.sessions[path].listItem = listItem;
			oldListItem.remove();

		},

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

		updateTabDropdownVisibility: function() {
			while (self.isTabListOverflowed()) {
				var tab = self.tabList.find('li:last-child');
				if (tab) {
					self.moveTabToDropdownMenu(tab);
				} else break;
			}

			while (!self.isTabListOverflowed(true)) {
				var menuItem = self.dropDownMenu.find('li:last-child');
				if (menuItem) {
					self.moveDropdownMenuItemToTab(menuItem);
				} else break;
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

		//////////////////////////////////////////////////////////////////
		// Factory
		//////////////////////////////////////////////////////////////////



		createListItem: function(path) {
			var split = atheos.common.splitDirectoryAndFileName(path);

			var item = '<li class="draggable" data-path="' + path + '"><a>' +
				split.directory + '<span class="file-name">' + split.fileName + '</span>' +
				'</a><i class="close fas fa-times-circle"></i></li>';

			item = oX(item);

			return item;
		}

	};

})(this);