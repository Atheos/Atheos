//////////////////////////////////////////////////////////////////////////////80
// Contact: Simple Ajax contact form
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/license.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80



(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], function() {
			return factory(root);
		});
	} else if (typeof exports === 'object') {
		module.exports = factory(root);
	} else {
		root.Contact = factory(root);
	}
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this, function(window) {
	'use strict';
	
	let Q = (s) => document.querySelector(s);
	
	function postAjax(url, data, callback) {
		var params = [];
		if (data && typeof data === 'object') {
			for (var name in data) {
				params.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
			}
			params.push(("v=" + Math.random()).replace(".", ""));
			params = params.join('&');
		} else {
			params = null;
		}

		var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");

		xhr.open('POST', url);
		xhr.onload = () => callback(xhr.responseText);
		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.send(params);
		return xhr;
	}

	function submit(e) {
		e.preventDefault();
		// get form data
		var data = {
			name: Q('#name').value,
			email: Q('#email').value,
			message: Q('#text').value
		};

		postAjax('/cdn/contact.php', data, parse_response);
	}

	function parse_response(response) {
		response = JSON.parse(response);
		var icon;
		if (response.message == 'email invalid') {
			response = 'Invalid Email';
			icon = 'warning';
		} else if (response.message == 'email sent') {
			response = 'Message Successfully Sent';
			icon = 'check';
		} else {
			response = 'Internal Server Error';
			icon = 'error';
		}

		toast(response, icon);
	}

	function toast(text, icon) {
		var wrapper = Q("toast");

		Q('toast icon').classList.add(icon);
		Q('toast span').innerHTML = text;

		wrapper.classList.add("show");
		setTimeout(function() {
			wrapper.classList.remove("show");
		}, 4200);
	}

	const Contact = {
		init: function() {
			var contact = Q('#contact');
			if (contact) {
				contact.addEventListener('submit', submit);
			}
		}
	};
	return Contact;
});