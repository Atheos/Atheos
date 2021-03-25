//////////////////////////////////////////////////////////////////////////////80
// Aeon: Ajax library for fluid page transitions
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/license.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2016 Luigi De Rosa
// Source: https://github.com/barbajs/barba/tree/1.x
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';

	var Utils = {

		// Start an XMLHttpRequest() and return a Promise
		xhr: function(url) {
			var def = this.deferred();
			var req = new XMLHttpRequest();

			req.onreadystatechange = function() {
				if (req.readyState === 4) {
					return req.status === 200 ? def.resolve(req.responseText) : def.reject(new Error('xhr: HTTP code is not 200'));
				}
			};

			req.ontimeout = () => def.reject(new Error('xhr: Timeout exceeded'));

			req.open('GET', url);
			req.timeout = 2000;
			req.setRequestHeader('x-aeon', 'yes');
			req.send();

			return def.promise;
		},

		// Return a new "Deferred" object
		deferred: function() {
			return new function() {
				this.resolve = null;
				this.reject = null;

				this.promise = new Promise(function(resolve, reject) {
					this.resolve = resolve;
					this.reject = reject;
				}.bind(this));
			};
		}
	};


	let mem = [], // For History
		data = {}, // For Cache
		events = {}; // For Dispatcher

	var History = {
		add: (url) => mem.push(url),
		current: () => mem[mem.length - 1],
		previous: () => mem.length < 2 ? null : mem[mem.length - 2]
	};

	var Cache = {
		set: (key, val) => data[key] = val,
		get: (key) => data[key],
		reset: () => data = {}
	};

	var Dispatcher = {
		on: function(e, f) {
			if (!(e in events)) events[e] = [];
			events[e].push(f);
		},

		off: function(e, f) {
			if (e in events === false) return;
			events[e].splice(events[e].indexOf(f), 1);
		},

		trigger: function(e) { //e, ...args
			if (e in events === false) return;
			for (var i = 0; i < events[e].length; i++) {
				events[e][i].apply(this, Array.prototype.slice.call(arguments, 1));
			}
		}
	};

	var Transition = {

		oldContainer: undefined,
		newContainer: undefined,

		ready: undefined,
		promise: undefined,
		loading: undefined,

		init: function(oldContainer, newContainer) {
			this.oldContainer = oldContainer;
			this.promise = newContainer;

			this.deferred = Utils.deferred();
			this.ready = Utils.deferred();
			this.loading = this.ready.promise;

			Promise.all([this.loading, this.leave()]).then(this.enter.bind(this));

			this.promise.then((newContainer) => {
				this.newContainer = newContainer;
				this.ready.resolve();
			});

			return this.deferred.promise;
		},

		leave: function() {
			var oldWrap = this.oldContainer;
			return new Promise(function(resolve, reject) {
				oldWrap.addEventListener("transitionend", () => {
					oldWrap.style.display = 'none';
					resolve();
				});
				oldWrap.style.opacity = 1;
				oldWrap.style.transitionProperty = 'opacity';
				oldWrap.style.transitionDuration = '250ms';
				oldWrap.offsetHeight;
				oldWrap.style.opacity = 0;
			});
		},
		enter: function() {
			var newWrap = this.newContainer;

			newWrap.style.opacity = 0;
			newWrap.style.display = '';
			newWrap.style.transitionProperty = 'opacity';
			newWrap.style.transitionDuration = '750ms';
			newWrap.offsetHeight;
			newWrap.style.opacity = 1;

			this.done();
		},

		done: function() {
			this.oldContainer.remove();
			this.newContainer.style.display = '';
			this.deferred.resolve();
		}
	};

	var Dom = {

		selector: 'aeon',
		currentHTML: document.documentElement.innerHTML,

		parseResponse: function(responseText) {
			this.currentHTML = responseText;

			var wrapper = document.createElement('div');
			wrapper.innerHTML = responseText;

			var title = wrapper.querySelector('title');

			if (title) document.title = title.textContent;

			return this.getContainer(wrapper);
		},

		// Get the main wrapper by the ID `wrapperId`
		getWrapper: () => document.getElementById(Dom.selector),

		// Get the container on the current DOM,
		getContainer: function(element) {
			element = element || document.body;
			if (!element) return;
			return element.querySelector('.' + this.selector);
		},

		// Put the container on the page
		putContainer: function(element) {
			element.style.display = 'none';
			var wrapper = this.getWrapper();
			wrapper.insertBefore(element, this.getContainer());
		}
	};

	var Pjax = {

		transition: Transition,
		transitioning: false,

		init: function() {
			var container = Dom.getContainer();
			var wrapper = Dom.getWrapper();

			if (!(wrapper && container)) return;

			wrapper.setAttribute('aria-live', 'polite');
			History.add(window.location.href);

			//Fire for the current view.
			Dispatcher.trigger('initStateChange', History.current());
			Dispatcher.trigger('newPageReady', History.current(), container, Dom.currentHTML);
			Dispatcher.trigger('transitionCompleted', History.current());

			document.addEventListener('click', Pjax.onLinkClick);
			window.addEventListener('popstate', Pjax.onStateChange);
		},

		// Change the URL with pushstate and trigger the state change
		goTo: function(url) {
			window.history.pushState(null, null, url);
			Pjax.onStateChange();
		},

		// Load an url, will start an xhr request or load from the cache
		load: function(url) {
			var deferred = Utils.deferred();
			var xhr = Cache.get(url);

			if (!xhr) {
				xhr = Utils.xhr(url);
				Cache.set(url, xhr);
			}

			xhr.then((data) => {
					var container = Dom.parseResponse(data);
					Dom.putContainer(container);
					deferred.resolve(container);
				},
				() => {
					//Something went wrong (timeout, 404, 505...)
					window.location = url;
					deferred.reject();
				}
			);

			return deferred.promise;
		},

		// Get the .href parameter out of an element
		// and handle special cases (like xlink:href)
		getHref: function(el) {
			if (!el) return undefined;
			if (el.getAttribute && typeof el.getAttribute('xlink:href') === 'string') return el.getAttribute('xlink:href');
			if (typeof el.href === 'string') return el.href;
			return undefined;
		},

		// Callback called from click event
		onLinkClick: function(e) {

			var el = e.target;

			//Go up in the nodelist until we
			//find something with an href
			while (el && !Pjax.getHref(el)) {
				el = el.parentNode;
			}

			if (Pjax.preventCheck(e, el)) {
				e.stopPropagation();
				e.preventDefault();

				Dispatcher.trigger('linkClicked', el, e);

				var href = Pjax.getHref(el);
				Pjax.goTo(href);
			}
		},

		// Determine if the link should be followed
		preventCheck: function(e, element) {
			if (!window.history.pushState) return false;

			var href = Pjax.getHref(element);

			//User
			if (!element || !href) return false;

			//Middle click, cmd click, and ctrl click
			if (e.which > 1 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;

			//Ignore target with _blank target
			if (element.target && element.target === '_blank') return false;

			//Check if it's the same domain
			if (window.location.protocol !== element.protocol || window.location.hostname !== element.hostname) return false;

			//Ignore case when a hash is being tacked on the current URL
			if (href.indexOf('#') > -1) return false;

			//Ignore case where there is download attribute
			if (element.getAttribute && typeof element.getAttribute('download') === 'string') return false;

			if (element.classList.contains('no-preload')) return false;

			return true;
		},

		onStateChange: function() {
			var newUrl = window.location.href;
			if (Pjax.transitioning) window.location = newUrl;
			if (History.current() === newUrl) return false;

			History.add(newUrl);

			var newContainer = Pjax.load(newUrl);
			var transition = Object.create(Pjax.transition);

			Pjax.transitioning = true;

			Dispatcher.trigger('initStateChange', History.current(), History.previous());

			var instance = transition.init(Dom.getContainer(), newContainer);

			newContainer.then(Pjax.onNewContainerLoaded);
			instance.then(Pjax.onTransitionEnd);
		},

		// Function called as soon the new container is ready
		onNewContainerLoaded: function(container) {
			var current = History.current();

			Dispatcher.trigger('newPageReady', History.current(), container, Dom.currentHTML);
		},

		// Function called as soon the transition is finished
		onTransitionEnd: function() {
			Pjax.transitioning = false;

			Dispatcher.trigger('transitionCompleted', History.current(), History.previous());
		}
	};



	var Prefetch = {


		// Init the event listener on mouseover and touchstart
		init: function() {
			if (!window.history.pushState) return false;

			document.body.addEventListener('mouseover', this.onLinkEnter.bind(this));
			document.body.addEventListener('touchstart', this.onLinkEnter.bind(this));
		},

		// Callback for the mousehover/touchstart
		onLinkEnter: function(evt) {
			var el = evt.target;

			while (el && !Pjax.getHref(el)) {
				el = el.parentNode;
			}

			if (!el || el.classList.contains('no-prefetch')) {
				return;
			}

			var url = Pjax.getHref(el);

			//Check if the link is elegible for Pjax
			if (Pjax.preventCheck(evt, el) && !Cache.get(url)) {
				var xhr = Utils.xhr(url);
				Cache.set(url, xhr);
			}
		}
	};

	global.Aeon = {
		Dispatcher,
		init: function() {
			Prefetch.init();
			Pjax.init();
		}
	};

})(this);