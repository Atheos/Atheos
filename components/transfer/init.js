/*jshint esversion: 6 */

//////////////////////////////////////////////////////////////////////////////80
// FileManager Init
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80
// Notes: 
// Goodness this file is very complex; it's going to take a very long time
// to really get a grasp of what's going on in this file and how to 
// refactor it.
//												- Liam Siira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';
	var atheos = global.atheos,
		amplify = global.amplify,
		ajax = global.ajax,
		oX = global.onyx;

	var self = null;

	amplify.subscribe('system.loadMinor', () => atheos.transfer.init());

	atheos.transfer = {

		controller: 'components/transfer/controller.php',
		dialog: 'components/transfer/dialog.php',

		//////////////////////////////////////////////////////////////////////80
		// Init
		//////////////////////////////////////////////////////////////////////80
		init: function() {
			self = this;
		},

		//////////////////////////////////////////////////////////////////////80
		// Download
		//////////////////////////////////////////////////////////////////////80
		download: function(path) {
			var type = pathinfo(path).type;
			ajax({
				url: self.controller,
				data: {
					action: 'download',
					path,
					type
				},
				success: function(reply) {
					if (reply.status === 'success') {
						oX('#download').attr('src', 'components/transfer/download.php?filename=' + encodeURIComponent(reply.download));

					} else {
						atheos.toast.show('error', reply.text);
					}
				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Upload
		//////////////////////////////////////////////////////////////////////80
		upload: function(path) {
			// Source: https://codepen.io/PerfectIsShit/pen/zogMXP?editors=1010
			// Source: http://significanttechno.com/file-upload-progress-bar-using-javascript

			var listener = function(e) {
				e.preventDefault();
				e.stopPropagation();
				var input = oX('#modal_content input[type="file"]').el,
					fileCount = input.files.length,
					uploadName;

				if (fileCount <= 0) {
					return;
				}

				uploadName = input.files[0].name || 'Batch Upload';

				var progressNode = oX('<div class="upload-progress"><div></div><span></span></div>');
				oX('#progress_wrapper').append(progressNode);

				var data = new FormData();

				for (var x = 0; x < fileCount; x++) {
					data.append('upload[]', input.files[x]);
				}

				// data.append('upload[]', file);
				data.append('action', 'upload');
				data.append('path', path);

				var send = new XMLHttpRequest();
				send.upload.addEventListener('progress', self.showProgress(progressNode, uploadName), false);
				send.addEventListener('error', self.showProgress(progressNode, uploadName), false);
				send.open('POST', self.controller);

				send.onreadystatechange = function() {
					if (send.readyState === 4) {
						var reply = send.responseText;
						try {
							reply = JSON.parse(reply);
						} catch (e) {}

						if (send.status >= 200 && send.status < 300) {
							self.processUpload(reply, path);
						} else {
							self.showProgress(progressNode, uploadName)({
								type: 'error'
							});
						}
						input.value = '';
					}
				};
				send.send(data);
			};

			atheos.modal.load(400, self.dialog, {
				action: 'upload',
				path: path
			}, () => {
				oX('#modal_content').on('change', listener);
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Process Upload
		//////////////////////////////////////////////////////////////////////80
		processUpload: function(reply, path) {
			if (reply.status !== 'success') {
				atheos.toast.show('error', reply.text);
			}
			reply.data.forEach(function(file) {
				atheos.filemanager.addToFileManager(path + '/' + file.name, 'file', path);
				amplify.publish('filemanager.upload', {
					name: file.name,
					path: path
				});
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Show Progress
		//////////////////////////////////////////////////////////////////////80
		showProgress: function(node, name) {
			// Loading event doesn't send the total, so grab it from the progress
			// event and save it for later.
			var total;

			function formatBytes(bytes, decimals = 1) {
				// Source: https://stackoverflow.com/a/18650828
				if (bytes === 0) {
					return '0B';
				}

				const k = 1024;
				const dm = decimals < 0 ? 0 : decimals;
				const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

				const i = Math.floor(Math.log(bytes) / Math.log(k));

				return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
			}

			return function(event) {
				if (event.type === 'progress') {
					total = formatBytes(event.total);
					var percent = parseInt((event.loaded / event.total) * 100, 10);
					node.find('span').text(`${name}: ${percent}% (${formatBytes(event.loaded)}/${total})`);
					node.find('div').css('width', Math.round(percent) + '%');
					// _("status").innerHTML = Math.round(percent) + "% uploaded... please wait";

					if (percent === 100) {
						setTimeout(function() {
							atheos.flow.slide('remove', node.el, 500);
						}, 3000);
					}

				} else {
					node.find('span').text(`${name}: Upload failed...`);
					node.find('div').css('width', '100%');
					node.find('div').addClass('error');
				}
			};
		}
	};

})(this);