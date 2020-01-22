/**
 * Some functions from phpjs.org
 * 
 * php.js is licensed under the MIT licenses.
 */
(function(global, $){
    
    var codiad = global.codiad;
	
    codiad.Complete.extensions.phpjs = {
        
        init: function() {},
        
        htmlentities: function(string, quote_style, charset, double_encode) {
            //  discuss at: http://phpjs.org/functions/htmlentities/
            // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            //  revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            //  revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // improved by: nobbler
            // improved by: Jack
            // improved by: Rafał Kukawski (http://blog.kukawski.pl)
            // improved by: Dj (http://phpjs.org/functions/htmlentities:425#comment_134018)
            // bugfixed by: Onno Marsman
            // bugfixed by: Brett Zamir (http://brett-zamir.me)
            //    input by: Ratheous
            //  depends on: get_html_translation_table
            //   example 1: htmlentities('Kevin & van Zonneveld');
            //   returns 1: 'Kevin &amp; van Zonneveld'
            //   example 2: htmlentities("foo'bar","ENT_QUOTES");
            //   returns 2: 'foo&#039;bar'
            
            var hash_map = this.get_html_translation_table('HTML_ENTITIES', quote_style),
                symbol = '';
            string = string === null ? '' : string + '';
            
            if (!hash_map) {
                return false;
            }
            
            if (quote_style && quote_style === 'ENT_QUOTES') {
                hash_map["'"] = '&#039;';
            }
            
            if ( !! double_encode || double_encode === null) {
                for (symbol in hash_map) {
                    if (hash_map.hasOwnProperty(symbol)) {
                        string = string.split(symbol)
                          .join(hash_map[symbol]);
                    }
                }
            } else {
                string = string.replace(/([\s\S]*?)(&(?:#\d+|#x[\da-f]+|[a-zA-Z][\da-z]*);|$)/g, function (ignore, text, entity) {
                    for (symbol in hash_map) {
                        if (hash_map.hasOwnProperty(symbol)) {
                            text = text.split(symbol)
                                .join(hash_map[symbol]);
                        }
                    }
                    return text + entity;
                });
            }
            
            return string;
        },
        
        htmlspecialchars_decode: function(string, quote_style) {
            //       discuss at: http://phpjs.org/functions/htmlspecialchars_decode/
            //      original by: Mirek Slugen
            //      improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            //      bugfixed by: Mateusz "loonquawl" Zalega
            //      bugfixed by: Onno Marsman
            //      bugfixed by: Brett Zamir (http://brett-zamir.me)
            //      bugfixed by: Brett Zamir (http://brett-zamir.me)
            //         input by: ReverseSyntax
            //         input by: Slawomir Kaniecki
            //         input by: Scott Cariss
            //         input by: Francois
            //         input by: Ratheous
            //         input by: Mailfaker (http://www.weedem.fr/)
            //       revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // reimplemented by: Brett Zamir (http://brett-zamir.me)
            //        example 1: htmlspecialchars_decode("<p>this -&gt; &quot;</p>", 'ENT_NOQUOTES');
            //        returns 1: '<p>this -> &quot;</p>'
            //        example 2: htmlspecialchars_decode("&amp;quot;");
            //        returns 2: '&quot;'
            
            var optTemp = 0,
                i = 0,
                noquotes = false;
            if (typeof quote_style === 'undefined') {
                quote_style = 2;
            }
            string = string.toString()
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>');
            var OPTS = {
                'ENT_NOQUOTES': 0,
                'ENT_HTML_QUOTE_SINGLE': 1,
                'ENT_HTML_QUOTE_DOUBLE': 2,
                'ENT_COMPAT': 2,
                'ENT_QUOTES': 3,
                'ENT_IGNORE': 4
            };
            if (quote_style === 0) {
                noquotes = true;
            }
            if (typeof quote_style !== 'number') {
                // Allow for a single string or an array of string flags
                quote_style = [].concat(quote_style);
                for (i = 0; i < quote_style.length; i++) {
                    // Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
                    if (OPTS[quote_style[i]] === 0) {
                        noquotes = true;
                    } else if (OPTS[quote_style[i]]) {
                        optTemp = optTemp | OPTS[quote_style[i]];
                    }
                }
                quote_style = optTemp;
            }
            if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
                string = string.replace(/&#0*39;/g, "'"); // PHP doesn't currently escape if more than one 0, but it should
                // string = string.replace(/&apos;|&#x0*27;/g, "'"); // This would also be useful here, but not a part of PHP
            }
            if (!noquotes) {
                string = string.replace(/&quot;/g, '"');
            }
            // Put this in last place to avoid escape being double-decoded
            string = string.replace(/&amp;/g, '&');
            
            return string;
        },
        
        get_html_translation_table: function(table, quote_style) {
            //  discuss at: http://phpjs.org/functions/get_html_translation_table/
            // original by: Philip Peterson
            //  revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // bugfixed by: noname
            // bugfixed by: Alex
            // bugfixed by: Marco
            // bugfixed by: madipta
            // bugfixed by: Brett Zamir (http://brett-zamir.me)
            // bugfixed by: T.Wild
            // improved by: KELAN
            // improved by: Brett Zamir (http://brett-zamir.me)
            //    input by: Frank Forte
            //    input by: Ratheous
            //        note: It has been decided that we're not going to add global
            //        note: dependencies to php.js, meaning the constants are not
            //        note: real constants, but strings instead. Integers are also supported if someone
            //        note: chooses to create the constants themselves.
            //   example 1: get_html_translation_table('HTML_SPECIALCHARS');
            //   returns 1: {'"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;'}
            
            var entities = {},
                hash_map = {},
                decimal;
            var constMappingTable = {},
                constMappingQuoteStyle = {};
            var useTable = {},
                useQuoteStyle = {};
            
            // Translate arguments
            constMappingTable[0] = 'HTML_SPECIALCHARS';
            constMappingTable[1] = 'HTML_ENTITIES';
            constMappingQuoteStyle[0] = 'ENT_NOQUOTES';
            constMappingQuoteStyle[2] = 'ENT_COMPAT';
            constMappingQuoteStyle[3] = 'ENT_QUOTES';
            
            useTable = !isNaN(table) ? constMappingTable[table] : table ? table.toUpperCase() : 'HTML_SPECIALCHARS';
            useQuoteStyle = !isNaN(quote_style) ? constMappingQuoteStyle[quote_style] : quote_style ? quote_style.toUpperCase() :
            'ENT_COMPAT';
            
            if (useTable !== 'HTML_SPECIALCHARS' && useTable !== 'HTML_ENTITIES') {
                throw new Error('Table: ' + useTable + ' not supported');
                // return false;
            }
            
            entities['38'] = '&amp;';
            if (useTable === 'HTML_ENTITIES') {
                entities['160'] = '&nbsp;';
                entities['161'] = '&iexcl;';
                entities['162'] = '&cent;';
                entities['163'] = '&pound;';
                entities['164'] = '&curren;';
                entities['165'] = '&yen;';
                entities['166'] = '&brvbar;';
                entities['167'] = '&sect;';
                entities['168'] = '&uml;';
                entities['169'] = '&copy;';
                entities['170'] = '&ordf;';
                entities['171'] = '&laquo;';
                entities['172'] = '&not;';
                entities['173'] = '&shy;';
                entities['174'] = '&reg;';
                entities['175'] = '&macr;';
                entities['176'] = '&deg;';
                entities['177'] = '&plusmn;';
                entities['178'] = '&sup2;';
                entities['179'] = '&sup3;';
                entities['180'] = '&acute;';
                entities['181'] = '&micro;';
                entities['182'] = '&para;';
                entities['183'] = '&middot;';
                entities['184'] = '&cedil;';
                entities['185'] = '&sup1;';
                entities['186'] = '&ordm;';
                entities['187'] = '&raquo;';
                entities['188'] = '&frac14;';
                entities['189'] = '&frac12;';
                entities['190'] = '&frac34;';
                entities['191'] = '&iquest;';
                entities['192'] = '&Agrave;';
                entities['193'] = '&Aacute;';
                entities['194'] = '&Acirc;';
                entities['195'] = '&Atilde;';
                entities['196'] = '&Auml;';
                entities['197'] = '&Aring;';
                entities['198'] = '&AElig;';
                entities['199'] = '&Ccedil;';
                entities['200'] = '&Egrave;';
                entities['201'] = '&Eacute;';
                entities['202'] = '&Ecirc;';
                entities['203'] = '&Euml;';
                entities['204'] = '&Igrave;';
                entities['205'] = '&Iacute;';
                entities['206'] = '&Icirc;';
                entities['207'] = '&Iuml;';
                entities['208'] = '&ETH;';
                entities['209'] = '&Ntilde;';
                entities['210'] = '&Ograve;';
                entities['211'] = '&Oacute;';
                entities['212'] = '&Ocirc;';
                entities['213'] = '&Otilde;';
                entities['214'] = '&Ouml;';
                entities['215'] = '&times;';
                entities['216'] = '&Oslash;';
                entities['217'] = '&Ugrave;';
                entities['218'] = '&Uacute;';
                entities['219'] = '&Ucirc;';
                entities['220'] = '&Uuml;';
                entities['221'] = '&Yacute;';
                entities['222'] = '&THORN;';
                entities['223'] = '&szlig;';
                entities['224'] = '&agrave;';
                entities['225'] = '&aacute;';
                entities['226'] = '&acirc;';
                entities['227'] = '&atilde;';
                entities['228'] = '&auml;';
                entities['229'] = '&aring;';
                entities['230'] = '&aelig;';
                entities['231'] = '&ccedil;';
                entities['232'] = '&egrave;';
                entities['233'] = '&eacute;';
                entities['234'] = '&ecirc;';
                entities['235'] = '&euml;';
                entities['236'] = '&igrave;';
                entities['237'] = '&iacute;';
                entities['238'] = '&icirc;';
                entities['239'] = '&iuml;';
                entities['240'] = '&eth;';
                entities['241'] = '&ntilde;';
                entities['242'] = '&ograve;';
                entities['243'] = '&oacute;';
                entities['244'] = '&ocirc;';
                entities['245'] = '&otilde;';
                entities['246'] = '&ouml;';
                entities['247'] = '&divide;';
                entities['248'] = '&oslash;';
                entities['249'] = '&ugrave;';
                entities['250'] = '&uacute;';
                entities['251'] = '&ucirc;';
                entities['252'] = '&uuml;';
                entities['253'] = '&yacute;';
                entities['254'] = '&thorn;';
                entities['255'] = '&yuml;';
            }
            
            if (useQuoteStyle !== 'ENT_NOQUOTES') {
                entities['34'] = '&quot;';
            }
            if (useQuoteStyle === 'ENT_QUOTES') {
                entities['39'] = '&#39;';
            }
            entities['60'] = '&lt;';
            entities['62'] = '&gt;';
            
            // ascii decimals to real symbols
            for (decimal in entities) {
                if (entities.hasOwnProperty(decimal)) {
                    hash_map[String.fromCharCode(decimal)] = entities[decimal];
                }
            }
            
            return hash_map;
        }
    };
    
    $(function() {
        codiad.Complete.extensions.phpjs.init();
    });
})(this, jQuery);