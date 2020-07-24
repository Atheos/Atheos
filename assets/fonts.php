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


$families = isset($_GET["family"]) ? htmlspecialchars($_GET["family"]) : false;

if (!$families) {
	die;
}

$families = explode("|", $families);

/**
* Ideally, you wouldn't need to change any code beyond this point.
*/
$buffer = "";
foreach ($families as $family) {
	$buffer .= file_get_contents("fonts/$family/webfont.css");
}
// Remove comments
$buffer = preg_replace('!/\*[^*]*\*+([^/][^*]*\*+)*/!', '', $buffer);
// Remove space after colons
$buffer = str_replace(': ', ':', $buffer);
// Remove whitespace
$buffer = str_replace(array("\r\n", "\r", "\n", "\t", '  ', '    ', '    '), '', $buffer);
// Enable GZip encoding.
ob_start("ob_gzhandler");
// Enable caching
header('Cache-Control: public');
// Expire in one day
header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 86400) . ' GMT');
// Set the correct MIME type, because Apache won't set it for us
header("Content-type: text/css");
// Write everything out
echo("/* Copyright (C) 2020-Present  Liam Siira <Liam@Siira.us>*/
/* This file is part of https://www.siira.us			*/
/* This code can not be copied and/or distributed		*/
/* without the express permission of Liam Siira			*/\n"
	. $buffer
);
?>