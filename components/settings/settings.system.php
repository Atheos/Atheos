<?php require_once('../../common.php'); ?>
<label><i class="fas fa-sliders-h"></i><?php i18n("System Settings"); ?></label>
<table>
	<tr>
		<td><?php i18n("Active File Loop Behavior"); ?></td>
		<td>
			<toggle>
				<input id="active_loopBehavior_loopActive" data-setting="active.loopBehavior" value="loopActive" name="active.loopBehavior" type="radio" checked />
				<label for="active_loopBehavior_loopActive"><?php i18n("Loop only active tabs"); ?></label>
				<input id="active_loopBehavior_loopBoth" data-setting="active.loopBehavior" value="loopBoth" name="active.loopBehavior" type="radio" />
				<label for="active_loopBehavior_loopBoth"><?php i18n("Include Dropdown menu"); ?></label>
			</toggle>
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
			<toggle>
				<input id="filemanager_showHidden_true" data-setting="filemanager.showHidden" value="true" name="filemanager.showHidden" type="radio" checked />
				<label for="filemanager_showHidden_true"><?php i18n("True"); ?></label>
				<input id="filemanager_showHidden_false" data-setting="filemanager.showHidden" value="loopBoth" name="filemanager.showHidden" type="radio" />
				<label for="filemanager_showHidden_false"><?php i18n("False"); ?></label>
			</toggle>
		</td>
	</tr>
	<tr>
		<td><?php i18n("Filemanager Trigger"); ?></td>
		<td>
			<toggle>
				<input id="filemanager_openTrigger_click" data-setting="filemanager.openTrigger" value="click" name="filemanager.openTrigger" type="radio" checked />
				<label for="filemanager_openTrigger_click"><?php i18n("Single Click"); ?></label>
				<input id="filemanager_openTrigger_dblclick" data-setting="filemanager.openTrigger" value="dblclick" name="filemanager.openTrigger" type="radio" />
				<label for="filemanager_openTrigger_dblclick"><?php i18n("Double Click"); ?></label>
			</toggle>
		</td>
	</tr>
	<tr>
		<td><?php i18n("Left Sidebar Trigger"); ?></td>
		<td>
			<toggle>
				<input id="sidebars_leftTrigger_hover" data-setting="sidebars.leftTrigger" value="hover" name="sidebars.leftTrigger" type="radio" checked/>
				<label for="sidebars_leftTrigger_hover"><?php i18n("Hover"); ?></label>			
				<input id="sidebars_leftTrigger_click" data-setting="sidebars.leftTrigger" value="click" name="sidebars.leftTrigger" type="radio"  />
				<label for="sidebars_leftTrigger_click"><?php i18n("Click"); ?></label>
			</toggle>			
		</td>
	</tr>
	<tr>
		<td><?php i18n("Right Sidebar Trigger"); ?></td>
		<td>
			<toggle>
				<input id="sidebars_rightTrigger_hover" data-setting="sidebars.rightTrigger" value="hover" name="sidebars.rightTrigger" type="radio" checked/>
				<label for="sidebars_rightTrigger_hover"><?php i18n("Hover"); ?></label>			
				<input id="sidebars_rightTrigger_click" data-setting="sidebars.rightTrigger" value="click" name="sidebars.rightTrigger" type="radio"  />
				<label for="sidebars_rightTrigger_click"><?php i18n("Click"); ?></label>
			</toggle>
		</td>
	</tr>
	<tr>
		<td><?php i18n("Project Dock Trigger"); ?></td>
		<td>
			<toggle>
				<input id="project_openTrigger_click" data-setting="project.openTrigger" value="click" name="project.openTrigger" type="radio" checked />
				<label for="project_openTrigger_click"><?php i18n("Single Click"); ?></label>
				<input id="project_openTrigger_dblclick" data-setting="project.openTrigger" value="dblclick" name="project.openTrigger" type="radio" />
				<label for="project_openTrigger_dblclick"><?php i18n("Double Click"); ?></label>
			</toggle>			
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