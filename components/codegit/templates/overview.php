<div id="codegit_overview" class="content">
	<input type="text" id="commit_message" placeholder="Enter commit message here...">
	<button onclick="atheos.codegit.commit();">Commit</button>
	<table>
		<?php
		$repo = Common::getWorkspacePath($repo);
		$changes = $CodeGit->loadChanges($repo);
		?>

		<thead>
			<tr>
				<th><input group="cg_overview" parent="true" type="checkbox" class="large"></th>
				<th>Status</th>
				<th>File</th>
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>
			<?php
			if (is_array($changes)) {
				foreach ($changes as $key => $array) {
					if (is_array($array) && count($array) < 1) continue;
					foreach ($array as $line => $file) {
						?>
						<tr data-file="<?php echo $file ?>">
							<td>
								<input group="cg_overview" type="checkbox" class="large">
							</td>
							<td class="<?php echo $key ?>"><?php echo $key ?></td>
							<td class="file"><?php echo $file ?></td>
							<td>
								<button class="git_diff">Diff</button>
								<button class="git_undo">Undo</button>
							</td>
						</tr>
						<?php
					}
				}
			} ?>
		</tbody>
	</table>
</div>