<?php

/*
    *  Copyright (c) Codiad & daeks (codiad.com), distributed
    *  as-is and without warranty under the MIT License. See
    *  [root]/license.txt for more. This information must remain intact.
    */

require_once('../../common.php');

//////////////////////////////////////////////////////////////////
// Verify Session or Key
//////////////////////////////////////////////////////////////////

checkSession();

$action = Common::data("action");

if (!$action) {
	Common::sendJSON("E401m");
	die;
}

switch ($action) {

	//////////////////////////////////////////////////////////////////////
	// Update
	//////////////////////////////////////////////////////////////////////
	case 'check':

		if (!checkAccess()) {
			?>
			<h1><?php i18n("Restricted"); ?></h1>
			<pre><?php i18n("You can not check for updates"); ?></pre>
			<?php
		} else {
			require_once('class.update.php');
			$update = new Update();
			$vars = json_decode($update->check(), true);
			$local = $vars['local'];
			?>
			<form>
				<input type="hidden" name="archive" value="">
				<input type="hidden" name="remoteversion" value="">
				<h1><?php i18n("Update Check"); ?></h1>
				<br><table>
					<tr><td width="40%"><?php i18n("Your Version"); ?></td><td><?php echo $local['atheos_version']; ?></td></tr>
					<tr><td width="40%"><?php i18n("Latest Version"); ?></td><td id="remote_latest"></td></tr>
				</table>
				<br><label><?php i18n("Changes on Atheos"); ?></label>
				<pre id="remote_body" style="overflow: auto; max-height: 200px; max-width: 510px;"></pre>
				<?php if (false) {
					?>
					<br><em class="note"><?php i18n("Note: Your installation is a nightly build. Atheos might be unstable."); ?></em><br>
					<?php
				} ?>
				<br>
				<button class="btn-left" onclick="atheos.update.download();return false;"><?php i18n("Download Atheos") ?></button>
				<button class="btn-right" onclick="atheos.modal.unload();return false;"><?php i18n("Cancel"); ?></button>
			</form>
			<?php
		}
		break;
	default:
		Common::sendJSON("E401i");
		die;
		break;

}

?>