<?php

//////////////////////////////////////////////////////////////////////////////80
// Analytics Dialog
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

require_once("../../common.php");

switch ($action) {

	//////////////////////////////////////////////////////////////////////////80
	// Update
	//////////////////////////////////////////////////////////////////////////80
	case "check":

		if (!Common::checkAccess("configure")) {
			echo("<h1>" . i18n("restricted") . "</h1>");
			echo("<pre>" . i18n("youCanNotCheckForUpdates") . "</pre>");
		} else {
			require_once("class.update.php");
			$update = new Update();
			$vars = json_decode($update->check(), true);
			$local = $vars["local"];
			?>
			<label class="title"><i class="fas fa-sync"></i><?php echo i18n("updateCheck"); ?></label>
			<form>
				<input type="hidden" name="archive" value="">
				<input type="hidden" name="remoteversion" value="">
				<br><table>
					<tr><td width="40%"><?php echo i18n("yourVersion"); ?></td><td><?php echo $local["atheos_version"]; ?></td></tr>
					<tr><td width="40%"><?php echo i18n("latestVersion"); ?></td><td id="remote_latest"></td></tr>
				</table>
				<br><label><?php echo i18n("changesOnAtheos"); ?></label>
				<pre id="update_changes"></pre>
				<?php if ($local["atheos_version"] === "nightly") {
					?>
					<br><em class="note"><?php echo i18n("noteYourInstallationIsANightlyBuildCodiadMightBeUnstable"); ?></em><br>
					<?php
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