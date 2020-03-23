<!--<label>Status: <span class="git_area_path"></span></label>-->
<!--<header>-->
<!--	<button onclick="atheos.codegit.showDialog('overview', atheos.codegit.location); return false;">Overview</button>-->
<!--	<button onclick="atheos.codegit.showCommitDialog(); return false;">Commit</button>-->
<!--<button onclick="atheos.codegit.showDialog('branches', atheos.codegit.location); return false;">Branches</button>-->
<!--	<button onclick="atheos.codegit.showDialog('remote', atheos.codegit.location); return false;">Remotes</button>-->
<!--	<button onclick="atheos.codegit.showDialog('log', atheos.codegit.location); return false;">Log</button>-->
<!--	<button onclick="atheos.codegit.showDialog('push', atheos.codegit.location); return false;">Pull/Push</button>-->
<!--<button onclick="atheos.codegit.showDialog('userConfig', atheos.codegit.location); return false;">User config</button>-->

<!--</header>-->

<?php
require_once('class.git.php');

$action = Common::post('action') ?: Common::get('action');
$path = Common::post('path') ?: Common::get('path');
$panel = Common::post('panel') ?: Common::get('panel');
$repo = Common::post('repo') ?: Common::get('repo');

$CodeGit = new Git($path, $repo);

if ($action === "loadPanel") {

	switch ($panel) {
		case 'commit':
			include('major/commit.html');
			break;
		case 'log':
			include('major/log.php');
			break;
		case 'push':
			include('major/push.html');
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
	<label>Branch: <span id="codegit_branch"><?php echo $CodeGit->getCurrentBranch(); ?></span>/<span id="codegit_status"></span></label>
	<div id="codegit">
		<!--<div class="panels-components">-->
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

			<button class="bottom" onclick="return false;"><?php i18n("Commit"); ?></button>
		</ul>
		<div id="panel_view" class="panel">
			<?php	include('major/overview.php'); ?>
		</div>
	</div>
	<?php
}