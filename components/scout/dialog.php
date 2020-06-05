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
		<label class="title"><i class="fas fa-search"></i><?php i18n("Search Files"); ?></label>
		<form>
			<table id="probe_table">
				<tr>
					<td width="65%">
						<input type="text" name="probe_query" placeholder="<?php i18n("query"); ?>" autofocus="autofocus">
					</td>
					<td width="5%">&nbsp;&nbsp;</td>
					<td>
						<input type="text" name="probe_filter" placeholder="<?php i18n("space seperated file types"); ?>">
					</td>
					<!--<td>-->
					<!--	<label for="probe_type"><?php i18n("Within WorkSpace:"); ?></label>-->
					<!--	<input type="checkbox" name="probe_type" id="probe_type">-->
					<!--</td>					-->
				</tr>
			</table>
			<pre id="probe_results"></pre>
			<div id="probe_processing" class="loader">
				<h2><?php echo($loadingText); ?></h2>
			</div>
			<toolbar>
				<button class="btn-left"><?php i18n("Search"); ?></button>
			</toolbar>

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