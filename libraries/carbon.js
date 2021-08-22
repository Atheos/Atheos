//////////////////////////////////////////////////////////////////////////////80
// Carbon Custom Events
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
//	warranty under the MIT License. See [root]/docs/LICENSE.md for more.
//	This information must remain intact.
// Copyright (c) 2013 appendTo LLC - https://amplifyjs.com/
//////////////////////////////////////////////////////////////////////////////80
// Description: 
//	Carbon provides methods to facilitate the Publish and Subscribe messaging
//	pattern in your front-end application. A component can publish events with
//	arguements that multiple client components can subscribe to; it encourages
//	loose coupling of components, resulting in less brittle/more reusable code.
//////////////////////////////////////////////////////////////////////////////80
// Suggestions:
//	- Reimplement the ability to pass context
//////////////////////////////////////////////////////////////////////////////80
// Usage:
//	- list: Lists out all currently active subscriptions
//	- reset: resets carbon, deleting all subscriptions
//  - sub: subscribes to an event, or multiple comma-delimited events
//  - pub: publishes an event with arguements
//  - del: deletes a subscribtion
//
// 	carbon.subscribe('system.loadExtra', () => atheos.plugin.init());
//
//	carbon.sub('chrono.kilo', function() {
//		console.log("This will log every 1 second");
//	}
//
//////////////////////////////////////////////////////////////////////////////80

(function() {
	'use strict';

	var subs = {};

	window.carbon = {
		list: () => subs,
		reset: () => subs = {},
		pub: function(topic) {
			if (!subs[topic]) return;

			topic = subs[topic];

			var args = Array.prototype.slice.call(arguments, 1),
				i = topic.length;

			while (--i >= 0) {
				topic[i].apply(null, args);
			}
		},

		sub: function(topic, callback) {
			var topics = topic.split(' '),
				i = topics.length;

			while (--i >= 0) {
				topic = topics[i];
				(subs[topic] = subs[topic] || []).push(callback);

			}
			return callback;
		},

		del: function(topic, callback) {
			if (!subs[topic]) return;
			if (!callback) {
				delete subs[topic];
				return;
			}

			var i = subs[topic].length;

			while (--i > 0) {
				if (subs[topic][i].callback === callback) {
					subs[topic].splice(i, 1);
					i++;
				}
			}
		}
	};

	carbon.publish = carbon.pub;
	carbon.subscribe = carbon.sub;
	carbon.unsubscribe = carbon.del;

}());