		activeRepo: '',
				codegit.checkFileStatus(path);
					codegit.checkFileStatus(path);
					directory.node.addClass('repo');
					if (directory.node.find('i.repo-icon').length === 0) {
						directory.node.append('<i class="repo-icon fas fa-code-branch"></i>');
					}
					var repo = oX('#file-manager a[data-path="' + file.path + '"]');
					repo.addClass('repo');
					if (repo.find('i.repo-icon').length === 0) {
						repo.append('<i class="repo-icon fas fa-code-branch"></i>');
					}
						obj.menu.append('<a class="file-only codegit" onclick="atheos.codegit.diff(\'' + obj.path + '\', \'' + path + '\');">' + codegit.icon + 'Git Diff</a>');
			codegit.activeRepo = repo;
			atheos.modal.load(800, codegit.dialog + '?action=codegit&repo=' + repo);
				oX('#panel_view').on('click', function(e) {
					var target = oX(e.target);
					var tagName = target.el.tagName;
					if (tagName === 'BUTTON') {
						if (target.text() === 'Diff') {
							codegit.showPanel('diff', repo, {
								files: [target.parent('tr').attr('data-file')]
						} else if (target.text() === 'Undo') {
							// codegit.showPanel(target.attr('data-panel'), repo);

				codegit.monitorCheckBoxes();
				atheos.modal.resize();
		showPanel: function(panel, repo, data) {
				var menu = oX('#panel_menu a[data-panel="' + panel + '"]');
				if (menu) {
					oX('#panel_menu .active').removeClass('active');
					menu.addClass('active');
				}
				data = data || {};
				data.action = 'loadPanel';
				data.panel = panel;
				data.repo = repo;
					data: data,
						oX('#panel_view').empty();
						oX('#panel_view').html(reply);
		showDialog: function(type, repo, path) {
			path = path || oX('#project-root').attr('data-path');
			codegit.location = repo || codegit.location;
			atheos.modal.load(600, codegit.dialog + '?action=loadPanel&panel=' + type + "&repo=" + repo + "&path=" + path);
		},

		diff: function(path, repo) {
			if (!path || !repo) return;

			repo = this.getPath(repo);
			path = path.replace(repo + "/", "");

			codegit.showDialog('diff', repo, path);
		},


			var path = this.getPath(codegit.activeRepo);
				message: message.value(),
				path: path
				url: this.controller + '?action=commit',
					log(data);
		checkFileStatus: function(path) {
			ajax({
				url: codegit.controller,
				data: {
					action: 'fileStatus',
					path: path
				},
				success: function(reply) {
					text = '';
					if (reply.status !== 'error') {
						text = `${codegit.icon}${reply.branch}: +${reply.insertions}, -${reply.deletions}`;
					}
					codegit.fileStatus.html(text);

			})
				// result.data = codegit.renderDiff(result.data);
			if (!path || !repo) return;

			repo = this.getPath(repo);



			codegit.showDialog('blame', repo, path);
			// atheos.modal.ready.then(function() {

			// 	var blame = oX('#codegit_blame');
			// 	var data = JSON.parse(blame.text());
			// 	blame.empty();

			// 	blame.html(codegit.renderBlame(data));

			// 	console.log(data);
			// });
		},

		renderBlame: function(data) {
			data = Object.values(data);
			// var codegit = this;
			// this.location = repo;
			// path = path.replace(repo + "/", "");
			// this.showDialog('blame', repo);
			// $.getJSON(this.path + 'controller.php?action=blame&repo=' + this.encode(repo) + '&path=' + this.encode(path), function(result) {
			// 	log(result);
			// 	return;
			// 	if (result.status != "success") {
			// 		atheos.toast.show('error', result.message);
			// 		codegit.showDialog('overview', repo);
			// 	}
			// 	$('.git_blame_area table thead th').text(path);
			// 	//Split blame output per file line
			var hashRegExp = /^[a-z0-9]{40}/;
			var starts, startIndexes = [],
				segments = [],
				s, e, i;
			starts = data.filter(function(line) {
				return hashRegExp.test(line);
			});
			for (i = 0; i < starts.length; i++) {
				startIndexes.push(data.indexOf(starts[i]));
			}
			for (i = 0; i < starts.length; i++) {
				s = startIndexes[i];
				e = (i < (starts.length - 1)) ? (startIndexes[i + 1]) : (data.length);
				segments.push(data.slice(s, e));
			}
			//Combine lines with the same commit
			var hash = segments[0][0].match(hashRegExp)[0];
			var unique = [{
				segment: segments[0],
				hash: hash,
				lines: [segments[0][12]]
			}];
			for (i = 1; i < segments.length; i++) {
				if (hash === segments[i][0].match(hashRegExp)[0]) {
					//Same
					unique[unique.length - 1].lines.push(segments[i][12]);
				} else {
					hash = segments[i][0].match(hashRegExp)[0];
					//Next
					unique.push({
						segment: segments[i],
						hash: hash,
						lines: [segments[i][12]]
					});
			}
			//Format output
			var output = "",
				msg, date, name, line;
			for (i = 0; i < unique.length; i++) {
				msg = unique[i].segment[9].replace("summary ", "");
				date = unique[i].segment[7].replace("committer-time ", "");
				date = new Date(date * 1000);
				date = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
				name = unique[i].segment[5].replace("committer ", "");
				hash = unique[i].hash;
				output += '<tr><td>' + msg + '<br>' + name + ': ' + date + '</td>';
				output += '<td class="commit_hash" data-hash="' + hash + '">' + hash.substr(0, 8) + '</td><td><ol>';
				for (var j = 0; j < unique[i].lines.length; j++) {
					line = unique[i].lines[j].replace(new RegExp('\t', 'g'), ' ')
						.replace(new RegExp(' ', 'g'), "&nbsp;")
						.replace(new RegExp('\n', 'g'), "<br>");
					output += '<li>' + line + '</li>';
				output += '</ol></td></tr>';
			}
			$('.git_blame_area table tbody').html(output);
			// });
		findRepo: function(path) {
			var root = oX('#project-root').attr('data-path'),
				counter = 0;

			var file = path;
			while (path != root) {
				path = codegit.dirname(path);
				if ($('[data-path="' + path + '"]').hasClass('repo')) {
					return path;
					break;
				}
				if (counter >= 10) break;
				counter++;
			}
			return false;
		},

		monitorCheckBoxes: function() {
			var checkboxAll = oX('#codegit_overview #check_all');
			var checkboxes = oX('#codegit_overview tbody').find('input[type="checkbox"]');

			checkboxAll.on('click', function() {
				var status = checkboxAll.el.checked;
				checkboxes.forEach((checkbox) => checkbox.el.checked = status);
			});

			oX('#codegit_overview tbody').on('click', function(e) {
				var node = e.target;
				if (node.tagName === 'INPUT' && node.type === 'checkbox') {
					if (!node.checked) {
						if (checkboxAll.el.checked) {
							checkboxAll.el.checked = false;
						}
					} else {
						var allChecked = true;
						checkboxes.forEach((checkbox) => {
							allChecked = allChecked && (checkbox.el.checked === true);
						});
						if (allChecked) {
							checkboxAll.el.checked = true;
						}
					}
				}
			});
		},
