;
(function() {

	'use strict';
	document.addEventListener("DOMContentLoaded", function() {
		ajax({
			url: 'https://api.github.com/repos/Atheos/Atheos/tags',
			type: 'GET',
			success: function(data) {
				data = JSON.parse(data);
				document.querySelector('#version_tag').innerText = data[0].name;
			}
		});

		if (window.console && window.console.log) {
			window.console.log([
				"",
				"╭───────────────────────────────╮",
				"│                               │",
				"│  Hi, I'm Liam Siira.          │",
				"│  Want to get in touch?        │",
				"│  Contact me at liam@siira.us. │",
				"│                               │",
				"╰───────────────────────────────╯"
			].join("\n"));
		}
	});
})();