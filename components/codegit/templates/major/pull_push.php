<div id="codegit_push_pull" class="content">

	<?php
	$repo = $CodeGit->getWorkspacePath($repo);

	$remotes = $CodeGit->getRemotes($repo, $path);
	$branches = $CodeGit->loadLog($repo, $path);

	// $url = $CodeGit->repoURL . "/commit/";
	// onclick="window.open('<?php echo $url . $item["hash"]

	$remoteOptions = '';
	// $branches = '';

	foreach ($remotes as $i => $item) {
		// echo $item;
		$item = explode("\n", $item);
		foreach($item as $x => $line) {
			// if(preg_match("/^\* remote (.+)/")) {
				// $item = $line;
				echo $x . ":" .$line;
			// }
		}
		// echo $item[0];
		$remoteOptions .= "<option value=\"$item\">$item</option>";
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
			<td><select id="git_branches"></select></td>
		</tr>
	</table>
</div>