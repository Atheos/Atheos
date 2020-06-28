<div id="codegit_push_pull" class="content">

	<?php
	$repo = Common::getWorkspacePath($repo);

	$remotes = $CodeGit->getRemotes($repo, $path);
	$branches = $CodeGit->getBranches($repo, $path);

	$status = $CodeGit->branchStatus($repo);

	$remoteOptions = array();
	$brancheOptions = '';


	foreach ($remotes as $i => $item) {
		$item = preg_replace("(\(fetch\)|\(push\))", "", $item);
		$value = explode("\t", $item)[0];
		$remoteOptions[] = "<option value=\"$value\">$item</option>";
	}

	$remoteOptions = array_unique($remoteOptions);
	$remoteOptions = implode("", $remoteOptions);

	foreach ($branches["branches"] as $i => $item) {
		if ($item === $branches["current"]) {
			$brancheOptions .= "<option selected value=\"$item\">$item</option>";
		} else {
			$brancheOptions .= "<option value=\"$item\">$item</option>";
		}
	}

	?>

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
	<pre>
		<?php echo $status["data"]; ?>
	</pre>
	<toolbar>
		<button onclick="atheos.codegit.transfer('push'); return false;"><?php echo i18n("git_push") ?></button>
		<button onclick="atheos.codegit.transfer('pull'); return false;"><?php echo i18n("git_pull") ?></button>
		<button onclick="atheos.codegit.transfer('fetch'); return false;"><?php echo i18n("git_fetch") ?></button>
	</toolbar>
</div>