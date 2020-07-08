<label class="title"><i class="fa fa-code-branch"></i> <?php echo i18n("git_clone"); ?></label>
<form>
	<p>
		<?php echo i18n("git_repoURL"); ?>
	</p>
	<input type="text" name="clone" autofocus="autofocus" autocomplete="off">
	<button class="btn-left"><?php echo i18n("git_clone"); ?></button>
	<button class="btn-right" onclick="atheos.modal.unload(); return false;"><?php echo i18n("cancel"); ?></button>
</form>