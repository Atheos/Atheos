<?php

require '../lib/Minifier.php';


$output_file = 'scripts.min.js';
$input_dir = '.';

$files = glob($input_dir . '/*.js');
$javascript = '';
$files = [
	"jquery-1.7.2.min.js",
	"jquery-ui-1.8.23.custom.min.js",
	"jquery.css3.min.js",
	"amplify.js",
	"localstorage.js",
	"events.js",
	"hoverintent.min.js",
	"pico.js",
	"miniAjax.js",
	"bioflux.js",
	"system.js",
	"helpers.js",
	"hex.js",
	"sidebars.js",
	"modal.js",
	"toast.js",
	"jsend.js",
	"instance.js?v=". time()
];
foreach ($files as $file) {
	$javascript .= file_get_contents($file) . ';' . PHP_EOL;
}

$minified_javascript = \JShrink\Minifier::minify($javascript);

// if(file_exists('test.js')) {
//         $existing_contents = file_get_contents('test.js');
//         if($existing_contents == $minified_javascript)
//                 exit();
// }

// file_put_contents($output_file, $minified_javascript);

echo $minified_javascript;



// if(filemtime('scripts_template.js') < filemtime('scripts_template.min.js')) {
//   read_file('scripts_template.min.js');
// } else {
//   $output = \JShrink\Minifier::minify(file_get_contents('scripts_template.js'));
//   file_put_contents('scripts_template.min.js', $output);
//   echo $output;
// }