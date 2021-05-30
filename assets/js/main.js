//////////////////////////////////////////////////////////////////////////////80
// Main Controller
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/license.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80

document.addEventListener("DOMContentLoaded", function() {
	'use strict';

	window.log = Function.prototype.bind.call(console.log, console);
	window.$ = (s) => document.querySelector(s);
	window.$$ = (s) => document.querySelectorAll(s);

	log(`╭─────────────────────────────╮\n
		│ Hi, I'm Liam Siira.         │\n
		│ Want to get in touch?       │\n
		│ Contact me at liam@siira.io.│\n
		╰─────────────────────────────╯`);

	if (typeof Synthetic !== 'undefined') Synthetic.init();

	if ('fonts' in document) {
		Promise.all([
			document.fonts.load('700 1em Ubuntu'),
			document.fonts.load('500 1em Ubuntu')
		]).then(function() {
			document.documentElement.className += 'ready';
		});
	}

	fetch('https://api.github.com/repos/Atheos/Atheos/tags')
		.then(response => response.json())
		.then(data => {
			for(let tag of $$('.version_tag')) {
				tag.innerText = data[0].name;
			}
		});

	let cp = $('footer small'),
		yr = new Date().getFullYear(),
		text = 'Copyright ' + yr + ', Liam Siira';
	cp && (cp.innerText = text);

});