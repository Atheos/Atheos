//////////////////////////////////////////////////////////////////////////////80
// Carbon Custom Events
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/license.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2013 appendTo LLC.
// Source: https://amplifyjs.com/
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';

	var subs = {};

	global.carbon = {
		list: () => subs,
		reset: () => subs = {},
		publish: function(topic) {
			if (!subs[topic]) return;

			topic = subs[topic];

			var args = Array.prototype.slice.call(arguments, 1),
				i = topic.length;

			while (--i >= 0) {
				topic[i].apply(null, args);
			}
		},

		// Topics need to be comma delimited
		subscribe: function(topic, callback) {
			var topics = topic.split(','),
				i = topics.length;

			while (--i >= 0) {
				topic = topics[i].trim();
				(subs[topic] = subs[topic] || []).push(callback);

			}
			return callback;
		},

		unsubscribe: function(topic, callback) {
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

}(this));