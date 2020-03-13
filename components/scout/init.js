//////////////////////////////////////////////////////////////////////////////80
// Discover
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Notes: 
// Module used to scan through a project's files by their contents.
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	// 'use strict';
	var atheos = global.atheos,
		amplify = global.amplify,
		ajax = global.ajax,
		o = global.onyx;

	amplify.subscribe('atheos.loaded', () => atheos.scout.init());


	atheos.scout = {
		controller: 'components/scout/controller.php',
		dialog: 'components/scout/dialog.php',

		init: function() {
			var scout = this;

			o('#finder-quick').on('click', function(e) {
				scout.search(atheos.project.getCurrent());
			});

		},
		//////////////////////////////////////////////////////////////////
		// Search
		//////////////////////////////////////////////////////////////////
		search: function(path) {

			var search = this;
			atheos.modal.load(500, this.dialog, {
				action: 'search',
				path: path
			});
			atheos.modal.ready.then(function() {
				atheos.modal.hideOverlay();
				var table = o('#search_results');


				var lastSearched = JSON.parse(localStorage.getItem('lastSearched'));
				if (lastSearched) {
					o('#modal_content form input[name="search_string"]').value(lastSearched.searchText);
					o('#modal_content form input[name="search_file_type"]').value(lastSearched.fileExtension);
					o('#modal_content form select[name="search_type"]').value(lastSearched.searchType);
					if (lastSearched.searchResults !== '') {
						table.html(lastSearched.searchResults);
						atheos.animation.slide('open', table.el);
						atheos.modal.resize();
					}
				}


				var listener = function(e) {
					e.preventDefault();

					o('#search_processing').show();

					var searchString = o('#modal_content form input[name="search_string"]').value();
					var fileExtensions = o('#modal_content form input[name="search_file_type"]').value();
					var searchFileType = fileExtensions.trim();
					if (searchFileType !== '') {
						//season the string to use in find command
						searchFileType = '\\(' + searchFileType.replace(/\s+/g, '\\|') + '\\)';
					}

					var searchType = o('#modal_content form select[name="search_type"]').value();

					ajax({
						type: 'post',
						url: search.controller + '?action=search&path=' + encodeURIComponent(path) + '&type=' + searchType,
						data: {
							search_string: searchString,
							search_file_type: searchFileType,
							searchString: searchString,
							searchFileType: searchFileType
						},
						success: function(response) {
							response = JSON.parse(response);
							table.empty();
							var results = '';
							if (response.status !== 'error') {
								var index = response.data;

								for (var key in index) {
									if (!index.hasOwnProperty(key)) {
										continue;
									}

									var file = index[key];

									if (key.substr(-1) === '/') {
										key = key.substr(0, key.substr.length - 1);
									}

									var node = o('<div>'),
										content = '<span><strong>File: </strong>' + key + '</span>';

									node.addClass('file');

									file.forEach(function(result) {
										result.string = String(result.string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
										content += `<a class="result" onclick="atheos.filemanager.openFile('${result.path}',true,${result.line});atheos.modal.unload();"><span>Line ${result.line}: </span>${result.string}
												</a>`;
									});

									node.html(content);
									table.append(node);

								}

								results = table.html();
								atheos.animation.slide('open', table.el);

							} else {
								atheos.animation.slide('close', table.el);
							}
							search.saveSearchResults(searchString, searchType, fileExtensions, results);
							o('#search_processing').hide();
							atheos.modal.resize();

						}
					});

				};

				o('#modal_content form').on('submit', listener);

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
			localStorage.setItem('lastSearched', JSON.stringify(lastSearched));
		}
	};
})(this);