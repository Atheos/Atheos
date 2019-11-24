;
(function() {

	'use strict';
	document.addEventListener("DOMContentLoaded", function() {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open('GET', 'https://api.github.com/repos/HLSiira/Atheos/tags', true);
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4) {
				if (xmlhttp.status == 200) {
					var obj = JSON.parse(xmlhttp.responseText);
					document.querySelector('#version_tag').innerText = obj[0].name;
				}
			}
		};
		xmlhttp.send(null);
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