<label class="title"><i class="fas fa-history"></i><?php echo i18n("codegit_log"); ?></label>
<ul id="codegit_log" class="content">
	<?php
	$repo = Common::getWorkspacePath($repo);
	$log = $CodeGit->loadLog($repo, $path);

	// $url = $CodeGit->repoURL . "/commit/";
	// onclick="window.open('<?php echo $url . $item["hash"]

	foreach ($log as $i => $item) {
		?>
		<li class="commit">
			<p class="hash">
				Commit: <span><?php echo $item["hash"]; ?></span>
			</p>
			<p class="date">
				<?php echo $item["date"]; ?>
			</p>
			<p class="author">
				Author: <span><?php echo $item["author"] . " &lt;" . $item["email"] . "&gt;"; ?></span>
			</p>
			<p class="message">
				<?php echo stripslashes($item["message"]); ?>
			</p>
		</li>
		<?php
	}
	?>
</ul>