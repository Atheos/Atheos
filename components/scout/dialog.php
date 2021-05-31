<?php

//////////////////////////////////////////////////////////////////////////////80
// Scout Dialog
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

$path = POST("path");

switch ($action) {

	//////////////////////////////////////////////////////////////////////////80
	// Probe File Contents
	//////////////////////////////////////////////////////////////////////////80
	case 'probe':
		$loadingText = '';
		foreach (str_split(i18n("scout_searching")) as $character) {
			$loadingText .= "<em>$character</em>";
		}

		?>
		<label class="title"><i class="fas fa-search"></i><?php echo i18n("scout_searchFiles"); ?></label>
		<form class="searchText">
			<table id="probe_table">
				<tr>
					<td width="65%">
						<input type="text" name="probe_query" placeholder="<?php echo i18n("scout_query"); ?>" autofocus="autofocus">
					</td>
					<td width="5%">&nbsp;&nbsp;</td>
					<td>
						<input type="text" name="probe_filter" placeholder="<?php echo i18n("scout_fileTypes"); ?>">
					</td>
				</tr>
			</table>
			<pre id="probe_results"></pre>
			<div id="probe_processing" class="loader">
				<h2><?php echo($loadingText); ?></h2>
			</div>
			<toolbar>
				<button class="btn-left"><?php echo i18n("search"); ?></button>
			</toolbar>
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