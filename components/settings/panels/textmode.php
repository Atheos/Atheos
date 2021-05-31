<?php

//////////////////////////////////////////////////////////////////////////////80
// TextMode
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @ccvca, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

require_once __DIR__ . "/../../textmode/class.textmode.php";

$TextMode = new TextMode();

$map = Common::loadJSON("extensions");

if (!$map || !is_array($map)) {
	$map = $TextMode->getDefaultExtensionMap();
}

@ksort($map);

?>
<label><i class="fas fa-pencil-alt"></i><?php echo i18n("extensions"); ?></label>
<table id="textmode">
	<thead>
		<tr>
			<th><?php echo i18n("fileExtension"); ?></th>
			<th><?php echo i18n("defaultTextmode"); ?></th>
		</tr>
	</thead>
	<tbody id="textmodes">
		<?php
		foreach ($map as $extension => $mode) {
			//////////////////////////////////////////////////////////////////
			//print only valid assotiations
			//////////////////////////////////////////////////////////////////
			if (!$TextMode->validMode($mode)) {
				continue;
			} ?>
			<tr>
				<td><input type="text" name="extension" value="<?php echo $extension ?>" /></td>
				<td><?php echo $TextMode->createTextModeSelect($extension) ?></td>
			</tr>
			<?php
		}
		?>
	</tbody>
</table>
<br>
<button class="btn-left" onClick="atheos.textmode.addFieldToForm(); return false;"><?php echo i18n("newExtension"); ?></button>
<button class="btn-right" onClick="atheos.textmode.saveExtensions(); return false;"><?php echo i18n("saveExtensions"); ?></button>