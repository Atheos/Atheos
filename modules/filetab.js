//////////////////////////////////////////////////////////////////////////////80
// Filetab
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Description:
// Small module to handle file tabs, primarily to reduce editor.js
// size during refactor; may be merged back at a later date.
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';

	const self = {

		tabList: null,
		dropDownMenu: null,
		loopBehavior: 'loopActive',
		dropDownOpen: false,

		//////////////////////////////////////////////////////////////////////80
		// Init
		//////////////////////////////////////////////////////////////////////80
		init: function() {
			// Resolve DOM nodes fresh at init time
			self.tabList = oX('#active_file_tabs');
			self.dropDownMenu = oX('#active_file_dropdown');
			
			self.initFileTabListener();

			atheos.common.initMenuHandler('#tab_dropdown', '#active_file_dropdown', ['fa-chevron-circle-down', 'fa-chevron-circle-up']);

			fX('#tab_close').on('click', function(e) {
				e.stopPropagation();
				atheos.editor.closeAll();
			});

			carbon.subscribe('settings.loaded', function() {
				// Retrieve editor settings from localStorage
				self.loopBehavior = storage('editor.loopBehavior') || self.loopBehavior;
				// This timeout is an effort to double check the tab visibility
				// after everything has been loaded. The default route has some 
				// minor issues on loading such that it doesn't quite meet spec
				setTimeout(self.updateTabDropdownVisibility, 500);
			});

			window.onresize = self.updateTabDropdownVisibility;
		},


		initFileTabListener: function() {
			var activeListener = function(e) {
				e.stopPropagation();

				var tagName = e.target.tagName;
				var node = oX(e.target);

				if (tagName === 'UL') return;

				var path = node.attr('data-path');
				if (['I', 'A', 'SPAN'].indexOf(tagName) > -1) {
					path = node.parent('LI').attr('data-path');
				}

				if (e.which === 2) {
					// Middle click anywhere closes file
					self.close(path);

				} else if (e.which === 1) {

					// Left click not on an icon: Switch focus to file
					if (tagName !== 'I') {
						atheos.editor.focusOnFile(path);
						atheos.editor.sendFocusToServer(path);

						// Left click on an icon: Save or close file
					} else if (tagName === 'I') {
						// Save file
						if (node.hasClass('save')) {
							atheos.editor.save(path);

							// Close file
						} else if (node.hasClass('close')) {
							atheos.editor.close(path);
							// 		self.updateTabDropdownVisibility();
						}
					}
				}
			};

			fX('#active_file_tabs').on('click, auxclick', function(e) {
				activeListener(e);
			});

			fX('#active_file_dropdown').on('click, auxclick', function(e) {
				activeListener(e);
			});

			fX('#active_file_tabs').on('mousedown', self.handleFileTabDrag);

			fX('#active_file_tabs').on('dragstart', blackhole);

		},

		handleFileTabDrag: function(e) {
			// Inspired By: https://codepen.io/fitri/pen/VbrZQm
			// Made with love by @fitri
			// & https://github.com/io-developer/js-dragndrop
			e.stopPropagation();

			var target = e.target;
			var origin, sibling;

			var dragZone = self.tabList.element;
			var clone, startEX, startEY, startMX, startMY, timeout;

			var xMax, yMax;

			function moveTarget(e) {
				timeout = false;

				var swap = [].slice.call(dragZone.querySelectorAll('.draggable'));

				swap = swap.filter((item) => {
					var rect = item.getBoundingClientRect();
					if (e.clientX < rect.left || e.clientX >= rect.right) return false;
					return (item !== clone);
				});

				if (swap.length === 0) return;

				swap = swap[swap.length - 1];
				if (dragZone.contains(swap)) {
					swap = swap !== target.nextSibling ? swap : swap.nextSibling;
					if (swap) {
						swap.parentNode.insertBefore(target, swap);
					}
				}
			}

			function dragMove(e) {
				var x = startEX + e.screenX - startMX;
				x = (x > xMax) ? xMax : ((x < 0) ? 0 : x);
				clone.style.left = (x - dragZone.scrollLeft) + 'px';
				if (timeout === false) {
					// In an attempt at optimization, I am setting a timeout on
					// the moveTarget such that it runs only once every 50ms
					timeout = setTimeout(() => moveTarget(e), 50);
				}
			}

			function dragStart() {
				timeout = false;

				startEX = target.offsetLeft;
				startEY = target.offsetTop;

				startMX = e.screenX;
				startMY = e.screenY;

				clone = target.cloneNode(true);
				clone.style.left = (startEX - dragZone.scrollLeft) + 'px';
				clone.style.top = (startEY - dragZone.scrollTop) + 'px';
				clone.style.position = 'absolute';
				clone.style.cursor = 'grabbing';

				dragZone.append(clone);
				target.style.opacity = 0;

				xMax = dragZone.offsetWidth - clone.offsetWidth;
				yMax = dragZone.offsetHeight - clone.offsetHeight;

				document.addEventListener('mousemove', dragMove);
			}

			function dragEnd() {
				clearTimeout(timeout);
				target.style.opacity = '';
				if (clone) clone.remove();
				if (target.parentNode !== origin) {
					if (sibling) {
						sibling.after(target);
					} else {
						origin.append(target);
					}
				}
				document.removeEventListener('mousemove', dragMove);
				document.removeEventListener('mouseup', dragEnd);
			}

			target = target.closest('.draggable');
			if (!target || !dragZone) return;

			origin = target.parentNode;
			sibling = target.previousSibling;

			timeout = setTimeout(dragStart, 200);
			document.addEventListener('mouseup', dragEnd);
		},


		//////////////////////////////////////////////////////////////////////80
		// Find next file tab
		//////////////////////////////////////////////////////////////////////80
		getNextFileTab: function(direction) {

			var activeTabs = self.tabList.findAll('li');
			if (self.loopBehavior === 'loopBoth') {
				var dropDownChildren = self.dropDownMenu.findAll('li');
				activeTabs = activeTabs.concat(dropDownChildren);
			}

			var currentTabIndex = false;

			activeTabs.forEach(function(tab, i) {
				currentTabIndex = tab.hasClass('active') ? i : currentTabIndex;
			});

			if (currentTabIndex === false || activeTabs.length === 0) {
				return;
			}

			var nextTabElement, nextTabIndex = null;

			if (direction === 'up') {
				nextTabIndex = (currentTabIndex === 0) ? (activeTabs.length - 1) : (currentTabIndex - 1);
				nextTabElement = activeTabs[nextTabIndex];
			} else {
				nextTabIndex = (currentTabIndex + 1) % activeTabs.length;
				nextTabElement = activeTabs[nextTabIndex];
			}
			return nextTabElement.attr('data-path');
		},

		highlightEntry: function(path, direction) {
			direction = direction || false;
			var active = self.tabList.findAll('.active');
			active.forEach(function(item) {
				item.removeClass('active');
			});

			var file = atheos.editor.activeFiles[path];
			var dropDown = self.dropDownMenu.find('[data-path="' + path + '"]');

			if (dropDown.exists()) {
				var fileTab = file.fileTab;
				self.moveTab(self.tabList, fileTab, direction);

				var tab;
				if (direction === 'up') {
					tab = self.tabList.find('li:last-child');
				} else {
					tab = self.tabList.find('li:first-child');
				}
				self.moveTab(self.dropDownMenu, tab, direction);
			}
			file.fileTab.addClass('active');
		},

		//////////////////////////////////////////////////////////////////////80
		// Move tab between Active & Dropdown
		//////////////////////////////////////////////////////////////////////80
		moveTab: function(destination, fileTab, direction) {
			direction = direction || false;

			if (direction === 'up') {
				destination.prepend(fileTab);
			} else {
				destination.append(fileTab);
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Add newly opened file to list
		//////////////////////////////////////////////////////////////////////80
		createFileTab: function(path) {
			/* If the tab list would overflow with the new tab. Move the
				* first tab to dropdown, then add a new tab. */
			if (self.isTabListOverflowed(true)) {
				var tab = self.tabList.find('li:first-child');
				self.moveTab(self.dropDownMenu, tab);
			}

			var fileTab = self.createListItem(path);
			self.tabList.append(fileTab);
			self.updateTabDropdownVisibility();

			return fileTab;
		},

		//////////////////////////////////////////////////////////////////////80
		// Is the activeTabs overflowed
		//////////////////////////////////////////////////////////////////////80
		isTabListOverflowed: function(includeFictiveTab) {
			includeFictiveTab = includeFictiveTab || false;

			var tabs = self.tabList.findAll('li');

			if (!tabs) return false;
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

			var availableWidth = oX('#ACTIVE').width();

			var iconWidths = oX('#tab_dropdown').width() * 2;

			var room = availableWidth - (iconWidths + tabWidth + 50);

			return (room < 0);
		},

		//////////////////////////////////////////////////////////////////////80
		// Update tab visibility
		//////////////////////////////////////////////////////////////////////80
		updateTabDropdownVisibility: function() {
			var fileTab;

			while (self.isTabListOverflowed()) {
				fileTab = self.tabList.find('li:last-child');
				if (fileTab.exists()) {
					self.moveTab(self.dropDownMenu, fileTab);
				} else {
					break;
				}
			}

			while (!self.isTabListOverflowed(true)) {
				fileTab = self.dropDownMenu.find('li:last-child');
				if (fileTab.exists()) {
					self.moveTab(self.tabList, fileTab);
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
			var info = pathinfo(path);

			var item = `<li class="draggable" data-path="${path}">
			<a title="${path}"><span class="subtle">${info.directory}/</span>${info.basename}</a>
			<i class="save fas fa-save"></i><i class="close fas fa-times-circle"></i>
			</li>`;

			item = oX(item);
			return item;
		},

	};

	carbon.subscribe('system.loadMinor', () => self.init());
	atheos.tabmanager = self;

})();