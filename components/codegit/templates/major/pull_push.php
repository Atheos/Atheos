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
	<button onclick="atheos.codegit.push(); return false;">Push</button>
	<button onclick="atheos.codegit.pull(); return false;">Pull</button>
	<table>
		<tr>
			<td>Remote:</td>
			<td><select id="git_remotes">
				<?php echo $remoteOptions; ?>
			</select></td>
		</tr>
		<tr>
			<td>Branch:</td>
			<td><select id="git_branches">
				<?php echo $brancheOptions; ?>
			</select></td>
		</tr>
	</table>
</div>