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

(function(global) {
	'use strict';

	// Takes in milliseconds and converts it to a human readable time,
	// such as 'about 3 hours ago' or '23 days ago'
	function ago(ms) {

		let end = (number) => (number > 1) ? 's ago' : ' ago';

		ms = Math.floor(ms / 1000);

		let yer = Math.floor(ms / 31536000);
		if (yer) return yer + ' year' + end(yer);

		let mon = Math.floor((ms %= 31536000) / 2592000);
		if (mon) return mon + ' month' + end(mon);

		let day = Math.floor((ms %= 2592000) / 86400);
		if (day) return day + ' day' + end(day);

		let hor = Math.floor((ms %= 86400) / 3600);
		if (hor) return 'about ' + hor + ' hour' + end(hor);

		let min = Math.floor((ms %= 3600) / 60);
		if (min) return min + ' minute' + end(min);

		let sec = ms % 60;
		if (sec) return sec + ' second' + end(sec);

		return 'just now';
	}

	// Pluralizes a word, but only works when the word requires
	// an 's' to be added for pluralization.
	let pluralize = (w, n) => n !== 1 ? w + 's' : w;
	let shorten = (text, max) => text.length < max ? text : text.substring(0, max - 3) + '...';
	let capitalize = s => `${s.charAt(0).toUpperCase()}${s.slice(1)}`;

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
		PushEvent: new Anomaly('Pushed to {{branchLink}}{{repoLink}}<br><ul class="gha-commits">{{payload.commits}}</ul><small class="gha-message-commits">{{commitsMessage}}</small>'),
        PushCommit: new Anomaly('<li><small>{{shaLink}} {{message}}</small></li>'),
		ReleaseEvent: new Anomaly('Released {{tagLink}} at {{repoLink}}<br><small> {{zipLink}}</small>'),
		WatchEvent: new Anomaly('Starred {{repoLink}}')
	};

	var methods = {

		renderLink: (url, title, cls) => `<a class="${ cls || '' }" rel="noopener" href="${ url }" target="_blank">${ title || url }</a>`,
		renderGitLink: (url, title, cls) => methods.renderLink('https://github.com/' + url, title || url, cls),

		createActivity: (data) => {
			var title;
			var p = data.payload;
			data.repoLink = methods.renderGitLink(data.repo.name);

			// Get the branch name if it exists.
			if (p.ref) {
				data.branch = p.ref.substring(0, 11) === 'refs/heads/' ? p.ref.substring(11) : p.ref;
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
				p.commits.forEach((d, i) => {
					d.message = shorten(d.message, 75);
					d.shaLink = methods.renderGitLink(data.repo.name + '/commit/' + d.sha, d.sha.substring(0, 6), 'gha-sha');
				});
			}

			// Get the link if this is an IssueEvent.
			if (p.issue) {
				title = data.repo.name + '#' + p.issue.number;
				data.issueLink = methods.renderLink(p.issue.html_url, title);
				data.issueType = 'issue';
				p.action = capitalize(p.action);
				if (p.issue.pull_request) {
					data.issueType = 'pull request';
				}
			}

			// Retrieve the pull request link if this is a PullRequestEvent.
			if (p.pull_request) {
				var pr = p.pull_request;
				p.action = capitalize(p.action);
				data.pullRequestLink = methods.renderLink(pr.html_url, data.repo.name + '#' + pr.number);
				data.mergeMessage = '';

				// If this was a merge, set the merge message.
				if (p.pull_request.merged) {
					p.action = 'Merged';
					var summary = `${pr.commits} ${pluralize('commit', pr.commits)} with ${pr.additions} ${pluralize('addition', pr.additions)} and ${pr.deletions} ${pluralize('deletion', pr.deletions)}`;
					data.mergeMessage = `<br><small class="gha-message-merge">${summary}</small>`;
				}
			}

			// Get the link if this is a PullRequestReviewCommentEvent
			if (p.comment && p.comment.pull_request_url) {
				title = data.repo.name + "#" + p.comment.pull_request_url.split('/').pop();
				data.pullRequestLink = methods.renderLink(p.comment.html_url, title);
			}

			// Get the comment if one exists, and trim it to 150 characters.
			if (p.comment && p.comment.body) {
				data.comment = p.comment.body;
				data.comment = shorten(data.comment, 150);

				if (p.comment.html_url && p.comment.commit_id) {
					title = data.repo.name + '@' + p.comment.commit_id.substring(0, 10);
					data.commentLink = methods.renderLink(p.comment.html_url, title);
				}
			}

			if (p.push_id) {
				let html = '';
				p.commits.forEach((c) => {
					html += templates.PushCommit.render(c);
				});
				p.commits = html;
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
			return `<activity><div class="gha-message">${message}</div><span class="gha-time">${timeString}</span></activity>`;
		}
	};

	let self = null;

	global.Activity = {
		username: 'HLSiira',
		selector: '#feed',
		eventsUrl: null,
		limit: 20,

		init: () => {
			self = global.Activity;

			var userUrl = 'https://api.github.com/users/' + self.username,
				feed = localStorage.getItem('feed');
			self.eventsUrl = userUrl + '/events';

			if (false && feed) {
				self.render(feed);
			} else {
				self.loadFeed();
			}
		},

		loadFeed: () => {
			echo({
				url: self.eventsUrl,
				header: ['Accept', 'application/vnd.github.v3+json'],
				settled: (feed, status) => {
					if (status === true) {
						feed = self.createStream(feed);
						localStorage.setItem('feed', feed);
					} else {
						feed = status === 403 ? `<info>403: Github API rate limit exceeded.</info>` : `<info>404: User ${self.username} not found.</info>`;
					}
					self.render(feed);
				}
			});
		},

		render: (feed) => {
			var div = $(self.selector);
			if (!div) return;
			div.innerHTML = feed;

		},

		createStream: (data) => {
			var output = '';
			let limit = self.limit > data.length ? data.length : self.limit;

			if (limit === 0) {
				return `<info>204: User ${self.username} does not have public activity.</info>`;
			}

			for (var i = 0; i < limit; i++) {
				output += methods.createActivity(data[i]);
			}

			return output;
		},
	};

})(this);