<?php

//////////////////////////////////////////////////////////////////////////////80
// Transfer Download
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

require_once("../../common.php");

//////////////////////////////////////////////////////////////////////////////80
// Verify Session or Key
//////////////////////////////////////////////////////////////////////////////80
Common::checkSession();

$filename = isset($_GET["filename"]) ? $_GET["filename"] : false;
$basename = basename($filename);
Common::cleanPath($filename);

if(strpos($filename, WORKSPACE) !== 0) die;

header("Pragma: public");
header("Expires: 0");
header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
header("Cache-Control: public");
header("Content-Description: File Transfer");
header("Content-Type: application/octet-stream");
header("Content-Disposition: attachment; filename=\"$basename\"");
header("Content-Transfer-Encoding: binary");
header("Content-Length: " . filesize($filename));

if (ob_get_contents()) {
	ob_end_clean();
}

flush();

readfile($filename);
// Remove temp file
unlink($filename);