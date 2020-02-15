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

$debug = false;
if ($debug == true) {


	echo("	<script src=\"js/amplify.js\"></script>");
	echo("	<script src=\"js/hoverintent.min.js\"></script>");
	echo("	<script src=\"js/ajax.js\"></script>");

	echo("	<script src=\"js/onyx.js\"></script>");
	echo("	<script src=\"js/file-icons.js\"></script>");
	echo("	<script src=\"js/synthetic.js\"></script>");

	echo("	<script src=\"js/system.js\"></script>");

	echo("	<script src=\"js/helpers.js\"></script>");
	echo("	<script src=\"js/storage.js\"></script>");
	echo("	<script src=\"js/sidebars.js\"></script>");
	echo("	<script src=\"js/confirm.js\"></script>");
	echo("	<script src=\"js/modal.js\"></script>");
	echo("	<script src=\"js/toast.js\"></script>");
	echo("	<script src=\"js/jsend.js\"></script>");

} else {
	$files = [
		"js/jquery-1.7.2.min.js",
		"js/jquery-ui-1.8.23.custom.min.js",
		"js/amplify.js",
		"js/hoverintent.min.js",
		"js/ajax.js",
		"js/file-icons.js",
		"js/onyx.js",
		"js/synthetic.js",
		"js/system.js",
		"js/helpers.js",
		"js/storage.js",
		"js/sidebars.js",
		"js/confirm.js",
		"js/modal.js",
		"js/toast.js",
		"js/jsend.js"
	];

	$minified = 'public/core.min.js';

	function minifyJS($minified, $files) {


		$javascript = '';
		$minified_javascript = "// Creation Time: " . time() . PHP_EOL;
		foreach ($files as $file) {
			$javascript = file_get_contents($file);
			$minified_javascript .= "// $file" . PHP_EOL;
			$minifier = new Minify\JS($javascript);
			$minified_javascript .= $minifier->minify() . ';' . PHP_EOL;
			// $minified_javascript .= \JShrink\Minifier::minify($javascript, array('flaggedComments' => false));

		}
		// $minified_javascript .= \JShrink\Minifier::minify($javascript, array('flaggedComments' => false));
		file_put_contents($minified, $minified_javascript);
	};

	// if (file_exists($minified)) {
	// 	$mostRecent = filemtime($minified);
	// 	foreach ($files as $file) {
	// 		if (filemtime($file) > $mostRecent) {
	// 			$mostRecent = filemtime($file);
	// 			break;
	// 		}
	// 	}
	// 	if (filemtime($minified) < $mostRecent) {
	// 		minifyJS($minified, $files);
	// 	}
	// } else {
	minifyJS($minified, $files);
	// }

	echo("<script src=\"$minified\"></script>");

}