<?php

//////////////////////////////////////////////////////////////////////////////80
// Transfer Dialog
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

$path = POST("path");

function return_bytes($val) {
	$val = trim($val);
	$last = strtolower($val[strlen($val)-1]);
	switch ($last) {
		case 'g':
			$val *= 1024;
			break;
		case 'm':
			$val *= 1024;
			break;
		case 'k':
			$val *= 1024;
			break;
	}
	return $val;
}

function max_file_upload_in_bytes() {
	//select maximum upload size
	$max_upload = return_bytes(ini_get('upload_max_filesize'));
	//select post limit
	$max_post = return_bytes(ini_get('post_max_size'));
	//select memory limit
	$memory_limit = return_bytes(ini_get('memory_limit'));
	// return the smallest of them, this defines the real limit
	return min($max_upload, $max_post, $memory_limit);
}

switch ($action) {

	//////////////////////////////////////////////////////////////////////////80
	// Upload
	//////////////////////////////////////////////////////////////////////////80
	case 'upload':
		if (!Common::isAbsPath($path)) {
			$path .= "/";
		}
		?>
		<label class="title"><i class="fas fa-upload"></i><?php echo i18n("filesUpload"); ?></label>
		<form class="transfer" enctype="multipart/form-data">
			<pre><?php echo($path); ?></pre>
			<label id="upload_wrapper">
				<?php echo i18n("dragFilesOrClickHereToUpload"); ?>
				<input type=“hidden” name=“MAX_FILE_SIZE” value=“<?php echo max_file_upload_in_bytes(); ?>”>
				<input type="file" name="upload[]" multiple>
			</label>
			<div id="progress_wrapper">
			</div>
		</form>


		<?php
		break;

	//////////////////////////////////////////////////////////////////////////80
	// Default: Invalid Action
	//////////////////////////////////////////////////////////////////////////80
	default:
		Common::send("error", "Invalid action.");
		break;
}