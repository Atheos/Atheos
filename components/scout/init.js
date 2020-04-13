/*jshint esversion: 6 */

//////////////////////////////////////////////////////////////////////////////80
// Scout
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80
// Notes: 
// Module used to scan through a project's files by their contents.
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';

	var atheos = global.atheos,
		amplify = global.amplify,
		ajax = global.ajax,
		oX = global.onyx;

	var self = null;

	amplify.subscribe('atheos.loaded', () => atheos.scout.init());


	atheos.scout = {
		controller: 'components/scout/controller.php',
		dialog: 'components/scout/dialog.php',
		cachedFileTree: null,
		rootPath: null,
		rootName: null,
		strategy: 'left_prefix',

		init: function() {
			self = this;

			oX('#open_probe').on('click', function(e) {
				self.probe();
			});

			oX('#filter_open').on('click', function() {
				self.showFilter();
			});
			oX('#filter_close').on('click', function() {
				self.hideFilter();
			});


			var filterStrategy = oX('#filter_strategy');

			oX('#filter_options').on('click', function() {
				filterStrategy.show();
			});

			filterStrategy.on('click', function(e) {
				var node = oX(e.target);
				filterStrategy.find('.active').removeClass('active');
				if (e.target.tagname === 'A') {
					self.strategy = node.attr('data-option');
					node.parent().addClass('active');
					filterStrategy.hide();
				}
			});

			var changeTimeout = false;
			oX('#filter_input').on('change, keydown, paste, input', function() {
				if (changeTimeout !== false) clearTimeout(changeTimeout);
				changeTimeout = setTimeout(function() {
					self.filterTree();
					changeTimeout = false;
				}, 1000);
			});
		},
		//////////////////////////////////////////////////////////////////
		// Search
		//////////////////////////////////////////////////////////////////
		probe: function() {

			var path = atheos.project.current.path;

			var listener = function() {
				// atheos.common.hideOverlay();
				var table = oX('#probe_results');

				var lastSearched = JSON.parse(atheos.storage('lastSearched'));

				if (lastSearched) {
					oX('#modal_content form input[name="probe_query"]').value(lastSearched.searchText);
					oX('#modal_content form input[name="probe_filter"]').value(lastSearched.fileExtension);
					oX('#modal_content form select[name="probe_type"]').value(lastSearched.searchType);
					if (lastSearched.searchResults !== '') {
						table.html(lastSearched.searchResults);
						atheos.flow.slide('open', table.el);
						atheos.modal.resize();
					}
				}

				var listener = function(e) {
					e.preventDefault();

					oX('#probe_processing').show();

					var query = oX('#modal_content form input[name="probe_query"]').value();
					var fileExtensions = oX('#modal_content form input[name="probe_filter"]').value();
					var filter = fileExtensions.trim();
					if (filter !== '') {
						//season the string to use in find command
						filter = '\\(' + filter.replace(/\s+/g, '\\|') + '\\)';
					}

					var type = oX('#modal_content form select[name="probe_type"]').value();

					ajax({
						url: self.controller,
						data: {
							action: 'probe',
							type: type,
							path: path,
							query: query,
							filter: filter
						},
						success: function(reply) {
							table.empty();
							oX('#probe_processing').hide();
							var results = '';
							if (reply.status === 'error') {
								table.append('<p>' + reply.text + '</p>');
								return;
							}
							for (var key in reply) {
								if (!reply.hasOwnProperty(key) || key === 'status') continue;

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
									content += `<a class="result" onclick="atheos.filemanager.openFile('${result.path}',true,${result.line});atheos.modal.unload();"><span>Line ${result.line}: </span>${result.string}
												</a>`;
								});

								node.html(content);
								table.append(node);
							}
							results = table.html();
							atheos.flow.slide('open', table.el);

							self.saveSearchResults(query, type, filter, results);
							atheos.modal.resize();

						}
					});

				};

				oX('#modal_content form').on('submit', listener);
			};

			amplify.subscribe('modal.loaded', listener);

			atheos.modal.load(500, this.dialog, {
				action: 'probe',
				path: path
			});
		},

		/////////////////////////////////////////////////////////////////
		// saveSearchResults
		/////////////////////////////////////////////////////////////////
		saveSearchResults: function(searchText, searchType, fileExtensions, searchResults) {
			var lastSearched = {
				searchText: searchText,
				searchType: searchType,
				fileExtension: fileExtensions,
				searchResults: searchResults
			};
			atheos.storage('lastSearched', JSON.stringify(lastSearched));
		},

		showFilter: function() {
			self.cachedFileTree = oX('#file-manager').html();
			self.rootPath = oX('#project-root').attr('data-path');
			self.rootName = oX('#project-root span').text();

			self.currentlyFiltering = null;

			oX("#filter_wrapper").show();
			oX("#filter_input").focus();
		},

		hideFilter: function() {
			oX("#filter_wrapper").hide();

			if (self.cachedFileTree) {
				oX('#file-manager').html(self.cachedFileTree);
				self.cachedFileTree = null;
			}

			oX('#filter_input').empty();
		},

		filterTree: function() {
			var input = oX('#filter_input').value();

			input = input.replace(/^\s+|\s+$/g, '');

			if (!input || input === this.currentlyFiltering) {
				return;
			} else {
				self.currentlyFiltering = input;
				ajax({
					url: self.controller,
					data: {
						action: 'filter',
						filter: input,
						path: self.rootPath,
						strategy: self.strategy
					},
					success: function(reply) {
						if (reply.status === 'success') {
							self.renderTree(reply);
						} else {
							self.noResults();
						}
					}
				});
			}
		},

		// Use query response returned by server to filter the directory tree
		renderTree: function(data) {
			var tree = this.createHierarchy(data);
			var domTree = this.createDirectory(tree);

			oX('#project-root').siblings('ul')[0].html(domTree);

		},

		// Empty the tree and notify that no files were found
		noResults: function() {
			var notice = '<ul><li><a><i class="fas fa-info-circle medium-blue"></i><span>No Results.</span></a></li</ul>';
			oX('#project-root').siblings('ul')[0].html(notice);
		},

		// Construct internal representation for filtered directory tree
		// from array returned by server
		createHierarchy: function(data) {
			var tree = {},
				pathArray = [],
				currentLevel = {};

			for (var key in data) {
				if (!data.hasOwnProperty(key) || key === 'status') continue;
				var result = data[key],
					path = result.path,
					type = result.type;

				currentLevel = tree;

				if (atheos.project.isAbsPath(path)) {
					pathArray = path.replace(this.rootPath, this.rootName).split('/');
				} else {
					pathArray = path.split('/');
				}

				pathArray.forEach(function(fragment, index) {
					if (fragment === "") return;

					if (!currentLevel[fragment]) {
						type = index < (pathArray.length - 1) ? 'directory' : result.type;
						currentLevel[fragment] = {
							type: type,
							children: {}
						};
						if (type === 'file') {
							currentLevel[fragment].path = path;
						} else {
							if (atheos.project.isAbsPath(path)) {
								currentLevel[fragment].path = pathArray.slice(0, index + 1).join('/').replace(this.rootName, this.rootPath);
							} else {
								currentLevel[fragment].path = pathArray.slice(0, index + 1).join('/');
							}
						}
					}
					currentLevel = currentLevel[fragment].children;
				});

			}
			return tree;
		},

		// Construct DOM tree from internal data-structure representing
		// the filtered directory tree
		createDirectory: function(tree) {
			var str = "<ul>";

			for (var key in tree) {
				str += this.createDirectoryItem(key, tree[key]);
			}
			str += "</ul>";
			return str;
		},

		// Create DOM node for a particular tree element
		createDirectoryItem: function(name, obj) {
			// var name = atheos.common.getNodeName(path);
			// name = path.replace(path, '').split('/').join('');
			var fileClass = obj.type === 'directory' ? 'fa fa-folder medium-blue' : global.FileIcons.getClassWithColor(name);

			var nodeClass = 'none';
			if (obj.type === 'directory' && (obj.children)) {
				nodeClass = 'fa fa-plus';
			}

			fileClass = fileClass || 'fa fa-file medium-green';

			var node = '<li>';

			node += `<a data-type="${obj.type}" data-path="${self.rootPath}/${obj.path}">
						<i class="expand ${nodeClass}"></i>
						<i class="${fileClass}"></i>
						<span>${name}</span>
					</a>`;

			if (obj.children) {
				node += '<ul>';
				for (var key in obj.children) {
					node += this.createDirectoryItem(key, obj.children[key]);
				}
				node += '</ul>';

			}
			node += '</li>';

			return node;
		}
	};

})(this);