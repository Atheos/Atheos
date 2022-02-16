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

	let cp = $('footer small'),
		yr = new Date().getFullYear(),
		text = 'Copyright ' + yr + ', Liam Siira';
	cp && (cp.innerText = text);

});