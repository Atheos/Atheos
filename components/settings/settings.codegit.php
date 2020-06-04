<?php require_once('../../common.php'); ?>

<label><i class="fas fa-code-branch"></i><?php i18n("CodeGit Settings"); ?></label>
<table>
	<tr>
		<td>
			<?php i18n("FileManager Git Banner"); ?>
		</td>
		<td>
			<toggle>
				<input id="codegit_repoBanner_enabled" data-setting="codegit.repoBanner" value="enabled" name="codegit.repoBanner" type="radio" checked/>
				<label for="codegit_repoBanner_enabled"><?php i18n("Enabled"); ?></label>			
				<input id="codegit_repoBanner_disabled" data-setting="codegit.repoBanner" value="disabled" name="codegit.repoBanner" type="radio"  />
				<label for="codegit_repoBanner_disabled"><?php i18n("Disabled"); ?></label>
			</toggle>				
		</td>
	</tr>
	<tr>
		<td>
			<?php i18n("Git File Status"); ?>
		</td>
		<td>
			<toggle>
				<input id="codegit_fileStatus_enabled" data-setting="codegit.fileStatus" value="enabled" name="codegit.fileStatus" type="radio" checked/>
				<label for="codegit_fileStatus_enabled"><?php i18n("Enabled"); ?></label>			
				<input id="codegit_fileStatus_disabled" data-setting="codegit.fileStatus" value="disabled" name="codegit.fileStatus" type="radio"  />
				<label for="codegit_fileStatus_disabled"><?php i18n("Disabled"); ?></label>
			</toggle>					
		</td>
	</tr>
</table>