//////////////////////////////////////////////////////////////////////////////80
// Worker Manager
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Notes: 
// This is a module.
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';

	var atheos = global.atheos,
		carbon = global.carbon;

	var self = null;

	carbon.subscribe('system.loadMajor', () => atheos.workerManager.init());


	atheos.workerManager = {
		taskQueue: [],

		init: function() {
			self = this;
		},

		addTask: function(taskConfig, callback, context) {
			if (self.worker !== null) {
				self.taskQueue.push({
					config: taskConfig,
					callback: callback,
					context: context
				});

				self.clearSubsidableTasks(taskConfig.id);

				if (!self.workerRunning()) {
					var initStatus = self.initiateWorker();
					if (!initStatus) {
						callback(null, false);
						return;
					}
					self.worker.addEventListener('message', function(e) {
						self.concludeTask(e.data);
					}, false);
				}

				if (self.taskQueue.length === 1) {
					self.scheduleNext();
				}
			} else {
				callback(false, taskConfig.id);
			}
		},
		workerRunning: function() {
			return !!self.worker;
		},
		initiateWorker: function() {
			if (typeof Worker !== 'undefined' && Worker !== null) {
				self.worker = new Worker('components/worker/worker.js');
				return !!self.worker;
			}
		},
		clearSubsidableTasks: function(id) {
			var i = self.taskQueue.length - 2;
			while (i > 0) {
				if (self.taskQueue[i].id === id) {
					self.taskQueue.splice(i, 1);
				}
				i--;
			}
		},
		scheduleNext: function() {
			var taskConfig = self.taskQueue[0].config;
			self.worker.postMessage(taskConfig);
		},
		concludeTask: function(msg) {
			if (self.taskQueue.length > 0) {
				var tq = self.taskQueue[0];
				var callback = tq.callback;
				var context = tq.context;
				self.taskQueue.splice(0, 1);
				if (self.taskQueue.length > 0) {
					self.scheduleNext();
				}
				callback.apply(context, [msg.success, msg.result]);
			}
		}
	};

})(this);