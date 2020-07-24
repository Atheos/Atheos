//////////////////////////////////////////////////////////////////////////////80
// Main Controller
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/license.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80

document.addEventListener("DOMContentLoaded", function() {

	// Shorthand for sending to console
	window.log = Function.prototype.bind.call(console.log, console);

	console.log([
		"                                 ",
		"╭───────────────────────────────╮",
		"│                               │",
		"│  Hi, I'm Liam Siira.          │",
		"│  Want to get in touch?        │",
		"│  Contact me at liam@siira.io. │",
		"│                               │",
		"╰───────────────────────────────╯"
	].join("\n"));

	if (typeof Contact !== 'undefined') Contact.init();
	if (typeof Synthetic !== 'undefined') Synthetic.init();
	if (typeof Aeon !== 'undefined') {
		Aeon.init();

		Aeon.Dispatcher.on('transitionCompleted', () => {
			if (typeof Activity !== 'undefined') Activity.init();
			if (typeof Lumin !== 'undefined') Lumin.init();
		});
	}
	if (typeof Activity !== 'undefined') Activity.init();
	if (typeof Lumin !== 'undefined') Lumin.init();
});