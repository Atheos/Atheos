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
		synthetic.init();

	});
	document.addEventListener("change", function(e) {
		if (e.target.tagName === 'SELECT') {
			var sel = e.target,
				type = sel.id.split('_').pop(),
				file = sel.value;
			ajax({
				url: `/raw?des=blog&type=${type}&file=${file}`,
				success: function(data) {
					var p = document.getElementById('blog_p_' + type);
					p.innerHTML = data;
				},
				error: function(data) {
					console.log('server error');
				}
			});
		}
	});
})();