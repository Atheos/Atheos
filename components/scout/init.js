//////////////////////////////////////////////////////////////////////////////80
// Scout
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';


	const self = {

		cachedFileTree: null,
		rootPath: null,
		rootName: null,
		strategy: 'left_prefix',

		//////////////////////////////////////////////////////////////////////80
		// Initilization
		//////////////////////////////////////////////////////////////////////80
		init: function() {
			fX('#search_open').on('click', self.openSearch);
			fX('#filter_open').on('click', self.openFilter);
			fX('#filter_exit').on('click', self.exitFilter);

			atheos.common.initMenuHandler('#filter_options', '#filter_strategy');

			var strategyMenu = oX('#filter_strategy');
			fX('#filter_strategy').on('click', function(e) {
				var node = oX(e.target);
				strategyMenu.find('.active').removeClass('active');
				if (e.target.tagname === 'A') {
					self.strategy = node.attr('data-option');
					node.parent().addClass('active');
				}
			});

			var changeTimeout = false;
			fX('#filter_input').on('change, keydown, paste, input', function() {
				if (changeTimeout !== false) {
					clearTimeout(changeTimeout);
				}
				changeTimeout = setTimeout(function() {
					self.filterTree();
					changeTimeout = false;
				}, 500);
			});


			fX('#dialog .searchText').on('submit', self.searchText);

		},

		searchText: function(e) {
			e.preventDefault();

			var table = oX('#probe_results');

			oX('#probe_processing').show();

			var query = oX('#dialog input[name="probe_query"]').value();
			var extensions = oX('#dialog input[name="probe_filter"]').value();
			var filter = extensions.trim();
			// var type = oX('#dialog select[name="probe_type"]').prop('checked');
			if (filter !== '') {
				//season the string to use in find command
				filter = '\\(' + filter.replace(/\s+/g, '\\|') + '\\)';
			}

			echo({
				url: atheos.controller,
				data: {
					target: 'scout',
					action: 'probe',
					// type,
					path: atheos.current.projectPath,
					query,
					filter
				},
				settled: function(reply, status) {
					table.empty();
					oX('#probe_processing').hide();
					var results = '';
					if (status === 404) {
						table.append('<p>' + reply.text + '</p>');
						return;
					}

					for (var key in reply) {

						var file = reply[key];

						if (key.substr(-1) === '/') {
							key = key.substr(0, key.substr.length - 1);
						}

						var node = oX('<div>'),
							content = '<span><strong>File: </strong>' + key + '</span>';

						node.addClass('file');

						file.forEach(function(result) {
							// result.string = String(result.string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
							// result.line = result.line.length >= file.length ? result.line : new Array(file.length - result.length + 1).join(' ') + result.line;
							content += `<a class="result" onclick="atheos.sessionmanager.openFile('${result.path}',true,${result.line});atheos.modal.unload();"><span>Line ${result.line}: </span>${result.string}</a>`;
						});

						node.html(content);
						table.append(node);
					}
					results = table.html();
					atheos.flow.slide('open', table.element);

					self.saveSearchResults(query, extensions, results);
					atheos.modal.resize();

				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Probe file contents
		//////////////////////////////////////////////////////////////////////80
		openSearch: function() {
			atheos.modal.load(500, {
				target: 'scout',
				action: 'probe',
				callback: function() {
					var table = oX('#probe_results');

					var lastSearched = JSON.parse(storage('lastSearched'));

					if (lastSearched) {
						oX('#dialog input[name="probe_query"]').value(lastSearched.query);
						oX('#dialog input[name="probe_filter"]').value(lastSearched.extensions);
						// oX('#dialog input[name="probe_type"]').checked(lastSearched.type);
						if (lastSearched.results !== '') {
							table.html(lastSearched.results);
							atheos.flow.slide('open', table.element);
							atheos.modal.resize();
						}
					}
				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Save Search Results
		//////////////////////////////////////////////////////////////////////80
		saveSearchResults: function(query, extensions, results) {
			var lastSearched = {
				query,
				extensions,
				results,
				// type
			};
			storage('lastSearched', JSON.stringify(lastSearched));
		},

		//////////////////////////////////////////////////////////////////////80
		// Show Filter
		//////////////////////////////////////////////////////////////////////80
		openFilter: function() {
			self.cachedFileTree = oX('#FILETREE').html();
			self.rootPath = oX('#project-root').attr('data-path');
			self.rootName = oX('#project-root span').text();

			self.currentlyFiltering = null;

			oX('#filter_wrapper').show();
			oX('#filter_input').focus();
		},

		//////////////////////////////////////////////////////////////////////80
		// Hide Filter
		//////////////////////////////////////////////////////////////////////80
		exitFilter: function() {
			oX('#filter_wrapper').hide();

			if (self.cachedFileTree) {
				oX('#FILETREE').html(self.cachedFileTree);
				self.cachedFileTree = null;
			}
			oX('#filter_input').empty();
		},

		//////////////////////////////////////////////////////////////////////80
		// Filter File Manager
		//////////////////////////////////////////////////////////////////////80
		filterTree: function() {
			var input = oX('#filter_input').value();
			var projectRoot = oX('#project-root').siblings('ul')[0];

			input = input.replace(/^\s+|\s+$/g, '');

			if (!input || input === self.currentlyFiltering) {
				return;
			}

			self.currentlyFiltering = input;
			echo({
				url: atheos.controller,
				data: {
					target: 'scout',
					action: 'filter',
					keyword: input,
					path: self.rootPath,
					strategy: self.strategy
				},
				settled: function(reply, status) {
					if (status === 200) {
						projectRoot.html('');
						self.createHierarchy(reply);
					} else {
						var notice = '<ul><li><a><i class="fas fa-info-circle medium-blue"></i><span>No Results.</span></a></li</ul>';
						projectRoot.html(notice);
					}
				}
			});

		},


		//////////////////////////////////////////////////////////////////////80
		// Create Hierarchry Representing Filtered Tree
		//////////////////////////////////////////////////////////////////////80
		createHierarchy: function(searchResults) {
			searchResults = Object.values(searchResults);
			// Sort folders first, then alphabetically
			searchResults.sort((a, b) => {
				if (a.relativePath === b.relativePath) return 0;
				if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
				return a.relativePath.localeCompare(b.relativePath);
			});
			log(searchResults);
			for (const node of searchResults) {
				self.addToFileTree(node.fullPath, node.type, node.repo, node.link);
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Create Hierarchry Representing Filtered Tree
		//////////////////////////////////////////////////////////////////////80
		addToFileTree: function(path, type, isRepo, isLink) {
			// Already exists
			if (oX('#FILETREE a[data-path="' + path + '"]').exists()) return;

			let parentPath = pathinfo(path).directory,
				size = 0;

			// Check if parent exists, create it if it doesnt, and open it:
			var parentNode = oX('#FILETREE a[data-path="' + parentPath + '"]');
			if (!parentNode.exists()) {
				parentNode = self.addToFileTree(parentPath, 'folder');
				if (!parentNode) return false; // Return false for hidden parent folders
			}
			parentNode.addClass('open');
			parentNode.find('.expand').replaceClass('none', 'fa fa-minus');

			var nodeHTML = atheos.fileTree.createDirectoryItem(path, type, size, isRepo, isLink);
			if (nodeHTML == '') return false; // Return false for hidden files / parent folders
			var list = parentNode.siblings('ul')[0];
			if (list) {
				// UL exists, other children to play with
				list.append(nodeHTML);
				atheos.fileTree.sortNodes(list.element);
			} else {
				list = oX('<ul>');
				list.append(nodeHTML);
				parentNode.append(list.element);
			}
			
			// Return an onyx link for recursive creation of parent directories
			return oX('#FILETREE a[data-path="' + path + '"]');
		}
	};

	carbon.subscribe('system.loadExtra', () => self.init());
	atheos.scout = self;

})();