<?php // @codingStandardsIgnoreFile
/**
* This file is part of Pico. It's copyrighted by the contributors recorded
* in the version control history of the file, available from the following
* original location:
*
* <https://github.com/picocms/Pico/blob/master/index.php.dist>
*
* SPDX-License-Identifier: MIT
* License-Filename: LICENSE
*/

// load dependencies
require_once __DIR__ . '/vendor/composer/autoload.php';

Autoloader::getLoader();

// instance Pico
$pico = new Pico(
	__DIR__, // root dir
	'config/', // config dir
	'plugins/', // plugins dir
	''   // themes dir
);

// header("Access-Control-Allow-Origin: *");
header("strict-transport-security: max-age=600");

// run application
echo $pico->run();