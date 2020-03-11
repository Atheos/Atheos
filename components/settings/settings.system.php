<?php require_once('../../common.php'); ?>
<h2><i class="fas fa-sliders-h"></i><?php i18n("System Settings"); ?></h2>
<table class="settings">
	<tr>
		<td><?php i18n("Left Sidebar Trigger"); ?></td>
		<td>
			<select class="setting" data-setting="sidebars.leftOpenOnClick">
				<option value="false" default><?php i18n("Hover") ?></option>
				<option value="true"><?php i18n("Click") ?></option>
			</select>
		</td>
	</tr>	
	<tr>
		<td><?php i18n("Right Sidebar Trigger"); ?></td>
		<td>
			<select class="setting" data-setting="sidebars.rightOpenOnClick">
				<option value="false" default><?php i18n("Hover") ?></option>
				<option value="true"><?php i18n("Click") ?></option>
			</select>
		</td>
	</tr>
	<tr>
		<td><?php i18n("Filemanager Trigger"); ?></td>
		<td>
			<select class="setting" data-setting="editor.fileManagerTrigger">
				<option value="false" default><?php i18n("Single Click") ?></option>
				<option value="true"><?php i18n("Double Click") ?></option>
			</select>
		</td>

	</tr>
	<tr>
		<td><?php i18n("Sync system settings on all devices"); ?></td>
		<td>
			<select class="setting" data-setting="settings.syncSystem">
				<option value="true"><?php i18n("Yes") ?></option>
				<option value="false" default><?php i18n("No") ?></option>
			</select>
		</td>

	</tr>
	<tr>
		<td><?php i18n("Sync plugin settings on all devices"); ?></td>
		<td>
			<select class="setting" data-setting="settings.syncPlugin">
				<option value="true"><?php i18n("Yes") ?></option>
				<option value="false" default><?php i18n("No") ?></option>
			</select>
		</td>
	</tr>
</table>