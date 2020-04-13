<?php

//////////////////////////////////////////////////////////////////////////////80
// TextMode
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @ccvca, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

require_once('../../common.php');
require_once 'class.textmode.php';

Common::checkSession();

$action = Common::data('action');

if ($action) {
	
	$TextMode = new TextMode();

	switch ($action) {
		case 'settings':
			if (!Common::checkAccess()) {
				die(Common::sendJSON("error", "You are not allowed to edit the file extensions."));
			}

			$ext = Common::readJSON("extensions");

			if (!is_array($ext)) {
				$ext = $TextMode->getDefaultExtensions();
			}

			$textModes = $TextMode->getAvailiableTextModes();

			if (!@ksort($ext)) {
				die(Common::sendJSON("error", "PHP: Missing ksort"));
			}

			?>
			<h2><i class="icon-pencil big-icon"></i><?php i18n("Extensions"); ?></h2>
			<form>

				<table id="textmode">
					<thead>
						<tr>
							<th><?php i18n("Extension"); ?></th>
							<th><?php i18n("Mode"); ?></th>
						</tr>
					</thead>
					<tbody id="textmodes">
						<?php
						foreach ($ext as $ex => $mode) {
							//////////////////////////////////////////////////////////////////
							//print only valid assotiations
							//////////////////////////////////////////////////////////////////
							if (!$TextMode->validTextMode($mode)) {
								continue;
							} ?>
							<tr>
								<td><input type="text" name="extension" value="<?php echo $ex ?>" /></td>
								<td><?php echo $TextMode->getTextModeSelect($mode) ?></td>
							</tr>
							<?php
						}
						?>
					</tbody>
				</table>
				<br>
				<button class="btn-left" onClick="atheos.textmode.addFieldToForm(); return false;"><?php i18n("New Extension"); ?></button>
				<button class="btn-right" onClick="atheos.textmode.saveExtensions(); return false;"><?php i18n("Save Extensions"); ?></button>
			</form>
			<?php
			break;
		default:
			die(Common::sendJSON("error", "invalid action"));
			break;
	}
} else {
	die(Common::sendJSON("error", "missing action"));
}
?>