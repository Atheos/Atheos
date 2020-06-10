<?php
// Copyright (c) Codiad & Andr3as, distributed
// as-is and without warranty under the MIT License.
// See http://opensource.org/licenses/MIT for more information.
// This information must remain intact.

require_once('../../common.php');
require_once('class.git.php');

$action = Common::data('action');
$path = Common::data('path');
$panel = Common::data('panel');
$repo = Common::data('repo');

$CodeGit = new CodeGit($path, $repo);

if ($action === "loadPanel") {

	switch ($panel) {
		case 'blame': //Checked
			include('templates/minor/blame.php');
			break;
		case 'diff': //Checked
			include('templates/minor/diff.php');
			break;
		case 'log': //Checked
			include('templates/major/log.php');
			break;
		case 'transfer': //Checked
			include('templates/major/transfer.php');
			break;
		case 'config':
			include('templates/major/config.php');
			break;
		default:
			include('templates/major/overview.php');
			break;
	}
} else {
	$status = $CodeGit->branchStatus($repo);
	$status = is_array($status) ? $status["status"] : $status;
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
			<?php include('templates/major/overview.php'); ?>
		</panel>
	</div>
	<toolbar>
		<label>Branch: <span id="codegit_branch"><?php echo $CodeGit->getCurrentBranch(); ?></span><span id="codegit_status">(<?php echo $status; ?>)</span></label>
	</toolbar>
	<?php
}