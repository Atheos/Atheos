<?php

require 'lib/Minifier.php';

$files = array();

foreach ($plugins as $plugin) {
	if (file_exists(PLUGINS . "/" . $plugin . "/init.js")) {
		$files[] = PLUGINS . "/" . $plugin . "/init.js";
		echo PLUGINS . "/" . $plugin . "/init.js\n";
	}
}

$minified = 'plugins/plugins.min.js';
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