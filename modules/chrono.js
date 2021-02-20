//////////////////////////////////////////////////////////////////////////////80
// Chronometer
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Description: 
// The Chronometer Module sets global intervals that are published through
// Amplify subscriptions; allowing the client browser to only have a select few
// Intervals running while providing plugins the ability to use timed events.
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80


(function(global) {

	//////////////////////////////////////////////////////////////////////////80
	// Emit events on regular intervals for timing events
	//////////////////////////////////////////////////////////////////////////80
	global.chrono = {
		kilo: setInterval(() => carbon.pub('chrono.kilo'), 1000), // 1 second
		mega: setInterval(() => carbon.pub('chrono.mega'), 10000), // 10 Seconds
		giga: setInterval(() => carbon.pub('chrono.giga'), 100000), // 100 Seconds
		tera: setInterval(() => carbon.pub('chrono.tera'), 300000) // 5 minutes
	};
}(this));