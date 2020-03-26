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

	amplify.subscribe('atheos.loaded', () => atheos.scout.init());


	atheos.scout = {
		controller: 'components/scout/controller.php',
		dialog: 'components/scout/dialog.php',

		init: function() {
			var scout = this;

			oX('#open_scout').on('click', function(e) {
				scout.search();
			});

		},
		//////////////////////////////////////////////////////////////////
		// Search
		//////////////////////////////////////////////////////////////////
		search: function() {

			var search = this,
				path = atheos.project.current.path;

			var listener = function() {
				// atheos.modal.hideOverlay();
				var table = oX('#search_results');

				var lastSearched = JSON.parse(localStorage.getItem('lastSearched'));

				if (lastSearched) {
					oX('#modal_content form input[name="search_string"]').value(lastSearched.searchText);
					oX('#modal_content form input[name="search_file_type"]').value(lastSearched.fileExtension);
					oX('#modal_content form select[name="search_type"]').value(lastSearched.searchType);
					if (lastSearched.searchResults !== '') {
						table.html(lastSearched.searchResults);
						atheos.animation.slide('open', table.el);
						atheos.modal.resize();
					}
				}

				var listener = function(e) {
					e.preventDefault();

					oX('#search_processing').show();

					var query = oX('#modal_content form input[name="search_string"]').value();
					var fileExtensions = oX('#modal_content form input[name="search_file_type"]').value();
					var filter = fileExtensions.trim();
					if (filter !== '') {
						//season the string to use in find command
						filter = '\\(' + filter.replace(/\s+/g, '\\|') + '\\)';
					}

					var type = oX('#modal_content form select[name="search_type"]').value();

					ajax({
						url: search.controller,
						data: {
							action: 'search',
							type: type,
							path: path,
							query: query,
							filter: filter
						},
						success: function(reply) {
							table.empty();
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
							atheos.animation.slide('open', table.el);

							search.saveSearchResults(query, type, filter, results);
							oX('#search_processing').hide();
							atheos.modal.resize();

						}
					});

				};

				oX('#modal_content form').on('submit', listener);
			};

			amplify.subscribe('modal.loaded', listener);

			atheos.modal.load(500, this.dialog, {
				action: 'search',
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
			localStorage.setItem('lastSearched', JSON.stringify(lastSearched));
		}
	};
})(this);