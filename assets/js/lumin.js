//////////////////////////////////////////////////////////////////////////////80
// Lumin: Language agnostic syntax highlighter
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/license.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Copyright 2019 Lars Jung
// Source: https://github.com/lrsjng/lolight
//////////////////////////////////////////////////////////////////////////////80

(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], function() {
			return factory(root);
		});
	} else if (typeof exports === 'object') {
		module.exports = factory(root);
	} else {
		root.Lumin = factory(root);
	}
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this, function(window) {
	'use strict';

	// var SELECTOR = '.lumin';
	var CLS_PREFIX = 'll-';
	// var STYLE = '_nam#2196f3}_num#fc407a}_str#43a047}_rex#ef6c00}_pct#F93}_brc#999}_key#EEE;}_com#aaa;}'.replace(/_/g, '.' + CLS_PREFIX).replace(/#/g, '{color:#');

	var KEYWORD_RE = /^(a(bstract|lias|nd|rguments|rray|s(m|sert)?|uto)|b(ase|egin|ool(ean)?|reak|yte)|c(ase|atch|har|hecked|lass|lone|ompl|onst|ontinue)|de(bugger|cimal|clare|f(ault|er)?|init|l(egate|ete)?)|do|double|e(ls?if|lse(if)?|nd|nsure|num|vent|x(cept|ec|p(licit|ort)|te(nds|nsion|rn)))|f(allthrough|inal(ly)?|ixed|loat|or(each)?|riend|rom|unc(tion)?)|global|goto|guard|i(f|mp(lements|licit|ort)|n(it|clude(_once)?|line|out|stanceof|t(eger|erface|ernal)?)?|s)|l(ambda|et|ock|ong)|m(odule|utable)|NaN|n(amespace|ative|ext|ew|il|ot|ull)|o(bject|perator|r|ut|verride)|p(ackage|arams|rivate|rotected|rotocol|ublic)|r(aise|e(adonly|do|f|gister|peat|quire(_once)?|scue|strict|try|turn))|s(byte|ealed|elf|hort|igned|izeof|tatic|tring|truct|ubscript|uper|ynchronized|witch)|t(emplate|hen|his|hrows?|ransient|ry|ype(alias|def|id|name|of))|u(n(checked|def(ined)?|ion|less|signed|til)|se|sing)|v(ar|irtual|oid|olatile)|w(char_t|hen|here|hile|ith)|xor|yield)$/;
	
	var CONST_RE = /^(post|xml(.*))$/i;

	var BOOLEAN_RE = /^(true|false)$/;

	var TOKEN_RES = [
		['num', /#([0-9a-f]{6}|[0-9a-f]{3})\b/],
		['com', /(\/\/|#).*?(?=\n|$)/],
		['com', /\/\*[\s\S]*?\*\//],
		['com', /<!--[\s\S]*?-->/],
		['rex', /\/(\\\/|[^\n])*?\//],
		['str', /(['"`])(\\\1|[\s\S])*?\1/],
		['num', /[+-]?([0-9]*\.?[0-9]+|[0-9]+\.?[0-9]*)([eE][+-]?[0-9]+)?/],
		// [PCT, /[\\.,:;+\-*\/=<>()[\]{}\|?!&@~]/],
		['pct', /[\\.,:;+\-*\/=<>\|?!&@~]/],
		['brc', /[()[\]{}]/],
		['spc', /\s+/],
		['nam', /[\w$]+/],
		['unk', /./]
	];

	var tokenize = function(text) {
		if (typeof text !== 'string') {
			return;
		}

		var tokens = [];
		var len = TOKEN_RES.length;
		var preferDiv = false;

		while (text) {
			for (var i = 0; i < len; i += 1) {
				var m = TOKEN_RES[i][1].exec(text);
				if (!m || m.index !== 0) {
					continue;
				}

				var cls = TOKEN_RES[i][0];
				if (cls === 'rex' && preferDiv) {
					continue;
				}

				var tok = m[0];

				if (cls === 'nam') {
					if (KEYWORD_RE.test(tok)) {
						cls = 'key';
					}
					if (BOOLEAN_RE.test(tok)) {
						cls = 'num';
					}
					if (CONST_RE.test(tok)) {
						cls = 'con';
					}
				}
				if (cls === 'spc') {
					if (tok.indexOf('\n') >= 0) {
						preferDiv = false;
					}
				} else {
					preferDiv = cls === 'num' || cls === 'nam';
				}

				text = text.slice(tok.length);
				tokens.push([cls, tok]);
				break;
			}
		}
		return tokens;
	};

	var highlight = function(block) {
		var tokens = tokenize(block.textContent);
		block.innerHTML = '';
		tokens.forEach(function(token) {
			var tok_el = document.createElement('span');
			tok_el.className = CLS_PREFIX + token[0];
			tok_el.textContent = token[1];
			block.appendChild(tok_el);
		});
	};

	var lumin = {
		init: function(sel) {
			// var head = document.querySelector('head');
			// var style = document.createElement('style');

			// style.textContent = STYLE;
			// head.insertBefore(style, head.firstChild);

			var targets = document.querySelectorAll(sel || 'code');
			for (var i = 0; i < targets.length; i++) {
				highlight(targets[i]);
			}
		}
	};

	return lumin;
});