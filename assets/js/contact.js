//////////////////////////////////////////////////////////////////////////////80
// Contact: Simple Ajax contact form
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/license.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';

	let btn = null;

	function submit(e) {
		e.preventDefault();

		btn = $('#contact input[type="submit"]');
		btn.value = 'Sending...';
		setLoading(true);

		echo({
			url: '/cdn/contact.php',
			data: {
				name: $('#name').value,
				email: $('#email').value,
				text: $('#text').value
			},
			settled: toast
		});
	}

	function setLoading(enabled) {
		if (enabled && btn) {
			btn.classList.add('disabled');
			btn.value = btn.value + '.';
			setTimeout(() => setLoading(true), 750);
		} else {
			btn.classList.remove('disabled');
			btn.value = 'Submit';
			btn = null;
		}
	}

	function toast(reply) {
		setLoading(false);

		$('toast icon').className = '';
		$('toast icon').classList.add(reply.icon);
		$('toast span').innerText = reply.text;

		var wrapper = $("toast");
		wrapper.classList.add("show");
		setTimeout(() => wrapper.classList.remove("show"), 4200);
	}

	global.Contact = {
		init: function() {
			var form = $('#contact');
			if (form) form.addEventListener('submit', submit);
		}
	};
})(this);