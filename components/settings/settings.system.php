<?php require_once('../../common.php'); ?>
<h2><i class="fas fa-sliders-h"></i><?php i18n("System Settings"); ?></h2>
<table class="settings">
	<tr>
		<td><?php i18n("Active File Loop Behavior"); ?></td>
		<td>
			<select class="setting" data-setting="active.loopBehavior">
				<option value="loopActive" default><?php i18n("Loop only active tabs") ?></option>
				<option value="loopBoth"><?php i18n("Include Dropdown menu") ?></option>
			</select>
		</td>
	</tr>	
	<tr>
		<td><?php i18n("Sidebar Hover Duration"); ?></td>
		<td>
			<select class="setting" data-setting="sidebars.hoverDuration">
				<option value="0">0ms</option>
				<option value="300" default selected>300ms (default)</option>
				<option value="500">500ms</option>
				<option value="700">700ms</option>
				
			</select>
		</td>
	</tr>
	<tr>
		<td><?php i18n("Show Hidden Files"); ?></td>
		<td>
			<select class="setting" data-setting="filemanager.showHidden">
				<option value="true" default><?php i18n("True") ?></option>
				<option value="false"><?php i18n("False") ?></option>
			</select>
		</td>
	</tr>	
	<tr>
		<td><?php i18n("Filemanager Trigger"); ?></td>
		<td>
			<select class="setting" data-setting="filemanager.openTrigger">
				<option value="single" default><?php i18n("Single Click") ?></option>
				<option value="double"><?php i18n("Double Click") ?></option>
			</select>
		</td>
	</tr>	
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
		<td><?php i18n("Project Dock Trigger"); ?></td>
		<td>
			<select class="setting" data-setting="project.openTrigger">
				<option value="single" default><?php i18n("Single Click") ?></option>
				<option value="double"><?php i18n("Double Click") ?></option>
			</select>
		</td>
	</tr>	
	<!--<tr>-->
	<!--	<td><?php i18n("Context Menu Close Delay"); ?></td>-->
	<!--	<td>-->
	<!--		<select class="setting" data-setting="contextmenu.hoverDuration">-->
	<!--			<option value="0">0ms</option>-->
	<!--			<option value="300" default selected>300ms (default)</option>-->
	<!--			<option value="500">500ms</option>-->
	<!--			<option value="700">700ms</option>-->
	<!--		</select>-->
	<!--	</td>-->
	<!--</tr>-->
</table>