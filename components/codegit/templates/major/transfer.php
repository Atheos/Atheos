<div id="codegit_transfer" class="content">

	<?php
	$repo = Common::getWorkspacePath($repo);

	$remotes = $CodeGit->getRemotes($repo, $path);
	$branches = $CodeGit->getBranches($repo, $path);

	$status = $CodeGit->branchStatus($repo);

	$remoteOptions = array();
	$brancheOptions = '';

	$tableRemotes = array();
	$tableBranches = '';


	foreach ($remotes as $i => $item) {
		$item = preg_replace("(\(fetch\)|\(push\))", "", $item);
		$value = explode("\t", $item)[0];
		$remoteOptions[] = "<option value=\"$value\">$item</option>";

		$tableRemotes[] = "<tr data-value=\"$value\"><td><input type=\"text\" placeholder=\"$item\"></input></td><td><i class=\"fas fa-save\"></i><i class=\"fas fa-trash-alt\"></i></td></tr>";
	}

	$remoteOptions = array_unique($remoteOptions);
	$remoteOptions = implode("", $remoteOptions);

	$tableRemotes = array_unique($tableRemotes);
	$tableRemotes = implode("", $tableRemotes);

	foreach ($branches["branches"] as $i => $item) {
		if ($item === $branches["current"]) {
			$brancheOptions .= "<option selected value=\"$item\">$item</option>";
		} else {
			$brancheOptions .= "<option value=\"$item\">$item</option>";
		}
	}

	?>
	<!--<toolbar>-->
	<!--	<button onclick="atheos.codegit.newRemote();"><?php echo i18n("git_remote_new") ?></button>-->
	<!--	<button onclick="atheos.codegit.newBranch();"><?php echo i18n("git_branch_new") ?></button>-->
	<!--</toolbar>-->
	<!--<table>-->
	<!--	<?php echo $tableRemotes; ?>-->
	<!--</table>-->
	<!--<br />-->
	<toolbar>
		<button onclick="atheos.codegit.transfer('push');"><?php echo i18n("git_push") ?></button>
		<button onclick="atheos.codegit.transfer('pull');"><?php echo i18n("git_pull") ?></button>
		<button onclick="atheos.codegit.transfer('fetch');"><?php echo i18n("git_fetch") ?></button>
	</toolbar>
	<table>
		<tr>
			<td width="50%">Remote:</td>
			<td><select id="git_remotes">
				<?php echo $remoteOptions; ?>
			</select></td>
		</tr>
		<tr>
			<td width="50%">Branch:</td>
			<td><select id="git_branches">
				<?php echo $brancheOptions; ?>
			</select></td>
		</tr>
	</table>
	<hint id="git_transfer_text">
	</hint>
</div>