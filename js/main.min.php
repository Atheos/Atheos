<?php

require '../lib/Minifier.php';


$files = glob('/*.js');

$files = [
	"jquery-1.7.2.min.js",
	"jquery-ui-1.8.23.custom.min.js",
	"amplify.js",
	"localstorage.js",
	"hoverintent.min.js",
	"miniAjax.js",
	"onyx.js",
	"system.js",
	"helpers.js",
	"synthetic.js",
	"sidebars.js",
	"confirm.js",
	"modal.js",
	"toast.js",
	"jsend.js",
	"instance.js"
];
if (file_exists('core.min.js')) {
	$mostRecent = filemtime('core.min.js');
	foreach ($files as $file) {
		if (filemtime($file) > $mostRecent) {
			$mostRecent = filemtime($file);
			break;
		}
	}
	if (filemtime('core.min.js') < $mostRecent) {
		echo file_get_contents('core.min.js');
	} else {
		$javascript = '';
		foreach ($files as $file) {
			$javascript .= file_get_contents($file) . ';' . PHP_EOL;
		}

		$minified_javascript = \JShrink\Minifier::minify($javascript);
		$minified_javascript = '// Creation Time: ' . time() . '\n' . $minified_javascript;
		file_put_contents('core.min.js', $minified_javascript);
		echo $minified_javascript;
	}
} else {
	$javascript = '';
	foreach ($files as $file) {
		$javascript .= file_get_contents($file) . ';' . PHP_EOL;
	}

	$minified_javascript = \JShrink\Minifier::minify($javascript);
	$minified_javascript = '// Creation Time: ' . time() . '\n' . $minified_javascript;

	file_put_contents('core.min.js', $minified_javascript);
	echo $minified_javascript;
}

// foreach ($files as $file) {
// 	$javascript .= file_get_contents($file) . ';' . PHP_EOL;
// }

// $minified_javascript = \JShrink\Minifier::minify($javascript);

// // if(file_exists('test.js')) {
// //         $existing_contents = file_get_contents('test.js');
// //         if($existing_contents == $minified_javascript)
// //                 exit();
// // }

// // file_put_contents($output_file, $minified_javascript);

// // echo $minified_javascript;