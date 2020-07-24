(function() {

	'use strict';
	document.addEventListener("DOMContentLoaded", function() {
		echo({
			url: 'https://api.github.com/repos/Atheos/Atheos/tags',
			type: 'GET',
			success: function(reply) {
				// data = JSON.parse(data);
				var tags = document.querySelectorAll('.version_tag');
				for (var i = 0; i < tags.length; ++i) {
					tags[i].innerText = reply[0].name;
				}
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
		if (typeof Synthetic !== 'undefined') Synthetic.init();
		if (typeof Aeon !== 'undefined') Aeon.init();

	});
})();