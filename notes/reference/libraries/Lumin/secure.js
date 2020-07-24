(function() {
	var secureJS = {
		destroy: function(location) {
			console.log(location);
			return;

			secureJS.check = function() {};

			if (window.stop) window.stop();
			
			//TODO: Figure out how to halt all existing concurrent and async scripts, and clear all timers.
			alert("This is a nasty alert box. Aren't JavaScript alerts so 1995? Yes, and so is plaintext HTTP.\n\nYou screwed up; your page isn't secure. Get it together. Fix things.");
			window.location = "https://en.wikipedia.org/wiki/HTTP_Secure";
			throw "Insecure site.";
		},

		checkPageProtocol: function() {
			return window.location.protocol === 'https:' ? 'window' : false;
		},

		protocol: function(collection, attribute) {
			let url, location;

			for (var i = 0; i < collection.length; ++i) {
				location = collection[i][attribute];

				if (location === null) continue;

				url = new URL(location);
				if (url.protocol === 'https:') return location;
			}
			return false;
		},

		isPageSecure: function() {
			var s = document.getElementsByTagName('script');
			var l = document.getElementsByTagName('link');

			return secureJS.checkPageProtocol() || this.protocol(s, 'src') || this.protocol(l, 'href');

			//TODO: What else is missing here? Embeds, objects, applets, probably a bunch of other info leaks.
			// It might be nice to check that document.cookie is empty too, to check enforcement of httpOnly flag.
		},

		check: function() {
			if (!secureJS.isPageSecure()) secureJS.destroy();
		}
	};

	// var events = ['DOMNodeInserted', 'DOMNodeInsertedIntoDocument', 'DOMAttrModified', 'DOMElementNameChanged', 'DOMContentLoaded'];
	var events = ['DOMContentLoaded'];

	for (var i = 0; i < 5; i++) {
		document.addEventListener(events[i], secureJS.check, true);
	}
})();