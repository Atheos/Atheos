<?php
$localRepo = false; // basename `git rev-parse --show-toplevel`

$settings = $CodeGit->settings($repo);

?>


<label class="title"><i class="fas fa-git-branch"></i><?php echo i18n("configure"); ?></label>

<div id="codegit_configure" class="content">
	<fieldset id="remote">
		<legend>Global<span> - Global for all repositories</span></legend>
		<label for="global_username">Username</label>
		<input type="text" name="global_username" id="global_username" placeholder="<?php echo $settings["name"]?>">
		<label for="global_email">E-Mail</label>
		<input type="text" name="global_email" id="global_email" placeholder="<?php echo $settings["email"]?>">
	</fieldset>

	<!--<fieldset id="local">-->
	<!--	<legend>Local<span> - for <?php echo $localRepo ?></span></legend>-->
	<!--	<label for="local_username">Username</label>-->
	<!--	<input type="text" name="local_username" id="local_username" class="local">-->
	<!--	<label for="local_email">E-Mail</label>-->
	<!--	<input type="text" name="local_email" id="local_email" class="local">-->
	<!--</fieldset>-->
</div>