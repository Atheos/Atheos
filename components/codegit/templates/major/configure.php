<?php
$settings = $CodeGit->settings($repo);
?>

<div id="codegit_configure" class="content">
	<label class="title"><i class="fas fa-user-cog"></i><?php echo i18n("configure"); ?></label>

	<table>
		<tr>
			<td>
				<fieldset id="global">
					<legend>Global settings (WIP)</legend>
					<label for="global_name">Name</label>
					<input type="text" name="global_name" id="global_name" placeholder="<?php echo $settings["global"]["name"][0] ?>" disabled>
					<label for="global_email">E-Mail</label>
					<input type="text" name="global_email" id="global_email" placeholder="<?php echo $settings["global"]["email"][0] ?>" disabled>
					<button onclick="atheos.codegit.configure('global');"  disabled><?php echo i18n("update") ?></button>
				</fieldset>
			</td>
			<td>
				<fieldset id="local">
					<legend>Local settings for <?php echo $repo ?></legend>
					<label for="local_name">Name</label>
					<input type="text" name="local_name" id="local_name" placeholder="<?php echo $settings["local"]["name"][0] ?>">
					<label for="local_email">E-Mail</label>
					<input type="text" name="local_email" id="local_email" placeholder="<?php echo $settings["local"]["email"][0] ?>">
					<button onclick="atheos.codegit.configure('local');"><?php echo i18n("update") ?></button>

				</fieldset>
			</td>
		</tr>
	</table>
</div>
<hint>These settings are pulled from Git</hint>