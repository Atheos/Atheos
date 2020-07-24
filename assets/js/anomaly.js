//////////////////////////////////////////////////////////////////////////////80
// Anomaly: Micro templating framework
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/license.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2012 Jason Mooberry
// Source: https://github.com/jasonmoo/t.js/
//////////////////////////////////////////////////////////////////////////////80

(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], function() {
			return factory(root);
		});
	} else if (typeof exports === 'object') {
		module.exports = factory(root);
	} else {
		root.Anomaly = factory(root);
	}
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this, function(window) {
	'use strict';

	var blockregex = /\{(@?)(.+?)\}\}([\s\S]+?)\{\/\2\}\}/g,
		valregex = /\{\{(.+?)\}\}/g;

	function scrub(val) {
		return new Option(val).innerHTML.replace(/"/g, "&quot;");
	}

	function get_value(vars, key) {
		var parts = key.split('.');
		while (parts.length) {
			if (!(parts[0] in vars)) {
				return false;
			}
			vars = vars[parts.shift()];
		}
		return vars;
	}

	function render(fragment, vars) {
		fragment = fragment.replace(blockregex, function(_, meta, key, inner) {
			var val = get_value(vars, key),
				temp = "",
				i;

			let v, k;

			// process array/obj iteration
			if (meta == '@') {
				// store any previous vars
				// reuse existing vars
				k = vars.key;
				v = vars.val;
				for (i in val) {
					if (val.hasOwnProperty(i)) {
						vars.key = i;
						vars.val = val[i];
						temp += render(inner, vars);
					}
				}
				vars.key = k;
				vars.val = v;
				return temp;
			}

		});
		fragment = fragment.replace(valregex, function(meta, key) {
			var val = get_value(vars, key);

			if (val || val === 0) {
				return meta == '%' ? scrub(val) : val;
			}
			return "";
		});
		return fragment;
	}


	function anomaly(t) {
		this.template = t;
	}

	anomaly.prototype.render = function(vars) {
		return render(this.template, vars);
	};

	return anomaly;

});