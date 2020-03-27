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
	Common::sendJSON("error", "Missing Action");
	die;
}

switch ($action) {

	//////////////////////////////////////////////////////////////////////
	// Update
	//////////////////////////////////////////////////////////////////////

	case 'check':

		if (!checkAccess()) {
			?>
			<label><?php i18n("Restricted"); ?></label>
			<pre><?php i18n("You can not check for updates"); ?></pre>
			<button onclick="codiad.modal.unload();return false;"><?php i18n("Close"); ?></button>
			<?php
		} else {
			require_once('class.update.php');
			$update = new Update();
			$vars = json_decode($update->check(), true);
			$local = $vars['local'];
			$remote = $vars['remote'];
			?>
			<form>
				<input type="hidden" name="archive" value="<?php echo $remote['zipball_url']; ?>">
				<input type="hidden" name="remoteversion" value="<?php echo $remote['tag_name']; ?>">
				<label><?php i18n("Update Check"); ?></label>
				<br><table>
					<tr><td width="40%"><?php i18n("Your Version"); ?></td><td><?php echo $local['atheos_version']; ?></td></tr>
					<tr><td width="40%"><?php i18n("Latest Version"); ?></td><td><?php echo $remote['tag_name']; ?></td></tr>
				</table>
				<?php if ($local['atheos_version'] != $remote['tag_name']) {
					?>
					<br><label><?php i18n("Changes on Atheos"); ?></label>
					<pre style="overflow: auto; max-height: 200px; max-width: 510px;"><?php echo $remote['body']; ?></pre>
					<?php
				} else {
					?>
					<br><br><b><label><?php i18n("Congratulation, your system is up to date."); ?></label></b>
					<?php

				} ?>
				<?php if (false) {
					?>
					<br><em class="note"><?php i18n("Note: Your installation is a nightly build. Atheos might be unstable."); ?></em><br>
					<?php
				} ?>
				<br><?php
				if ($local['atheos_version'] != $remote['tag_name']) {
					echo '<button class="btn-left" onclick="codiad.update.download();return false;">'.i18n("Download Atheos").'</button>&nbsp;';
				}
				?><button class="btn-right" onclick="codiad.modal.unload();return false;"><?php i18n("Cancel"); ?></button>
			</form>
			<?php
		}
		break;

}

?>