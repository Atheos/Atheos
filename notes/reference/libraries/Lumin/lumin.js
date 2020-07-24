//	Synthetic | Simple pulsing hexagonal background for websites
//	(c) 2020 Liam Siira (liam@siira.us)
//	Created from lolight.js by Lars Jung (https://larsjung.de/lolight/)

(function (root, factory) {
    if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = factory(); // eslint-disable-line no-undef
    } else if (typeof define === 'function' && define.amd) { // eslint-disable-line no-undef
        define([], factory); // eslint-disable-line no-undef
    } else {
        root.lumin = factory();
    }
}(this, function () {
    var SELECTOR = '.lumin';
    var CLS_PREFIX = 'll-';
    // var STYLE = '_nam#2196f3}_num#ec407a}_str#43a047}_rex#ef6c00}_pct#666}_key#555;font-weight:bold}_com#aaa;font-style:italic}'.replace(/_/g, '.' + CLS_PREFIX).replace(/#/g, '{color:#');
    var STYLE = '_nam#2196f3}_num#fc407a}_str#43a047}_rex#ef6c00}_pct#999}_key#EEE;}_com#aaa;}'.replace(/_/g, '.' + CLS_PREFIX).replace(/#/g, '{color:#');


    var KEYWORD_RE = /^(a(bstract|lias|nd|rguments|rray|s(m|sert)?|uto)|b(ase|egin|ool(ean)?|reak|yte)|c(ase|atch|har|hecked|lass|lone|ompl|onst|ontinue)|de(bugger|cimal|clare|f(ault|er)?|init|l(egate|ete)?)|do|double|e(cho|ls?if|lse(if)?|nd|nsure|num|vent|x(cept|ec|p(licit|ort)|te(nds|nsion|rn)))|f(allthrough|alse|inal(ly)?|ixed|loat|or(each)?|riend|rom|unc(tion)?)|global|goto|guard|i(f|mp(lements|licit|ort)|n(it|clude(_once)?|line|out|stanceof|t(erface|ernal)?)?|s)|l(ambda|et|ock|ong)|m(odule|utable)|NaN|n(amespace|ative|ext|ew|il|ot|ull)|o(bject|perator|r|ut|verride)|p(ackage|arams|rivate|rotected|rotocol|ublic)|r(aise|e(adonly|do|f|gister|peat|quire(_once)?|scue|strict|try|turn))|s(byte|ealed|elf|hort|igned|izeof|tatic|tring|truct|ubscript|uper|ynchronized|witch)|t(emplate|hen|his|hrows?|ransient|rue|ry|ype(alias|def|id|name|of))|u(n(checked|def(ined)?|ion|less|signed|til)|se|sing)|v(ar|irtual|oid|olatile)|w(char_t|hen|here|hile|ith)|xor|yield)$/;

    var COM = 'com';
    var KEY = 'key';
    var NAM = 'nam';
    var NUM = 'num';
    var PCT = 'pct';
    var REX = 'rex';
    var SPC = 'spc';
    var STR = 'str';
    var UNK = 'unk';

    var TOKEN_RES = [
        [NUM, /#([0-9a-f]{6}|[0-9a-f]{3})\b/],
        [COM, /(\/\/|#).*?(?=\n|$)/],
        [COM, /\/\*[\s\S]*?\*\//],
        [COM, /<!--[\s\S]*?-->/],
        [REX, /\/(\\\/|[^\n])*?\//],
        [STR, /(['"`])(\\\1|[\s\S])*?\1/],
        [NUM, /[+-]?([0-9]*\.?[0-9]+|[0-9]+\.?[0-9]*)([eE][+-]?[0-9]+)?/],
        [PCT, /[\\.,:;+\-*\/=<>()[\]{}|?!&@~]/],
        [SPC, /\s+/],
        [NAM, /[\w$]+/],
        [UNK, /./]
    ];

    var tokenize = function (text) {
        if (typeof text !== 'string') {
            throw new Error('tok: no string');
        }

        var tokens = [];
        var len = TOKEN_RES.length;
        var prefer_div_over_re = false;

        while (text) {
            for (var i = 0; i < len; i += 1) {
                var m = TOKEN_RES[i][1].exec(text);
                if (!m || m.index !== 0) {
                    continue;
                }

                var cls = TOKEN_RES[i][0];
                if (cls === REX && prefer_div_over_re) {
                    continue;
                }

                var tok = m[0];

                if (cls === NAM && KEYWORD_RE.test(tok)) {
                    cls = KEY;
                }
                if (cls === SPC) {
                    if (tok.indexOf('\n') >= 0) {
                        prefer_div_over_re = false;
                    }
                } else {
                    prefer_div_over_re = cls === NUM || cls === NAM;
                }

                text = text.slice(tok.length);
                tokens.push([cls, tok]);
                break;
            }
        }

        return tokens;
    };

    var with_doc = function (fail, fn) {
        if (typeof document !== 'undefined') {
            fn(document); // eslint-disable-line no-undef
        } else if (fail) {
            throw new Error('no doc');
        }
    };

    var highlight_el = function (el) {
        with_doc(true, function (doc) {
            var tokens = tokenize(el.textContent);
            el.innerHTML = '';
            tokens.forEach(function (token) {
                var tok_el = doc.createElement('span');
                tok_el.className = CLS_PREFIX + token[0];
                tok_el.textContent = token[1];
                el.appendChild(tok_el);
            });
        });
    };

    var lolight = function (sel) {
        with_doc(true, function (doc) {
            [].forEach.call(doc.querySelectorAll(sel || SELECTOR), function (el) {
                highlight_el(el);
            });
        });
    };

    with_doc(false, function (doc) {
        // do it with style
        var head = doc.querySelector('head');
        var style = doc.createElement('style');
        style.textContent = STYLE;
        head.insertBefore(style, head.firstChild);

        // auto highlight
        if ((/^(i|c|loade)/).test(doc.readyState)) {
            lolight();
        } else {
            doc.addEventListener('DOMContentLoaded', function () {
                lolight();
            });
        }
    });

    lolight.tok = tokenize;
    lolight.el = highlight_el;
    return lolight;
}));
