<div id="codegit_push_pull" class="content">

	<?php
	$repo = $CodeGit->getWorkspacePath($repo);

	$remotes = $CodeGit->getRemotes($repo, $path);
	$branches = $CodeGit->getBranches($repo, $path);

	$remoteOptions = array();
	$brancheOptions = '';
	
	
	foreach ($remotes as $i => $item) {
		$item = preg_replace("(\(fetch\)|\(push\))", "", $item);
		$remoteOptions[] = "<option value=\"$item\">$item</option>";
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
	<button onclick="atheos.codegit.push(); return false;"><?php i18n("Push") ?></button>
	<button onclick="atheos.codegit.pull(); return false;"><?php i18n("Pull") ?></button>
	<button onclick="atheos.codegit.fetch(); return false;"><?php i18n("Fetch") ?></button>
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
</div>