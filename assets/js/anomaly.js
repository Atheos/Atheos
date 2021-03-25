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

(function(global) {
	'use strict';

	var regex = /\{\{(.+?)\}\}/g;

	let scrub = (val) => new Option(val).innerHTML.replace(/"/g, "&quot;");

	let getVal = (v, k) => {
		var p = k.split('.');
		while (p.length) {
			if (!(p[0] in v)) return false;
			v = v[p.shift()];
		}
		return v;
	};
	
	let render = (fragment, vars) => {
		fragment = fragment.replace(regex, function(meta, key) {
			var val = getVal(vars, key);

			if (val || val === 0) {
				return meta == '%' ? scrub(val) : val;
			}
			return "";
		});
		return fragment;		
	};

	global.Anomaly = function(t) {
		this.template = t;
	};

	global.Anomaly.prototype.render = function(vars) {
		return render(this.template, vars);
	};

})(this);