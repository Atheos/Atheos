<?php

// require 'lib/Minifier.php';

require_once 'lib/minify/src/Minify.php';
require_once 'lib/minify/src/CSS.php';
require_once 'lib/minify/src/JS.php';
require_once 'lib/minify/src/Exception.php';
require_once 'lib/minify/src/Exceptions/BasicException.php';
require_once 'lib/minify/src/Exceptions/FileImportException.php';
require_once 'lib/minify/src/Exceptions/IOException.php';
require_once 'lib/path-converter/src/ConverterInterface.php';
require_once 'lib/path-converter/src/Converter.php';

use MatthiasMullie\Minify;

$files = [
	"modules/jquery-1.7.2.min.js",
	"modules/jquery-ui-1.8.23.custom.min.js",
	"modules/amplify.js",
	"modules/ajax.js",
	"modules/file-icons.js",
	"modules/onyx.js",
	"modules/synthetic.js",
	"modules/system.js",
	"modules/alert.js",
	"modules/chronometer.js",
	"modules/codiad.js",
	"modules/helpers.js",
	"modules/jsend.js",
	"modules/keybind.js",
	"modules/modal.js",
	"modules/sidebars.js",
	"modules/storage.js",
	"modules/toast.js"
];
// This is a conditional that helps during developement of Atheos.
if (true) {
	$scripts = '';
	foreach ($files as $file) {
		$scripts .= ("<script type=\"text/javascript\" src=\"$file\"></script>" . PHP_EOL);
	}
	echo $scripts;
} else {
	$minified = 'public/core.min.js';
	
	function minifyJS($minified, $files) {
		$javascript = '';
		$minified_javascript = "// Creation Time: " . date('Y-m-d H:i:s', time()) . PHP_EOL;
		foreach ($files as $file) {
			if (is_readable($file)) {
				$javascript = file_get_contents($file);
				$minified_javascript .= "// $file" . PHP_EOL;
				$minifier = new Minify\JS($javascript);
				$minified_javascript .= $minifier->minify() . ';' . PHP_EOL;
			}
		}
		file_put_contents($minified, $minified_javascript);
	};

	if (is_readable($minified)) {
		$mostRecent = filemtime($minified);
		foreach ($files as $file) {
			if (filemtime($file) > $mostRecent) {
				$mostRecent = filemtime($file);
				break;
			}
		}
		if (filemtime($minified) < $mostRecent) {
			minifyJS($minified, $files);
		}
	} else {
		minifyJS($minified, $files);
	}

	echo("<script src=\"$minified\"></script>");

}