//////////////////////////////////////////////////////////////////////////////80
// Storage
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Description: 
// The Storage module is a wrapper around the default LocalStorage in JS to
// compress some of the key-values. I'll admit, the goal of this module is a
// little silly, but I'd like to think it makes the code a little cleaner and 
// nicer to work with in the long haul. It might save me only a 20-30 characters
// per file, but that will add up over time.
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80


(function() {

	window.storage = function(key, newVal) {
		var oldVal = localStorage.getItem('atheos.' + key);

		if (typeof newVal !== 'undefined') {
			localStorage.setItem('atheos.' + key, newVal);
		}

		if (!oldVal) {
			return oldVal;
		} else if (oldVal === 'true' || oldVal === 'false') {
			return (oldVal === 'true');
		} else if (isNaN(oldVal) === false) {
			return parseInt(oldVal, 10);
		} else {
			return oldVal;
		}
	};

}());