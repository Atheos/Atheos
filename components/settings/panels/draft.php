<label><i class="fas fa-save"></i><?php echo i18n("settings_draft"); ?></label>

<table>
	<tr>
		<td><?php echo i18n("draft_enable"); ?></td>
		<td>
			<toggle>
				<input id="draft_enabled_true" data-setting="draft.enabled" value="true" name="draft.enabled" type="radio" checked />
				<label for="draft_enabled_true"><?php echo i18n("enabled") ?></label>
				<input id="draft_enabled_false" data-setting="draft.enabled" value="false" name="draft.enabled" type="radio" />
				<label for="draft_enabled_false"><?php echo i18n("disabled"); ?></label>
			</toggle>
		</td>
	</tr>
	<tr>
		<td><?php echo i18n("draft_verbose"); ?></td>
		<td>
			<toggle>
				<input id="draft_verbose_true" data-setting="draft.verbose" value="true" name="draft.verbose" type="radio" />
				<label for="draft_verbose_true"><?php echo i18n("enabled") ?></label>
				<input id="draft_verbose_false" data-setting="draft.verbose" value="false" name="draft.verbose" type="radio" checked />
				<label for="draft_verbose_false"><?php echo i18n("disabled"); ?></label>
			</toggle>
		</td>
	</tr>	
	<tr>
		<td><?php echo i18n("draft_interval"); ?></td>
		<td>
			<select class="setting" data-setting="draft.interval">
				<option value="5000"><?php echo i18n("time_second_plural", 5); ?></option>
				<option value="30000"><?php echo i18n("time_second_plural", 30); ?></option>
				<option value="60000"><?php echo i18n("time_minute_single", 1); ?></option>
				<option value="300000" selected><?php echo i18n("time_minute_plural", 5); ?></option>
				<option value="600000"><?php echo i18n("time_minute_plural", 10); ?></option>
			</select>
		</td>
	</tr>
</table>