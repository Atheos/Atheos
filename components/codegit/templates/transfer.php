<div id="codegit_transfer" class="content">

	<?php
	$repo = Common::getWorkspacePath($repo);

	$remotes = $CodeGit->getRemotes($repo, $path);
	$branches = $CodeGit->getBranches($repo, $path);

	$status = $CodeGit->branchStatus($repo);

	$remoteOptions = array();
	$brancheOptions = '';

	$tableTransfer = array();

	$icons = "<i class=\"fas fa-pencil-alt\"></i><i class=\"fas fa-trash-alt\"></i>";
	$buttons = "<button disabled>" . i18n("edit") . "</button><button disabled>" . i18n("delete") . "</button>";

	if (is_array($remotes)) {
		foreach ($remotes as $i => $item) {
			$item = preg_replace("(\(fetch\)|\(push\))", "", $item);
			$value = explode("\t", $item)[0];
			$remoteOptions[] = "<option value=\"$value\">$item</option>";

			$tableTransfer[] = "<tr data-value=\"$value\"><td><input type=\"text\" placeholder=\"$item\"></input></td><td>$buttons</td></tr>";
		}
	} else {
		$remoteOptions[] = "<option disabled selected>No Remotes</option>";
	}

	$remoteOptions = array_unique($remoteOptions);
	$remoteOptions = implode("", $remoteOptions);

	$tableTransfer = array_unique($tableTransfer);
	$tableTransfer = implode("", $tableTransfer);

	if (is_array($branches["branches"])) {
		foreach ($branches["branches"] as $i => $item) {
			if ($item === $branches["current"]) {
				$brancheOptions .= "<option selected value=\"$item\">$item</option>";
			} else {
				$brancheOptions .= "<option value=\"$item\">$item</option>";
			}
		}
	} else {
		$brancheOptions = "<option disabled selected>No Branches</option>";
	}

	?>
	<!--<toolbar>-->
	<!--	<button onclick="atheos.codegit.newRemote();"><?php echo i18n("git_remote_new") ?></button>-->
	<!--	<button onclick="atheos.codegit.newBranch();"><?php echo i18n("git_branch_new") ?></button>-->
	<!--</toolbar>-->
	<label class="title"><i class="fas fa-cloud"></i><?php echo i18n("git_transfer"); ?></label>

	<table>
		<tr>
			<th>Remote</th>
			<th>Branch</th>
			<th>Actions</th>
		</tr>
		<tr>
			<td>
				<select id="git_remotes">
					<?php echo $remoteOptions; ?>
				</select>
			</td>
			<td>
				<select id="git_branches">
					<?php echo $brancheOptions; ?>
				</select>
			</td>
			<td>
				<button onclick="atheos.codegit.transfer('push');"><?php echo i18n("git_push") ?></button>
				<button onclick="atheos.codegit.transfer('pull');"><?php echo i18n("git_pull") ?></button>
				<button onclick="atheos.codegit.transfer('fetch');"><?php echo i18n("git_fetch") ?></button>
			</td>
		</tr>
	</table>
	<br />
	<br />
	<label class="title"><i class="fas fa-cogs"></i><?php echo i18n("git_transfer_edit"); ?></label>
	<table>
		<?php echo $tableTransfer; ?>
	</table>
	<hint id="git_transfer_text">
	</hint>
</div>