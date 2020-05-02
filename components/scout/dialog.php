<?php

//////////////////////////////////////////////////////////////////////////////80
// Scout Dialog
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

require_once("../../common.php");

//////////////////////////////////////////////////////////////////////////////80
// Verify Session or Key
//////////////////////////////////////////////////////////////////////////////80
Common::checkSession();

$action = Common::data("action");
$path = Common::data("path");

if (!$action) {
	Common::sendJSON("E401m");
	die;
}

switch ($action) {

	//////////////////////////////////////////////////////////////////////////80
	// Probe File Contents
	//////////////////////////////////////////////////////////////////////////80
	case 'probe':
		$loadingText = '';
		foreach (str_split(i18n("Searching...", "return")) as $character) {
			$loadingText .= "<em>$character</em>";
		}

		?>
		<form>
			<table id="probe_table">
				<tr>
					<td width="65%">
						<label><?php i18n("Search Files:"); ?></label>
						<input type="text" name="probe_query" autofocus="autofocus">
					</td>
					<td width="5%">&nbsp;&nbsp;</td>
					<td>
						<label><?php i18n("In:"); ?></label>
						<select name="probe_type">
							<option value="0"><?php i18n("Current Project"); ?></option>
							<?php if (Common::checkAccess("configure")) {
								?>
								<option value="1"><?php i18n("Workspace Projects"); ?></option>
								<?php
							} ?>
						</select>
					</td>
				</tr>
				<tr>
					<td coli="3">
						<label><?php i18n("File Type:"); ?></label>
						<input type="text" name="probe_filter" placeholder="<?php i18n("space seperated file types eg: js c php"); ?>">
					</td>
				</tr>
			</table>
			<pre id="probe_results"></pre>
			<div id="probe_processing" class="loader">
				<h2><?php echo($loadingText); ?></h2>
			</div>
			<button class="btn-left"><?php i18n("Search"); ?></button>
			<button class="btn-right" onclick="atheos.modal.unload();return false;"><?php i18n("Cancel"); ?></button>
		</form>
		<?php
		break;

	//////////////////////////////////////////////////////////////////////////80
	// Default: Invalid Action
	//////////////////////////////////////////////////////////////////////////80
	default:
		Common::sendJSON("E401i");
		break;
}