<label><i class="fas fa-sliders-h"></i><?php echo i18n("settings_system"); ?></label>
<table>
	<tr>
		<td><?php echo i18n("loop_behavior"); ?></td>
		<td>
			<toggle>
				<input id="active_loopBehavior_loopActive" data-setting="active.loopBehavior" value="loopActive" name="active.loopBehavior" type="radio" checked />
				<label for="active_loopBehavior_loopActive"><?php echo i18n("loop_onlyActive"); ?></label>
				<input id="active_loopBehavior_loopBoth" data-setting="active.loopBehavior" value="loopBoth" name="active.loopBehavior" type="radio" />
				<label for="active_loopBehavior_loopBoth"><?php echo i18n("loop_incDropdown"); ?></label>
			</toggle>
		</td>
	</tr>
	<tr>
		<td><?php echo i18n("hover_duration"); ?></td>
		<td>
			<select class="setting" data-setting="sidebars.hoverDuration">
				<option value="0"><?php echo i18n("time_ms", 0); ?></option>
				<option value="300" default selected><?php echo i18n("time_ms_default", 300); ?></option>
				<option value="500"><?php echo i18n("time_ms", 500); ?></option>
				<option value="700"><?php echo i18n("time_ms", 700); ?></option>
			</select>
		</td>
	</tr>
	<tr>
		<td><?php echo i18n("showHidden"); ?></td>
		<td>
			<toggle>
				<input id="filemanager_showHidden_true" data-setting="filemanager.showHidden" value="true" name="filemanager.showHidden" type="radio" checked />
				<label for="filemanager_showHidden_true"><?php echo i18n("true"); ?></label>
				<input id="filemanager_showHidden_false" data-setting="filemanager.showHidden" value="false" name="filemanager.showHidden" type="radio" />
				<label for="filemanager_showHidden_false"><?php echo i18n("false"); ?></label>
			</toggle>
		</td>
	</tr>
	<tr>
		<td><?php echo i18n("trigger_fileManager"); ?></td>
		<td>
			<toggle>
				<input id="filemanager_openTrigger_click" data-setting="filemanager.openTrigger" value="click" name="filemanager.openTrigger" type="radio" checked />
				<label for="filemanager_openTrigger_click"><?php echo i18n("click_single"); ?></label>
				<input id="filemanager_openTrigger_dblclick" data-setting="filemanager.openTrigger" value="dblclick" name="filemanager.openTrigger" type="radio" />
				<label for="filemanager_openTrigger_dblclick"><?php echo i18n("click_double"); ?></label>
			</toggle>
		</td>
	</tr>
	<tr>
		<td><?php echo i18n("trigger_leftSidebar"); ?></td>
		<td>
			<toggle>
				<input id="sidebars_leftTrigger_hover" data-setting="sidebars.leftTrigger" value="hover" name="sidebars.leftTrigger" type="radio" checked />
				<label for="sidebars_leftTrigger_hover"><?php echo i18n("hover"); ?></label>
				<input id="sidebars_leftTrigger_click" data-setting="sidebars.leftTrigger" value="click" name="sidebars.leftTrigger" type="radio" />
				<label for="sidebars_leftTrigger_click"><?php echo i18n("click"); ?></label>
			</toggle>
		</td>
	</tr>
	<tr>
		<td><?php echo i18n("trigger_rightSidebar"); ?></td>
		<td>
			<toggle>
				<input id="sidebars_rightTrigger_hover" data-setting="sidebars.rightTrigger" value="hover" name="sidebars.rightTrigger" type="radio" checked />
				<label for="sidebars_rightTrigger_hover"><?php echo i18n("hover"); ?></label>
				<input id="sidebars_rightTrigger_click" data-setting="sidebars.rightTrigger" value="click" name="sidebars.rightTrigger" type="radio" />
				<label for="sidebars_rightTrigger_click"><?php echo i18n("click"); ?></label>
			</toggle>
		</td>
	</tr>
	<tr>
		<td><?php echo i18n("trigger_projectDock"); ?></td>
		<td>
			<toggle>
				<input id="project_openTrigger_click" data-setting="project.openTrigger" value="click" name="project.openTrigger" type="radio" checked />
				<label for="project_openTrigger_click"><?php echo i18n("click_single"); ?></label>
				<input id="project_openTrigger_dblclick" data-setting="project.openTrigger" value="dblclick" name="project.openTrigger" type="radio" />
				<label for="project_openTrigger_dblclick"><?php echo i18n("click_double"); ?></label>
			</toggle>
		</td>
	</tr>
	<!--<tr>-->
	<!--	<td><?php echo i18n("contextMenu_delay"); ?></td>-->
	<!--	<td>-->
	<!--		<select class="setting" data-setting="contextmenu.hoverDuration">-->
	<!--			<option value="0"><?php echo i18n("time_ms", 0); ?></option>-->
	<!--			<option value="300" default selected><?php echo i18n("time_ms_default", 300); ?></option>-->
	<!--			<option value="500"><?php echo i18n("time_ms", 500); ?></option>-->
	<!--			<option value="700"><?php echo i18n("time_ms", 700); ?></option>-->
	<!--		</select>-->
	<!--	</td>-->
	<!--</tr>-->
</table>