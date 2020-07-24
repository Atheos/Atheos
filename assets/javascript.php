<?php
/**
* On-the-fly CSS Compression
* Copyright (c) 2009 and onwards, Manas Tungare.
* Creative Commons Attribution, Share-Alike.
*
* In order to minimize the number and size of HTTP requests for CSS content,
* this script combines multiple CSS files into a single file and compresses
* it on-the-fly.
*
* To use this in your HTML, link to it in the usual way:
* <link rel="stylesheet" type="text/css" media="screen, print, projection" href="/css/compressed.css.php" />
*
* https://gist.github.com/manastungare/2625128#file-css-compress-php
*/
/* Add your CSS files to this array (THESE ARE ONLY EXAMPLES) */

$request = isset($_GET["js"]) ? strtolower(htmlspecialchars($_GET["js"])) : false;

$files = array(
	"mn" => "main",
	"ac" => "activity",
	"an" => "aeon",
	"ay" => "anomaly",
	"ct" => "contact",
	"eo" => "echo",
	"ln" => "lumin",
	"pm" => "prism",
	"sc" => "synthetic",
);

if (strpos($request, "|")) {
	$codes = explode("|", $request);
} else {
	// Nocturnal
	$codes = array('an', 'ct', 'ay', 'ac', 'ln', 'sc');
	// $codes[] = "mn";

}
$codes[] = "mn";
$codes = array_unique($codes);
/**
* Ideally, you wouldn't need to change any code beyond this point.
*/
$buffer = "";
foreach ($codes as $code) {
	if (array_key_exists($code, $files)) {
		$file = $files[$code];
		$content = file_get_contents("js/$file.js");

		$needle = '//////////////////////////////////////////////////////////////////////////////80';
		$pos = strrpos($content, $needle) + 80;

		// Spilt licmse block from code
		$block = substr($content, 0, $pos);
		$content = substr($content, $pos);

		// Remove comments
		$content = preg_replace('/(?:(?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:(?<!\:|\\\|\')\/\/.*))/', '', $content);

		// Remove space after colons
		$content = str_replace(': ', ':', $content);

		// Remove whitespace
		// $content = str_replace(array("\r\n", "\r", "\n", "\t", '  ', '    ', '    '), '', $content);
		$content = str_replace(array("\r\n", "\r", "\n", "\t"), '', $content);

		$buffer .= PHP_EOL . $block . PHP_EOL . PHP_EOL . $content . PHP_EOL;
	}
}

$copyright = "//////////////////////////////////////////////////////////////////////////////80
// Psuedo compressed Javascript files from Siira Network
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/license.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80\n";

// Enable GZip encoding.
ob_start("ob_gzhandler");
// Enable caching
header('Cache-Control: public');
// Expire in one day
header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 86400) . ' GMT');
// Set the correct MIME type, because Apache won't set it for us
header("Content-type: text/javascript");
// Write everything out
echo($copyright . $buffer);
?>