(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], function() {
			return factory(root);
		});
	} else if (typeof exports === 'object') {
		module.exports = factory(root);
	} else {
		root.ajax = factory(root);
	}
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this, function(window) {

	'use strict';

	function formatParams(data, random) {
		var arr = [];
		if (data && typeof data === 'object') {
			for (var name in data) {
				arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
			}
		}
		if (random) {
			arr.push(('v=' + Math.random()).replace('.', ''));
		}
		return arr.join('&');
	}

	const ajax = function(options) {
		options = options || {};
		options.type = (options.type || 'GET').toUpperCase();
		options.dataType = options.dataType || 'json';
		var params = formatParams(options.data, false);
		var xhr;

		if (window.XMLHttpRequest) {
			xhr = new XMLHttpRequest();
		} else {
			xhr = new ActiveXObject('Microsoft.XMLHTTP');
		}

		return new Promise(function(resolve, reject) {
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4) {
					var status = xhr.status;
					if (status >= 200 && status < 300) {
						if (options.success) {
							options.success(xhr.responseText, xhr.responseXML);
						}
						resolve(xhr.responseText);
					} else {
						if (options.fail) {
							options.fail(status);
						}
						reject(xhr.responseText);
					}
				}
			};
			if (options.type === 'GET') {
				params = params ? '?' + params : '';
				xhr.open('GET', options.url + params, true);
				xhr.send(null);
			} else if (options.type === 'POST') {
				xhr.open('POST', options.url, true);
				xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
				xhr.send(params);
			}
		});
		// return xhr;
	};
	
	return ajax;

});



/*
	* author: WeideMo
	* email: 412511016@qq.com
	* source: https://github.com/WeideMo/miniAjax
	* alt: https://github.com/maxrpeterson/ajax/blob/master/ajax.js
	**/