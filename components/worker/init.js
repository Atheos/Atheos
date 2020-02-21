//////////////////////////////////////////////////////////////////////////////80
// Worker Manager
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Notes: 
// This is a module.
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	
	var atheos = global.atheos;

	atheos.workerManager = {
		taskQueue: [],
		addTask: function(taskConfig, callback, context) {
			var _this = this;
			if (_this.worker !== null) {
				this.taskQueue.push({
					config: taskConfig,
					callback: callback,
					context: context
				});

				this.clearSubsidableTasks(taskConfig.id);

				if (!this.workerRunning()) {
					var initStatus = this.initiateWorker();
					if (!initStatus) {
						callback(null, false);
						return;
					}
					this.worker.addEventListener('message', function(e) {
						_this.concludeTask(e.data);
					}, false);
				}

				if (this.taskQueue.length === 1) {
					this.scheduleNext();
				}
			} else {
				callback(false, taskConfig.id);
			}
		},
		workerRunning: function() {
			return !!this.worker;
		},
		initiateWorker: function() {
			if (typeof Worker !== 'undefined' && Worker !== null) {
				this.worker = new Worker('components/worker/worker.js');
				return !!this.worker;
			}
		},
		clearSubsidableTasks: function(id) {
			var i = this.taskQueue.length - 2;
			while (i > 0) {
				if (this.taskQueue[i].id === id) {
					this.taskQueue.splice(i, 1);
				}
				i--;
			}
		},
		scheduleNext: function() {
			var taskConfig = this.taskQueue[0].config;
			this.worker.postMessage(taskConfig);
		},
		concludeTask: function(msg) {
			if (this.taskQueue.length > 0) {
				var tq = this.taskQueue[0];
				var callback = tq.callback;
				context = tq.context;
				this.taskQueue.splice(0, 1);
				if (this.taskQueue.length > 0) {
					this.scheduleNext();
				}
				tq.callback.apply(context, [msg.success, msg.result]);
			}
		}
	};

})(this);