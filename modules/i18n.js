		var i18n = (function(lang) {
			return function(word, args) {
				var x;
				var returnw = (word in lang) ? lang[word] : word;
				for (x in args) {
					returnw = returnw.replace("%{" + x + "}%", args[x]);
				}
				return returnw;
			};
		})([]);