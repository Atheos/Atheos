<div id="codegit_overview" class="content">
	<input type="text" id="commit_message" placeholder="<?php echo i18n("git_commit_message") ?>">
	<button onclick="atheos.codegit.commit(false);"><?php echo i18n("git_commit") ?></button>
	<button onclick="atheos.codegit.commit(true);"><?php echo i18n("git_amend") ?></button>
	<table>
		<?php
		$repo = Common::getWorkspacePath($repo);
		$changes = $CodeGit->loadChanges($repo);
		?>

		<thead>
			<tr>
				<th><input group="cg_overview" parent="true" type="checkbox" class="large"></th>
				<th><?php echo i18n("git_objects_status") ?></th>
				<th><?php echo i18n("git_objects_file") ?></th>
				<th><?php echo i18n("git_objects_actions") ?></th>
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
								<button class="git_diff" data-button="diff"><?php echo i18n("git_objects_actions_diff") ?></button>
								<button class="git_undo" data-button="undo"><?php echo i18n("git_objects_actions_undo") ?></button>
							</td>
						</tr>
						<?php
					}
				}
			} ?>
		</tbody>
	</table>
</div>