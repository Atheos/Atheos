<?php

//////////////////////////////////////////////////////////////////////////////80
// Update Dialog
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

require_once("class.update.php");

$Update = new Update();

switch ($action) {

	//////////////////////////////////////////////////////////////////////////80
	// Update
	//////////////////////////////////////////////////////////////////////////80
	case "check":

		if (!Common::checkAccess("configure")) {
			?>
			<label class="title"><i class="fas fa-sync"></i><?php echo i18n("restricted"); ?></label>
			<form>
				<label class="title"><i class="fas fa-sync"></i><?php echo i18n("restricted_updates"); ?></label>
			</form>
			<?php
		} else {
			$latest = $Update->latest;

			$body = preg_replace("/\*\*/i", "", $latest["body"]);
			$body = str_replace("Changes:", "", $body);

			?>
			<label class="title"><i class="fas fa-sync"></i><?php echo i18n("update_check"); ?></label>

			<form>
				<input type="hidden" name="archive" value="">
				<input type="hidden" name="remoteversion" value="">
				<br>
				<table>
					<tr><td width="40%"><?php echo i18n("yourVersion"); ?></td><td><?php echo ucfirst(VERSION); ?></td></tr>
					<tr><td width="40%"><?php echo i18n("latestVersion"); ?></td><td><?php echo $latest["tag_name"]; ?></td></tr>
				</table>
				<br>
				<label><?php echo i18n("update_changes"); ?></label>
				<pre id="update_changes"><?php echo $body; ?></pre>
				<?php if (DEVELOPMENT) {
					echo("<hint>" . i18n("nightly") . "</hint>");
				} ?>
				<br>
				<toolbar>
					<button class="btn-left" onclick="atheos.update.download();return false;"><?php echo i18n("downloadAtheos") ?></button>
				</toolbar>
			</form>
			<?php
		}
		break;

	//////////////////////////////////////////////////////////////////////////80
	// Default: Invalid Action
	//////////////////////////////////////////////////////////////////////////80
	default:
		Common::send("error", "Invalid action.");
		break;

}