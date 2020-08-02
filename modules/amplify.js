(function(global) {

	var slice = [].slice,
		subscriptions = {};

	var amplify = global.amplify = {
		list: subscriptions,
		reset: function() {
			subscriptions = {};
		},
		publish: function(topic) {
			if (typeof topic !== 'string') return false;

			var args = slice.call(arguments, 1),
				topicSubscriptions,
				subscription,
				length,
				i = 0,
				ret;

			if (!subscriptions[topic]) {
				return true;
			}

			topicSubscriptions = subscriptions[topic].slice();
			for (length = topicSubscriptions.length; i < length; i++) {
				subscription = topicSubscriptions[i];
				ret = subscription.callback.apply(null, args);
			}
			return ret !== false;
		},

		// Topics need to be comma delimited
		subscribe: function(topic, callback, priority) {
			if (typeof topic !== 'string') return false;

			priority = priority || 10;

			var topicIndex = 0,
				topics = topic.split(','),
				topicLength = topics.length,
				added;
			for (; topicIndex < topicLength; topicIndex++) {

				topic = topics[topicIndex].trim();
				added = false;

				if (!subscriptions[topic]) {
					subscriptions[topic] = [];
				}

				var i = subscriptions[topic].length - 1,
					subscriptionInfo = {
						callback: callback,
						priority: priority
					};

				for (; i >= 0; i--) {
					if (subscriptions[topic][i].priority <= priority) {
						subscriptions[topic].splice(i + 1, 0, subscriptionInfo);
						added = true;
						break;
					}
				}

				if (!added) {
					subscriptions[topic].unshift(subscriptionInfo);
				}
			}

			return callback;
		},

		unsubscribe: function(topic, callback) {
			if (typeof topic !== 'string') return false;

			if (!subscriptions[topic]) {
				return;
			}

			var length = subscriptions[topic].length,
				i = 0;

			for (; i < length; i++) {
				if (subscriptions[topic][i].callback === callback) {
					subscriptions[topic].splice(i, 1);

					// Adjust counter and length for removed item
					i--;
					length--;
				}
			}
		},

		unsubscribeAll: function(topic) {
			if (typeof topic === 'string') {
				delete subscriptions[topic];
			} else {
				for (var key in subscriptions) {
					delete subscriptions[key];
				}
			}
		}
	};

}(this));