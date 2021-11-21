<label><i class="fas fa-comments"></i><?php echo i18n("settings_feedback"); ?></label>

<table>
	<!-- TOAST //////////////////////////////////////////////////////////////-->

	<tr>
		<td width="50%"><?php echo i18n("toast_location"); ?></td>
		<td>
			<select class="setting" data-setting="toast.location">
				<option value="top left"><?php echo i18n("location_tl"); ?></option>
				<option value="top center"><?php echo i18n("location_tc"); ?></option>
				<option value="top right"><?php echo i18n("location_tr"); ?></option>				
				<option value="bottom left"><?php echo i18n("location_bl"); ?></option>
				<option value="bottom center"><?php echo i18n("location_bc"); ?></option>
				<option value="bottom right" selected><?php echo i18n("location_br"); ?></option>
			</select>
		</td>
	</tr>
	<tr>
		<td><?php echo i18n("toast_stay_success"); ?></td>
		<td>
			<select class="setting" data-setting="toast.stay.success">
				<option value="3000" selected><?php echo i18n("time_second_plural", 3); ?></option>
				<option value="5000"><?php echo i18n("time_second_plural", 5); ?></option>
				<option value="10000"><?php echo i18n("time_second_plural", 10); ?></option>
				<option value="false"><?php echo i18n("manual"); ?></option>
			</select>
		</td>
	</tr>
	<tr>
		<td><?php echo i18n("toast_stay_warning"); ?></td>
		<td>
			<select class="setting" data-setting="toast.stay.warning">
				<option value="3000"><?php echo i18n("time_second_plural", 3); ?></option>
				<option value="5000" selected><?php echo i18n("time_second_plural", 5); ?></option>
				<option value="10000"><?php echo i18n("time_second_plural", 10); ?></option>
				<option value="false"><?php echo i18n("manual"); ?></option>
			</select>
		</td>
	</tr>
	<tr>
		<td><?php echo i18n("toast_stay_error"); ?></td>
		<td>
			<select class="setting" data-setting="toast.stay.error">
				<option value="3000"><?php echo i18n("time_second_plural", 3); ?></option>
				<option value="5000"><?php echo i18n("time_second_plural", 5); ?></option>
				<option value="10000" selected><?php echo i18n("time_second_plural", 10); ?></option>
				<option value="false"><?php echo i18n("manual"); ?></option>
			</select>
		</td>
	</tr>

	<!-- OUTPUT /////////////////////////////////////////////////////////////-->
	<tr>
		<td width="50%"><?php echo i18n("output_location"); ?></td>
		<td>
			<select class="setting" data-setting="output.location">
				<option value="top left"><?php echo i18n("location_tl"); ?></option>
				<option value="top center"><?php echo i18n("location_tc"); ?></option>
				<option value="top right"><?php echo i18n("location_tr"); ?></option>
				<option value="bottom left" selected><?php echo i18n("location_bl"); ?></option>
				<option value="bottom center"><?php echo i18n("location_bc"); ?></option>
				<option value="bottom right"><?php echo i18n("location_br"); ?></option>
			</select>
		</td>
	</tr>
		<tr>
		<td><?php echo i18n("output_stay_success"); ?></td>
		<td>
			<select class="setting" data-setting="output.stay.success">
				<option value="3000" selected><?php echo i18n("time_second_plural", 3); ?></option>
				<option value="5000"><?php echo i18n("time_second_plural", 5); ?></option>
				<option value="10000"><?php echo i18n("time_second_plural", 10); ?></option>
				<option value="false"><?php echo i18n("manual"); ?></option>
			</select>
		</td>
	</tr>
	<tr>
		<td><?php echo i18n("output_stay_warning"); ?></td>
		<td>
			<select class="setting" data-setting="output.stay.warning">
				<option value="3000"><?php echo i18n("time_second_plural", 3); ?></option>
				<option value="5000" selected><?php echo i18n("time_second_plural", 5); ?></option>
				<option value="10000"><?php echo i18n("time_second_plural", 10); ?></option>
				<option value="false"><?php echo i18n("manual"); ?></option>
			</select>
		</td>
	</tr>
	<tr>
		<td><?php echo i18n("output_stay_error"); ?></td>
		<td>
			<select class="setting" data-setting="output.stay.error">
				<option value="3000"><?php echo i18n("time_second_plural", 3); ?></option>
				<option value="5000"><?php echo i18n("time_second_plural", 5); ?></option>
				<option value="10000" selected><?php echo i18n("time_second_plural", 10); ?></option>
				<option value="false"><?php echo i18n("manual"); ?></option>
			</select>
		</td>
	</tr>
</table>