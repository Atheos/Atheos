(function(global) {

	var subscriptions = {};

	global.amplify = {
		list: subscriptions,
		reset: function() {
			subscriptions = {};
		},
		publish: function(topic) {
			if (!subscriptions[topic]) return;
			
			var args = Array.prototype.slice.call(arguments, 1),
				topicSubscriptions,
				length,
				i = 0;

			topicSubscriptions = subscriptions[topic].slice();
			for (length = topicSubscriptions.length; i < length; i++) {
				topicSubscriptions[i].apply(null, args);
			}
		},

		// Topics need to be comma delimited
		subscribe: function(topic, callback) {
			var topics = topic.split(','),
				length = topics.length,
				i = 0;

			for (; i < length; i++) {
				topic = topics[i].trim();

				if (!subscriptions[topic]) {
					subscriptions[topic] = [];
				}
				subscriptions[topic].push(callback);
			}

			return callback;
		},

		unsubscribe: function(topic, callback) {
			if (!subscriptions[topic]) return;

			var length = subscriptions[topic].length,
				i = 0;

			for (; i < length; i++) {
				if (subscriptions[topic][i].callback === callback) {
					subscriptions[topic].splice(i, 1);

					// Adjust counter and length for removed item
					length--;
					i--;
				}
			}
		},

		unsubscribeAll: function(topic) {
			if (typeof topic === 'string') {
				delete subscriptions[topic];
			} else {
				subscriptions = {};
			}
		}
	};

}(this));