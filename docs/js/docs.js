//     Util.Main.js
//     (c) 2019 Liam Siira (liam@siira.us)

(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], function() {
			return factory(root);
		});
	} else if (typeof exports === 'object') {
		module.exports = factory(root);
	} else {
		root.docs = factory(root);
	}
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this, function(window) {

	'use strict';
	const docs = {

		settings: {
			// URL: 'https://github.com/HLSiira/Atheos/tree/master/docs'
			URL: 'https://raw.githubusercontent.com/Atheos/Atheos/master/',
			fileTree: {},
			currentDoc: ''
		},


		init: function() {
			this.loadPage('docs/LICENSE');

			this.createDirectory('/docs');

		},
		createDirectory: function(path, element) {
			ajax({
				url: 'https://api.github.com/repos/atheos/atheos/contents/' + path,
				type: 'get',
				success: function(data) {
					data = JSON.parse(data);
					data.sort(docs.sortOBJ('type'));
					console.log(data);
					data.forEach(file => {
						// console.log(el);
						if (file.name.split('.').pop() === 'md' || file.type === 'dir') {
							docs.addNavLink(file, element);
						}

					});
				}
			});
		},
		addNavLink: function(file, element) {
			element = element || P('nav ul');
			let nav = P(document.createElement('li'));
			file = {
				name: file.name,
				path: file.path.split('.').slice(0, -1).join('.'),
				type: file.type
			};
			nav.html(`
					<a href="${file.path}" data-type="${file.type}">
						<i class="icon-${file.type}"></i>
						<span>${file.name}</span>
					</a>
			`);
			nav.on('click', docs.openNav, false);
			element.sel.appendChild(nav.sel);
		},

		openNav: function(e) {
			e.preventDefault();
			let target = P(e.target);
			console.log(target.attr('href'));
			if (target.attr('data-type') == 'file') {
				docs.loadPage(target.attr('href'));
			}
			console.log(target);
		},

		parseURL: function(q) {
			if (!q) {
				return 'index';
			}
			let queryString = window.location.search,
				urlParams = new URLSearchParams(q);

			return urlParams || 'index';

		},

		loadPage: function(p = 'index') {
			if (p !== this.settings.currentPage) {
				this.settings.currentPage = p;
				ajax({
					url: `${this.settings.URL}${p}.md`,
					type: 'get',
					success: this.renderPage
				});
			}
		},

		renderPage: function(markdown) {
			let content = P('#content');
			content.html(marked(markdown));
		},

		createToC: function() {
			var ToC =
				"<nav role='navigation' class='table-of-contents'>" +
				"<h2>On this page:</h2>" +
				"<ul>";

			var newLine, el, title, link;

			$("article h3").each(function() {

				el = $(this);
				title = el.text();
				link = "#" + el.attr("id");

				newLine =
					"<li>" +
					"<a href='" + link + "'>" +
					title +
					"</a>" +
					"</li>";

				ToC += newLine;

			});

			ToC +=
				"</ul>" +
				"</nav>";

			$(".all-questions").prepend(ToC);
		},
		sortOBJ: function(key) {
			return function innersort(a, b) {
				if (a[key] < b[key]) {
					return -1;
				}
				if (a[key] > b[key]) {
					return 1;
				}
				return 0;
			};
		}

	};


	return docs;

});

document.addEventListener("DOMContentLoaded", function() {
	docs.init();
});