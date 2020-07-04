<label><i class="fas fa-code-branch"></i><?php echo i18n("settings_codegit"); ?></label>
<table>
	<tr>
		<td>
			<?php echo i18n("codegit_banner"); ?>
		</td>
		<td>
			<toggle>
				<input id="codegit_repoBanner_enabled" data-setting="codegit.repoBanner" value="enabled" name="codegit.repoBanner" type="radio" checked/>
				<label for="codegit_repoBanner_enabled"><?php echo i18n("enabled"); ?></label>			
				<input id="codegit_repoBanner_disabled" data-setting="codegit.repoBanner" value="disabled" name="codegit.repoBanner" type="radio"  />
				<label for="codegit_repoBanner_disabled"><?php echo i18n("disabled"); ?></label>
			</toggle>				
		</td>
	</tr>
	<tr>
		<td>
			<?php echo i18n("codegit_status"); ?>
		</td>
		<td>
			<toggle>
				<input id="codegit_fileStatus_enabled" data-setting="codegit.fileStatus" value="enabled" name="codegit.fileStatus" type="radio" checked/>
				<label for="codegit_fileStatus_enabled"><?php echo i18n("enabled"); ?></label>			
				<input id="codegit_fileStatus_disabled" data-setting="codegit.fileStatus" value="disabled" name="codegit.fileStatus" type="radio"  />
				<label for="codegit_fileStatus_disabled"><?php echo i18n("disabled"); ?></label>
			</toggle>					
		</td>
	</tr>
</table>