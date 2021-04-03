//////////////////////////////////////////////////////////////////////////////80
// Scout
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';

	var atheos = global.atheos;

	var self = null;

	carbon.subscribe('system.loadExtra', () => atheos.scout.init());

	atheos.scout = {

		cachedFileTree: null,
		rootPath: null,
		rootName: null,
		strategy: 'left_prefix',

		//////////////////////////////////////////////////////////////////////80
		// Initilization
		//////////////////////////////////////////////////////////////////////80
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

			atheos.common.initMenuHandler(oX('#filter_options'), oX('#filter_strategy'));

			var strategyMenu = oX('#filter_strategy');
			strategyMenu.on('click', function(e) {
				var node = oX(e.target);
				strategyMenu.find('.active').removeClass('active');
				if (e.target.tagname === 'A') {
					self.strategy = node.attr('data-option');
					node.parent().addClass('active');
				}
			});

			var changeTimeout = false;
			oX('#filter_input').on('change, keydown, paste, input', function() {
				if (changeTimeout !== false) {
					clearTimeout(changeTimeout);
				}
				changeTimeout = setTimeout(function() {
					self.filterTree();
					changeTimeout = false;
				}, 500);
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Probe file contents
		//////////////////////////////////////////////////////////////////////80
		probe: function() {

			var path = atheos.project.current.path;

			var listener = function(e) {
				e.preventDefault();

				var table = oX('#probe_results');

				oX('#probe_processing').show();

				var query = oX('#modal_content input[name="probe_query"]').value();
				var extensions = oX('#modal_content input[name="probe_filter"]').value();
				var filter = extensions.trim();
				// var type = oX('#modal_content select[name="probe_type"]').prop('checked');
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
						path,
						query,
						filter
					},
					success: function(reply) {
						table.empty();
						oX('#probe_processing').hide();
						var results = '';
						if (reply.status === 'error') {
							table.append('<p>' + reply.text + '</p>');
							return;
						}

						delete reply.status;

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
								content += `<a class="result" onclick="atheos.filemanager.openFile('${result.path}',true,${result.line});atheos.modal.unload();"><span>Line ${result.line}: </span>${result.string}</a>`;
							});

							node.html(content);
							table.append(node);
						}
						results = table.html();
						atheos.flow.slide('open', table.el);

						self.saveSearchResults(query, extensions, results);
						atheos.modal.resize();

					}
				});
			};

			atheos.modal.load(500, {
				target: 'scout',
				action: 'probe',
				listener,
				callback: function() {
					var table = oX('#probe_results');

					var lastSearched = JSON.parse(storage('lastSearched'));

					if (lastSearched) {
						oX('#modal_content input[name="probe_query"]').value(lastSearched.query);
						oX('#modal_content input[name="probe_filter"]').value(lastSearched.extensions);
						// oX('#modal_content input[name="probe_type"]').checked(lastSearched.type);
						if (lastSearched.results !== '') {
							table.html(lastSearched.results);
							atheos.flow.slide('open', table.el);
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
		showFilter: function() {
			self.cachedFileTree = oX('#file-manager').html();
			self.rootPath = oX('#project-root').attr('data-path');
			self.rootName = oX('#project-root span').text();

			self.currentlyFiltering = null;

			oX('#filter_wrapper').show();
			oX('#filter_input').focus();
		},

		//////////////////////////////////////////////////////////////////////80
		// Hide Filter
		//////////////////////////////////////////////////////////////////////80
		hideFilter: function() {
			oX('#filter_wrapper').hide();

			if (self.cachedFileTree) {
				oX('#file-manager').html(self.cachedFileTree);
				self.cachedFileTree = null;
			}
			oX('#filter_input').empty();
		},

		//////////////////////////////////////////////////////////////////////80
		// Filter File Manager
		//////////////////////////////////////////////////////////////////////80
		filterTree: function() {
			var input = oX('#filter_input').value();

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
					filter: input,
					path: self.rootPath,
					strategy: self.strategy
				},
				success: function(reply) {
					if (reply.status === 'success') {
						delete reply.status;

						var domTree = self.createHierarchy(reply);
						oX('#project-root').siblings('ul')[0].html(domTree);
					} else {
						var notice = '<ul><li><a><i class="fas fa-info-circle medium-blue"></i><span>No Results.</span></a></li</ul>';
						oX('#project-root').siblings('ul')[0].html(notice);
					}
				}
			});

		},

		//////////////////////////////////////////////////////////////////////80
		// Create Hierarchry Representing Filtered Tree
		//////////////////////////////////////////////////////////////////////80
		createHierarchy: function(data) {
			var tree = {},
				pathArray = [],
				currentLevel = {},
				key;

			for (key in data) {

				var result = data[key],
					path = result.path,
					type = result.type;

				currentLevel = tree;

				if (atheos.common.isAbsPath(path)) {
					pathArray = path.replace(this.rootPath, this.rootName).split('/');
				} else {
					pathArray = path.split('/');
				}

				pathArray.forEach(function(fragment, index) {
					if (fragment === '') {
						return;
					}

					if (!currentLevel[fragment]) {
						type = index < (pathArray.length - 1) ? 'directory' : result.type;
						currentLevel[fragment] = {
							type: type,
							children: {}
						};
						if (type === 'file') {
							currentLevel[fragment].path = path;
						} else {
							if (atheos.common.isAbsPath(path)) {
								currentLevel[fragment].path = pathArray.slice(0, index + 1).join('/').replace(this.rootName, this.rootPath);
							} else {
								currentLevel[fragment].path = pathArray.slice(0, index + 1).join('/');
							}
						}
					}
					currentLevel = currentLevel[fragment].children;
				});
			}

			var domTree = '<ul>';
			for (key in tree) {
				var obj = tree[key];
				domTree += this.createDirectoryItem(`${self.rootPath}/${obj.path}`, obj.type, obj.size);
			}

			for (key in tree) {
				domTree += this.createDirectoryItem(key, tree[key]);
			}
			domTree += '</ul>';
			return domTree;
		},

		//////////////////////////////////////////////////////////////////////80
		// Create Filtered Directory Item
		//////////////////////////////////////////////////////////////////////80
		createDirectoryItem: function(name, obj) {

			var fileClass = obj.type === 'directory' ? 'fa fa-folder medium-blue' : icons.getClassWithColor(name);

			var nodeClass = 'none';
			var isOpen = '';
			if (obj.type === 'directory' && (obj.children)) {
				nodeClass = 'fa fa-minus';
				isOpen = 'class="open"';
			}

			fileClass = fileClass || 'fa fa-file medium-green';

			var node = '<li>';

			node += `<a data-type="${obj.type}" data-path="${self.rootPath}/${obj.path}" ${isOpen}>
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