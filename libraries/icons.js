//////////////////////////////////////////////////////////////////////////////80
// File Icons
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2014-2016 Daniel Brooker
// Copyright (c) 2016-2021 John Gardner
// Distributed as-is and without warranty under the MIT License.
// See [root]/docs/LICENSE.md for more. This information must remain intact.
// Source: https://github.com/file-icons/atom
//////////////////////////////////////////////////////////////////////////////80

(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], function() {
			return factory(root);
		});
	} else if (typeof exports === 'object') {
		module.exports = factory(root);
	} else {
		root.icons = factory(root);
	}
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this, function(window) {

	var root = this || global;
	var cache = {
		directoryName: {},
		directoryPath: {},
		fileName: {},
		filePath: {},
		interpreter: {},
		scope: {},
		language: {},
		signature: {}
	};

	/* ---------------------------------------------------------------------------
		* Icon
		* ------------------------------------------------------------------------- */

	/**
		* Create Icon instance
		*
		* @param {Number}  index - Index of the icon's appearance in the enclosing array
		* @param {Array}   data - icon's data points that contains the following,
		*
		* @property {Icon} icon - Icon's CSS class (e.g., 'js-icon')
		* @property {Array} colour - Icon's colour classes
		* @property {RegExp} match - Pattern for matching names or pathnames
		* @property {Numeric} [priority=1] -  priority that determined icon's order of appearance
		* @property {Boolean} [matchPath=false] - Match against system path instead of basename
		* @property {RegExp} [interpreter=null] -  to match executable names in hashbangs
		* @property {RegExp} [scope=null] -  to match grammar scope-names
		* @property {RegExp} [lang=null] -  to match alias patterns
		* @property {RegExp} [sig=null] -  to match file signatures
		*
		* @constructor
		*/

	var Icon = function(index, data) {
		this.index = index;
		this.icon = data[0];
		this.colour = data[1];
		this.match = data[2];
		this.priority = data[3] || 1;
		this.matchPath = data[4] || false;
		this.interpreter = data[5] || null;
		this.scope = data[6] || null;
		this.lang = data[7] || null;
		this.signature = data[8] || null;
	};

	/**
		* Return the CSS classes for displaying the icon.
		*
		* @param {Number|null} colourMode
		* @param {Boolean} asArray
		* @return {String}
		*/

	Icon.prototype.getClass = function(colourMode, asArray) {

		colourMode = colourMode !== undefined ? colourMode : null;
		asArray = asArray !== undefined ? asArray : false;

		// No colour needed or available
		if (colourMode === null || this.colour[0] === null) {
			return asArray ? [this.icon] : this.icon;
		}

		return asArray ? [this.icon, this.colour[colourMode]] : this.icon + ' ' + this.colour[colourMode];
	};

	/* ---------------------------------------------------------------------------
		* IconTables
		* ------------------------------------------------------------------------- */

	/**
		* Create IconTables instance
		*
		* @param {Array}   data - Icons database
		*
		* @property {Array} directoryIcons - Icons to match directory-type resources.
		* @property {Array} fileIcons      - Icons to match file resources.
		* @property {Icon}  binaryIcon     - Icon for binary files.
		* @property {Icon}  executableIcon - Icon for executables.
		* @class
		* @constructor
		*/

	var IconTables = function(data) {
		this.directoryIcons = this.read(data[0]);
		this.fileIcons = this.read(data[1]);
		this.binaryIcon = this.matchScope('source.asm');
		this.executableIcon = this.matchInterpreter('bash');
	};

	/**
		* Populate icon-lists from a icons data table.
		*
		* @param {Array} table
		* @return {Object}
		* @private
		*/

	IconTables.prototype.read = function(table) {

		var icons = table[0];
		var indexes = table[1];

		icons = icons.map(function(icon, index) {
			return new Icon(index, icon);
		});

		// Dereference Icon instances from their stored offset
		indexes = indexes.map(function(index) {
			return index.map(function(offset) {
				return icons[offset];
			});
		});

		return {
			byName: icons,
			byInterpreter: indexes[0],
			byLanguage: indexes[1],
			byPath: indexes[2],
			byScope: indexes[3],
			bySignature: indexes[4]
		};
	};

	/**
		* Match an icon using a resource's basename.
		*
		* @param {String} name - Name of filesystem entity
		* @param {Boolean} [directory=false] - Match folders instead of files
		* @return {Icon}
		*/
	IconTables.prototype.matchName = function(name, directory) {

		directory = directory !== undefined ? directory : false;
		var cachedIcons = directory ? this.cache.directoryName : cache.fileName;
		var icons = directory ? this.directoryIcons.byName : this.fileIcons.byName;

		if (cachedIcons[name]) {
			return cachedIcons[name];
		}

		for (var i in icons) {
			var icon = icons[i];
			if (icon.match.test(name)) {
				cachedIcons[name] = icon;
				return cachedIcons[name];
			}
		}
		return null;
	};

	/**
		* Match an icon using a resource's system path.
		*
		* @param {String} path - Full pathname to check
		* @param {Boolean} [directory=false] - Match folders instead of files
		* @return {Icon}
		*/
	IconTables.prototype.matchPath = function(path, directory) {

		directory = directory !== undefined ? directory : false;
		var cachedIcons = directory ? cache.directoryName : cache.fileName;
		var icons = directory ? this.directoryIcons.byPath : this.fileIcons.byPath;

		if (cachedIcons[name]) {
			return cachedIcons[name];
		}

		for (var i in icons) {
			var icon = icons[i];
			if (icon.match.test(path)) {
				cachedIcons[path] = icon;
				return cachedIcons[path];
			}
		}
		return null;
	};

	/**
		* Match an icon using the human-readable form of its related language.
		*
		* Typically used for matching modelines and Linguist-language attributes.
		*
		* @example IconTables.matchLanguage('JavaScript')
		* @param {String} name - Name/alias of language
		* @return {Icon}
		*/
	IconTables.prototype.matchLanguage = function(name) {

		if (cache.language[name]) {
			return cache.language[name];
		}

		for (var i in this.fileIcons.byLanguage) {
			var icon = this.fileIcons.byLanguage[i];
			if (icon.lang.test(name)) {
				cache.language[name] = icon;
				return cache.language[name];
			}
		}
		return null;
	};

	/**
		* Match an icon using the grammar-scope assigned to it.
		*
		* @example IconTables.matchScope('source.js')
		* @param {String} name
		* @return {Icon}
		*/
	IconTables.prototype.matchScope = function(name) {

		if (cache.scope[name]) {
			return cache.scope[name];
		}

		for (var i in this.fileIcons.byScope) {
			var icon = this.fileIcons.byScope[i];
			if (icon.scope.test(name)) {
				cache.scope[name] = icon;
				return cache.scope[name];
			}
		}
		return null;
	};

	/**
		* Match an icon using the name of an interpreter which executes its language.
		*
		* Used for matching interpreter directives (a.k.a., 'hashbangs').
		*
		* @example IconTables.matchInterpreter('bash')
		* @param {String} name
		* @return {Icon}
		*/
	IconTables.prototype.matchInterpreter = function(name) {

		if (cache.interpreter[name]) {
			return cache.interpreter[name];
		}

		for (var i in this.fileIcons.byInterpreter) {
			var icon = this.fileIcons.byInterpreter[i];
			if (icon.interpreter.test(name)) {
				cache.interpreter[name] = icon;
				return cache.interpreter[name];
			}
		}
		return null;
	};

	/**
		* Match an icon using a resource's file signature.
		*
		* @example IconTables.matchSignature('\x1F\x8B')
		* @param {String} data
		* @return {Icon}
		*/
	IconTables.prototype.matchSignature = function(data) {};

	/* ---------------------------------------------------------------------------
		* Icons Database
		* ------------------------------------------------------------------------- */

	var icondb = [
		[
			[
				['arttext-icon', ['purple', 'purple'], /\.artx$/i],
				['atom-icon', ['green', 'green'], /^\.atom$/],
				['bower-icon', ['yellow', 'orange'], /^bower[-_]components$/],
				['dropbox-icon', ['blue', 'blue'], /^(?:Dropbox|\.dropbox\.cache)$/],
				['emacs-icon', ['purple', 'purple'], /^\.emacs\.d$/],
				['dylib-icon', [null, null], /\.framework$/i],
				['git-icon', ['red', 'red'], /\.git$/],
				['github-icon', [null, null], /^\.github$/],
				['meteor-icon', ['orange', 'orange'], /^\.meteor$/],
				['node-icon', ['green', 'green'], /^node_modules$/],
				['package-icon', [null, null], /^\.bundle$/i],
				['svn-icon', [null, null], /^\.svn$/i],
				['textmate-icon', [null, null], /\.tmBundle$/i],
				['vagrant-icon', ['cyan', 'cyan'], /\.vagrant$/i],
				['appstore-icon', [null, null], /\.xcodeproj$/i]
			],
			[
				[],
				[],
				[],
				[],
				[]
			]
		],
		[
			[
				['binary-icon', ['green', 'green'], /\.swp$/i, 4],
				['link-icon', ['blue', 'blue'], /\.lnk$/i, 3],
				['angular-icon', ['red', 'red'], /^angular[^.]*\.js$/i, 2],
				['ant-icon', ['pink', 'pink'], /^ant\.xml$|\.ant$/i, 2],
				['apache-icon', ['red', 'red'], /^(?:apache2?|httpd).conf$/i, 2],
				['apache-icon', ['green', 'green'], /\.vhost$/i, 2],
				['apache-icon', ['green', 'green'], /\.thrift$/i, 2],
				['appcelerator-icon', ['red', 'red'], /^appcelerator\.js$/i, 2],
				['appveyor-icon', ['blue', 'blue'], /^appveyor\.yml$/i, 2],
				['archlinux-icon', ['purple', 'purple'], /^\.install$/, 2],
				['archlinux-icon', ['maroon', 'maroon'], /^\.SRCINFO$/, 2],
				['archlinux-icon', ['yellow', 'yellow'], /^pacman\.conf$/, 2],
				['archlinux-icon', ['yellow', 'yellow'], /^pamac\.conf$/, 2],
				['archlinux-icon', ['cyan', 'cyan'], /^PKGBUILD$/, 2],
				['archlinux-icon', ['yellow', 'yellow'], /yaourtrc$/i, 2],
				['backbone-icon', ['blue', 'blue'], /^backbone(?:[-.]min|dev)?\.js$/i, 2],
				['boot-icon', ['green', 'green'], /^Makefile\.boot$/i, 2],
				['bootstrap-icon', ['yellow', 'yellow'], /^(?:custom\.)?bootstrap\S*\.js$/i, 2],
				['bootstrap-icon', ['blue', 'blue'], /^(?:custom\.)?bootstrap\S*\.css$/i, 2],
				['bootstrap-icon', ['blue', 'blue'], /^(?:custom\.)?bootstrap\S*\.less$/i, 2],
				['bootstrap-icon', ['pink', 'pink'], /^(?:custom\.)?bootstrap\S*\.scss$/i, 2],
				['bootstrap-icon', ['green', 'green'], /^(?:custom\.)?bootstrap\S*\.styl$/i, 2],
				['bower-icon', ['yellow', 'orange'], /^(?:\.bowerrc|bower\.json|Bowerfile)$/i, 2],
				['brakeman-icon', ['red', 'red'], /brakeman\.yml$/i, 2],
				['brakeman-icon', ['red', 'red'], /^brakeman\.ignore$/i, 2],
				['broccoli-icon', ['green', 'green'], /^Brocfile\./i, 2],
				['package-icon', ['orange', 'orange'], /Cargo\.toml$/i, 2],
				['package-icon', ['orange', 'orange'], /Cargo\.lock$/i, 2],
				['chai-icon', ['red', 'red'], /^chai\.(?:[jt]sx?|es6?|coffee)$/i, 2],
				['chartjs-icon', ['pink', 'pink'], /^Chart\.js$/i, 2],
				['circleci-icon', ['green', 'green'], /^circle\.yml$/i, 2],
				['cc-icon', ['green', 'green'], /\.codeclimate\.yml$/i, 2],
				['codecov-icon', ['pink', 'pink'], /^codecov\.ya?ml$/i, 2],
				['coffee-icon', ['cyan', 'cyan'], /\.coffee\.ecr$/i, 2],
				['coffee-icon', ['red', 'red'], /\.coffee\.erb$/i, 2],
				['compass-icon', ['red', 'red'], /^_?(?:compass|lemonade)\.scss$/i, 2],
				['composer-icon', ['yellow', 'yellow'], /^composer\.(?:json|lock)$/i, 2],
				['composer-icon', ['blue', 'blue'], /^composer\.phar$/i, 2],
				['cordova-icon', ['blue', 'blue'], /^cordova(?:[^.]*\.|-(?:\d\.)+)js$/i, 2],
				['d3-icon', ['orange', 'orange'], /^d3(?:\.v\d+)?[^.]*\.js$/i, 2],
				['database-icon', ['red', 'red'], /^METADATA\.pb$/, 2],
				['database-icon', ['red', 'red'], /\.git[\/\\](?:.*[\/\\])?(?:HEAD|ORIG_HEAD|packed-refs|logs[\/\\](?:.+[\/\\])?[^\/\\]+)$/, 2, true],
				['docker-icon', ['blue', 'blue'], /^(?:Dockerfile|docker-compose)|\.docker(?:file|ignore)$/i, 2, false, , /\.dockerfile$/i, /^Docker$/i],
				['docker-icon', ['orange', 'orange'], /^docker-sync\.yml$/i, 2],
				['dojo-icon', ['red', 'red'], /^dojo\.js$/i, 2],
				['ember-icon', ['red', 'red'], /^ember(?:\.|(?:-[^.]+)?-(?:\d+\.)+(?:debug\.)?)js$/i, 2],
				['eslint-icon', ['purple', 'purple'], /\.eslint(?:cache|ignore)$/i, 2],
				['eslint-icon', ['purple', 'purple'], /\.eslintrc(?:\.(?:js|json|ya?ml))?$/i, 2],
				['extjs-icon', ['green', 'green'], /\bExtjs(?:-ext)?\.js$/i, 2],
				['fabfile-icon', ['blue', 'blue'], /^fabfile\.py$/i, 2],
				['fuelux-icon', ['orange', 'orange'], /^fuelux(?:\.min)?\.(?:css|js)$/i, 2],
				['gear-icon', ['blue', 'blue'], /\.indent\.pro$/i, 2],
				['grunt-icon', ['yellow', 'yellow'], /gruntfile\.js$/i, 2],
				['grunt-icon', ['maroon', 'maroon'], /gruntfile\.coffee$/i, 2],
				['gulp-icon', ['red', 'red'], /gulpfile\.js$|gulpfile\.babel\.js$/i, 2],
				['gulp-icon', ['maroon', 'maroon'], /gulpfile\.coffee$/i, 2],
				['html5-icon', ['cyan', 'cyan'], /\.html?\.ecr$/i, 2],
				['html5-icon', ['red', 'red'], /\.(?:html?\.erb|rhtml)$/i, 2, false, , /\.html\.erb$/i, /^HTML$/i],
				['ionic-icon', ['blue', 'blue'], /^ionic\.project$/, 2],
				['js-icon', ['cyan', 'cyan'], /\.js\.ecr$/i, 2],
				['js-icon', ['red', 'red'], /\.js\.erb$/i, 2],
				['jquery-icon', ['blue', 'blue'], /^jquery(?:[-.](?:min|latest|\d\.\d+(?:\.\d+)?))*\.(?:[jt]sx?|es6?|coffee|map)$/i, 2],
				['jqueryui-icon', ['blue', 'blue'], /^jquery(?:[-_.](?:ui[-_.](?:custom|dialog-?\w*)|effects)(?:\.[^.]*)?|[-.]?ui(?:-\d\.\d+(?:\.\d+)?)?(?:\.\w+)?)(?:[-_.]?min|dev)?\.(?:[jt]sx?|es6?|coffee|map|s?css|less|styl)$/i, 2],
				['karma-icon', ['cyan', 'cyan'], /^karma\.conf\.js$/i, 2],
				['karma-icon', ['maroon', 'maroon'], /^karma\.conf\.coffee$/i, 2],
				['knockout-icon', ['red', 'red'], /^knockout[-.](?:\d+\.){3}(?:debug\.)?js$/i, 2],
				['leaflet-icon', ['green', 'green'], /^leaflet\.(?:draw-src|draw|spin|coordinates-(?:\d+\.)\d+\.\d+\.src)\.(?:js|css)$|^wicket-leaflet\.js$/i, 2],
				['lein-icon', [null, null], /project\.clj$/i, 2],
				['manpage-icon', ['green', 'green'], /^tmac\.|^(?:mmn|mmt)$/i, 2],
				['marko-icon', ['blue', 'blue'], /\.marko$/i, 2, false, /^marko$/, /\.marko$/i, /^mark[0o]$/i],
				['marko-icon', ['maroon', 'maroon'], /\.marko\.js$/i, 2],
				['materialize-icon', ['red', 'red'], /^materialize(?:\.min)?\.(?:js|css)$/i, 2],
				['mathjax-icon', ['green', 'green'], /^MathJax[^.]*\.js$/i, 2],
				['mocha-icon', ['maroon', 'maroon'], /^mocha\.(?:[jt]sx?|es6?|coffee)$/i, 2],
				['mocha-icon', ['red', 'red'], /^mocha\.(?:s?css|less|styl)$/i, 2],
				['mocha-icon', ['maroon', 'maroon'], /mocha\.opts$/i, 2],
				['modernizr-icon', ['red', 'red'], /^modernizr(?:[-\.]custom|-\d\.\d+)(?:\.\d+)?\.js$/i, 2],
				['mootools-icon', ['purple', 'purple'], /^mootools[^.]*\d+\.\d+(?:.\d+)?[^.]*\.js$/i, 2],
				['neko-icon', ['orange', 'orange'], /^run\.n$/, 2],
				['newrelic-icon', ['cyan', 'cyan'], /^newrelic\.yml/i, 2],
				['nginx-icon', ['green', 'green'], /^nginx\.conf$/i, 2],
				['shuriken-icon', ['cyan', 'cyan'], /\.ninja\.d$/i, 2],
				['nodemon-icon', ['green', 'green'], /^nodemon\.json$|^\.nodemonignore$/i, 2],
				['normalize-icon', ['red', 'red'], /^normalize\.(?:css|less|scss|styl)$/i, 2],
				['npm-icon', ['red', 'red'], /^(?:package\.json|\.npmignore|\.?npmrc|npm-debug\.log|npm-shrinkwrap\.json)$/i, 2],
				['postcss-icon', ['yellow', 'yellow'], /\bpostcss\.config\.js$/i, 2],
				['protractor-icon', ['red', 'red'], /^protractor\.conf\./i, 2],
				['pug-icon', ['orange', 'orange'], /^\.pug-lintrc/i, 2],
				['raphael-icon', ['orange', 'orange'], /^raphael(?:\.min|\.no-deps)*\.js$/i, 2],
				['react-icon', ['blue', 'blue'], /^react(?:-[^.]*)?\.js$/i, 2],
				['react-icon', ['blue', 'blue'], /\.react\.js$/i, 2],
				['book-icon', ['blue', 'blue'], /^README(?:\b|_)|^(?:licen[sc]es?|(?:read|readme|click|delete|keep|test)\.me)$|\.(?:readme|1st)$/i, 2],
				['book-icon', ['blue', 'blue'], /^(?:notice|bugs|changes|change[-_]?log(?:[-._]?\d+)?|contribute|contributing|contributors|copying|hacking|history|install|maintainers|manifest|more\.stuff|projects|revision|terms|thanks)$/i, 2],
				['requirejs-icon', ['blue', 'blue'], /^require(?:[-.]min|dev)?\.js$/i, 2],
				['clojure-icon', ['maroon', 'maroon'], /^riemann\.config$/i, 2],
				['rollup-icon', ['red', 'red'], /^rollup\.config\./i, 2],
				['ruby-icon', ['green', 'green'], /_spec\.rb$/i, 2],
				['scrutinizer-icon', ['blue', 'blue'], /\.scrutinizer\.yml$/i, 2],
				['sencha-icon', ['green', 'green'], /^sencha(?:\.min)?\.js$/i, 2],
				['snapsvg-icon', ['cyan', 'cyan'], /^snap\.svg(?:[-.]min)?\.js$/i, 2],
				['sourcemap-icon', ['blue', 'blue'], /\.css\.map$/i, 2],
				['sourcemap-icon', ['yellow', 'yellow'], /\.js\.map$/i, 2],
				['stylelint-icon', ['purple', 'purple'], /^\.stylelintrc(?:\.|$)/i, 2],
				['stylelint-icon', ['yellow', 'yellow'], /^stylelint\.config\.js$/i, 2],
				['stylelint-icon', ['blue', 'blue'], /\.stylelintignore$/i, 2],
				['toc-icon', ['cyan', 'cyan'], /\.toc$/i, 2, false, , /\.toc$/i, /^Table of Contents$/i],
				['calc-icon', ['maroon', 'maroon'], /\.8x[pk](?:\.txt)?$/i, 2, false, , , , /^\*\*TI[789]\d\*\*/],
				['travis-icon', ['red', 'red'], /^\.travis/i, 2],
				['typedoc-icon', ['purple', 'purple'], /^typedoc\.json$/i, 2],
				['typings-icon', ['maroon', 'maroon'], /^typings\.json$/i, 2],
				['uikit-icon', ['blue', 'blue'], /^uikit(?:\.min)?\.js$/i, 2],
				['webpack-icon', ['blue', 'blue'], /webpack\.config\.|^webpackfile\.js$/i, 2],
				['wercker-icon', ['purple', 'purple'], /^wercker\.ya?ml$/i, 2],
				['yarn-icon', ['blue', 'blue'], /^yarn\.lock$/i, 2],
				['yeoman-icon', ['cyan', 'cyan'], /\.yo-rc\.json$/i, 2],
				['yui-icon', ['blue', 'blue'], /^(?:yahoo-|yui)[^.]*\.js$/i, 2],
				['emacs-icon', ['red', 'red'], /\.gnus$/i, 1.5],
				['emacs-icon', ['green', 'green'], /\.viper$/i, 1.5],
				['emacs-icon', ['blue', 'blue'], /^Cask$/, 1.5],
				['emacs-icon', ['blue', 'blue'], /^Project\.ede$/i, 1.5],
				['_1c-icon', ['red', 'red'], /\.bsl$/i, , false, , /\.bsl$/i, /^1C$|^1[\W_ \t]?C[\W_ \t]?Enterprise$/i],
				['_1c-icon', ['orange', 'orange'], /\.sdbl$/i, , false, , /\.sdbl$/i, /^1C$|^1[\W_ \t]?C[\W_ \t]?Query$/i],
				['_1c-icon', ['red', 'red'], /\.os$/i],
				['_1c-alt-icon', ['red', 'red'], /\.mdo$/i],
				['abap-icon', ['orange', 'orange'], /\.abap$/i, , false, , /\.abp$/i, /^ABAP$/i],
				['as-icon', ['blue', 'blue'], /\.swf$/i],
				['as-icon', ['red', 'red'], /\.as$/i, , false, , /\.(?:flex-config|actionscript(?:\.\d+)?)$/i, /^ActionScript$|^(?:ActionScript\s*3|as3)$/i],
				['as-icon', ['yellow', 'yellow'], /\.jsfl$/i],
				['as-icon', ['red', 'red'], /\.swc$/i],
				['ada-icon', ['blue', 'blue'], /\.(?:ada|adb|ads)$/i, , false, , /\.ada$/i, /^Ada$|^(?:ada95|ada2005)$/i],
				['ae-icon', ['pink', 'pink'], /\.aep$/i],
				['ae-icon', ['purple', 'purple'], /\.aet$/i],
				['ai-icon', ['orange', 'orange'], /\.ai$/i],
				['ai-icon', ['orange', 'orange'], /\.ait$/i],
				['indesign-icon', ['pink', 'pink'], /\.indd$|\.idml$/i],
				['indesign-icon', ['purple', 'purple'], /\.indl$/i],
				['indesign-icon', ['purple', 'purple'], /\.indt$|\.inx$/i],
				['indesign-icon', ['blue', 'blue'], /\.indb$/i],
				['psd-icon', ['blue', 'blue'], /\.psd$/i, , false, , , , /^8BPS/],
				['psd-icon', ['purple', 'purple'], /\.psb$/i],
				['premiere-icon', ['purple', 'purple'], /\.prproj$/i],
				['premiere-icon', ['maroon', 'maroon'], /\.prel$/i],
				['premiere-icon', ['purple', 'purple'], /\.psq$/i],
				['alloy-icon', ['red', 'red'], /\.als$/i, , false, , /\.alloy$/i, /^Alloy$/i],
				['alpine-icon', ['blue', 'blue'], /(?:\.|^)APKBUILD$/],
				['ampl-icon', ['maroon', 'maroon'], /\.ampl$/i, , false, , /\.ampl$/i, /^AMPL$/i],
				['sun-icon', ['yellow', 'yellow'], /\.ansiweatherrc$/i],
				['antlr-icon', ['red', 'red'], /\.g$/i, , false, /^antlr$/, /\.antlr$/i, /^antlr$/i],
				['antlr-icon', ['orange', 'orange'], /\.g4$/i],
				['apache-icon', ['red', 'red'], /\.apacheconf$/i, , false, , /\.apache-config$/i, /^Apache$|^(?:aconf|ApacheConf)$/i],
				['apache-icon', ['purple', 'purple'], /apache2[\\\/]magic$/i, , true],
				['api-icon', ['blue', 'blue'], /\.apib$/i, , false, , /\.apib$/i, /^API Blueprint$/i],
				['apl-icon', ['cyan', 'cyan'], /\.apl$/i, , false, /^apl$/, /\.apl$/i, /^apl$/i],
				['apl-icon', ['maroon', 'maroon'], /\.apl\.history$/i],
				['apple-icon', ['purple', 'purple'], /\.(?:applescript|scpt)$/i, , false, /^osascript$/, /\.applescript$/i, /^Apple$|^[0o]sascript$/i],
				['arc-icon', ['blue', 'blue'], /\.arc$/i],
				['arduino-icon', ['cyan', 'cyan'], /\.ino$/i, , false, , /\.arduino$/i, /^Arduino$/i],
				['asciidoc-icon', ['blue', 'blue'], /\.(?:ad|adoc|asc|asciidoc)$/i, , false, , /\.asciidoc$/i, /^AsciiDoc$/i],
				['asp-icon', ['blue', 'blue'], /\.asp$/i, , false, , /\.asp$/i, /^[Aa][Ss][Pp][\W_ \t]?[Nn][Ee][Tt]$|^aspx(?:-vb)?$/],
				['asp-icon', ['maroon', 'maroon'], /\.asax$/i],
				['asp-icon', ['green', 'green'], /\.ascx$/i],
				['asp-icon', ['green', 'green'], /\.ashx$/i],
				['asp-icon', ['cyan', 'cyan'], /\.asmx$/i],
				['asp-icon', ['purple', 'purple'], /\.aspx$/i],
				['asp-icon', ['cyan', 'cyan'], /\.axd$/i],
				['eclipse-icon', ['maroon', 'maroon'], /\.aj$/i],
				['binary-icon', ['red', 'red'], /\.(?:l?a|[ls]?o|out|s|a51|n?asm|axf|elf|prx|puff|was[mt]|z80)$|\.rpy[bc]$/i, , false, , /(?:^|\.)(?:a[rs]m|x86|z80|lc-?3|cpu12|x86asm|m68k|assembly|avr(?:dis)?asm|dasm)(?:\.|$)/i, /^Assembly$|^n?asm$/i],
				['binary-icon', ['blue', 'blue'], /\.agc$|\.d-objdump$/i, , false, , /\.source\.agc$/i, /^Assembly$|^(?:Virtual\s*)?AGC$|^Apollo(?:[-_\s]*11)?\s*Guidance\s*Computer$/i],
				['binary-icon', ['green', 'green'], /\.ko$/i],
				['binary-icon', ['blue', 'blue'], /\.lst$/i, , false, /^lst-cpu12$/, /\.lst-cpu12$/i, /^Assembly$|^lst[\W_ \t]?cpu12$/i],
				['binary-icon', ['orange', 'orange'], /\.(?:(?:c(?:[+px]{2}?)?-?)?objdump|bsdiff|bin|dat|pak|pdb)$/i],
				['binary-icon', ['orange', 'orange'], /\.gcode|\.gco/i],
				['binary-icon', ['purple', 'purple'], /\.py[co]$/i],
				['binary-icon', [null, null], /\.DS_Store$/i],
				['ats-icon', ['red', 'red'], /\.dats$/i, , false, , /\.ats$/i, /^ATS$|^ats2$/i],
				['ats-icon', ['blue', 'blue'], /\.hats$/i],
				['ats-icon', ['yellow', 'yellow'], /\.sats$/i],
				['audacity-icon', ['yellow', 'yellow'], /\.aup$/i],
				['audio-icon', ['red', 'red'], /\.mp3$/i, , false, , , , /^\xFF\xFB|^ID3/],
				['audio-icon', ['yellow', 'yellow'], /\.wav$/i, , false, , , , /^RIFF(?!.+WEBP)/],
				['audio-icon', ['cyan', 'cyan'], /\.(?:aac|ac3|m4p)$/i, , false, , , , /^\x0Bw/],
				['audio-icon', ['purple', 'purple'], /\.aif[fc]?$/i, , false, , , , /^FORM.{4}AIFF/],
				['audio-icon', ['cyan', 'cyan'], /\.au$/i, , false, , , , /^\.snd|^dns\./],
				['audio-icon', ['red', 'red'], /\.flac$/i, , false, , , , /^fLaC/],
				['audio-icon', ['red', 'red'], /\.f4[ab]$/i, , false, , , , /^FLV\x01\x04/],
				['audio-icon', ['cyan', 'cyan'], /\.m4a$/i, , false, , , , /^.{4}ftypM4A/],
				['audio-icon', ['green', 'green'], /\.(?:mpc|mp\+)$/i, , false, , , , /^MPCK/],
				['audio-icon', ['orange', 'orange'], /\.oga$/i],
				['audio-icon', ['maroon', 'maroon'], /\.opus$/i, , false, , , , /OpusHead/],
				['audio-icon', ['blue', 'blue'], /\.r[am]$/i, , false, , , , /^\.RMF/],
				['audio-icon', ['blue', 'blue'], /\.wma$/i],
				['augeas-icon', ['orange', 'orange'], /\.aug$/i],
				['ahk-icon', ['blue', 'blue'], /\.ahk$/i, , false, /^ahk$/, /\.ahk$/i, /^AutoHotkey$|^ahk$/i],
				['ahk-icon', ['purple', 'purple'], /\.ahkl$/i],
				['autoit-icon', ['purple', 'purple'], /\.au3$/i, , false, , /(?:^|\.)autoit(?:\.|$)/i, /^AutoIt$|^(?:AutoIt3|AutoItScript|au3)$/i],
				['terminal-icon', ['blue', 'blue'], /\.awk$/i, , false, /^awk$/, /\.awk$/i, /^awk$/i],
				['terminal-icon', ['red', 'red'], /\.gawk$/i, , false, /^gawk$/, /\.gawk$/i, /^AWK$|^gawk$/i],
				['terminal-icon', ['maroon', 'maroon'], /\.mawk$/i, , false, /^mawk$/, /\.mawk$/i, /^AWK$|^mawk$/i],
				['terminal-icon', ['green', 'green'], /\.nawk$/i, , false, /^nawk$/, /\.nawk$/i, /^AWK$|^nawk$/i],
				['terminal-icon', ['cyan', 'cyan'], /\.auk$/i],
				['babel-icon', ['yellow', 'yellow'], /\.(?:babelrc|languagebabel|babel)$/i],
				['babel-icon', ['yellow', 'yellow'], /\.babelignore$/i],
				['bibtex-icon', ['red', 'red'], /\.cbx$/i],
				['bibtex-icon', ['orange', 'orange'], /\.bbx$/i],
				['bibtex-icon', ['yellow', 'yellow'], /\.bib$/i, , false, /^bibtex$/, /\.bibtex$/i, /^bibtex$/i],
				['bibtex-icon', ['green', 'green'], /\.bst$/i],
				['gnu-icon', ['red', 'red'], /\.bison$/i, , false, , /\.bison$/i, /^Bison$/i],
				['blender-icon', ['orange', 'orange'], /\.blend$/i],
				['blender-icon', ['orange', 'orange'], /\.blend\d+$/i],
				['blender-icon', ['blue', 'blue'], /\.bphys$/i],
				['bluespec-icon', ['blue', 'blue'], /\.bsv$/i, , false, , /\.bsv$/i, /^Bluespec$/i],
				['boo-icon', ['green', 'green'], /\.boo$/i, , false, , /\.boo(?:\.unity)?$/i, /^Boo$/i],
				['boot-icon', [null, null], /\.boot$/i],
				['brain-icon', ['pink', 'pink'], /\.bf?$/i, , false, , /\.(?:bf|brainfuck)$/i, /^Brainfuck$|^(?:bf|Brainf\**ck)$/i],
				['brew-icon', ['orange', 'orange'], /^Brewfile$/],
				['bro-icon', ['cyan', 'cyan'], /\.bro$/i, , false, , /\.bro$/i, /^Bro$/i],
				['byond-icon', ['blue', 'blue'], /\.dm$/i, , false, , /\.dm$/i, /^BYOND$|^(?:DM|Dream\s*Maker(?:\s*Script)?)$/i],
				['c-icon', ['blue', 'blue'], /\.c$/i, , false, /^tcc$/, /\.c$/i, /^C$/i],
				['c-icon', ['purple', 'purple'], /\.h$|\.cats$/i],
				['c-icon', ['green', 'green'], /\.idc$/i],
				['c-icon', ['maroon', 'maroon'], /\.w$/i],
				['c-icon', ['blue', 'blue'], /\.nc$/i],
				['c-icon', ['cyan', 'cyan'], /\.upc$/i],
				['csharp-icon', ['blue', 'blue'], /\.cs$/i, , false, , /\.cs$/i, /^C#$|^c\s*sharp$/i],
				['csscript-icon', ['green', 'green'], /\.csx$/i, , false, , /\.csx$/i, /^C#-Script$/i],
				['cpp-icon', ['blue', 'blue'], /\.c[+px]{2}$|\.cc$/i, , false, , /\.cpp$/i, /^C\+\+$|c[-_]?pp|cplusplus/i],
				['cpp-icon', ['purple', 'purple'], /\.h[+px]{2}$/i],
				['cpp-icon', ['orange', 'orange'], /\.[it]pp$/i],
				['cpp-icon', ['red', 'red'], /\.(?:tcc|inl)$/i],
				['cabal-icon', ['cyan', 'cyan'], /\.cabal$/i, , false, , /\.cabal$/i, /^Cabal$/i],
				['cake-icon', ['yellow', 'yellow'], /\.cake$/i, , false, , /\.cake$/i, /^Cake$/i],
				['cakefile-icon', ['red', 'red'], /^Cakefile$/],
				['cakephp-icon', ['red', 'red'], /\.ctp$/i],
				['ceylon-icon', ['orange', 'orange'], /\.ceylon$/i],
				['chapel-icon', ['green', 'green'], /\.chpl$/i, , false, , /\.chapel$/i, /^Chapel$|^chpl$/i],
				['chrome-icon', ['red', 'red'], /\.crx$/i, , false, , , , /^Cr24/],
				['chuck-icon', ['green', 'green'], /\.ck$/i, , false, , /\.chuck$/i, /^ChucK$/i],
				['cirru-icon', ['pink', 'pink'], /\.cirru$/i, , false, , /\.cirru$/i, /^Cirru$/i],
				['clarion-icon', ['orange', 'orange'], /\.clw$/i, , false, , /\.clarion$/i, /^Clarion$/i],
				['clean-icon', ['cyan', 'cyan'], /\.icl$/i, , false, /^clean$/, /\.clean$/i, /^clean$/i],
				['clean-icon', ['cyan', 'cyan'], /\.dcl$/i],
				['clean-icon', ['blue', 'blue'], /\.abc$/i],
				['click-icon', ['yellow', 'yellow'], /\.click$/i, , false, , /\.click$/i, /^Click$|^Click!$/i],
				['clips-icon', ['green', 'green'], /\.clp$/i, , false, , /\.clips$/i, /^CLIPS$/i],
				['clojure-icon', ['blue', 'blue'], /\.clj$/i, , false, /^clojure$/, /\.clojure$/i, /^cl[0o]jure$/i],
				['clojure-icon', ['purple', 'purple'], /\.cl2$/i],
				['clojure-icon', ['green', 'green'], /\.cljc$/i],
				['clojure-icon', ['red', 'red'], /\.cljx$|\.hic$/i],
				['cljs-icon', ['blue', 'blue'], /\.cljs(?:\.hl|cm)?$/i],
				['cmake-icon', ['green', 'green'], /\.cmake$/i, , false, /^cmake$/, /\.cmake$/i, /^cmake$/i],
				['cmake-icon', ['red', 'red'], /^CMakeLists\.txt$/],
				['coffee-icon', ['maroon', 'maroon'], /\.coffee$/i, , false, /^coffee$/, /\.coffee$/i, /^CoffeeScript$|^Coffee(?:-Script)?$/i],
				['coffee-icon', ['maroon', 'maroon'], /\.cjsx$/i],
				['coffee-icon', ['maroon', 'maroon'], /\.litcoffee$/i, , false, /^litcoffee$/, /\.litcoffee$/i, /^CoffeeScript$|^litc[0o]ffee$/i],
				['coffee-icon', ['blue', 'blue'], /\.iced$/i],
				['cf-icon', ['cyan', 'cyan'], /\.cfc$/i, , false, , /\.cfscript$/i, /^ColdFusion$|^(?:CFC|CFScript)$/i],
				['cf-icon', ['cyan', 'cyan'], /\.cfml?$/i, , false, , /\.cfml?$/i, /^ColdFusion$|^(?:cfml?|ColdFusion\s*HTML)$/i],
				['khronos-icon', ['orange', 'orange'], /\.dae$/i],
				['cl-icon', ['orange', 'orange'], /\.cl$/i, , false, /^(?:c?lisp|sbcl|[ec]cl)$/, /\.common-lisp$/i, /^Common Lisp$|^c?lisp$/i],
				['cp-icon', ['maroon', 'maroon'], /\.cp$/i],
				['cp-icon', ['red', 'red'], /\.cps$/i],
				['zip-icon', [null, null], /\.(?:zip|z|xz)$/i, , false, , , , /^(?:\x50\x4B(?:\x03\x04|\x05\x06|\x07|\x08)|\x1F[\x9D\xA0]|BZh|RNC[\x01\x02]|\xD0\xCF\x11\xE0)/],
				['zip-icon', ['blue', 'blue'], /\.rar$/i, , false, , , , /^Rar!\x1A\x07\x01?\0/],
				['zip-icon', ['blue', 'blue'], /\.t?gz$|\.tar$|\.whl$/i, , false, , , , /^\x1F\x8B/],
				['zip-icon', ['maroon', 'maroon'], /\.(?:lzo?|lzma|tlz|tar\.lzma)$/i, , false, , , , /^LZIP/],
				['zip-icon', ['maroon', 'maroon'], /\.7z$/i, , false, , , , /^7z\xBC\xAF\x27\x1C/],
				['zip-icon', ['red', 'red'], /\.apk$|\.gem$/i],
				['zip-icon', ['cyan', 'cyan'], /\.bz2$/i],
				['zip-icon', ['blue', 'blue'], /\.iso$/i, , false, , , , /^\x45\x52\x02\0{3}|^\x8B\x45\x52\x02/],
				['zip-icon', ['orange', 'orange'], /\.xpi$/i],
				['zip-icon', ['green', 'green'], /\.epub$/i],
				['zip-icon', ['pink', 'pink'], /\.jar$/i],
				['zip-icon', ['purple', 'purple'], /\.war$/i],
				['zip-icon', ['orange', 'orange'], /\.xar$/i, , false, , , , /^xar!/],
				['zip-icon', ['orange', 'orange'], /\.egg$/i],
				['config-icon', ['yellow', 'yellow'], /\.(?:ini|desktop|directory|cfg|conf|prefs)$/i, , false, , /\.ini$/i, /^d[0o]sini$/i],
				['config-icon', ['purple', 'purple'], /\.properties$/i, , false, , /\.java-properties$/i],
				['config-icon', ['green', 'green'], /\.toml$|\.opts$/i],
				['config-icon', ['red', 'red'], /\.ld$/i],
				['config-icon', ['red', 'red'], /\.lds$|\.reek$/i],
				['config-icon', ['blue', 'blue'], /\.terminal$/i],
				['config-icon', ['orange', 'orange'], /^ld\.script$/i],
				['config-icon', ['red', 'red'], /\.git[\/\\](?:config|info[\/\\]\w+)$/, , true],
				['config-icon', ['orange', 'orange'], /^\/(?:private\/)?etc\/(?:[^\/]+\/)*[^\/]*\.(?:cf|conf|ini)(?:\.default)?$/i, , true],
				['config-icon', ['maroon', 'maroon'], /^\/(?:private\/)?etc\/(?:aliases|auto_(?:home|master)|ftpusers|group|gettytab|hosts(?:\.equiv)?|manpaths|networks|paths|protocols|services|shells|sudoers|ttys)$/i, , true],
				['coq-icon', ['maroon', 'maroon'], /\.coq$/i, , false, , /\.coq$/i, /^Coq$/i],
				['creole-icon', ['blue', 'blue'], /\.creole$/i, , false, , /\.creole$/i, /^Creole$/i],
				['crystal-icon', ['cyan', 'cyan'], /\.e?cr$/i, , false, /^crystal$/, /\.crystal$/i, /^Crystal$/i],
				['csound-icon', ['maroon', 'maroon'], /\.orc$/i, , false, , /\.csound$/i, /^Csound$|^cs[0o]und[\W_ \t]?[0o]rc$/i],
				['csound-icon', ['orange', 'orange'], /\.udo$/i],
				['csound-icon', ['maroon', 'maroon'], /\.csd$/i, , false, , /\.csound-document$/i, /^Csound$|^cs[0o]und[\W_ \t]?csd$/i],
				['csound-icon', ['blue', 'blue'], /\.sco$/i, , false, , /\.csound-score$/i, /^Csound$|^cs[0o]und[\W_ \t]?sc[0o]$/i],
				['css3-icon', ['blue', 'blue'], /\.css$/i, , false, /^css$/, /\.css$/i, /^css$/i],
				['css3-icon', ['blue', 'blue'], /\.less$/i, , false, /^less$/, /\.less$/i, /^CSS$|^less$/i],
				['cucumber-icon', ['green', 'green'], /\.feature$/i, , false, , /(?:^|\.)(?:gherkin\.feature|cucumber\.steps)(?:\.|$)/i, /^Cucumber$|^gherkin$/i],
				['nvidia-icon', ['green', 'green'], /\.cu$/i, , false, , /\.cuda(?:-c\+\+)?$/i, /^CUDA$/i],
				['nvidia-icon', ['green', 'green'], /\.cuh$/i],
				['cython-icon', ['orange', 'orange'], /\.pyx$/i, , false, , /\.cython$/i, /^Cython$|^pyrex$/i],
				['cython-icon', ['blue', 'blue'], /\.pxd$/i],
				['cython-icon', ['blue', 'blue'], /\.pxi$/i],
				['dlang-icon', ['red', 'red'], /\.di?$/i, , false, , /\.d$/i, /^D$/i],
				['yang-icon', ['red', 'red'], /\.dnh$/i, , false, , /\.danmakufu$/i, /^Danmakufu$/i],
				['darcs-icon', ['green', 'green'], /\.d(?:arcs)?patch$/i],
				['dart-icon', ['cyan', 'cyan'], /\.dart$/i, , false, /^dart$/, /\.dart$/i, /^Dart$/i],
				['dashboard-icon', ['orange', 'orange'], /\.s[kl]im$/i, , false, /^slim$/, /\.slim$/i, /^slim$/i],
				['dashboard-icon', ['green', 'green'], /\.cpuprofile$/i],
				['database-icon', ['yellow', 'yellow'], /\.(?:h|geo|topo)?json$/i],
				['database-icon', ['red', 'red'], /\.ya?ml$/i],
				['database-icon', ['maroon', 'maroon'], /\.cson$|\.ston$|^mime\.types$/i],
				['database-icon', ['yellow', 'yellow'], /\.json5$/i, , false, /^json5$/, /\.json5$/i, /^js[0o]n5$/i],
				['database-icon', ['red', 'red'], /\.http$|\.pot?$/i],
				['database-icon', ['orange', 'orange'], /\.ndjson$|\.pytb$/i, , false, , /\.python\.traceback$/i],
				['database-icon', ['blue', 'blue'], /\.fea$/i, , false, , /\.opentype$/i, /^afdk[0o]$/i],
				['database-icon', ['purple', 'purple'], /\.json\.eex$|\.edn$/i],
				['database-icon', ['cyan', 'cyan'], /\.proto$/i, , false, , /\.protobuf$/i, /^(?:protobuf|Protocol\s*Buffers?)$/i],
				['database-icon', ['blue', 'blue'], /\.pydeps$|\.rviz$/i],
				['database-icon', ['purple', 'purple'], /\.eam\.fs$/i],
				['database-icon', ['pink', 'pink'], /\.qml$/i],
				['database-icon', ['pink', 'pink'], /\.qbs$/i],
				['database-icon', ['cyan', 'cyan'], /\.ttl$/i, , false, , /\.turtle$/i],
				['database-icon', ['blue', 'blue'], /\.syntax$/i],
				['database-icon', ['red', 'red'], /[\/\\](?:magic[\/\\]Magdir|file[\/\\]magic)[\/\\][-.\w]+$|lib[\\\/]icons[\\\/]\.icondb\.js$/i, , true],
				['dbase-icon', ['red', 'red'], /\.dbf$/i],
				['debian-icon', ['red', 'red'], /\.deb$/i],
				['debian-icon', ['cyan', 'cyan'], /^control$/],
				['debian-icon', ['cyan', 'cyan'], /^rules$/],
				['diff-icon', ['orange', 'orange'], /\.diff$/i, , false, , /\.diff$/i, /^Diff$|^udiff$/i],
				['earth-icon', ['blue', 'blue'], /\.zone$/i],
				['earth-icon', ['green', 'green'], /\.arpa$/i],
				['earth-icon', ['blue', 'blue'], /^CNAME$/],
				['doxygen-icon', ['blue', 'blue'], /^Doxyfile$/, , false, , /\.doxygen$/i, /^Doxyfile$/i],
				['dyalog-icon', ['orange', 'orange'], /\.dyalog$/i, , false, /^dyalog$/],
				['dylib-icon', ['cyan', 'cyan'], /\.(?:dylib|bundle)$/i],
				['e-icon', ['green', 'green'], /\.E$/, , false, /^rune$/],
				['eagle-icon', ['red', 'red'], /\.sch$/i],
				['eagle-icon', ['red', 'red'], /\.brd$/i],
				['ec-icon', ['blue', 'blue'], /\.ec$/i, , false, /^ec$/, /\.ec$/i, /^ec$/i],
				['ec-icon', ['purple', 'purple'], /\.eh$/i],
				['ecere-icon', ['blue', 'blue'], /\.epj$/i],
				['eclipse-icon', ['blue', 'blue'], /\.c?project$/],
				['eclipse-icon', ['red', 'red'], /\.classpath$/i],
				['editorconfig-icon', ['orange', 'orange'], /\.editorconfig$/i, , false, , /\.editorconfig$/i, /^EditorConfig$/i],
				['eiffel-icon', ['cyan', 'cyan'], /\.e$/, , false, , /\.eiffel$/i, /^Eiffel$/i],
				['elixir-icon', ['purple', 'purple'], /\.ex$/i, , false, /^elixir$/, /\.elixir$/i, /^elixir$/i],
				['elixir-icon', ['purple', 'purple'], /\.(?:exs|eex)$/i],
				['elixir-icon', ['purple', 'purple'], /mix\.exs?$/i],
				['elm-icon', ['blue', 'blue'], /\.elm$/i, , false, , /\.elm$/i, /^Elm$/i],
				['emacs-icon', ['purple', 'purple'], /(?:^|\.)(?:el|_?emacs|spacemacs|emacs\.desktop|abbrev[-_]defs)$/i, , false, /^emacs$/, /\.emacs\.lisp$/i, /^Emacs Lisp$|^elisp$/i],
				['emacs-icon', ['purple', 'purple'], /(?:^|\.)(?:elc|eld)$/i, , false, , , , /^;ELC\x17\0{3}/],
				['at-icon', ['red', 'red'], /^(?:authors|owners)$/i],
				['em-icon', ['red', 'red'], /\.emberscript$/i, , false, , /\.ember(?:script)?$/i, /^EmberScript$/i],
				['mustache-icon', ['blue', 'blue'], /\.em(?:blem)?$/i, , false, , /\.emblem$/i, /^Emblem$/i],
				['eq-icon', ['orange', 'orange'], /\.eq$/i, , false, , /\.eq$/i, /^EQ$/i],
				['erlang-icon', ['red', 'red'], /\.erl$/i, , false, /^escript$/, /\.erlang$/i, /^Erlang$/i],
				['erlang-icon', ['red', 'red'], /\.beam$/i],
				['erlang-icon', ['maroon', 'maroon'], /\.hrl$/i],
				['erlang-icon', ['green', 'green'], /\.xrl$/i],
				['erlang-icon', ['green', 'green'], /\.yrl$/i],
				['erlang-icon', ['maroon', 'maroon'], /\.app\.src$/i],
				['factor-icon', ['orange', 'orange'], /\.factor$/i, , false, , /\.factor$/i, /^Factor$/i],
				['factor-icon', ['orange', 'orange'], /\.factor-rc$/i],
				['factor-icon', ['red', 'red'], /\.factor-boot-rc$/i],
				['fancy-icon', ['blue', 'blue'], /\.fy$/i, , false, /^fancy$/, /\.fancy$/i, /^fancy$/i],
				['fancy-icon', ['blue', 'blue'], /\.fancypack$/i],
				['fancy-icon', ['green', 'green'], /^Fakefile$/],
				['fantom-icon', ['blue', 'blue'], /\.fan$/i, , false, , /\.fan(?:tom)?$/i, /^Fantom$/i],
				['fbx-icon', ['maroon', 'maroon'], /\.fbx$/i],
				['finder-icon', ['blue', 'blue'], /^Icon\r$/],
				['finder-icon', ['blue', 'blue'], /\.rsrc$/i],
				['flow-icon', ['orange', 'orange'], /\.(?:flowconfig|js\.flow)$/i],
				['flux-icon', ['blue', 'blue'], /\.fx$/i],
				['flux-icon', ['blue', 'blue'], /\.flux$/i],
				['font-icon', ['blue', 'blue'], /\.woff2$/i, , false, , , , /^wOF2/],
				['font-icon', ['blue', 'blue'], /\.woff$/i, , false, , , , /^wOFF/],
				['font-icon', ['green', 'green'], /\.eot$/i, , false, , , , /^.{34}LP/],
				['font-icon', ['green', 'green'], /\.ttc$/i, , false, , , , /^ttcf/],
				['font-icon', ['green', 'green'], /\.ttf$/i, , false, , , , /^\0\x01\0{3}/],
				['font-icon', ['yellow', 'yellow'], /\.otf$/i, , false, , , , /^OTTO.*\0/],
				['font-icon', ['red', 'red'], /\.pfb$/i],
				['font-icon', ['red', 'red'], /\.pfm$/i],
				['ff-icon', ['orange', 'orange'], /\.pe$/i, , false, /^fontforge$/, /\.source\.fontforge$/i, /^FontForge$|^pfaedit$/i],
				['ff-icon', ['blue', 'blue'], /\.sfd$/i, , false, , /\.text\.sfd$/i, /^FontForge$/i],
				['fortran-icon', ['maroon', 'maroon'], /\.f$/i, , false, , /\.fortran\.?(?:modern|punchcard)?$/i, /^Fortran$/i],
				['fortran-icon', ['green', 'green'], /\.f90$/i, , false, , /\.fortran\.free$/i, /^Fortran$/i],
				['fortran-icon', ['red', 'red'], /\.f03$/i],
				['fortran-icon', ['blue', 'blue'], /\.f08$/i],
				['fortran-icon', ['maroon', 'maroon'], /\.f77$/i, , false, , /\.fortran\.fixed$/i, /^Fortran$/i],
				['fortran-icon', ['pink', 'pink'], /\.f95$/i],
				['fortran-icon', ['cyan', 'cyan'], /\.for$/i],
				['fortran-icon', ['yellow', 'yellow'], /\.fpp$/i],
				['freemarker-icon', ['blue', 'blue'], /\.ftl$/i, , false, , /\.ftl$/i, /^FreeMarker$|^ftl$/i],
				['frege-icon', ['red', 'red'], /\.fr$/i],
				['fsharp-icon', ['blue', 'blue'], /\.fs[xi]?$/i, , false, , /\.fsharp$/i, /^FSharp$|^f#$/i],
				['gml-icon', ['green', 'green'], /\.gml$/i],
				['gams-icon', ['red', 'red'], /\.gms$/i, , false, , /\.gams(?:-lst)?$/i, /^GAMS$/i],
				['gap-icon', ['yellow', 'yellow'], /\.gap$/i, , false, /^gap$/, /\.gap$/i, /^gap$/i],
				['gap-icon', ['blue', 'blue'], /\.gi$/i],
				['gap-icon', ['orange', 'orange'], /\.tst$/i],
				['gdb-icon', ['green', 'green'], /\.gdb$/i, , false, /^gdb$/, /\.gdb$/i, /^gdb$/i],
				['gdb-icon', ['cyan', 'cyan'], /gdbinit$/i],
				['godot-icon', ['blue', 'blue'], /\.gd$/i, , false, , /\.gdscript$/i, /^GDScript$/i],
				['gear-icon', ['red', 'red'], /^\.htaccess$|\.yardopts$/i],
				['gear-icon', ['orange', 'orange'], /^\.htpasswd$/i],
				['gear-icon', ['green', 'green'], /^\.env\.|\.pairs$/i],
				['gear-icon', ['yellow', 'yellow'], /^\.lesshintrc$/i],
				['gear-icon', ['yellow', 'yellow'], /^\.csscomb\.json$|\.csslintrc$|\.jsbeautifyrc$|\.jshintrc$|\.jscsrc$/i],
				['gear-icon', ['maroon', 'maroon'], /\.coffeelintignore$|\.codoopts$/i],
				['gear-icon', ['blue', 'blue'], /\.module$/i],
				['gear-icon', ['blue', 'blue'], /\.arcconfig$|\.python-version$/i],
				['gear-icon', ['orange', 'orange'], /\.lintstagedrc$/i],
				['gears-icon', ['orange', 'orange'], /\.dll$/i, , false, , , , /^PMOCCMOC/],
				['code-icon', ['blue', 'blue'], /\.xml$|\.config$|\.4th$|\.cocci$|\.dyl$|\.dylan$|\.ecl$|\.forth$|\.launch$|\.manifest$|\.menu$|\.srdf$|\.st$|\.ui$|\.wsf$|\.x3d$|\.xaml$/i, , false, , , , /^<\?xml /],
				['code-icon', ['red', 'red'], /\.rdf$|\.capnp$|\.dotsettings$|\.flex$|\.fsh$|\.fsproj$|\.prw$|\.xproj$/i, , false, , /\.capnp$/i],
				['code-icon', ['blue', 'blue'], /^_service$/],
				['code-icon', ['red', 'red'], /^configure\.ac$|\.ML$/],
				['code-icon', ['green', 'green'], /^Settings\.StyleCop$/],
				['code-icon', ['green', 'green'], /\.abnf$|\.ditaval$|\.storyboard$|\.xmi$|\.yacc$/i, , false, /^abnf$/, /\.abnf$/i, /^abnf$/i],
				['code-icon', ['purple', 'purple'], /\.aepx$|\.dita$|\.grace$|\.lid$|\.nproj$/i],
				['code-icon', ['cyan', 'cyan'], /\.agda$|\.plist$|\.wisp$|\.xlf$|\.xslt$/i, , false, , /\.plist$/i],
				['code-icon', ['orange', 'orange'], /\.appxmanifest$|\.befunge$|\.fun$|\.muf$|\.xul$/i],
				['code-icon', ['cyan', 'cyan'], /\.ash$|\.asn1?$|\.lagda$|\.lex$|\.props$|\.resx$|\.smt2$|\.vsh$|\.xsl$|\.yy$/i, , false, /^xsl$/, /\.xsl$/i],
				['code-icon', ['blue', 'blue'], /\.axml$|\.bmx$|\.brs$|\.ccxml$|\.clixml$|\.fth$|\.intr$|\.mdpolicy$|\.mtml$|\.myt$|\.xsd$/i, , false, /^brightscript$/, /\.brightscript$/i],
				['code-icon', ['maroon', 'maroon'], /\.bnf$|\.cbl$|\.cob$|\.cobol$|\.fxml$/i, , false, /^bnf$/, /\.bnf$/i, /^bnf$/i],
				['code-icon', ['maroon', 'maroon'], /\.ccp$|\.cpy$|\.mxml$/i],
				['code-icon', ['red', 'red'], /\.ch$|\.cw$|\.ebnf$|\.iml$|\.jflex$|\.m4$|\.mask$|\.mumps$|\.prg$|\.pt$|\.rl$|\.sml$|\.targets$|\.webidl$|\.wsdl$|\.xacro$|\.xliff$/i, , false, /^ebnf$/, /\.ebnf$/i],
				['code-icon', ['pink', 'pink'], /\.ct$|\.zcml$/i],
				['code-icon', ['green', 'green'], /\.cy$|\.eclxml$|\.ivy$|\.sed$|\.tml$|\.y$/i],
				['code-icon', ['purple', 'purple'], /\.ditamap$|\.frt$|\.lp$|\.omgrofl$|\.osm$|\.wxs$|\.xib$/i],
				['code-icon', ['pink', 'pink'], /\.filters$|\.lol$|\.pig$/i],
				['code-icon', ['orange', 'orange'], /\.grxml$|\.urdf$/i],
				['code-icon', ['yellow', 'yellow'], /\.jelly$/i],
				['code-icon', ['yellow', 'yellow'], /\.jsproj$|\.ohm$|\.sgml?$/i, , false, /^ohm$/, /\.ohm$/i],
				['code-icon', ['blue', 'blue'], /\.mq[45h]$/i, , false, , /(?:^|\.)mq[45](?=\.|$)/i],
				['code-icon', ['green', 'green'], /\.odd$/i],
				['code-icon', ['blue', 'blue'], /\.psc1$|\.smt$/i, , false, /boolector|cvc4|mathsat5|opensmt|smtinterpol|smt-rat|stp|verit|yices2|z3/, /\.smt$/i],
				['code-icon', ['cyan', 'cyan'], /\.scxml$/i],
				['code-icon', ['maroon', 'maroon'], /\.sig$|\.wxl$/i],
				['code-icon', ['orange', 'orange'], /\.ux$|\.wxi$/i],
				['code-icon', ['purple', 'purple'], /\.vxml$/i],
				['genshi-icon', ['red', 'red'], /\.kid$/i, , false, , /\.genshi$/i, /^Genshi$|^xml\+(?:genshi|kid)$/i],
				['gentoo-icon', ['cyan', 'cyan'], /\.ebuild$/i, , false, , /\.ebuild$/i, /^Gentoo$/i],
				['gentoo-icon', ['blue', 'blue'], /\.eclass$/i],
				['git-icon', ['red', 'red'], /^\.git|^\.keep$|\.mailmap$/i, , false, , /\.git-(?:commit|config|rebase)$/i, /^Git$/i],
				['git-commit-icon', ['red', 'red'], /^COMMIT_EDITMSG$/],
				['git-merge-icon', ['red', 'red'], /^MERGE_(?:HEAD|MODE|MSG)$/],
				['glade-icon', ['green', 'green'], /\.glade$/i],
				['pointwise-icon', ['blue', 'blue'], /\.glf$/i],
				['glyphs-icon', ['green', 'green'], /\.glyphs$/i],
				['gn-icon', ['blue', 'blue'], /\.gn$/i, , false, /^gn$/, /\.gn$/i, /^gn$/i],
				['gn-icon', ['blue', 'blue'], /\.gni$/i],
				['gnu-icon', ['red', 'red'], /\.(?:gnu|gplv[23])$/i],
				['graph-icon', ['red', 'red'], /\.(?:gp|plo?t|gnuplot)$/i, , false, /^gnuplot$/, /\.gnuplot$/i, /^Gnuplot$/i],
				['go-icon', ['blue', 'blue'], /\.go$/i, , false, , /\.go(?:template)?$/i, /^Go$/i],
				['golo-icon', ['orange', 'orange'], /\.golo$/i, , false, , /\.golo$/i, /^Golo$/i],
				['gosu-icon', ['blue', 'blue'], /\.gs$/i, , false, , /\.gosu(?:\.\d+)?$/i, /^Gosu$/i],
				['gosu-icon', ['green', 'green'], /\.gst$/i],
				['gosu-icon', ['green', 'green'], /\.gsx$/i],
				['gosu-icon', ['blue', 'blue'], /\.vark$/i],
				['gradle-icon', ['blue', 'blue'], /\.gradle$/i, , false, , /\.gradle$/i, /^Gradle$/i],
				['gradle-icon', ['purple', 'purple'], /gradlew$/i],
				['gf-icon', ['red', 'red'], /\.gf$/i],
				['graphql-icon', ['pink', 'pink'], /\.graphql$/i, , false, , /\.graphql$/i, /^GraphQL$/i],
				['graphql-icon', ['purple', 'purple'], /\.gql$/i],
				['graphviz-icon', ['blue', 'blue'], /\.gv$/i, , false, , /\.dot$/i, /^Graphviz$/i],
				['graphviz-icon', ['cyan', 'cyan'], /\.dot$/i],
				['groovy-icon', ['blue', 'blue'], /\.(?:groovy|grt|gtpl|gsp|gvy)$/i, , false, /^groovy$/, /\.groovy$/i, /^Groovy$|^gsp$/i],
				['hack-icon', ['orange', 'orange'], /\.hh$/i, , false, , /\.hack$/i, /^Hack$/i],
				['haml-icon', ['yellow', 'yellow'], /\.haml$/i, , false, /^haml$/, /\.haml$/i, /^haml$/i],
				['haml-icon', ['maroon', 'maroon'], /\.hamlc$/i, , false, /^hamlc$/, /\.hamlc$/i, /^Haml$|^hamlc$/i],
				['harbour-icon', ['blue', 'blue'], /\.hb$/i, , false, , /\.harbour$/i, /^Harbour$/i],
				['hashicorp-icon', ['purple', 'purple'], /\.hcl$/i, , false, , /(?:^|\.)(?:hcl|hashicorp)(?:\.|$)/i, /^Hashicorp Configuration Language$/i],
				['haskell-icon', ['purple', 'purple'], /\.hs$/i, , false, /^runhaskell$/, /\.source\.haskell$/i, /^Haskell$/i],
				['haskell-icon', ['blue', 'blue'], /\.hsc$/i, , false, , /\.hsc2hs$/i, /^Haskell$/i],
				['haskell-icon', ['purple', 'purple'], /\.c2hs$/i, , false, , /\.c2hs$/i, /^Haskell$|^C2hs(?:\s*Haskell)?$/i],
				['haskell-icon', ['blue', 'blue'], /\.lhs$/i, , false, , /\.latex\.haskell$/i, /^Haskell$|^(?:lhaskell|lhs|Literate\s*Haskell)$/i],
				['haxe-icon', ['orange', 'orange'], /\.hx(?:[sm]l|)?$/, , false, , /(?:^|\.)haxe(?:\.\d+)?$/i, /^Haxe$/i],
				['heroku-icon', ['purple', 'purple'], /^Procfile$/],
				['heroku-icon', ['purple', 'purple'], /\.buildpacks$/i],
				['heroku-icon', ['purple', 'purple'], /^\.vendor_urls$/],
				['html5-icon', ['orange', 'orange'], /\.x?html?$/i, , false, , /\.html\.basic$/i, /^HTML$|^(?:xhtml|htm)$/i],
				['html5-icon', ['red', 'red'], /\.cshtml$|\.latte$/i, , false, /^latte$/, /\.latte$/i],
				['html5-icon', ['green', 'green'], /\.ejs$|\.kit$|\.swig$/i, , false, /^swig$/, /\.swig$/i],
				['html5-icon', ['blue', 'blue'], /\.gohtml$|\.phtml$/i, , false, /^gohtml$/, /\.gohtml$/i, /^HTML$|^g[0o]html$/i],
				['html5-icon', ['purple', 'purple'], /\.html\.eex$|\.jsp$/i, , false, , /\.jsp$/i],
				['html5-icon', ['cyan', 'cyan'], /\.shtml$/i],
				['html5-icon', ['red', 'red'], /\.scaml$/i, , false, /^scaml$/, /\.scaml$/i, /^HTML$|^scaml$/i],
				['html5-icon', ['red', 'red'], /\.vash$/i, , false, /^vash$/, /\.vash$/i, /^HTML$|^vash$/i],
				['html5-icon', ['blue', 'blue'], /\.dtml$/i, , false, /^dtml$/, /\.dtml$/i, /^HTML$|^dtml$/i],
				['hy-icon', ['blue', 'blue'], /\.hy$/i, , false, , /\.hy$/i, /^Hy$|^hylang$/i],
				['idl-icon', ['blue', 'blue'], /\.dlm$/i, , false, , /\.idl$/i, /^IDL$/i],
				['idris-icon', ['red', 'red'], /\.idr$/i, , false, , /\.(?:idris|ipkg)$/i, /^Idris$/i],
				['idris-icon', ['maroon', 'maroon'], /\.lidr$/i],
				['igorpro-icon', ['red', 'red'], /\.ipf$/i],
				['image-icon', ['orange', 'orange'], /\.a?png$|\.svgz$/i, , false, , , , /^.PNG\r\n\x1A\n/],
				['image-icon', ['yellow', 'yellow'], /\.gif$|\.ora$|\.sgi$/i, , false, , , , /^GIF8[97]a/],
				['image-icon', ['green', 'green'], /\.jpg$/i, , false, , , , /^\xFF\xD8\xFF[\xDB\xE0\xE1]|(?:JFIF|Exif)\0|^\xCF\x84\x01|^\xFF\xD8.+\xFF\xD9$/],
				['image-icon', ['blue', 'blue'], /\.ico$/i, , false, , , , /^\0{2}\x01\0/],
				['image-icon', ['blue', 'blue'], /\.webp$|\.iff$|\.lbm$|\.liff$|\.nrrd$|\.pcx$|\.vsdx?$/i, , false, , , , /^RIFF.{4}WEBPVP8/],
				['image-icon', ['red', 'red'], /\.bmp$/i, , false, , , , /^BM/],
				['image-icon', ['red', 'red'], /\.bpg$/i, , false, , , , /^BPG\xFB/],
				['image-icon', ['orange', 'orange'], /\.cin$/i, , false, , , , /^\x80\x2A\x5F\xD7/],
				['image-icon', ['green', 'green'], /\.cd5$/i, , false, , , , /^_CD5\x10\0/],
				['image-icon', ['yellow', 'yellow'], /\.cpc$/i],
				['image-icon', ['orange', 'orange'], /\.cr2$/i, , false, , , , /^II\*\0\x10\0{3}CR/],
				['image-icon', ['pink', 'pink'], /\.dcm$|\.mpo$|\.pbm$/i, , false, , , , /^.{128}DICM/],
				['image-icon', ['green', 'green'], /\.dds$/i, , false, , , , /^DDS \|\0{3}/],
				['image-icon', ['purple', 'purple'], /\.djvu?$|\.pxr$/i, , false, , , , /^AT&TFORM/],
				['image-icon', ['orange', 'orange'], /\.dpx$|\.raw$/i, , false, , , , /^(?:SDPX|XPDS)/],
				['image-icon', ['blue', 'blue'], /\.ecw$|\.sct$/i],
				['image-icon', ['yellow', 'yellow'], /\.exr$/i, , false, , , , /^v\/1\x01/],
				['image-icon', ['cyan', 'cyan'], /\.fits?$|\.fts$/i, , false, , , , /^SIMPLE  =/],
				['image-icon', ['red', 'red'], /\.flif$|\.hdp$|\.heic$|\.heif$|\.jxr$|\.wdp$/i, , false, , , , /^FLIF/],
				['image-icon', ['blue', 'blue'], /\.hdr$/i, , false, , , , /^#\?RADIANCE\n/],
				['image-icon', ['pink', 'pink'], /\.icns$/i, , false, , , , /^icns/],
				['image-icon', ['green', 'green'], /\.(?:jp[f2xm]|j2c|mj2)$/i, , false, , , , /^\0{3}\fjP {2}/],
				['image-icon', ['cyan', 'cyan'], /\.jps$/i],
				['image-icon', ['orange', 'orange'], /\.mng$/i, , false, , , , /^.MNG\r\n\x1A\n/],
				['image-icon', ['red', 'red'], /\.pgf$/i],
				['image-icon', ['purple', 'purple'], /\.pict$/i],
				['image-icon', ['orange', 'orange'], /\.tga$/i, , false, , , , /TRUEVISION-XFILE\.\0$/],
				['image-icon', ['red', 'red'], /\.tiff?$/i, , false, , , , /^II\x2A\0|^MM\0\x2A/],
				['image-icon', ['maroon', 'maroon'], /\.wbm$/i],
				['inform7-icon', ['blue', 'blue'], /\.ni$/i, , false, , /\.inform-?7?$/i, /^Inform 7$|^i7$/i],
				['inform7-icon', ['blue', 'blue'], /\.i7x$/i],
				['inno-icon', ['blue', 'blue'], /\.iss$/i, , false, , /\.inno$/i, /^Inno Setup$/i],
				['io-icon', ['purple', 'purple'], /\.io$/i, , false, /^io$/, /^source\.io$/i, /^Io$/i],
				['ioke-icon', ['red', 'red'], /\.ik$/i, , false, /^ioke$/],
				['isabelle-icon', ['red', 'red'], /\.thy$/i, , false, , /\.isabelle\.theory$/i, /^Isabelle$/i],
				['isabelle-icon', ['blue', 'blue'], /^ROOT$/],
				['j-icon', ['blue', 'blue'], /\.ijs$/i, , false, /^jconsole$/, /\.j$/i, /^J$/i],
				['jade-icon', ['red', 'red'], /\.jade$/i, , false, , /\.jade$/i, /^Jade$/i],
				['jake-icon', ['maroon', 'maroon'], /^Jakefile$/],
				['jake-icon', ['yellow', 'yellow'], /\.jake$/i],
				['java-icon', ['purple', 'purple'], /\.java$/i, , false, , /\.java$/i, /^Java$/i],
				['js-icon', ['yellow', 'yellow'], /\.js$|\.es6$|\.es$/i, , false, /^(?:node|iojs)$/, /\.js$/i, /^JavaScript$|^(?:js|node)$/i],
				['js-icon', ['orange', 'orange'], /\._js$/i],
				['js-icon', ['maroon', 'maroon'], /\.jsb$|\.dust$/i],
				['js-icon', ['blue', 'blue'], /\.jsm$|\.mjs$|\.xsjslib$/i],
				['js-icon', ['green', 'green'], /\.jss$/i],
				['js-icon', ['pink', 'pink'], /\.sjs$/i],
				['js-icon', ['red', 'red'], /\.ssjs$/i],
				['js-icon', ['purple', 'purple'], /\.xsjs$/i],
				['jenkins-icon', ['red', 'red'], /^Jenkinsfile$/],
				['jinja-icon', ['red', 'red'], /\.jinja$/i, , false, , /\.jinja$/i, /^Jinja$|^(?:django|htmldjango|html\+django\/jinja|html\+jinja)$/i],
				['jinja-icon', ['red', 'red'], /\.jinja2$/i],
				['jsonld-icon', ['blue', 'blue'], /\.jsonld$/i],
				['sql-icon', ['blue', 'blue'], /\.jq$/i, , false, , /\.jq$/i, /^JSONiq$/i],
				['jsx-icon', ['blue', 'blue'], /\.jsx$/i, , false, , /\.jsx$/i, /^JSX$/i],
				['julia-icon', ['purple', 'purple'], /\.jl$/i, , false, , /\.julia$/i, /^Julia$/i],
				['jupyter-icon', ['orange', 'orange'], /\.ipynb$/i, , false, , /\.ipynb$/i, /^(?:ipynb|(?:Jupyter|IPython)\s*Notebook)$/i],
				['jupyter-icon', ['cyan', 'cyan'], /^Notebook$/],
				['keynote-icon', ['blue', 'blue'], /\.keynote$/i],
				['keynote-icon', ['blue', 'blue'], /\.knt$/i],
				['kivy-icon', ['maroon', 'maroon'], /\.kv$/i, , false, , /\.kv$/i, /^Kivy$/i],
				['earth-icon', ['green', 'green'], /\.kml$/i],
				['kotlin-icon', ['blue', 'blue'], /\.kt$/i, , false, /^kotlin$/, /\.kotlin$/i, /^k[0o]tlin$/i],
				['kotlin-icon', ['blue', 'blue'], /\.ktm$/i],
				['kotlin-icon', ['orange', 'orange'], /\.kts$/i],
				['krl-icon', ['blue', 'blue'], /\.krl$/i, , false, , /\.krl$/i, /^KRL$/i],
				['labview-icon', ['blue', 'blue'], /\.lvproj$/i],
				['laravel-icon', ['orange', 'orange'], /\.blade\.php$/i, , false, , /\.php\.blade$/i, /^Laravel$/i],
				['lasso-icon', ['blue', 'blue'], /\.lasso$|\.las$/i, , false, , /\.lasso$/i, /^Lasso$|^lass[0o]script$/i],
				['lasso-icon', ['blue', 'blue'], /\.lasso8$/i],
				['lasso-icon', ['purple', 'purple'], /\.lasso9$/i],
				['lasso-icon', ['red', 'red'], /\.ldml$/i],
				['lean-icon', ['purple', 'purple'], /\.lean$/i, , false, /^lean$/, /\.lean$/i, /^lean$/i],
				['lean-icon', ['red', 'red'], /\.hlean$/i],
				['lfe-icon', ['red', 'red'], /\.lfe$/i],
				['lightwave-icon', ['red', 'red'], /\.lwo$/i],
				['lightwave-icon', ['blue', 'blue'], /\.lws$/i],
				['lisp-icon', ['red', 'red'], /\.lsp$/i, , false, /^newlisp$/, /\.newlisp$/i, /^Lisp$|^newlisp$/i],
				['lisp-icon', ['red', 'red'], /\.lisp$/i, , false, /^lisp$/, /\.lisp$/i, /^lisp$/i],
				['lisp-icon', ['maroon', 'maroon'], /\.l$|\.nl$/i, , false, /picolisp|pil/],
				['lisp-icon', ['blue', 'blue'], /\.ny$|\.sexp$/i],
				['lisp-icon', ['purple', 'purple'], /\.podsl$/i],
				['ls-icon', ['blue', 'blue'], /\.ls$/i, , false, , /\.livescript$/i, /^LiveScript$|^(?:ls|live-script)$/i],
				['ls-icon', ['blue', 'blue'], /\._ls$/i],
				['ls-icon', ['green', 'green'], /^Slakefile$/],
				['llvm-icon', ['green', 'green'], /\.ll$/i, , false, /^llvm$/, /\.llvm$/i, /^llvm$/i],
				['llvm-icon', ['yellow', 'yellow'], /\.clang-format$/i],
				['mobile-icon', ['blue', 'blue'], /\.xm$/i, , false, /^logos$/, /\.logos$/i, /^l[0o]g[0o]s$/i],
				['mobile-icon', ['red', 'red'], /\.xi$/i],
				['logtalk-icon', ['red', 'red'], /\.(?:logtalk|lgt)$/i, , false, , /\.logtalk$/i, /^Logtalk$/i],
				['lookml-icon', ['purple', 'purple'], /\.lookml$/i],
				['lsl-icon', ['cyan', 'cyan'], /\.lsl$/i, , false, /^lsl$/, /\.lsl$/i, /^lsl$/i],
				['lsl-icon', ['cyan', 'cyan'], /\.lslp$/i],
				['lua-icon', ['blue', 'blue'], /\.lua$/i, , false, /^lua$/, /\.lua$/i, /^lua$/i],
				['lua-icon', ['blue', 'blue'], /\.pd_lua$/i],
				['lua-icon', ['purple', 'purple'], /\.rbxs$/i],
				['lua-icon', ['red', 'red'], /\.wlua$/i],
				['checklist-icon', ['yellow', 'yellow'], /^Makefile|^makefile$/, , false, /^make$/, /\.makefile$/i, /^Makefile$|^(?:bsdmake|make|mf)$/i],
				['checklist-icon', ['yellow', 'yellow'], /\.(?:mk|mak|make)$|^mkfile$/i],
				['checklist-icon', ['red', 'red'], /^BSDmakefile$|\.am$/i],
				['checklist-icon', ['green', 'green'], /^GNUmakefile$/i],
				['checklist-icon', ['blue', 'blue'], /^Kbuild$/],
				['checklist-icon', ['blue', 'blue'], /\.bb$/i],
				['checklist-icon', ['blue', 'blue'], /^DEPS$/],
				['checklist-icon', ['blue', 'blue'], /\.mms$/i],
				['checklist-icon', ['blue', 'blue'], /\.mmk$/i],
				['checklist-icon', ['purple', 'purple'], /\.pri$/i],
				['mako-icon', ['blue', 'blue'], /\.mak?o$/i, , false, , /\.mako$/i, /^Mako$/i],
				['manpage-icon', ['green', 'green'], /\.(?:1(?:[bcmsx]|has|in)?|[24568]|3(?:avl|bsm|3c|in|m|qt|x)?|7(?:d|fs|i|ipp|m|p)?|9[efps]?|chem|eqn|groff|man|mandoc|mdoc|me|mom|n|nroff|pic|tmac|tmac-u|tr|troff)$/i, , false, /man|mandoc|(?:[gnt]|dit)roff/i, /\.[gt]?roff$/i, /^Manual Page$|^(?:[gtn]?roff|manpage)$/i, /^\.TH[ \t]+(?:\S+)|^'\\' [tre]+(?=\s|$)/],
				['manpage-icon', ['maroon', 'maroon'], /\.(?:rnh|rno|roff|run|runoff)$/i, , false, /^runoff$/, /\.runoff$/i, /^Manual Page$|^run[0o]ff$/i],
				['mapbox-icon', ['cyan', 'cyan'], /\.mss$/i, , false, , /\.mss$/i, /^Mapbox$|^Carto(?:CSS)?$/i],
				['markdown-icon', ['blue', 'blue'], /\.(?:md|mdown|markdown|mkd|mkdown|mkdn|rmd|ron)$/i, , false, , /\.gfm$/i, /^Markdown$/i],
				['mathematica-icon', ['red', 'red'], /\.mathematica$|\.nbp$/i, , false, , /\.mathematica$/i, /^Mathematica$|^mma$/i],
				['mathematica-icon', ['red', 'red'], /\.cdf$/i],
				['mathematica-icon', ['orange', 'orange'], /\.ma$/i],
				['mathematica-icon', ['maroon', 'maroon'], /\.mt$/i],
				['mathematica-icon', ['orange', 'orange'], /\.nb$/i],
				['mathematica-icon', ['yellow', 'yellow'], /\.wl$/i],
				['mathematica-icon', ['yellow', 'yellow'], /\.wlt$/i],
				['matlab-icon', ['yellow', 'yellow'], /\.matlab$/i, , false, , /\.(?:matlab|octave)$/i, /^MATLAB$|^[0o]ctave$/i],
				['max-icon', ['purple', 'purple'], /\.maxpat$/i],
				['max-icon', ['red', 'red'], /\.maxhelp$/i],
				['max-icon', ['blue', 'blue'], /\.maxproj$/i],
				['max-icon', ['purple', 'purple'], /\.mxt$/i],
				['max-icon', ['green', 'green'], /\.pat$/i],
				['maxscript-icon', ['blue', 'blue'], /\.ms$/i, , false, , /\.maxscript$/i, /^MAXScript$/i],
				['maxscript-icon', ['purple', 'purple'], /\.mcr$/i],
				['maxscript-icon', ['red', 'red'], /\.mce$/i],
				['maxscript-icon', ['cyan', 'cyan'], /\.max$/i],
				['maxscript-icon', ['cyan', 'cyan'], /\.3ds$/i],
				['maya-icon', ['cyan', 'cyan'], /\.mb$/i],
				['maya-icon', ['blue', 'blue'], /\.mel$/i],
				['maya-icon', ['purple', 'purple'], /\.mcf[ip]$/i],
				['mediawiki-icon', ['yellow', 'yellow'], /\.mediawiki$/i, , false, /^mediawiki$/, /\.mediawiki$/i, /^mediawiki$/i],
				['mediawiki-icon', ['orange', 'orange'], /\.wiki$/i],
				['bullhorn-icon', ['orange', 'orange'], /^\.mention-bot$/i],
				['mercury-icon', ['cyan', 'cyan'], /\.moo$/i, , false, /^mmi$/, /\.mercury$/i, /^Mercury$/i],
				['metal-icon', ['cyan', 'cyan'], /\.metal$/i],
				['access-icon', ['maroon', 'maroon'], /\.accda$/i],
				['access-icon', ['maroon', 'maroon'], /\.accdb$/i],
				['access-icon', ['green', 'green'], /\.accde$/i],
				['access-icon', ['red', 'red'], /\.accdr$/i],
				['access-icon', ['red', 'red'], /\.accdt$/i],
				['access-icon', ['maroon', 'maroon'], /\.adn$|\.laccdb$/i],
				['access-icon', ['purple', 'purple'], /\.mdw$/i],
				['excel-icon', ['orange', 'orange'], /\.xls$/i],
				['excel-icon', ['green', 'green'], /\.xlsx$/i],
				['excel-icon', ['green', 'green'], /\.xlsm$/i],
				['excel-icon', ['red', 'red'], /\.xlsb$/i],
				['excel-icon', ['cyan', 'cyan'], /\.xlt$/i],
				['onenote-icon', ['purple', 'purple'], /\.one$/i],
				['powerpoint-icon', ['red', 'red'], /\.pps$/i],
				['powerpoint-icon', ['orange', 'orange'], /\.ppsx$/i],
				['powerpoint-icon', ['orange', 'orange'], /\.ppt$/i],
				['powerpoint-icon', ['red', 'red'], /\.pptx$/i],
				['powerpoint-icon', ['maroon', 'maroon'], /\.potm$/i],
				['powerpoint-icon', ['green', 'green'], /\.mpp$/i],
				['word-icon', ['blue', 'blue'], /\.doc$/i],
				['word-icon', ['blue', 'blue'], /\.docx$/i],
				['word-icon', ['maroon', 'maroon'], /\.docm$/i],
				['word-icon', ['cyan', 'cyan'], /\.docxml$/i],
				['word-icon', ['maroon', 'maroon'], /\.dotm$/i],
				['word-icon', ['cyan', 'cyan'], /\.dotx$/i],
				['word-icon', ['orange', 'orange'], /\.wri$/i],
				['minecraft-icon', ['green', 'green'], /^mcmod\.info$/i, , false, , /\.forge-config$/i, /^Minecraft$/i],
				['mirah-icon', ['blue', 'blue'], /\.dr?uby$/g, , false, /^mirah$/, /\.mirah$/i, /^mirah$/i],
				['mirah-icon', ['blue', 'blue'], /\.mir(?:ah)?$/g],
				['model-icon', ['red', 'red'], /\.obj$/i, , false, , /\.wavefront\.obj$/i],
				['model-icon', ['blue', 'blue'], /\.mtl$/i, , false, , /\.wavefront\.mtl$/i],
				['model-icon', ['green', 'green'], /\.stl$/i],
				['model-icon', ['orange', 'orange'], /\.u3d$/i],
				['circle-icon', ['red', 'red'], /\.mo$/i, , false, , /\.modelica(?:script)?$/i, /^Modelica$/i],
				['modula2-icon', ['blue', 'blue'], /\.mod$/i, , false, , /(?:^|\.)modula-?2(?:\.|$)/i, /^Modula-2$/i],
				['modula2-icon', ['green', 'green'], /\.def$/i],
				['modula2-icon', ['red', 'red'], /\.m2$/i],
				['monkey-icon', ['maroon', 'maroon'], /\.monkey$/i, , false, , /\.monkey$/i, /^Monkey$/i],
				['moon-icon', ['yellow', 'yellow'], /\.moon$/i, , false, /^moon$/, /\.moon$/i, /^MoonScript$/i],
				['mruby-icon', ['red', 'red'], /\.mrb$/i, , false, /^mruby$/],
				['msql-icon', ['purple', 'purple'], /\.dsql$/i],
				['mupad-icon', ['red', 'red'], /\.mu$/i],
				['music-icon', ['orange', 'orange'], /\.chord$/i],
				['music-icon', ['blue', 'blue'], /\.midi?$/i, , false, , , , /^MThd/],
				['music-icon', ['green', 'green'], /\.ly$/i, , false, , /\.(?:At)?lilypond-/i, /^Lily\s*Pond$/i],
				['music-icon', ['green', 'green'], /\.ily$/i],
				['music-icon', ['red', 'red'], /\.pd$/i],
				['mustache-icon', ['orange', 'orange'], /\.(?:hbs|handlebars|mustache)$/i, , false, , /(?:^|\.)(?:mustache|handlebars)(?:\.|$)/i, /^Mustache$|^(?:hbs|htmlbars|handlebars)$/i],
				['nant-icon', ['orange', 'orange'], /\.build$/i, , false, , /\.nant-build$/i, /^NAnt$/i],
				['earth-icon', ['green', 'green'], /\.ncl$/i, , false, , /\.ncl$/i, /^NCAR Command Language \(NCL\)$/i],
				['neko-icon', ['orange', 'orange'], /\.neko$/i, , false, /^neko$/, /\.neko$/i, /^nek[0o]$/i],
				['amx-icon', ['blue', 'blue'], /\.axs$/i],
				['amx-icon', ['blue', 'blue'], /\.axi$/i],
				['netlogo-icon', ['red', 'red'], /\.nlogo$/i],
				['nginx-icon', ['green', 'green'], /\.nginxconf$/i, , false, , /\.nginx$/i, /^NGINX$|^nginx[\W_ \t]?c[0o]nfigurati[0o]n[\W_ \t]?file$/i],
				['nib-icon', ['orange', 'orange'], /\.nib$/i],
				['nimrod-icon', ['green', 'green'], /\.nim(?:rod)?$/i, , false, , /\.nim$/i, /^Nimrod$/i],
				['shuriken-icon', ['blue', 'blue'], /\.ninja$/i, , false, /^ninja$/, /\.ninja$/i, /^ninja$/i],
				['nit-icon', ['green', 'green'], /\.nit$/i, , false, , /\.nit$/i, /^Nit$/i],
				['nix-icon', ['cyan', 'cyan'], /\.nix$/i, , false, , /\.nix$/i, /^Nix$|^nix[0o]s$/i],
				['nmap-icon', ['blue', 'blue'], /\.nse$/i, , false, , /\.nmap$/i, /^Nmap$/i],
				['node-icon', ['green', 'green'], /\.njs$|\.nvmrc$/i],
				['node-icon', ['green', 'green'], /\.node-version$/i],
				['nsis-icon', ['purple', 'purple'], /\.nsi$/i, , false, /^nsis$/, /\.nsis$/i, /^nsis$/i],
				['nsis-icon', ['cyan', 'cyan'], /\.nsh$/i],
				['recycle-icon', ['green', 'green'], /\.nu$/i, , false, /^nush$/, /\.nu$/i, /^Nu$|^nush$/i],
				['recycle-icon', ['green', 'green'], /^Nukefile$/],
				['nuget-icon', ['blue', 'blue'], /\.nuspec$/i],
				['nuget-icon', ['purple', 'purple'], /\.pkgproj$/i],
				['numpy-icon', ['blue', 'blue'], /\.numpy$/i],
				['numpy-icon', ['blue', 'blue'], /\.numpyw$/i],
				['numpy-icon', ['orange', 'orange'], /\.numsc$/i],
				['nunjucks-icon', ['green', 'green'], /\.(?:nunjucks|njk)$/i],
				['objc-icon', ['blue', 'blue'], /\.mm?$/i, , false, , /\.objc(?:pp)?$/i, /^Objective-C$|^(?:Obj-?C|ObjectiveC)(?:\+\+)?$/i],
				['objc-icon', ['red', 'red'], /\.pch$/i],
				['objc-icon', ['green', 'green'], /\.x$/i],
				['objj-icon', ['orange', 'orange'], /\.j$/i, , false, , /\.objj$/i, /^Objective-J$|^(?:Obj-?J|ObjectiveJ)$/i],
				['objj-icon', ['red', 'red'], /\.sj$/i],
				['ocaml-icon', ['orange', 'orange'], /\.ml$/i, , false, /ocaml(?:run|script)?/, /\.ocaml$/i, /^OCaml$/i],
				['ocaml-icon', ['orange', 'orange'], /\.mli$/i],
				['ocaml-icon', ['red', 'red'], /\.eliom$/i],
				['ocaml-icon', ['red', 'red'], /\.eliomi$/i],
				['ocaml-icon', ['green', 'green'], /\.ml4$/i],
				['ocaml-icon', ['green', 'green'], /\.mll$/i, , false, /^ocamllex$/, /\.ocamllex$/i, /^OCaml$|^[0o]camllex$/i],
				['ocaml-icon', ['yellow', 'yellow'], /\.mly$/i, , false, /^menhir$/, /\.menhir$/i, /^OCaml$|^menhir$/i],
				['ooc-icon', ['green', 'green'], /\.ooc$/i, , false, , /\.ooc$/i, /^OOC$/i],
				['opa-icon', ['blue', 'blue'], /\.opa$/i, , false, , /\.opa$/i, /^Opa$/i],
				['opencl-icon', ['red', 'red'], /\.opencl$/i, , false, , /\.opencl$/i, /^OpenCL$/i],
				['progress-icon', ['red', 'red'], /\.p$/i, , false, , /\.abl$/i, /^OpenEdge ABL$|^(?:progress|openedge|abl)$/i],
				['openoffice-icon', ['blue', 'blue'], /\.odt$/i],
				['openoffice-icon', ['blue', 'blue'], /\.ott$/i],
				['openoffice-icon', ['purple', 'purple'], /\.fodt$/i],
				['openoffice-icon', ['green', 'green'], /\.ods$/i],
				['openoffice-icon', ['green', 'green'], /\.ots$/i],
				['openoffice-icon', ['cyan', 'cyan'], /\.fods$/i],
				['openoffice-icon', ['purple', 'purple'], /\.odp$/i],
				['openoffice-icon', ['pink', 'pink'], /\.otp$/i],
				['openoffice-icon', ['pink', 'pink'], /\.fodp$/i],
				['openoffice-icon', ['red', 'red'], /\.odg$/i],
				['openoffice-icon', ['red', 'red'], /\.otg$/i],
				['openoffice-icon', ['orange', 'orange'], /\.fodg$/i],
				['openoffice-icon', ['maroon', 'maroon'], /\.odf$/i],
				['openoffice-icon', ['pink', 'pink'], /\.odb$/i],
				['scad-icon', ['orange', 'orange'], /\.scad$/i, , false, , /\.scad$/i, /^OpenSCAD$/i],
				['scad-icon', ['yellow', 'yellow'], /\.jscad$/i],
				['org-icon', ['green', 'green'], /\.org$/i],
				['osx-icon', ['red', 'red'], /\.dmg$/i, , false, , , , /^\x78\x01\x73\x0D\x62\x62\x60/],
				['ox-icon', ['cyan', 'cyan'], /\.ox$/i, , false, , /\.ox$/i, /^Ox$/i],
				['ox-icon', ['green', 'green'], /\.oxh$/i],
				['ox-icon', ['blue', 'blue'], /\.oxo$/i],
				['oxygene-icon', ['cyan', 'cyan'], /\.oxygene$/i, , false, , /\.oxygene$/i, /^Oxygene$/i],
				['oz-icon', ['yellow', 'yellow'], /\.oz$/i, , false, , /\.oz$/i, /^Oz$/i],
				['pan-icon', ['red', 'red'], /\.pan$/i],
				['papyrus-icon', ['green', 'green'], /\.psc$/i, , false, , /(?:^|\.)(?:papyrus\.skyrim|compiled-?papyrus|papyrus-assembly)(?:\.|$)/i, /^Papyrus$/i],
				['parrot-icon', ['green', 'green'], /\.parrot$/i, , false, /^parrot$/],
				['parrot-icon', ['green', 'green'], /\.pasm$/i, , false, , /\.parrot\.pasm$/i, /^Parrot$|^pasm$/i],
				['parrot-icon', ['blue', 'blue'], /\.pir$/i, , false, , /\.parrot\.pir$/i, /^Parrot$|^pir$/i],
				['pascal-icon', ['purple', 'purple'], /\.pas(?:cal)?$/i, , false, /pascal|instantfpc/, /\.pascal$/i, /^Pascal$/i],
				['pascal-icon', ['blue', 'blue'], /\.dfm$/i],
				['pascal-icon', ['blue', 'blue'], /\.dpr$/i],
				['pascal-icon', ['purple', 'purple'], /\.lpr$/i],
				['patch-icon', ['green', 'green'], /\.patch$/i],
				['pawn-icon', ['orange', 'orange'], /\.pwn$/i, , false, , /\.pwn$/i, /^PAWN$/i],
				['pdf-icon', ['red', 'red'], /\.pdf$/i, , false, , , , /^%PDF/],
				['perl-icon', ['blue', 'blue'], /\.p(?:er)?l$|\.t$/i, , false, /^perl$/, /\.perl$/i, /^perl$/i],
				['perl-icon', ['purple', 'purple'], /\.ph$/i],
				['perl-icon', ['purple', 'purple'], /\.plx$/i],
				['perl-icon', ['blue', 'blue'], /\.pm$/i],
				['perl-icon', ['red', 'red'], /\.(?:psgi|xs)$/i],
				['perl6-icon', ['purple', 'purple'], /\.pl6$/i, , false, /^perl6$/, /(?:^|\.)perl6(?:fe)?(?=\.|$)/, /^(?:pl6|Perl\s*6)$/i],
				['perl6-icon', ['blue', 'blue'], /\.[tp]6$|\.6pl$/i],
				['perl6-icon', ['pink', 'pink'], /\.(?:pm6|p6m)$/i],
				['perl6-icon', ['cyan', 'cyan'], /\.6pm$/i],
				['perl6-icon', ['purple', 'purple'], /\.nqp$/i],
				['perl6-icon', ['blue', 'blue'], /\.p6l$/i],
				['perl6-icon', ['green', 'green'], /\.pod6$/i],
				['perl6-icon', ['green', 'green'], /^Rexfile$/],
				['phalcon-icon', ['cyan', 'cyan'], /\.volt$/i, , false, , /\.volt$/i, /^Phalcon$/i],
				['php-icon', ['indigo', 'indigo'], /\.php(?:[st\d]|_cs)?$/i, , false, /^php$/, /\.php$/i, /^PHP$/i, /^<\?php/],
				['php-icon', ['green', 'green'], /^Phakefile/],
				['pickle-icon', ['cyan', 'cyan'], /\.pkl$/i],
				['pike-icon', ['cyan', 'cyan'], /\.pike$/i, , false, /^pike$/],
				['pike-icon', ['blue', 'blue'], /\.pmod$/i],
				['sql-icon', ['red', 'red'], /\.(?:pls|pck|pks|plb|plsql|pkb)$/i, , false, , /\.plsql(?:\.oracle)?(?:\.|$)/i, /^PLSQL$/i],
				['pod-icon', ['blue', 'blue'], /\.pod$/i],
				['pogo-icon', ['orange', 'orange'], /\.pogo$/i, , false, , /\.pogoscript$/i, /^PogoScript$/i],
				['pony-icon', ['maroon', 'maroon'], /\.pony$/i, , false, , /\.pony$/i, /^Pony$/i],
				['postcss-icon', ['red', 'red'], /\.p(?:ost)?css$/i, , false, /^postcss$/, /\.postcss$/i, /^p[0o]stcss$/i],
				['postcss-icon', ['pink', 'pink'], /\.sss$/i, , false, /^sugarss$/, /\.sugarss$/i, /^PostCSS$|^sugarss$/i],
				['postcss-icon', ['orange', 'orange'], /\.postcssrc$/i],
				['postscript-icon', ['red', 'red'], /\.ps$/i, , false, , /\.postscript$/i, /^PostScript$|^p[0o]stscr$/i, /^%!PS/],
				['postscript-icon', ['orange', 'orange'], /\.eps$/i],
				['postscript-icon', ['blue', 'blue'], /\.pfa$/i],
				['postscript-icon', ['green', 'green'], /\.afm$/i],
				['povray-icon', ['blue', 'blue'], /\.pov$/i],
				['powerbuilder-icon', ['blue', 'blue'], /\.pbl$|\.sra$/i],
				['powerbuilder-icon', ['blue', 'blue'], /\.pbt$/i],
				['powerbuilder-icon', ['red', 'red'], /\.srw$/i],
				['powerbuilder-icon', ['orange', 'orange'], /\.sru$/i],
				['powerbuilder-icon', ['maroon', 'maroon'], /\.srp$/i],
				['powerbuilder-icon', ['purple', 'purple'], /\.srj$/i],
				['powershell-icon', ['blue', 'blue'], /\.ps1$/i, , false, , /\.powershell$/i, /^PowerShell$|^p[0o]sh$/i],
				['powershell-icon', ['blue', 'blue'], /\.psd1$/i],
				['powershell-icon', ['purple', 'purple'], /\.psm1$/i],
				['powershell-icon', ['purple', 'purple'], /\.ps1xml$/i],
				['print-icon', ['cyan', 'cyan'], /\.ppd$/i],
				['processing-icon', ['blue', 'blue'], /\.pde$/i, , false, , /\.processing$/i, /^Processing$/i],
				['prolog-icon', ['blue', 'blue'], /\.pro$/i, , false, /^swipl$/, /\.prolog$/i, /^Prolog$/i],
				['prolog-icon', ['cyan', 'cyan'], /\.prolog$/i],
				['prolog-icon', ['purple', 'purple'], /\.yap$/i, , false, /^yap$/],
				['propeller-icon', ['orange', 'orange'], /\.spin$/i, , false, , /\.spin$/i, /^Propeller Spin$/i],
				['pug-icon', ['red', 'red'], /\.pug$/i, , false, , /\.pug$/i, /^Pug$/i],
				['puppet-icon', ['purple', 'purple'], /\.pp$/i, , false, /^puppet$/, /\.puppet$/i, /^puppet$/i],
				['puppet-icon', ['blue', 'blue'], /Modulefile$/i],
				['purebasic-icon', ['red', 'red'], /\.pb$/i, , false, /^purebasic$/, /\.purebasic$/i, /^purebasic$/i],
				['purebasic-icon', ['orange', 'orange'], /\.pbi$/i],
				['purescript-icon', ['purple', 'purple'], /\.purs$/i, , false, , /\.purescript$/i, /^PureScript$/i],
				['python-icon', ['blue', 'blue'], /\.py$|\.bzl$|\.py3$|\.?(?:pypirc|pythonrc|python-venv)$/i, , false, /python[\d.]*/, /\.python$/i, /^Python$|^rusth[0o]n$/i],
				['python-icon', ['blue', 'blue'], /\.ipy$/i],
				['python-icon', ['green', 'green'], /\.isolate$|\.gypi$|\.pyt$/i],
				['python-icon', ['orange', 'orange'], /\.pep$|\.pyde$/i, , false, /^pep8$/, /\.pep8$/i, /^Python$|^pep8$/i],
				['python-icon', ['green', 'green'], /\.gyp$/i],
				['python-icon', ['purple', 'purple'], /\.pyp$/i],
				['python-icon', ['maroon', 'maroon'], /\.pyw$/i],
				['python-icon', ['pink', 'pink'], /\.tac$/i],
				['python-icon', ['red', 'red'], /\.wsgi$/i],
				['python-icon', ['yellow', 'yellow'], /\.xpy$/i],
				['python-icon', ['pink', 'pink'], /\.rpy$/i, , false, , /\.renpy$/i, /^Python$|^Ren'?Py$/i],
				['python-icon', ['green', 'green'], /^(?:BUCK|BUILD|SConstruct|SConscript)$/],
				['python-icon', ['green', 'green'], /^(?:Snakefile|WATCHLISTS)$/],
				['python-icon', ['maroon', 'maroon'], /^wscript$/],
				['r-icon', ['blue', 'blue'], /\.(?:r|Rprofile|rsx|rd)$/i, , false, /^Rscript$/, /\.r$/i, /^R$|^(?:Rscript|splus|Rlang)$/i],
				['racket-icon', ['red', 'red'], /\.rkt$/i, , false, /^racket$/, /\.racket$/i, /^racket$/i],
				['racket-icon', ['blue', 'blue'], /\.rktd$/i],
				['racket-icon', ['red', 'red'], /\.rktl$/i],
				['racket-icon', ['blue', 'blue'], /\.scrbl$/i, , false, /^scribble$/, /\.scribble$/i, /^Racket$|^scribble$/i],
				['raml-icon', ['cyan', 'cyan'], /\.raml$/i, , false, , /\.raml$/i, /^RAML$/i],
				['rascal-icon', ['yellow', 'yellow'], /\.rsc$/i, , false, , /\.rascal$/i, /^Rascal$/i],
				['rdoc-icon', ['red', 'red'], /\.rdoc$/i, , false, , /\.rdoc$/i, /^RDoc$/i],
				['xojo-icon', ['green', 'green'], /\.rbbas$/i],
				['xojo-icon', ['green', 'green'], /\.rbfrm$/i],
				['xojo-icon', ['cyan', 'cyan'], /\.rbmnu$/i],
				['xojo-icon', ['cyan', 'cyan'], /\.rbres$/i],
				['xojo-icon', ['blue', 'blue'], /\.rbtbar$/i],
				['xojo-icon', ['blue', 'blue'], /\.rbuistate$/i],
				['reason-icon', ['red', 'red'], /\.re$/i, , false, /^reason$/, /\.reason$/i, /^reas[0o]n$/i],
				['reason-icon', ['orange', 'orange'], /\.rei$/i],
				['rebol-icon', ['green', 'green'], /\.reb(?:ol)?$/i, , false, /^rebol$/, /\.rebol$/i, /^reb[0o]l$/i],
				['rebol-icon', ['red', 'red'], /\.r2$/i],
				['rebol-icon', ['blue', 'blue'], /\.r3$/i],
				['red-icon', ['red', 'red'], /\.red$/i, , false, , /\.red$/i, /^Red$|^red\/?system$/i],
				['red-icon', ['red', 'red'], /\.reds$/i],
				['red-hat-icon', ['red', 'red'], /\.rpm$/i],
				['red-hat-icon', ['red', 'red'], /\.spec$/i],
				['regex-icon', ['green', 'green'], /\.regexp?$/i, , false, , /(?:\.|^)regexp?(?:\.|$)/i, /^RegExp$/i],
				['android-icon', ['maroon', 'maroon'], /\.rsh$/i],
				['rst-icon', ['blue', 'blue'], /\.re?st(?:\.txt)?$/i, , false, , /\.restructuredtext$/i, /^reStructuredText$|^re?st$/i],
				['rexx-icon', ['red', 'red'], /\.rexx?$/i, , false, /rexx|regina/i, /\.rexx$/i, /^REXX$/i],
				['rexx-icon', ['blue', 'blue'], /\.pprx$/i],
				['riot-icon', ['red', 'red'], /\.tag$/i, , false, , /\.riot$/i, /^RiotJS$/i],
				['robot-icon', ['purple', 'purple'], /\.robot$/i],
				['clojure-icon', ['red', 'red'], /\.rg$/i],
				['rss-icon', ['orange', 'orange'], /\.rss$/i],
				['ruby-icon', ['red', 'red'], /\.(?:rb|ru|ruby|erb|gemspec|god|mspec|pluginspec|podspec|rabl|rake|opal)$|^\.?(?:irbrc|gemrc|pryrc|rspec|ruby-(?:gemset|version))$/i, , false, /(?:mac|j)?ruby|rake|rbx/, /\.ruby$/i, /^Ruby$|^(?:rbx?|rake|jruby|macruby)$/i],
				['ruby-icon', ['red', 'red'], /^(?:Appraisals|(?:Rake|Gem|[bB]uild|Berks|Cap|Danger|Deliver|Fast|Guard|Jar|Maven|Pod|Puppet|Snap)file(?:\.lock)?)$|^rails$/],
				['ruby-icon', ['red', 'red'], /\.(?:jbuilder|rbuild|rb[wx]|builder)$/i],
				['ruby-icon', ['yellow', 'yellow'], /\.watchr$/i],
				['rust-icon', ['maroon', 'maroon'], /\.rs$/i, , false, /^rust$/, /\.rust$/i, /^rust$/i],
				['rust-icon', ['maroon', 'maroon'], /\.rlib$/i],
				['sage-icon', ['blue', 'blue'], /\.sage$/i, , false, /^sage$/, /\.sage$/i, /^sage$/i],
				['sage-icon', ['blue', 'blue'], /\.sagews$/i],
				['saltstack-icon', ['blue', 'blue'], /\.sls$/i, , false, , /\.salt$/i, /^SaltStack$|^Salt(?:State)?$/i],
				['sas-icon', ['blue', 'blue'], /\.sas$/i, , false, , /\.sas$/i, /^SAS$/i],
				['sass-icon', ['pink', 'pink'], /\.scss$/i, , false, /^scss$/, /\.scss$/i, /^Sass$|^scss$/i],
				['sass-icon', ['pink', 'pink'], /\.sass$/i, , false, /^sass$/, /\.sass$/i, /^sass$/i],
				['sbt-icon', ['purple', 'purple'], /\.sbt$/i],
				['scala-icon', ['red', 'red'], /\.(?:sc|scala)$/i, , false, /^scala$/, /\.scala$/i, /^Scala$/i],
				['scheme-icon', ['red', 'red'], /\.scm$/i, , false, /guile|bigloo|chicken/, /\.scheme$/i, /^Scheme$/i],
				['scheme-icon', ['blue', 'blue'], /\.sld$/i],
				['scheme-icon', ['purple', 'purple'], /\.sps$/i],
				['scilab-icon', ['purple', 'purple'], /\.sci$/i, , false, /^scilab$/, /\.scilab$/i, /^scilab$/i],
				['scilab-icon', ['blue', 'blue'], /\.sce$/i],
				['scilab-icon', ['cyan', 'cyan'], /\.tst$/i],
				['secret-icon', [null, null], /\.secret$/i],
				['self-icon', ['blue', 'blue'], /\.self$/i, , false, , /\.self$/i, /^Self$/i],
				['graph-icon', ['red', 'red'], /\.csv$/i, , false, , /(?:^|\.)csv(?:\.semicolon)?(?:\.|$)/i],
				['graph-icon', ['green', 'green'], /\.(?:tab|tsv)$/i],
				['graph-icon', ['green', 'green'], /\.dif$/i],
				['graph-icon', ['cyan', 'cyan'], /\.slk$/i],
				['sf-icon', ['orange', 'orange'], /\.sfproj$/i],
				['terminal-icon', ['purple', 'purple'], /\.(?:sh|rc|bats|bash|tool|install|command)$/i, , false, /bash|sh|zsh|rc/, /\.shell$/i, /^(?:sh|shell|Shell-?Script|Bash)$/i],
				['terminal-icon', ['purple', 'purple'], /^(?:\.?bash(?:rc|[-_]?(?:profile|login|logout|history|prompt))|_osc|config|install-sh|PKGBUILD)$/i],
				['terminal-icon', ['yellow', 'yellow'], /\.ksh$/i],
				['terminal-icon', ['yellow', 'yellow'], /\.sh-session$/i, , false, , /\.shell-session$/i, /^(?:Bash|Shell|Sh)[-\s]*(?:Session|Console)$/i],
				['terminal-icon', ['blue', 'blue'], /\.zsh(?:-theme|_history)?$|^\.?(?:antigen|zpreztorc|zlogin|zlogout|zprofile|zshenv|zshrc)$|\.tmux$/i],
				['terminal-icon', ['green', 'green'], /\.fish$|^\.fishrc$|\.tcsh$/i, , false, /^fish$/, /\.fish$/i, /^fish$/i],
				['terminal-icon', ['red', 'red'], /\.inputrc$/i],
				['terminal-icon', ['red', 'red'], /^(?:configure|config\.(?:guess|rpath|status|sub)|depcomp|libtool|compile)$/],
				['terminal-icon', ['purple', 'purple'], /^\/(?:private\/)?etc\/(?:[^\/]+\/)*(?:profile$|nanorc$|rc\.|csh\.)/i, , true],
				['terminal-icon', ['yellow', 'yellow'], /\.csh$/i],
				['shen-icon', ['cyan', 'cyan'], /\.shen$/i],
				['shopify-icon', ['green', 'green'], /\.liquid$/i],
				['sigils-icon', ['red', 'red'], /\.sigils$/i],
				['silverstripe-icon', ['blue', 'blue'], /\.ss$/i, , false, , /(?:^|\.)ss(?:template)?(?:\.|$)/i, /^SilverStripe$/i],
				['sketch-icon', ['orange', 'orange'], /\.sketch$/i],
				['slash-icon', ['blue', 'blue'], /\.sl$/i, , false, , /\.slash$/i, /^Slash$/i],
				['android-icon', ['green', 'green'], /\.smali$/i, , false, , /\.smali$/i, /^Smali$/i],
				['smarty-icon', ['yellow', 'yellow'], /\.tpl$/i, , false, , /\.smarty$/i, /^Smarty$/i],
				['snyk-icon', ['purple', 'purple'], /\.snyk$/i],
				['clojure-icon', ['yellow', 'yellow'], /\.(?:sma|sp)$/i, , false, , /\.sp$/i, /^SourcePawn$|^s[0o]urcem[0o]d$/i],
				['sparql-icon', ['blue', 'blue'], /\.sparql$/i, , false, , /\.rq$/i, /^SPARQL$/i],
				['sparql-icon', ['blue', 'blue'], /\.rq$/i],
				['sqf-icon', ['maroon', 'maroon'], /\.sqf$/i, , false, /^sqf$/, /\.sqf$/i, /^sqf$/i],
				['sqf-icon', ['red', 'red'], /\.hqf$/i],
				['sql-icon', ['orange', 'orange'], /\.(?:my)?sql$/i, , false, /^sql$/, /\.sql$/i, /^sql$/i],
				['sql-icon', ['blue', 'blue'], /\.ddl$/i],
				['sql-icon', ['green', 'green'], /\.udf$/i],
				['sql-icon', ['cyan', 'cyan'], /\.viw$/i],
				['sql-icon', ['blue', 'blue'], /\.prc$/i],
				['sql-icon', ['purple', 'purple'], /\.db2$/i],
				['sqlite-icon', ['blue', 'blue'], /\.sqlite$/i],
				['sqlite-icon', ['blue', 'blue'], /\.sqlite3$/i],
				['sqlite-icon', ['purple', 'purple'], /\.db$/i],
				['sqlite-icon', ['purple', 'purple'], /\.db3$/i],
				['squirrel-icon', ['maroon', 'maroon'], /\.nut$/i, , false, , /\.nut$/i, /^Squirrel$/i],
				['key-icon', ['yellow', 'yellow'], /\.pub$/i],
				['key-icon', ['orange', 'orange'], /\.pem$/i],
				['key-icon', ['blue', 'blue'], /\.key$|\.crt$/i],
				['key-icon', ['purple', 'purple'], /\.der$/i],
				['key-icon', ['red', 'red'], /^id_rsa/],
				['key-icon', ['green', 'green'], /\.glyphs\d*License$|^git-credential-osxkeychain$/i],
				['key-icon', ['green', 'green'], /^(?:master\.)?passwd$/i],
				['stan-icon', ['red', 'red'], /\.stan$/i, , false, , /\.stan$/i, /^Stan$/i],
				['stata-icon', ['blue', 'blue'], /\.do$/i, , false, /^stata$/, /\.stata$/i, /^stata$/i],
				['stata-icon', ['blue', 'blue'], /\.ado$/i],
				['stata-icon', ['blue', 'blue'], /\.doh$/i],
				['stata-icon', ['cyan', 'cyan'], /\.ihlp$/i],
				['stata-icon', ['cyan', 'cyan'], /\.mata$/i, , false, /^mata$/, /\.mata$/i, /^Stata$|^mata$/i],
				['stata-icon', ['cyan', 'cyan'], /\.matah$/i],
				['stata-icon', ['purple', 'purple'], /\.sthlp$/i],
				['storyist-icon', ['blue', 'blue'], /\.story$/i],
				['strings-icon', ['red', 'red'], /\.strings$/i, , false, , /\.strings$/i, /^Strings$/i],
				['stylus-icon', ['green', 'green'], /\.styl$/i, , false, , /\.stylus$/i, /^Stylus$/i],
				['sublime-icon', ['orange', 'orange'], /\.(?:stTheme|sublime[-_](?:build|commands|completions|keymap|macro|menu|mousemap|project|settings|theme|workspace|metrics|session|snippet))$/i],
				['sublime-icon', ['orange', 'orange'], /\.sublime-syntax$/i],
				['scd-icon', ['red', 'red'], /\.scd$/i, , false, /sclang|scsynth/, /\.supercollider$/i, /^SuperCollider$/i],
				['svg-icon', ['yellow', 'yellow'], /\.svg$/i, , false, , /\.svg$/i, /^SVG$/i],
				['swift-icon', ['green', 'green'], /\.swift$/i, , false, , /\.swift$/i, /^Swift$/i],
				['sysverilog-icon', ['blue', 'blue'], /\.sv$/i],
				['sysverilog-icon', ['green', 'green'], /\.svh$/i],
				['sysverilog-icon', ['cyan', 'cyan'], /\.vh$/i],
				['tag-icon', ['blue', 'blue'], /\.?c?tags$/i],
				['tag-icon', ['red', 'red'], /\.gemtags/i],
				['tcl-icon', ['orange', 'orange'], /\.tcl$/i, , false, /tclsh|wish/, /\.tcl$/i, /^Tcl$/i],
				['tcl-icon', ['orange', 'orange'], /\.adp$/i],
				['tcl-icon', ['red', 'red'], /\.tm$/i],
				['coffee-icon', ['orange', 'orange'], /\.tea$/i, , false, , /\.tea$/i, /^Tea$/i],
				['tt-icon', ['blue', 'blue'], /\.tt2?$/i],
				['tt-icon', ['purple', 'purple'], /\.tt3$/i],
				['tern-icon', ['blue', 'blue'], /\.tern-project$/i],
				['terraform-icon', ['purple', 'purple'], /\.tf(?:vars)?$/i, , false, , /\.terra(?:form)?$/i, /^Terraform$/i],
				['tex-icon', ['blue', 'blue'], /\.tex$|\.ltx$|\.lbx$/i, , false, , /(?:^|\.)latex(?:\.|$)/i, /^TeX$|^latex$/i],
				['tex-icon', ['green', 'green'], /\.aux$|\.ins$/i],
				['tex-icon', ['red', 'red'], /\.sty$|\.texi$/i, , false, , /(?:^|\.)tex(?:\.|$)/i, /^TeX$/i],
				['tex-icon', ['maroon', 'maroon'], /\.dtx$/i],
				['tex-icon', ['orange', 'orange'], /\.cls$|\.mkiv$|\.mkvi$|\.mkii$/i],
				['text-icon', ['blue', 'blue'], /\.te?xt$|\.irclog$|\.uot$/i, , false, , , , /^\xEF\xBB\xBF|^\xFF\xFE/],
				['text-icon', ['maroon', 'maroon'], /\.log$|^Terminal[-_\s]Saved[-_\s]Output$|\.brf$/i],
				['text-icon', ['red', 'red'], /\.git[\/\\]description$/, , true],
				['text-icon', ['red', 'red'], /\.err$|\.no$|^(?:bug-report|fdl|for-release|tests)$/i],
				['text-icon', ['red', 'red'], /\.rtf$|\.uof$/i],
				['text-icon', ['blue', 'blue'], /\.i?nfo$/i],
				['text-icon', ['purple', 'purple'], /\.abt$|\.sub$/i],
				['text-icon', ['orange', 'orange'], /\.ans$/i],
				['text-icon', ['yellow', 'yellow'], /\.etx$/i],
				['text-icon', ['orange', 'orange'], /\.msg$/i],
				['text-icon', ['purple', 'purple'], /\.srt$|\.uop$/i],
				['text-icon', ['cyan', 'cyan'], /\.(?:utxt|utf8)$/i],
				['text-icon', ['green', 'green'], /\.weechatlog$|\.uos$/i],
				['textile-icon', ['orange', 'orange'], /\.textile$/i, , false, , /\.textile$/i, /^Textile$/i],
				['textmate-icon', ['green', 'green'], /\.tmcg$/i],
				['textmate-icon', ['purple', 'purple'], /\.tmLanguage$/i],
				['textmate-icon', ['blue', 'blue'], /\.tmCommand$/i],
				['textmate-icon', ['blue', 'blue'], /\.tmPreferences$/i],
				['textmate-icon', ['orange', 'orange'], /\.tmSnippet$/i],
				['textmate-icon', ['pink', 'pink'], /\.tmTheme$/i],
				['textmate-icon', ['maroon', 'maroon'], /\.tmMacro$/i],
				['textmate-icon', ['orange', 'orange'], /\.yaml-tmlanguage$/i],
				['textmate-icon', ['purple', 'purple'], /\.JSON-tmLanguage$/i],
				['thor-icon', ['orange', 'orange'], /\.thor$/i],
				['thor-icon', ['orange', 'orange'], /^Thorfile$/i],
				['tsx-icon', ['blue', 'blue'], /\.tsx$/i, , false, , /\.tsx$/i, /^TSX$/i],
				['turing-icon', ['red', 'red'], /\.tu$/i, , false, , /\.turing$/i, /^Turing$/i],
				['twig-icon', ['green', 'green'], /\.twig$/i, , false, , /\.twig$/i, /^Twig$/i],
				['txl-icon', ['orange', 'orange'], /\.txl$/i, , false, , /\.txl$/i, /^TXL$/i],
				['ts-icon', ['blue', 'blue'], /\.ts$/i, , false, , /\.ts$/i, /^(?:ts|Type[-\s]*Script)$/i],
				['unity3d-icon', ['blue', 'blue'], /\.anim$/i, , false, /^shaderlab$/, /\.shaderlab$/i, /^Unity3D$|^shaderlab$/i],
				['unity3d-icon', ['green', 'green'], /\.asset$/i],
				['unity3d-icon', ['red', 'red'], /\.mat$/i],
				['unity3d-icon', ['red', 'red'], /\.meta$/i],
				['unity3d-icon', ['cyan', 'cyan'], /\.prefab$/i],
				['unity3d-icon', ['blue', 'blue'], /\.unity$/i],
				['unity3d-icon', ['maroon', 'maroon'], /\.unityproj$/i],
				['uno-icon', ['blue', 'blue'], /\.uno$/i],
				['unreal-icon', [null, null], /\.uc$/i, , false, , /\.uc$/i, /^UnrealScript$/i],
				['link-icon', ['blue', 'blue'], /\.url$/i],
				['urweb-icon', ['maroon', 'maroon'], /\.ur$/i, , false, , /\.ur$/i, /^UrWeb$|^Ur(?:\/Web)?$/i],
				['urweb-icon', ['blue', 'blue'], /\.urs$/i],
				['vagrant-icon', ['cyan', 'cyan'], /^Vagrantfile$/i],
				['gnome-icon', ['purple', 'purple'], /\.vala$/i, , false, /^vala$/, /\.vala$/i, /^vala$/i],
				['gnome-icon', ['purple', 'purple'], /\.vapi$/i],
				['varnish-icon', ['blue', 'blue'], /\.vcl$/i, , false, , /(?:^|\.)(?:varnish|vcl)(?:\.|$)/i, /^VCL$/i],
				['verilog-icon', ['green', 'green'], /\.v$/i, , false, /^verilog$/, /\.verilog$/i, /^veril[0o]g$/i],
				['verilog-icon', ['red', 'red'], /\.veo$/i],
				['vhdl-icon', ['green', 'green'], /\.vhdl$/i, , false, /^vhdl$/, /\.vhdl$/i, /^vhdl$/i],
				['vhdl-icon', ['green', 'green'], /\.vhd$/i],
				['vhdl-icon', ['blue', 'blue'], /\.vhf$/i],
				['vhdl-icon', ['blue', 'blue'], /\.vhi$/i],
				['vhdl-icon', ['purple', 'purple'], /\.vho$/i],
				['vhdl-icon', ['purple', 'purple'], /\.vhs$/i],
				['vhdl-icon', ['red', 'red'], /\.vht$/i],
				['vhdl-icon', ['orange', 'orange'], /\.vhw$/i],
				['video-icon', ['blue', 'blue'], /\.3gpp?$/i, , false, , , , /^.{4}ftyp3g/],
				['video-icon', ['blue', 'blue'], /\.(?:mp4|m4v|h264)$/i, , false, , , , /^.{4}ftyp/],
				['video-icon', ['blue', 'blue'], /\.avi$/i, , false, , , , /^MLVI/],
				['video-icon', ['cyan', 'cyan'], /\.mov$/i, , false, , , , /^.{4}moov/],
				['video-icon', ['purple', 'purple'], /\.mkv$/i, , false, , , , /^\x1AEß£\x93B\x82\x88matroska/],
				['video-icon', ['red', 'red'], /\.flv$/i, , false, , , , /^FLV\x01/],
				['video-icon', ['blue', 'blue'], /\.webm$/i, , false, , , , /^\x1A\x45\xDF\xA3/],
				['video-icon', ['red', 'red'], /\.mpe?g$/i, , false, , , , /^\0{2}\x01[\xB3\xBA]/],
				['video-icon', ['purple', 'purple'], /\.(?:asf|wmv)$/i, , false, , , , /^0&²u\x8EfÏ\x11¦Ù\0ª\0bÎl/],
				['video-icon', ['orange', 'orange'], /\.(?:ogm|og[gv])$/i, , false, , , , /^OggS/],
				['vim-icon', ['green', 'green'], /\.(?:vim|n?vimrc)$/i, , false, /Vim?/i, /\.viml$/i, /^(?:VimL?|NVim|Vim\s*Script)$/i],
				['vim-icon', ['green', 'green'], /^[gn_]?vim(?:rc|info)$/i],
				['vs-icon', ['blue', 'blue'], /\.(?:vba?|fr[mx]|bas)$/i, , false, , /\.vbnet$/i, /^Visual Studio$|^vb\.?net$/i],
				['vs-icon', ['red', 'red'], /\.vbhtml$/i],
				['vs-icon', ['green', 'green'], /\.vbs$/i],
				['vs-icon', ['blue', 'blue'], /\.csproj$/i],
				['vs-icon', ['red', 'red'], /\.vbproj$/i],
				['vs-icon', ['purple', 'purple'], /\.vcx?proj$/i],
				['vs-icon', ['green', 'green'], /\.vssettings$/i],
				['vs-icon', ['maroon', 'maroon'], /\.builds$/i],
				['vs-icon', ['orange', 'orange'], /\.sln$/i],
				['vue-icon', ['green', 'green'], /\.vue$/i, , false, , /\.vue$/i, /^Vue$/i],
				['owl-icon', ['blue', 'blue'], /\.owl$/i],
				['windows-icon', ['purple', 'purple'], /\.bat$|\.cmd$/i, , false, , /(?:^|\.)(?:bat|dosbatch)(?:\.|$)/i, /^(?:bat|(?:DOS|Win)?Batch)$/i],
				['windows-icon', [null, null], /\.(?:exe|com|msi)$/i],
				['windows-icon', ['blue', 'blue'], /\.reg$/i],
				['x10-icon', ['maroon', 'maroon'], /\.x10$/i, , false, , /\.x10$/i, /^X10$|^xten$/i],
				['x11-icon', ['orange', 'orange'], /\.X(?:authority|clients|initrc|profile|resources|session-errors|screensaver)$/i],
				['xmos-icon', ['orange', 'orange'], /\.xc$/i],
				['appstore-icon', ['blue', 'blue'], /\.(?:pbxproj|pbxuser|mode\dv\3|xcplugindata|xcrequiredplugins)$/i],
				['xojo-icon', ['green', 'green'], /\.xojo_code$/i],
				['xojo-icon', ['blue', 'blue'], /\.xojo_menu$/i],
				['xojo-icon', ['red', 'red'], /\.xojo_report$/i],
				['xojo-icon', ['green', 'green'], /\.xojo_script$/i],
				['xojo-icon', ['purple', 'purple'], /\.xojo_toolbar$/i],
				['xojo-icon', ['cyan', 'cyan'], /\.xojo_window$/i],
				['xpages-icon', ['blue', 'blue'], /\.xsp-config$/i],
				['xpages-icon', ['blue', 'blue'], /\.xsp\.metadata$/i],
				['xmos-icon', ['blue', 'blue'], /\.xpl$/i],
				['xmos-icon', ['purple', 'purple'], /\.xproc$/i],
				['sql-icon', ['red', 'red'], /\.(?:xquery|xq|xql|xqm|xqy)$/i, , false, , /\.xq$/i, /^XQuery$/i],
				['xtend-icon', ['purple', 'purple'], /\.xtend$/i, , false, , /\.xtend$/i, /^Xtend$/i],
				['yang-icon', ['yellow', 'yellow'], /\.yang$/i, , false, , /\.yang$/i, /^YANG$/i],
				['zbrush-icon', ['purple', 'purple'], /\.zpr$/i],
				['zephir-icon', ['pink', 'pink'], /\.zep$/i],
				['zimpl-icon', ['orange', 'orange'], /\.(?:zimpl|zmpl|zpl)$/i],
				['apple-icon', ['blue', 'blue'], /^com\.apple\./, 0.5],
				['apache-icon', ['red', 'red'], /^httpd\.conf/i, 0],
				['checklist-icon', ['yellow', 'yellow'], /TODO/, 0],
				['config-icon', [null, null], /config|settings|option|pref/i, 0],
				['doge-icon', ['yellow', 'yellow'], /\.djs$/i, 0, false, , /\.dogescript$/i, /^Dogescript$/i],
				['gear-icon', [null, null], /^\./, 0],
				['book-icon', ['blue', 'blue'], /\b(?:changelog|copying(?:v?\d)?|install|read[-_]?me)\b|^licen[sc]es?[-._]/i, 0],
				['book-icon', ['blue', 'blue'], /^news(?:[-_.]?[-\d]+)?$/i, 0],
				['v8-icon', ['blue', 'blue'], /^(?:[dv]8|v8[-_.][^.]*|mksnapshot|mkpeephole)$/i, 0]
			],
			[
				[69, 147, 152, 154, 169, 192, 195, 196, 197, 198, 204, 217, 239, 244, 249, 251, 253, 258, 287, 292, 293, 303, 304, 309, 331, 333, 336, 343, 347, 353, 362, 380, 395, 398, 416, 420, 421, 422, 424, 431, 434, 448, 451, 465, 467, 468, 471, 480, 481, 482, 485, 486, 487, 525, 526, 529, 534, 555, 565, 570, 571, 572, 578, 580, 584, 586, 590, 601, 602, 626, 629, 658, 669, 670, 681, 688, 694, 696, 709, 714, 715, 745, 748, 755, 760, 769, 772, 778, 779, 798, 800, 803, 805, 808, 811, 822, 823, 826, 836, 838, 848, 854, 858, 860, 864, 865, 867, 868, 871, 881, 886, 903, 905, 924, 928, 936, 944, 987, 1000, 1003, 1005, 1023],
				[42, 57, 69, 105, 120, 121, 124, 126, 129, 143, 145, 147, 149, 151, 152, 154, 156, 157, 158, 166, 167, 169, 174, 192, 194, 195, 196, 197, 198, 204, 206, 210, 211, 213, 215, 216, 217, 223, 224, 225, 229, 230, 234, 236, 237, 238, 239, 242, 243, 244, 249, 251, 253, 255, 256, 258, 275, 285, 286, 287, 288, 290, 291, 292, 293, 294, 295, 297, 300, 301, 303, 304, 309, 312, 314, 326, 330, 336, 341, 342, 343, 346, 347, 350, 351, 352, 353, 359, 362, 365, 380, 381, 382, 383, 386, 390, 392, 394, 395, 398, 400, 416, 422, 439, 440, 442, 448, 451, 452, 453, 454, 458, 461, 463, 465, 466, 467, 468, 469, 470, 471, 472, 473, 474, 475, 479, 482, 485, 486, 487, 488, 489, 490, 522, 524, 525, 527, 529, 530, 533, 534, 543, 546, 547, 548, 549, 553, 555, 558, 560, 561, 565, 570, 571, 575, 578, 580, 582, 584, 586, 590, 600, 601, 602, 603, 604, 605, 612, 618, 626, 629, 657, 658, 664, 665, 668, 669, 675, 678, 679, 680, 681, 685, 687, 688, 689, 690, 691, 694, 696, 704, 707, 709, 714, 715, 716, 717, 718, 719, 734, 738, 741, 742, 744, 746, 747, 748, 753, 755, 760, 768, 769, 774, 776, 777, 778, 779, 781, 792, 797, 798, 801, 802, 803, 805, 807, 808, 811, 818, 822, 823, 826, 827, 828, 829, 836, 838, 841, 845, 847, 848, 850, 854, 858, 860, 862, 863, 864, 865, 867, 868, 871, 875, 881, 884, 886, 894, 896, 897, 898, 900, 901, 903, 905, 915, 923, 924, 928, 932, 933, 936, 937, 938, 944, 947, 951, 952, 954, 970, 982, 983, 984, 985, 986, 987, 995, 997, 1000, 1002, 1003, 1005, 1023, 1025, 1034, 1036, 1039, 1053, 1054, 1055, 1063],
				[41, 150, 282, 283, 284, 321, 889, 959],
				[42, 57, 69, 105, 120, 121, 124, 126, 129, 143, 145, 147, 149, 151, 152, 154, 156, 157, 158, 166, 167, 169, 174, 192, 194, 195, 196, 197, 198, 204, 206, 210, 211, 213, 215, 216, 217, 223, 224, 225, 229, 230, 234, 236, 237, 238, 239, 242, 243, 244, 249, 251, 253, 255, 256, 258, 275, 276, 285, 286, 287, 288, 290, 291, 292, 293, 294, 295, 297, 300, 301, 303, 304, 309, 311, 312, 314, 319, 326, 330, 336, 341, 342, 343, 346, 347, 350, 351, 352, 353, 359, 362, 365, 380, 381, 382, 383, 386, 390, 392, 394, 395, 398, 400, 412, 416, 418, 420, 421, 422, 424, 431, 432, 434, 439, 440, 442, 448, 451, 452, 453, 454, 458, 461, 463, 465, 466, 467, 468, 469, 470, 471, 472, 473, 474, 475, 479, 480, 481, 482, 483, 485, 486, 487, 488, 489, 490, 522, 524, 525, 527, 529, 530, 533, 534, 543, 546, 547, 548, 549, 553, 555, 558, 560, 561, 565, 570, 571, 575, 578, 580, 582, 584, 586, 590, 600, 601, 602, 603, 604, 605, 612, 618, 626, 629, 657, 658, 660, 661, 664, 665, 668, 669, 675, 678, 679, 680, 681, 685, 687, 688, 689, 690, 691, 694, 696, 704, 707, 709, 714, 715, 716, 717, 718, 719, 734, 738, 741, 742, 744, 746, 747, 748, 753, 755, 760, 768, 769, 774, 776, 777, 778, 779, 781, 792, 797, 798, 801, 802, 803, 805, 807, 808, 811, 818, 822, 823, 826, 827, 828, 829, 836, 838, 841, 845, 847, 848, 850, 854, 858, 860, 862, 863, 864, 865, 867, 868, 871, 875, 876, 881, 884, 886, 894, 896, 897, 898, 900, 901, 903, 905, 915, 923, 924, 928, 932, 933, 936, 937, 938, 944, 947, 951, 952, 954, 970, 982, 983, 984, 985, 986, 987, 995, 997, 1000, 1002, 1003, 1005, 1023, 1025, 1034, 1036, 1039, 1053, 1054, 1055, 1063],
				[106, 138, 178, 179, 180, 181, 182, 183, 184, 185, 186, 188, 189, 235, 261, 262, 263, 264, 265, 268, 273, 348, 372, 373, 374, 375, 376, 377, 410, 411, 493, 494, 495, 496, 497, 498, 499, 500, 501, 503, 504, 505, 506, 507, 509, 510, 511, 512, 513, 514, 516, 519, 520, 601, 674, 737, 754, 769, 781, 957, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 1020, 1021, 1022]
			]
		]
	];

	/* ---------------------------------------------------------------------------
		* FileIcons
		* ------------------------------------------------------------------------- */

	/**
		* Create FileIcons instance
		*
		* @param {Array}   icondb - Icons database
		* @class
		* @constructor
		*/

	var FileIcons = function(icondb) {
		this.db = new IconTables(icondb);
	};

	/**
		* Get icon class name of the provided filename. If not found, default to text icon.
		*
		* @param {string} name - file name
		* @return {string}
		* @public
		*/

	FileIcons.prototype.getClass = function(name) {
		var match = this.db.matchName(name);
		return match ? match.getClass() : null;
	};

	/**
		* Get icon class name of the provided filename with color. If not found, default to text icon.
		*
		* @param {string} name - file name
		* @return {string}
		* @public
		*/

	FileIcons.prototype.getClassWithColor = function(name) {
		var match = this.db.matchName(name);
		return match ? match.getClass(0) : null;
	};

	return new FileIcons(icondb);
});