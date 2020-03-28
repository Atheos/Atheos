<?php

/*
    *  Copyright (c) Codiad & Kent Safranski (codiad.com), distributed
    *  as-is and without warranty under the MIT License. See
    *  [root]/license.txt for more. This information must remain intact.
    */

require_once('../../common.php');
require_once('class.scout.php');

//////////////////////////////////////////////////////////////////
// Verify Session or Key
//////////////////////////////////////////////////////////////////
checkSession();

//////////////////////////////////////////////////////////////////
// Get Action & Path
//////////////////////////////////////////////////////////////////
$action = Common::data("action");
$path = Common::data("path");

if (!$action) {
	Common::sendJSON("error", "Missing Action");
	die;
} elseif (!checkPath($path)) {
	Common::sendJSON("error", "Invalid Path");
	die;
}

//////////////////////////////////////////////////////////////////
// Handle Action
//////////////////////////////////////////////////////////////////

$Scout = new Scout();

switch ($action) {
	case "probe":
		$Scout->probe();
		break;
	case "filter":
		$Scout->filter();
		break;		
	default:
		Common::sendJSON("error", "Invalid Action");
		die;
		break;
}