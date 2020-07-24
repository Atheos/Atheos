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

(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], function() {
			return factory(root);
		});
	} else if (typeof exports === 'object') {
		module.exports = factory(root);
	} else {
		root.Aeon = factory(root);
	}
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this, function(window) {
	'use strict';

	var Utils = {
		// Return the current url
		getCurrentUrl: function() {
			return this.cleanLink(window.location.protocol + '//' +
				window.location.host +
				window.location.pathname +
				window.location.search);
		},

		// Given an url, return it without the hash
		cleanLink: function(url) {
			return url.replace(/#.*/, '');
		},

		// Time in millisecond after the xhr request goes in timeout
		xhrTimeout: 5000,

		// Start an XMLHttpRequest() and return a Promise
		xhr: function(url) {
			var deferred = this.deferred();
			var req = new XMLHttpRequest();

			req.onreadystatechange = function() {
				if (req.readyState === 4) {
					if (req.status === 200) {
						return deferred.resolve(req.responseText);
					} else {
						return deferred.reject(new Error('xhr: HTTP code is not 200'));
					}
				}
			};

			req.ontimeout = function() {
				return deferred.reject(new Error('xhr: Timeout exceeded'));
			};

			req.open('GET', url);
			req.timeout = this.xhrTimeout;
			req.setRequestHeader('x-aeon', 'yes');
			req.send();

			return deferred.promise;
		},

		// Get obj and props and return a new object with the property merged
		extend: function(obj, props) {
			var newObj = Object.create(obj);

			for (var prop in props) {
				if (props.hasOwnProperty(prop)) {
					newObj[prop] = props[prop];
				}
			}

			return newObj;
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
		},

		// Return the port number normalized, eventually you can pass a string to be normalized.
		getPort: function(p) {
			var port = typeof p !== 'undefined' ? p : window.location.port;
			var protocol = window.location.protocol;

			if (port != '')
				return parseInt(port);

			if (protocol === 'http:')
				return 80;

			if (protocol === 'https:')
				return 443;
		}
	};

	var History = {
		history: [],

		// Add a new set of url and namespace
		add: function(url, namespace) {
			if (!namespace)
				namespace = undefined;

			this.history.push({
				url: url,
				namespace: namespace
			});
		},

		// Return information about the current status
		currentStatus: function() {
			return this.history[this.history.length - 1];
		},

		// Return information about the previous status
		prevStatus: function() {
			if (this.history.length < 2)
				return null;

			return this.history[this.history.length - 2];
		}
	};

	var BaseTransition = {

		oldContainer: undefined,
		newContainer: undefined,
		newContainerReady: undefined,
		newContainerPromise: undefined,
		newContainerLoading: undefined,

		extend: function(obj) {
			return Utils.extend(this, obj);
		},

		init: function(oldContainer, newContainer) {
			this.oldContainer = oldContainer;
			this.newContainerPromise = newContainer;

			this.deferred = Utils.deferred();
			this.newContainerReady = Utils.deferred();
			this.newContainerLoading = this.newContainerReady.promise;

			this.start();

			this.newContainerPromise.then((newContainer) => {
				this.newContainer = newContainer;
				this.newContainerReady.resolve();
			});

			return this.deferred.promise;
		},

		start: function() {
			// this.newContainerLoading.then(this.finish.bind(this));

			// As soon the loading is finished and the old page is faded out, let's fade the new page
			Promise
				.all([this.newContainerLoading, this.fadeOut()])
				.then(this.fadeIn.bind(this));
		},

		fadeOut: function() {
			var oldWrap = this.oldContainer;
			return new Promise(function(resolve, reject) {
				oldWrap.addEventListener("transitionend", () => {
					oldWrap.style.display = 'none';
					resolve();
				});
				oldWrap.style.opacity = 1;
				// oldWrap.style.transition = "opacity 2500ms ease-in-out";
				oldWrap.style.transitionProperty = 'opacity';
				oldWrap.style.transitionDuration = '250ms';
				oldWrap.offsetHeight;
				oldWrap.style.opacity = 0;
			});
		},
		fadeIn: function() {
			var newWrap = this.newContainer;

			newWrap.style.opacity = 0;
			newWrap.style.display = '';
			// newWrap.style.transition = "opacity 2500ms ease-in-out";
			newWrap.style.transitionProperty = 'opacity';
			newWrap.style.transitionDuration = '750ms';
			newWrap.offsetHeight;
			newWrap.style.opacity = 1;

			this.done();
		},

		finish: function() {
			document.body.scrollTop = 0;
			this.done();
		},

		done: function() {
			this.oldContainer.parentNode.removeChild(this.oldContainer);
			// this.newContainer.style.visibility = 'visible';
			this.newContainer.style.display = '';
			this.deferred.resolve();
		}
	};

	var BaseView = {
		namespace: null,

		// Helper to extend this object
		extend: function(obj) {
			return Utils.extend(this, obj);
		},

		// Init the view.
		init: function() {
			Dispatcher.on('initStateChange', (newStatus, oldStatus) => {
				if (oldStatus && oldStatus.namespace === this.namespace)
					this.onLeave();
			});

			Dispatcher.on('newPageReady', (newStatus, oldStatus, container) => {
				this.container = container;

				if (newStatus.namespace === this.namespace)
					this.onEnter();
			});

			Dispatcher.on('transitionCompleted', (newStatus, oldStatus) => {
				if (newStatus.namespace === this.namespace)
					this.onEnterCompleted();

				if (oldStatus && oldStatus.namespace === this.namespace)
					this.onLeaveCompleted();
			});
		},

		// This function will be fired when the container
		// is ready and attached to the DOM.
		onEnter: function() {},

		// This function will be fired when the transition
		// to this container has just finished.
		onEnterCompleted: function() {},

		// This function will be fired when the transition
		// to a new container has just started.
		onLeave: function() {},

		// This function will be fired when the container
		// has just been removed from the DOM.
		onLeaveCompleted: function() {}
	};

	var BaseCache = {
		data: {},

		// Helper to extend this object
		extend: function(obj) {
			return Utils.extend(this, obj);
		},

		// Set a key and value data, mainly Barba is going to save promises
		set: function(key, val) {
			this.data[key] = val;
		},

		// Retrieve the data using the key
		get: function(key) {
			return this.data[key];
		},

		// Flush the cache
		reset: function() {
			this.data = {};
		}
	};

	var Dispatcher = {
		events: {},

		on: function(e, f) {
			this.events[e] = this.events[e] || [];
			this.events[e].push(f);
		},

		off: function(e, f) {
			if (e in this.events === false)
				return;

			this.events[e].splice(this.events[e].indexOf(f), 1);
		},

		trigger: function(e) { //e, ...args
			if (e in this.events === false)
				return;

			for (var i = 0; i < this.events[e].length; i++) {
				this.events[e][i].apply(this, Array.prototype.slice.call(arguments, 1));
			}
		}
	};

	var Dom = {
		dataNamespace: 'namespace',
		wrapperId: 'aeon',
		containerClass: 'aeon',

		// Full HTML String of the current page.
		currentHTML: document.documentElement.innerHTML,

		// Parse the responseText obtained from the xhr call
		parseResponse: function(responseText) {
			this.currentHTML = responseText;

			var wrapper = document.createElement('div');
			wrapper.innerHTML = responseText;

			var titleEl = wrapper.querySelector('title');

			if (titleEl)
				document.title = titleEl.textContent;

			return this.getContainer(wrapper);
		},

		// Get the main wrapper by the ID `wrapperId`
		getWrapper: function() {
			var wrapper = document.getElementById(this.wrapperId);
			if (!wrapper) console.warn('Aeon: wrapper not found!');
			return wrapper;
		},

		// Get the container on the current DOM,
		getContainer: function(element) {
			if (!element) element = document.body;

			if (!element) {
				console.warn('Aeon: DOM not ready!');
				return;
			}

			var container = element.querySelector('.' + this.containerClass);

			if (!container) console.warn('Aeon: no container found');

			return container;
		},

		// Get the namespace of the container
		getNamespace: function(element) {
			if (element && element.dataset) {
				return element.dataset[this.dataNamespace];
			} else if (element) {
				return element.getAttribute('data-' + this.dataNamespace);
			}

			return null;
		},

		// Put the container on the page
		putContainer: function(element) {
			// element.style.visibility = 'hidden';
			element.style.display = 'none';
			var wrapper = this.getWrapper();
			wrapper.insertBefore(element, this.getContainer());
		}
	};

	var Pjax = {

		transition: BaseTransition,
		cacheEnabled: true,
		transitionProgress: false,
		ignoreClassLink: 'no-aeon',


		init: function() {
			var container = Dom.getContainer();
			var wrapper = Dom.getWrapper();

			if (!(wrapper && container)) {
				return;
			}

			wrapper.setAttribute('aria-live', 'polite');

			History.add(
				Utils.getCurrentUrl(),
				Dom.getNamespace(container)
			);

			//Fire for the current view.
			Dispatcher.trigger('initStateChange', History.currentStatus());
			Dispatcher.trigger('newPageReady',
				History.currentStatus(), {},
				container,
				Dom.currentHTML
			);
			Dispatcher.trigger('transitionCompleted', History.currentStatus());

			this.bindEvents();
		},

		// Attach the eventlisteners
		bindEvents: function() {
			document.addEventListener('click',
				this.onLinkClick.bind(this)
			);

			window.addEventListener('popstate',
				this.onStateChange.bind(this)
			);
		},

		// Change the URL with pushstate and trigger the state change
		goTo: function(url) {
			window.history.pushState(null, null, url);
			this.onStateChange();
		},

		// Force the browser to go to a certain url
		forceGoTo: function(url) {
			window.location = url;
		},

		// Load an url, will start an xhr request or load from the cache
		load: function(url) {
			var deferred = Utils.deferred();
			var xhr = BaseCache.get(url);

			if (!xhr) {
				xhr = Utils.xhr(url);
				BaseCache.set(url, xhr);
			}

			xhr.then((data) => {
					var container = Dom.parseResponse(data);

					Dom.putContainer(container);

					if (!this.cacheEnabled)
						BaseCache.reset();

					deferred.resolve(container);
				},
				() => {
					//Something went wrong (timeout, 404, 505...)
					this.forceGoTo(url);
					deferred.reject();
				}
			);

			return deferred.promise;
		},

		// Get the .href parameter out of an element
		// and handle special cases (like xlink:href)
		getHref: function(el) {
			if (!el) {
				return undefined;
			}

			if (el.getAttribute && typeof el.getAttribute('xlink:href') === 'string') {
				return el.getAttribute('xlink:href');
			}

			if (typeof el.href === 'string') {
				return el.href;
			}

			return undefined;
		},

		// Callback called from click event
		onLinkClick: function(evt) {

			var el = evt.target;

			//Go up in the nodelist until we
			//find something with an href
			while (el && !this.getHref(el)) {
				el = el.parentNode;
			}

			if (this.preventCheck(evt, el)) {
				evt.stopPropagation();
				evt.preventDefault();

				Dispatcher.trigger('linkClicked', el, evt);

				var href = this.getHref(el);
				this.goTo(href);
			}
		},

		// Determine if the link should be followed
		preventCheck: function(evt, element) {
			if (!window.history.pushState)
				return false;

			var href = this.getHref(element);

			//User
			if (!element || !href)
				return false;

			//Middle click, cmd click, and ctrl click
			if (evt.which > 1 || evt.metaKey || evt.ctrlKey || evt.shiftKey || evt.altKey)
				return false;

			//Ignore target with _blank target
			if (element.target && element.target === '_blank')
				return false;

			//Check if it's the same domain
			if (window.location.protocol !== element.protocol || window.location.hostname !== element.hostname)
				return false;

			//Check if the port is the same
			if (Utils.getPort() !== Utils.getPort(element.port))
				return false;

			//Ignore case when a hash is being tacked on the current URL
			if (href.indexOf('#') > -1)
				return false;

			//Ignore case where there is download attribute
			if (element.getAttribute && typeof element.getAttribute('download') === 'string')
				return false;

			//In case you're trying to load the same page
			// if (Utils.cleanLink(href) == Utils.cleanLink(location.href))
			// return false;

			if (element.classList.contains(this.ignoreClassLink))
				return false;

			return true;
		},

		// Method called after a 'popstate' or from .goTo()
		onStateChange: function() {
			var newUrl = Utils.getCurrentUrl();

			if (this.transitionProgress)
				this.forceGoTo(newUrl);

			if (History.currentStatus().url === newUrl)
				return false;

			History.add(newUrl);

			var newContainer = this.load(newUrl);
			var transition = Object.create(this.transition);

			this.transitionProgress = true;

			Dispatcher.trigger('initStateChange',
				History.currentStatus(),
				History.prevStatus()
			);

			var transitionInstance = transition.init(
				Dom.getContainer(),
				newContainer
			);

			newContainer.then(
				this.onNewContainerLoaded.bind(this)
			);

			transitionInstance.then(
				this.onTransitionEnd.bind(this)
			);
		},

		// Function called as soon the new container is ready
		onNewContainerLoaded: function(container) {
			var currentStatus = History.currentStatus();
			currentStatus.namespace = Dom.getNamespace(container);

			Dispatcher.trigger('newPageReady',
				History.currentStatus(),
				History.prevStatus(),
				container,
				Dom.currentHTML
			);
		},

		// Function called as soon the transition is finished
		onTransitionEnd: function() {
			this.transitionProgress = false;

			Dispatcher.trigger('transitionCompleted',
				History.currentStatus(),
				History.prevStatus()
			);
		}
	};



	var Prefetch = {
		ignoreClassLink: 'no-prefetch',

		// Init the event listener on mouseover and touchstart
		init: function() {
			if (!window.history.pushState) {
				return false;
			}

			document.body.addEventListener('mouseover', this.onLinkEnter.bind(this));
			document.body.addEventListener('touchstart', this.onLinkEnter.bind(this));
		},

		// Callback for the mousehover/touchstart
		onLinkEnter: function(evt) {
			var el = evt.target;

			while (el && !Pjax.getHref(el)) {
				el = el.parentNode;
			}

			if (!el || el.classList.contains(this.ignoreClassLink)) {
				return;
			}

			var url = Pjax.getHref(el);

			//Check if the link is elegible for Pjax
			if (Pjax.preventCheck(evt, el) && !BaseCache.get(url)) {
				var xhr = Utils.xhr(url);
				BaseCache.set(url, xhr);
			}
		}
	};

	var Aeon = {
		version: '1.0.0',
		BaseTransition,
		BaseView,
		BaseCache,
		Dispatcher,
		History,
		Pjax,
		Prefetch,
		Utils,
		init: function() {
			Aeon.Prefetch.init();
			Aeon.Pjax.init();
		}
	};

	return Aeon;
});