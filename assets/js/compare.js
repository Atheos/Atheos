document.addEventListener("DOMContentLoaded", function() {
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



document.addEventListener("DOMContentLoaded", function() {
	if (typeof Contact !== 'undefined') Contact.init();
	if (typeof Synthetic !== 'undefined') Synthetic.init();
	if (typeof Aeon !== 'undefined') Aeon.init();

	if (typeof Aeon !== 'undefined' && typeof Activity !== 'undefined') {
		Aeon.Dispatcher.on('transitionCompleted', () => {
			Activity.init();
		});
		Activity.init();
	} else if (typeof Activity !== 'undefined') {
		Activity.init();
	}

	if (typeof Aeon !== 'undefined' && typeof Lumin !== 'undefined') {
		Aeon.Dispatcher.on('transitionCompleted', () => {
			Lumin.init();
		});
		Lumin.init();
	} else if (typeof Lumin !== 'undefined') {
		Lumin.init();
	}
});