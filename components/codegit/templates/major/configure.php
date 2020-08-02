<?php
$settings = $CodeGit->settings($repo);

$global_name = isset($settings["global"]["name"]) ? $settings["global"]["name"] : "";
$global_email = isset($settings["global"]["email"]) ? $settings["global"]["email"] : "";
$local_name = isset($settings["local"]["name"]) ? $settings["local"]["name"] : "";
$local_email = isset($settings["local"]["email"]) ? $settings["local"]["email"] : "";

?>

<div id="codegit_configure" class="content">
	<label class="title"><i class="fas fa-user-cog"></i><?php echo i18n("configure"); ?></label>
	<table>
		<tr>
			<td>
				<fieldset id="global">
					<legend><?php echo i18n("git_settings_global")?></legend>
					<label for="global_name"><?php echo i18n("name")?></label>
					<input type="text" name="global_name" id="global_name" placeholder="<?php echo $global_name ?>">
					<label for="global_email"><?php echo i18n("email")?></label>
					<input type="text" name="global_email" id="global_email" placeholder="<?php echo $global_email ?>">
					<button onclick="atheos.codegit.configure('global');"><?php echo i18n("update") ?></button>
					<button onclick="atheos.codegit.configure('clear_global');"><?php echo i18n("clear") ?></button>
				</fieldset>
			</td>
			<td>
				<fieldset id="local">
					<legend><?php echo i18n("git_settings_local", $repo)?></legend>
					<label for="local_name"><?php echo i18n("name")?></label>
					<input type="text" name="local_name" id="local_name" placeholder="<?php echo $local_name ?>">
					<label for="local_email"><?php echo i18n("email")?></label>
					<input type="text" name="local_email" id="local_email" placeholder="<?php echo $local_email ?>">
					<button onclick="atheos.codegit.configure('local');"><?php echo i18n("update") ?></button>
					<button onclick="atheos.codegit.configure('clear_local');"><?php echo i18n("clear") ?></button>
				</fieldset>
			</td>
		</tr>
	</table>
</div>