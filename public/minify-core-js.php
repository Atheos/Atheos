<?php

require 'lib/Minifier.php';

$files = [
	"js/jquery-1.7.2.min.js",
	"js/jquery-ui-1.8.23.custom.min.js",
	"js/amplify.js",
	"js/localstorage.js",
	"js/hoverintent.min.js",
	"js/ajax.js",
	"js/file-icons.js",
	"js/onyx.js",
	"js/system.js",
	"js/helpers.js",
	"js/synthetic.js",
	"js/sidebars.js",
	"js/confirm.js",
	"js/modal.js",
	"js/toast.js",
	"js/jsend.js",
	"js/instance.js"
];

$minified = 'public/core.min.js';

if (file_exists($minified)) {
	$mostRecent = filemtime($minified);
	foreach ($files as $file) {
		if (filemtime($file) > $mostRecent) {
			$mostRecent = filemtime($file);
			break;
		}
	}
	if (filemtime($minified) < $mostRecent) {
		$javascript = '';
		foreach ($files as $file) {
			$javascript .= file_get_contents($file) . ';' . PHP_EOL;
		}
		$minified_javascript = "// Creation Time: " . time() . PHP_EOL;
		$minified_javascript .= \JShrink\Minifier::minify($javascript);
		file_put_contents($minified, $minified_javascript);
	}
} else {
		$javascript = '';
	foreach ($files as $file) {
		$javascript .= file_get_contents($file) . ';' . PHP_EOL;
	}
		$minified_javascript = "// Creation Time: " . time() . PHP_EOL;
		$minified_javascript .= \JShrink\Minifier::minify($javascript);

	file_put_contents($minified, $minified_javascript);
}

echo("<script src=\"$minified\"></script>");