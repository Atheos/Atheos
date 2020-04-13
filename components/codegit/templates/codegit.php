<?php

require_once('class.git.php');

$action = Common::data('action');
$path = Common::data('path');
$panel = Common::data('panel');
$repo = Common::data('repo');

$CodeGit = new CodeGit($path, $repo);

if ($action === "loadPanel") {

	switch ($panel) {
		case 'blame':
			include('minor/blame.php');
			break;
		case 'commit':
			include('major/commit.html');
			break;
		case 'diff':
			include('minor/diff.php');
			break;
		case 'log':
			include('major/log.php');
			break;
		case 'pull_push':
			include('major/pull_push.php');
			break;
		case 'remote':
			include('major/remote.html');
			break;
		default:
			include('major/overview.php');
			break;
	}
} else {
	?>
	<h1><i class="fas fa-code-branch"></i><?php i18n("CodeGit"); ?></h1>
	<label>Branch: <span id="codegit_branch"><?php echo $CodeGit->getCurrentBranch(); ?></span>/<span id="codegit_status"><?php echo $CodeGit->status($repo); ?></span></label>
	<div id="codegit">
		<ul id="panel_menu">
			<li>
				<a data-panel="overview" class="active"><i class="fas fa-home"></i><?php i18n("Overview"); ?></a>
			</li>
			<li>
				<a data-panel="log"><i class="fas fa-history"></i><?php i18n("Log"); ?></a>
			</li>
			<li>
				<a data-panel="remotes"><i class="fas fa-cloud"></i><?php i18n("Remotes"); ?></a>
			</li>
			<li>
				<a data-panel="pull_push"><i class="fas fa-sync-alt"></i><?php i18n("Pull/Push"); ?></a>
			</li>
			<li>
				<a data-panel="user_config"><i class="fas fa-user-cog"></i><?php i18n("User Config"); ?></a>
			</li>
		</ul>
		<div id="panel_view" class="panel">
			<?php	include('major/overview.php'); ?>
		</div>
	</div>
	<?php
}