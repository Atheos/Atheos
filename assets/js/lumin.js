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

(function(global) {
	'use strict';

	var PREFIX = 'll-';
	var KEYWORD = /^(a(bstract|lias|nd|rguments|rray|s(m|sert)?|uto)|b(ase|egin|ool(ean)?|reak|yte)|c(ase|atch|har|hecked|lass|lone|ompl|onst|ontinue)|de(bugger|cimal|clare|f(ault|er)?|init|l(egate|ete)?)|do|double|e(ls?if|lse(if)?|nd|nsure|num|vent|x(cept|ec|p(licit|ort)|te(nds|nsion|rn)))|f(allthrough|inal(ly)?|ixed|loat|or(each)?|riend|rom|unc(tion)?)|global|goto|guard|i(f|mp(lements|licit|ort)|n(it|clude(_once)?|line|out|stanceof|t(eger|erface|ernal)?)?|s)|l(ambda|et|ock|ong)|m(odule|utable)|NaN|n(amespace|ative|ext|ew|il|ot|ull)|o(bject|perator|r|ut|verride)|p(ackage|arams|rivate|rotected|rotocol|ublic)|r(aise|e(adonly|do|f|gister|peat|quire(_once)?|scue|strict|try|turn))|s(byte|ealed|elf|hort|igned|izeof|tatic|tring|truct|ubscript|uper|ynchronized|witch)|t(emplate|hen|his|hrows?|ransient|ry|ype(alias|def|id|name|of))|u(n(checked|def(ined)?|ion|less|signed|til)|se|sing)|v(ar|irtual|oid|olatile)|w(char_t|hen|here|hile|ith)|xor|yield)$/;

	var CONST = /^(post|xml(.*))$/i;

	var BOOLEAN = /^(true|false)$/;

	var TOKENS = [
		['num', /#([0-9a-f]{6}|[0-9a-f]{3})\b/],
		['hex', /#([0-9A-F]{8}|[0-9A-F]{6}|[0-9A-F]{3,4})/i],
		['com', /(\/\/|#).*?(?=\n|$)/],
		['com', /\/\*[\s\S]*?\*\//],
		['com', /<!--[\s\S]*?-->/],
		// ['rex', /\/(\\\/|[^\n])*?\//],
		['rex', /((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)\/(?:\[(?:[^\]\\\r\n]|\\.)*]|\\.|[^/\\\[\r\n])+\/[gimyus]{0,6}(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/],
		// ['rex', /\/((?![*+?])(?:[^\r\n\[/\\]|\\.|\[(?:[^\r\n\]\\]|\\.)*\])+)\/((?:g(?:im?|mi?)?|i(?:gm?|mg?)?|m(?:gi?|ig?)?)?)/],
		
		// ['str', /(['"`])(\\\1|[\s\S])*?\1/],
		['str', /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/],
		['num', /[+-]?([0-9]*\.?[0-9]+|[0-9]+\.?[0-9]*)([eE][+-]?[0-9]+)?/],
		['pct', /[\\.,:;+\-*\/=<>\|?!&@~]/],
		['brc', /[()[\]{}]/],
		['spc', /\s+/],
		['wrd', /[\w$]+/],
		['unk', /./]
	];

	var escapeHTML = function(value) {
		return value
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#x27;');
	};

	var tokenize = function(text) {
		if (typeof text !== 'string') return;

		var result = '',
			l = TOKENS.length,
			prefer = false;

		while (text) {
			for (var i = 0; i < l; i += 1) {
				var m = TOKENS[i][1].exec(text);

				if (!m || m.index !== 0) continue;


				var cls = TOKENS[i][0];
				if (cls === 'rex' && prefer) continue;

				var tok = m[0];

				if (cls === 'wrd') {
					if (KEYWORD.test(tok)) cls = 'key';
					if (BOOLEAN.test(tok)) cls = 'bol';
					if (CONST.test(tok)) cls = 'con';
				}
				if (cls === 'spc') {
					if (tok.indexOf('\n') >= 0) prefer = false;
				} else {
					prefer = cls === 'num' || cls === 'wrd';
				}

				text = text.slice(tok.length);
				// tok = tok.replace(/[^\s\\]/g, '■');
				result += `<span class="${PREFIX + cls}">${tok}</span>`;
				break;
			}
		}
		return result;
	};

	global.Lumin = {
		init: function(sel) {
			var targets = document.querySelectorAll(sel || 'code');
			for (var i = 0; i < targets.length; i++) {
				this.highlight(targets[i]);
			}
		},
		highlight: function(block) {
			if (typeof block === 'string') {
				return tokenize(block);
			} else {
				block.innerHTML = tokenize(block.textContent);
			}
		}
	};

})(this);