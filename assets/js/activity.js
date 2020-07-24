//////////////////////////////////////////////////////////////////////////////80
// Github Activity Stream
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/license.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2015 Casey Scarborough
// Source: https://github.com/caseyscarborough/github-activity
//////////////////////////////////////////////////////////////////////////////80

(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], function() {
			return factory(root);
		});
	} else if (typeof exports === 'object') {
		module.exports = factory(root);
	} else {
		root.Activity = factory(root);
	}
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this, function(window) {
	'use strict';

	// Takes in milliseconds and converts it to a human readable time,
	// such as 'about 3 hours ago' or '23 days ago'
	function ago(ms) {

		let end = (number) => (number > 1) ? 's ago' : ' ago';

		ms = Math.floor(ms / 1000);

		let years = Math.floor(ms / 31536000);
		if (years) return years + ' year' + end(years);

		let months = Math.floor((ms %= 31536000) / 2592000);
		if (months) return months + ' month' + end(months);

		let days = Math.floor((ms %= 2592000) / 86400);
		if (days) return days + ' day' + end(days);

		let hours = Math.floor((ms %= 86400) / 3600);
		if (hours) return 'about ' + hours + ' hour' + end(hours);

		let minutes = Math.floor((ms %= 3600) / 60);
		if (minutes) return minutes + ' minute' + end(minutes);

		let seconds = ms % 60;
		if (seconds) return seconds + ' second' + end(seconds);

		return 'just now';
	}

	// Pluralizes a word, but only works when the word requires
	// an 's' to be added for pluralization.
	let pluralize = (w, n) => n !== 1 ? w + 's' : w;
	let shorten = (text, max) => text.length < max ? text : text.substring(0, max - 3) + '...';
	let capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

	var templates = {
		CommitCommentEvent: new Anomaly('Commented on commit {{commentLink}}<br><small>{{comment}}</small>'),
		CreateEvent: new Anomaly('Created {{payload.ref_type}} {{branchLink}}{{repoLink}}'),
		DeleteEvent: new Anomaly('Deleted {{payload.ref_type}} {{payload.ref}} at {{repoLink}}'),
		FollowEvent: new Anomaly('Started following {{targetLink}}'),
		ForkEvent: new Anomaly('Forked {{repoLink}} to {{forkLink}}'),
		GistEvent: new Anomaly('{{actionType}} {{gistLink}}'),
		GollumEvent: new Anomaly('{{actionType}} the {{repoLink}} wiki<br><small>{{message}}</small>'),
		IssueCommentEvent: new Anomaly('Commented on {{issueType}} {{issueLink}}<br><small>{{comment}}</small>'),
		IssuesEvent: new Anomaly('{{payload.action}} issue {{issueLink}}<br><small>{{payload.issue.title}}</small>'),
		MemberEvent: new Anomaly('Added {{memberLink}} to {{repoLink}}'),
		PublicEvent: new Anomaly('Open sourced {{repoLink}}'),
		PullRequestEvent: new Anomaly('{{payload.action}} pull request {{pullRequestLink}}<br><small>{{payload.pull_request.title}}</small>{{mergeMessage}}'),
		PullRequestReviewCommentEvent: new Anomaly('commented on pull request {{pullRequestLink}}<br><small>{{comment}}</small>'),
		PushEvent: new Anomaly('Pushed to {{branchLink}}{{repoLink}}<br>\
                <ul class="gha-commits">{@payload.commits}}<li><small>{{val.shaLink}} {{val.message}}</small></li>{/payload.commits}}</ul>\
                <small class="gha-message-commits">{{commitsMessage}}</small>'),
		ReleaseEvent: new Anomaly('Released {{tagLink}} at {{repoLink}}<br><small> {{zipLink}}</small>'),
		WatchEvent: new Anomaly('Starred {{repoLink}}')
	};

	var methods = {

		renderLink: function(url, title, cssClass) {
			title = title || url;
			cssClass = cssClass || "";

			return `<a class="${cssClass}" rel="noopener" href="${url}" target="_blank">${title}</a>`;

		},

		renderGitLink: function(url, title, cssClass) {
			title = title || url;
			return this.renderLink('https://github.com/' + url, title, cssClass);
		},

		createActivity: function(data) {
			var p = data.payload;
			data.repoLink = methods.renderGitLink(data.repo.name);

			// Get the branch name if it exists.
			if (p.ref) {
				if (p.ref.substring(0, 11) === 'refs/heads/') {
					data.branch = p.ref.substring(11);
				} else {
					data.branch = p.ref;
				}
				data.branchLink = methods.renderGitLink(data.repo.name + '/tree/' + data.branch, data.branch) + ' at ';
			}

			// Only show the first 6 characters of the SHA of each commit if given.
			if (p.commits) {
				var shaDiff = p.before + '...' + p.head;
				var length = p.commits.length;

				// Show message 'View (numberOfCommits - 2) more commits >>'
				if (length > 2) {
					data.commitsMessage = `<a href="https://github.com/${data.repo.name}/compare/${shaDiff}">View ${length - 2} more ${pluralize('commit', length - 2)}</a>`;
				}
				p.commits.splice(2, p.size);
				p.commits.forEach(function(d, i) {
					d.message = shorten(d.message, 66);
					d.shaLink = methods.renderGitLink(data.repo.name + '/commit/' + d.sha, d.sha.substring(0, 6), 'gha-sha');
				});
			}

			// Get the link if this is an IssueEvent.
			if (p.issue) {
				var title = data.repo.name + "#" + p.issue.number;
				data.issueLink = methods.renderLink(p.issue.html_url, title);
				data.issueType = "issue";
				p.action = capitalize(p.action);
				if (p.issue.pull_request) {
					data.issueType = "pull request";
				}
			}

			// Retrieve the pull request link if this is a PullRequestEvent.
			if (p.pull_request) {
				var pr = p.pull_request;
				data.pullRequestLink = methods.renderLink(pr.html_url, data.repo.name + "#" + pr.number);
				data.mergeMessage = "";

				// If this was a merge, set the merge message.
				if (p.pull_request.merged) {
					p.action = "Merged";
					var summary = `${pr.commits} ${pluralize('commit', pr.commits)} with ${pr.additions} ${pluralize('addition', pr.additions)} and ${pr.deletions} ${pluralize('deletion', pr.deletions)}`;
					data.mergeMessage = `<br><small class="gha-message-merge">${summary}</small>`;
				}
			}

			// Get the link if this is a PullRequestReviewCommentEvent
			if (p.comment && p.comment.pull_request_url) {
				var title = data.repo.name + "#" + p.comment.pull_request_url.split('/').pop();
				data.pullRequestLink = methods.renderLink(p.comment.html_url, title);
			}

			// Get the comment if one exists, and trim it to 150 characters.
			if (p.comment && p.comment.body) {
				data.comment = p.comment.body;
				data.comment = shorten(data.comment, 150);

				if (p.comment.html_url && p.comment.commit_id) {
					var title = data.repo.name + '@' + p.comment.commit_id.substring(0, 10);
					data.commentLink = methods.renderLink(p.comment.html_url, title);
				}
			}

			switch (data.type) {
				case 'ReleaseEvent':
					data.tagLink = methods.renderLink(p.release.html_url, p.release.tag_name);
					data.zipLink = methods.renderLink(p.release.zipball_url, 'Download Source Code (zip)');
					break;
				case 'GollumEvent': //Wiki Events
					var page = p.pages[0];
					data.actionType = capitalize(page.action);
					data.message = data.actionType + ' ' + methods.renderGitLink(page.html_url, page.title);
					break;
				case 'FollowEvent':
					data.targetLink = methods.renderGitLink(p.target.login);
					break;
				case 'ForkEvent':
					data.forkLink = methods.renderGitLink(p.forkee.full_name);
					break;
				case 'MemberEvent':
					data.memberLink = methods.renderGitLink(p.member.login);
					break;

				default:
					// code
			}

			if (p.gist) {
				data.actionType = p.action === 'fork' ? p.action + 'ed' : p.action + 'd';
				data.gistLink = methods.renderLink(p.gist.html_url, 'gist: ' + p.gist.id);
			}

			var message = templates[data.type].render(data);
			var timeString = ago(new Date() - new Date(data.created_at));

			// var single = ['CreateEvent', 'DeleteEvent', 'FollowEvent', 'ForkEvent', 'GistEvent', 'MemberEvent', 'WatchEvent'];
			// I should add a smaller activity option for single events.

			return `<activity><div class="gha-message">${message}</div><span class="gha-time">${timeString}</span></activity>`;
		}
	};

	var obj = {
		username: 'HLSiira',
		selector: '#feed',
		limit: 20,

		init: function() {
			var userUrl = 'https://api.github.com/users/' + this.username,
				eventsUrl = userUrl + '/events';

			var div = document.querySelector(this.selector);
			if (!div) return;

			var feed = localStorage.getItem('feed');
			if (feed) {
				div.innerHTML = feed;
				return;
			}

			this.loadFeed(eventsUrl, (status, output) => {
				if (status === true) {
					feed = this.createStream(output);
					localStorage.setItem('feed', feed);
				} else {
					if (status === 403) {
						feed = `<info>403: Github API rate limit exceeded.</info>`;
					} else {
						feed = `<info>404: User ${this.username} not found.</info>`;
					}
				}
				div.innerHTML = feed;
			});
		},

		loadFeed: function(url, callback) {
			var request = new XMLHttpRequest();
			request.open('GET', url);
			request.setRequestHeader('Accept', 'application/vnd.github.v3+json');

			request.onload = function() {
				var data = JSON.parse(request.responseText);
				if (request.status >= 200 && request.status < 300) {
					callback(true, data);
				} else {
					callback(request.status, data);
				}
			};

			request.send();
		},

		createStream: function(data) {
			var output = '';
			let limit = this.limit > data.length ? data.length : this.limit;

			if (limit === 0) {
				return `<info>204: User ${this.username} does not have public activity.</info>`;
			}

			for (var i = 0; i < limit; i++) {
				output += methods.createActivity(data[i]);
			}

			return output;
		},
	};

	return obj;
});