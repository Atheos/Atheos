//////////////////////////////////////////////////////////////////////////////80
// Analytics Init
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';

	const self = {
		home: null,
		data: null,

		//////////////////////////////////////////////////////////////////////80
		// Initilization
		//////////////////////////////////////////////////////////////////////80
		init: function() {
			TimeMe.initialize();
			echo({
				data: {
					target: 'analytics',
					action: 'init'
				},
				settled: function(reply, status) {
					if (status === 103) {
						return toast(status, reply);
					} else if (status === 200) {
						self.home = reply.home;
						self.send(reply.data);
					}
				}
			});

			window.addEventListener('unload', self.sendBeacon);
		},

		//////////////////////////////////////////////////////////////////////80
		// Send Analytics to endpoint
		//////////////////////////////////////////////////////////////////////80
		send(data) {
			echo({
				url: self.home,
				data
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Send Analytics to endpoint
		//////////////////////////////////////////////////////////////////////80
		sendBeacon() {
			let data = {
				target: 'analytics',
				action: 'saveDuration',
				duration: TimeMe.getTimeOnPage()
			};
			// echo({
			// 	data
			// });
			navigator.sendBeacon('/controller.php', JSON.stringify(data));
		},

		//////////////////////////////////////////////////////////////////////80
		// Opt In or Out of analytics collection
		//////////////////////////////////////////////////////////////////////80		
		changeOpt(value) {
			echo({
				data: {
					target: 'analytics',
					action: 'changeOpt',
					enabled: value
				},
				settled: function(reply, status) {
					// storage('analytics.enabled', value);
					toast(status, reply);
				}
			});
		}
	};

	carbon.subscribe('system.loadExtra', () => self.init());
	atheos.analytics = self;

})();


/*Copyright (c) 2020 Jason Zissman
Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

let TimeMe = {

	startStopTimes: [],
	idleTimeoutMs: 30 * 1000,
	currentIdleTimeMs: 0,
	checkIdleStateRateMs: 250,
	isUserCurrentlyOnPage: true,
	isUserCurrentlyIdle: false,
	timeElapsedCallbacks: [],
	userLeftCallbacks: [],
	userReturnCallbacks: [],

	// startTime is optional. If provided, must be of type Date(). By providing
	// startTime, you are overriding the internal timing mechanism and manually
	// indicating the start time.
	startTimer: (startTime) => {

		let arrayOfTimes = TimeMe.startStopTimes;
		let latestStartStopEntry = arrayOfTimes[arrayOfTimes.length - 1];
		if (latestStartStopEntry !== undefined && latestStartStopEntry.stopTime === undefined) {
			// Can't start new timer until previous finishes.
			return;
		}

		TimeMe.startStopTimes.push({
			"startTime": startTime || new Date(),
			"stopTime": undefined
		});
	},

	// stopTime is optional. If provided, must be of type Date(). By providing
	// stopTime, you are overriding the internal timing mechanism and manually
	// indicating the stop time.
	stopTimer: (stopTime) => {

		let arrayOfTimes = TimeMe.startStopTimes;
		if (arrayOfTimes === undefined || arrayOfTimes.length === 0) {
			// Can't stop timer before you've started it.
			return;
		}
		if (arrayOfTimes[arrayOfTimes.length - 1].stopTime === undefined) {
			arrayOfTimes[arrayOfTimes.length - 1].stopTime = stopTime || new Date();
		}
	},

	getTimeOnPage: () => {
		let timeInMs = TimeMe.getTimeOnPageInMilliseconds();
		if (timeInMs === undefined) {
			return undefined;
		} else {
			return timeInMs / 1000;
		}
	},

	getTimeOnPageInMilliseconds: () => {

		let totalTimeOnPage = 0;

		let arrayOfTimes = TimeMe.startStopTimes;
		if (arrayOfTimes === undefined) {
			// Can't get time on page before you've started the timer.
			return;
		}

		let timeSpentOnPageInSeconds = 0;
		for (let i = 0; i < arrayOfTimes.length; i++) {
			let startTime = arrayOfTimes[i].startTime;
			let stopTime = arrayOfTimes[i].stopTime;
			if (stopTime === undefined) {
				stopTime = new Date();
			}
			let difference = stopTime - startTime;
			timeSpentOnPageInSeconds += (difference);
		}

		totalTimeOnPage = Number(timeSpentOnPageInSeconds);
		return totalTimeOnPage;
	},

	userActivityDetected: () => {
		if (TimeMe.isUserCurrentlyIdle) {
			TimeMe.triggerUserHasReturned();
		}
		TimeMe.resetIdleCountdown();
	},
	resetIdleCountdown: () => {
		TimeMe.isUserCurrentlyIdle = false;
		TimeMe.currentIdleTimeMs = 0;
	},

	callWhenUserLeaves: (callback, numberOfTimesToInvoke) => {
		TimeMe.userLeftCallbacks.push({
			callback: callback,
			numberOfTimesToInvoke: numberOfTimesToInvoke
		});
	},

	callWhenUserReturns: (callback, numberOfTimesToInvoke) => {
		TimeMe.userReturnCallbacks.push({
			callback: callback,
			numberOfTimesToInvoke: numberOfTimesToInvoke
		});
	},

	triggerUserHasReturned: () => {
		if (!TimeMe.isUserCurrentlyOnPage) {
			TimeMe.isUserCurrentlyOnPage = true;
			TimeMe.resetIdleCountdown();
			for (let i = 0; i < TimeMe.userReturnCallbacks.length; i++) {
				let userReturnedCallback = TimeMe.userReturnCallbacks[i];
				let numberTimes = userReturnedCallback.numberOfTimesToInvoke;
				if (isNaN(numberTimes) || (numberTimes === undefined) || numberTimes > 0) {
					userReturnedCallback.numberOfTimesToInvoke -= 1;
					userReturnedCallback.callback();
				}
			}
		}
		TimeMe.startTimer();
	},
	// TODO - we are muddying the waters in between
	// 'user left page' and 'user gone idle'. Really should be
	// two separate concepts entirely. Need to break this into smaller  functions
	// for either scenario.
	triggerUserHasLeftPageOrGoneIdle: () => {
		if (TimeMe.isUserCurrentlyOnPage) {
			TimeMe.isUserCurrentlyOnPage = false;
			for (let i = 0; i < TimeMe.userLeftCallbacks.length; i++) {
				let userHasLeftCallback = TimeMe.userLeftCallbacks[i];
				let numberTimes = userHasLeftCallback.numberOfTimesToInvoke;
				if (isNaN(numberTimes) || (numberTimes === undefined) || numberTimes > 0) {
					userHasLeftCallback.numberOfTimesToInvoke -= 1;
					userHasLeftCallback.callback();
				}
			}
		}
		TimeMe.stopTimer();
	},

	callAfterTimeElapsedInSeconds: (timeInSeconds, callback) => {
		TimeMe.timeElapsedCallbacks.push({
			timeInSeconds: timeInSeconds,
			callback: callback,
			pending: true
		});
	},

	checkIdleState: () => {
		for (let i = 0; i < TimeMe.timeElapsedCallbacks.length; i++) {
			if (TimeMe.timeElapsedCallbacks[i].pending && TimeMe.getTimeOnCurrentPageInSeconds() > TimeMe.timeElapsedCallbacks[i].timeInSeconds) {
				TimeMe.timeElapsedCallbacks[i].callback();
				TimeMe.timeElapsedCallbacks[i].pending = false;
			}
		}
		if (TimeMe.isUserCurrentlyIdle === false && TimeMe.currentIdleTimeMs > TimeMe.idleTimeoutMs) {
			TimeMe.isUserCurrentlyIdle = true;
			TimeMe.triggerUserHasLeftPageOrGoneIdle();
		} else {
			TimeMe.currentIdleTimeMs += TimeMe.checkIdleStateRateMs;
		}
	},

	visibilityChangeEventName: undefined,
	hiddenPropName: undefined,

	listenForUserLeavesOrReturnsEvents: () => {
		if (typeof document.hidden !== "undefined") {
			TimeMe.hiddenPropName = "hidden";
			TimeMe.visibilityChangeEventName = "visibilitychange";
		} else if (typeof document.mozHidden !== "undefined") {
			TimeMe.hiddenPropName = "mozHidden";
			TimeMe.visibilityChangeEventName = "mozvisibilitychange";
		} else if (typeof document.msHidden !== "undefined") {
			TimeMe.hiddenPropName = "msHidden";
			TimeMe.visibilityChangeEventName = "msvisibilitychange";
		} else if (typeof document.webkitHidden !== "undefined") {
			TimeMe.hiddenPropName = "webkitHidden";
			TimeMe.visibilityChangeEventName = "webkitvisibilitychange";
		}

		document.addEventListener(TimeMe.visibilityChangeEventName, () => {
			if (document[TimeMe.hiddenPropName]) {
				TimeMe.triggerUserHasLeftPageOrGoneIdle();
			} else {
				TimeMe.triggerUserHasReturned();
			}
		}, false);

		window.addEventListener('blur', () => {
			TimeMe.triggerUserHasLeftPageOrGoneIdle();
		});

		window.addEventListener('focus', () => {
			TimeMe.triggerUserHasReturned();
		});
	},
	listForIdleEvents: () => {
		document.addEventListener("mousemove", () => {
			TimeMe.userActivityDetected();
		});
		document.addEventListener("keyup", () => {
			TimeMe.userActivityDetected();
		});
		document.addEventListener("touchstart", () => {
			TimeMe.userActivityDetected();
		});
		window.addEventListener("scroll", () => {
			TimeMe.userActivityDetected();
		});

		setInterval(() => {
			if (TimeMe.isUserCurrentlyIdle !== true) {
				TimeMe.checkIdleState();
			}
		}, TimeMe.checkIdleStateRateMs);
	},
	initialize: () => {
		TimeMe.listenForUserLeavesOrReturnsEvents();
		TimeMe.listForIdleEvents();
		// TODO - only do this if page currently visible.
		TimeMe.startTimer(undefined);
	}
};