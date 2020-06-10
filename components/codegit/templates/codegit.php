<?php

require_once('class.git.php');

$action = Common::data('action');
$path = Common::data('path');
$panel = Common::data('panel');
$repo = Common::data('repo');

$CodeGit = new CodeGit($path, $repo);

if ($action === "loadPanel") {

	switch ($panel) {
		case 'blame': //Checked
			include('minor/blame.php');
			break;
		case 'diff': //Checked
			include('minor/diff.php');
			break;
		case 'log': //Checked
			include('major/log.php');
			break;
		case 'transfer': //Checked
			include('major/transfer.php');
			break;
		case 'config':
			include('major/config.php');
			break;
		default:
			include('major/overview.php');
			break;
	}
} else {
	$status = $CodeGit->branchStatus($repo)["status"];
	?>
	<label class="title"><i class="fas fa-code-branch"></i><?php i18n("CodeGit"); ?></label>
	<div id="codegit">
		<menu>
			<li>
				<a data-panel="overview" class="active"><i class="fas fa-home"></i><?php i18n("Overview"); ?></a>
			</li>
			<li>
				<a data-panel="log"><i class="fas fa-history"></i><?php i18n("Log"); ?></a>
			</li>
			<li>
				<a data-panel="transfer"><i class="fas fa-cloud"></i><?php i18n("Transfer"); ?></a>
			</li>
			<li>
				<a data-panel="config"><i class="fas fa-user-cog"></i><?php i18n("Configure"); ?></a>
			</li>
		</menu>
		<panel>
			<?php	include('major/overview.php'); ?>
		</panel>
	</div>
	<toolbar>
		<label>Branch: <span id="codegit_branch"><?php echo $CodeGit->getCurrentBranch(); ?></span><span id="codegit_status">(<?php echo $status; ?>)</span></label>
	</toolbar>
	<?php
}