<?php

//////////////////////////////////////////////////////////////////////////////80
// Update Dialog
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

if (!$action) {
	Common::sendJSON("E401m");
	die;
}

switch ($action) {

	//////////////////////////////////////////////////////////////////////////80
	// Update
	//////////////////////////////////////////////////////////////////////////80
	case 'check':

		if (!Common::checkAccess("configure")) {
			echo("<h1>" . i18n("Restricted") . "</h1>");
			echo("<pre>" . i18n("You can not check for updates") . "</pre>");
		} else {
			require_once('class.update.php');
			$update = new Update();
			$vars = json_decode($update->check(), true);
			$local = $vars['local'];
			?>
			<label class="title"><i class="fas fa-sync"></i><?php i18n("Update Check"); ?></label>
			<form>
				<input type="hidden" name="archive" value="">
				<input type="hidden" name="remoteversion" value="">
				<br><table>
					<tr><td width="40%"><?php i18n("Your Version"); ?></td><td><?php echo $local['atheos_version']; ?></td></tr>
					<tr><td width="40%"><?php i18n("Latest Version"); ?></td><td id="remote_latest"></td></tr>
				</table>
				<br><label><?php i18n("Changes on Atheos"); ?></label>
				<pre id="update_changes"></pre>
				<?php if ($local['atheos_version'] === "nightly") {
					?>
					<br><em class="note"><?php i18n("Note: Your installation is a nightly build. Atheos might be unstable."); ?></em><br>
					<?php
				} ?>
				<br>
				<toolbar>
					<button class="btn-left" onclick="atheos.update.download();return false;"><?php i18n("Download Atheos") ?></button>
				</toolbar>
			</form>
			<?php
		}
		break;

	//////////////////////////////////////////////////////////////////////////80
	// Default: Invalid Action
	//////////////////////////////////////////////////////////////////////////80
	default:
		Common::sendJSON("E401i");
		die;
		break;

}