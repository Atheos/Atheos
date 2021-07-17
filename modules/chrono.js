//////////////////////////////////////////////////////////////////////////////80
// Chronometer
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Description: 
//	The Chronometer Module sets global intervals that are published through
//	Carbon subscriptions; allowing the client browser to only have a select few
//	Intervals running while providing plugins the ability to use timed events.
//////////////////////////////////////////////////////////////////////////////80
// Suggestions:
//	- Move debounce/throttle here to break up globals.js
//////////////////////////////////////////////////////////////////////////////80
// Usage:
//  - byte: publishes an event every 100 milliseconds (10th of a second)
//  - kilo: publishes an event every 1000 milliseconds (1 second)
//  - mega: publishes an event every 10000 milliseconds (10 seconds)
//  - giga: publishes an event every 100000 milliseconds (100 seconds)
//  - tera: publishes an event every 300000 milliseconds (5 minutes)
//
//	carbon.subscribe('chrono.kilo', function() {
//		console.log("This will log every 1 second");
//	}
//
//////////////////////////////////////////////////////////////////////////////80

(function() {

	let msReg = /(\d+)([mshd]+)/g,
		msUnt = {
			s: 1000,
			m: 60000,
			h: 3600000,
			d: 86400000
		};

	window.ms = (val) => {
		let test = [...val.toLowerCase().matchAll(msReg)],
			ms = 0,
			unit;
		for (unit of test) {
			ms += unit[1] * msUnt[unit[2]];
		}
		return ms;
	};

	window.chrono = {
		byte: setInterval(() => carbon.pub('chrono.byte'), 100), // 10th of a second
		kilo: setInterval(() => carbon.pub('chrono.kilo'), 1000), // 1 second
		mega: setInterval(() => carbon.pub('chrono.mega'), 10000), // 10 Seconds
		giga: setInterval(() => carbon.pub('chrono.giga'), 100000), // 100 Seconds
		tera: setInterval(() => carbon.pub('chrono.tera'), 300000) // 5 minutes
	};

}());