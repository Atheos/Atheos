(function(global, $) {

	var atheos = global.atheos,
		amplify = global.amplify,
		ajax = global.ajax,
		fileIcons = global.FileIcons,
		o = global.onyx;

	amplify.subscribe('atheos.loaded', function(settings) {
		atheos.finder.init();
	});

	//////////////////////////////////////////////////////////////////
	//
	//  Search utility to quickly filter the directory tree
	//  according to multiple matching strategies
	//
	//////////////////////////////////////////////////////////////////

	atheos.finder = {

		finderExpanded: false,
		menu: '',
		rootName: '',
		rootPath: '',
		htmlCache: '',
		options: {},

		// Setup finder
		init: function() {
			var finder = this;

			o('#tree-search').on('click', function() {
				if (!finder.finderExpanded) {
					finder.expandFinder();
				} else {
					finder.contractFinder();
				}
			});

			o('#finder-label').on('click', function() {
				finder.expandFinder();
			});

			var menu = o('#finder-options-menu');
			var $finderOptionsMenu = $('#finder-options-menu');
			finder.menu = menu;


			$('#finder-options').click(function() {
				$finderOptionsMenu.toggle();
			});

			// Setup the menu for selection of finding strategy
			$finderOptionsMenu.bind('click', 'a', function(e) {
				var $target = $(e.target);
				var strategy = $target.attr('data-option');
				var action = $target.attr('data-action');
				if (strategy) {
					finder.options.strategy = strategy;
					$finderOptionsMenu
						.find('li.chosen')
						.removeClass('chosen');
					$target.parent('li').addClass('chosen');
				} else if (action) {
					atheos.filemanager[action](atheos.project.getCurrent());
					finder.contractFinder();
				}
				$finderOptionsMenu.hide();
			});

			// Setup the menu for selection of finding strategy
			o('#finder-quick').on('click', function(e) {
				atheos.filemanager.search(atheos.project.getCurrent());
				finder.contractFinder();
			});

			/*


			  TODO: provide configuration option
			  to automatically collapse finder
			  --
			  The code below does exactly that
			  --

			$('#sb-left').mouseleave(function(){
			    finder.finderSustainFocus = false;
			    if (! $('#finder').is(':focus')){
			        finder.contractFinder();
			    }
			}).mouseenter(function(){
			    finder.finderSustainFocus = true;
			});
			$('#finder').blur(function(){
			    if (! finder.finderSustainFocus)
			        finder.contractFinder();
			});

			*/
		},

		// Create DOM node for a particular tree element
		createDirectoryItem: function(name, obj) {
			console.log(name);
			console.log(obj);

			// var name = atheos.helpers.getNodeName(path);
			// name = path.replace(path, '').split('/').join('');

			var fileClass = obj.type === 'directory' ? 'fa fa-folder medium-blue' : fileIcons.getClassWithColor(name);

			var nodeClass = 'none';
			if (obj.type === 'directory' && (obj.children)) {
				nodeClass = 'fa fa-plus';
			}

			fileClass = fileClass || 'fa fa-file medium-green';

			var node = '<li>';

			node += `<a data-type="${obj.type}" data-path="${obj.path}">
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

		// Construct internal representation for filtered directory tree
		// from array returned by server
		createHierarchy: function(data) {
			data = data.index;
			//console.log('data : ', data);
			var tree = {},
				fpathArr, i, j, fragment, curLevel, type;
			for (i = 0; i < data.length; i++) {
				curLevel = tree;
				if (atheos.project.isAbsPath(data[i].path)) {
					fpathArr = data[i].path.replace(this.rootPath, this.rootName).split('/');
				} else {
					fpathArr = data[i].path.split('/');
				}
				for (j = 0; j < fpathArr.length; j++) {
					fragment = fpathArr[j];
					if (fragment === "") {
						continue;
					}
					if (!curLevel[fragment]) {
						type = j < fpathArr.length - 1 ? 'directory' : data[i].type;
						curLevel[fragment] = {
							type: type,
							children: {}
						};
						if (type === 'file') {
							curLevel[fragment].path = data[i].path;
						} else {
							if (atheos.project.isAbsPath(data[i].path)) {
								curLevel[fragment].path = fpathArr.slice(0, j + 1).join('/').replace(this.rootName, this.rootPath);
							} else {
								curLevel[fragment].path = fpathArr.slice(0, j + 1).join('/');
							}
						}
					}
					curLevel = curLevel[fragment].children;
				}
			}
			//console.log('tree : ', tree, JSON.stringify(tree));
			return tree;
		},

		// Use query response returned by server to filter the directory tree
		_filterTree: function(data) {
			var tree = this.createHierarchy(data);
			var domTree = this.createDirectory(tree);
			$('#file-manager').html(domTree);
			$('#file-manager>ul>li:first-child>span').remove();
			$('#file-manager>ul>li:first-child>a').attr({
				id: 'project-root',
				'data-type': 'root',
				'data-path': this.rootPath
			});
		},

		// Clear all filters applied and restore the tree to its original state
		_clearFilters: function() {
			//console.info("Reloading initial tree state ");
			if (this.htmlCache)
				$('#file-manager').html(this.htmlCache);
			this.htmlCache = null;
			$('#finder').attr('value', '');
		},

		// Empty the tree and notify that no files were found
		_emptyTree: function() {
			$('#file-manager').html("No files found .");
		},

		// Check finder for changes in the user entered query
		checkFinder: function() {
			var fentry = $('#finder').attr('value');
			var _this = this;
			fentry = fentry.replace(/^\s+|\s+$/g, '');
			if (!fentry || fentry == this._lastEntry) return;
			/*else if (fentry.substring(0, this._lastEntry.length) ===
			         this._lastEntry) {

			    // TODO : Scope for optimization
			    //
			    // User has added characters to query - so unless the
			    // query is a regexp - the filtered results can be
			    // deduced locally if last ajax request had completed.

			    // Not implementing this currently because this is
			    // not very beneficial practically for decent
			    // typing speed.

			}*/
			else {
				// Stop currently ongoing request
				if (this._xhr) this._xhr.abort();

				// Query the server for results
				//console.log("Finder query changed");
				this._lastEntry = fentry;
				this._xhr = $.ajax({
					url: 'components/filemanager/controller.php',
					type: 'GET',
					dataType: 'json',
					data: {
						query: fentry,
						action: 'find',
						path: this.rootPath,
						options: this.options
					},
					success: function(data) {
						if (data.status === 'success') {
							_this._filterTree(data.data);
						} else {
							_this._emptyTree();
						}
					}
				});
			}
		},

		//////////////////////////////////////////////////////////////////
		//
		// Expand the finder box (Textbox through which the directory tree
		// can be searched for matching files) and focus on it.
		//
		//////////////////////////////////////////////////////////////////

		expandFinder: function() {
			this.finderExpanded = true;
			//console.info("Saving tree state : ");
			this.htmlCache = $('#file-manager').html();
			this.rootPath = $('#project-root').attr('data-path');
			this.rootName = $('#project-root').html();

			$("#finder-wrapper").show();
			$("#sb-left-title h2").hide();

			this._lastEntry = null;
			amplify.subscribe('chrono.kilo', this.checkFinder);
			$("#finder").focus();
			$("#finder-quick").hide();
			$("#sb-left-title").addClass('active');
			$("#tree-search")
				.removeClass('icon-search')
				.addClass('icon-cancel-squared active');
		},

		// Contract the finder box
		contractFinder: function() {
			this.finderExpanded = false;
			$("#finder-wrapper").hide('fast');
			$("#sb-left-title h2").show('fast');
			this.menu.hide();
			this._clearFilters();
			amplify.unsubscribe('chrono.kilo', this.checkFinder);

			$("#finder-quick").show();
			$("#sb-left-title").removeClass('active');
			$("#tree-search")
				.removeClass('icon-cancel-squared active')
				.addClass('icon-search');
		}


	};
})(this, jQuery);