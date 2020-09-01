<?php
// Copyright (c) Codiad & Andr3as, distributed
// as-is and without warranty under the MIT License.
// See http://opensource.org/licenses/MIT for more information.
// This information must remain intact.

require_once('class.git.php');

$path = POST('path');
$repo = POST('repo');

$CodeGit = new CodeGit($path, $repo);

if ($action === "loadPanel") {
	$panel = POST('panel');

	switch ($panel) {
		case 'blame': //Checked
			include('templates/major/blame.php');
			break;
		case 'diff': //Checked
			include('templates/major/diff.php');
			break;
		case 'log': //Checked
			include('templates/major/log.php');
			break;
		case 'transfer': //Checked
			include('templates/major/transfer.php');
			break;
		case 'config':
			include('templates/major/configure.php');
			break;
		default:
			include('templates/major/overview.php');
			break;
	}
} elseif ($action === "codegit") {
	$status = $CodeGit->branchStatus($repo);
	?>
	<label class="title"><i class="fas fa-code-branch"></i><?php echo i18n("codegit"); ?></label>
	<div id="codegit">
		<menu>
			<li>
				<a data-panel="overview" class="active"><i class="fas fa-home"></i><?php echo i18n("overview"); ?></a>
			</li>
			<li>
				<a data-panel="log"><i class="fas fa-history"></i><?php echo i18n("log"); ?></a>
			</li>
			<li>
				<a data-panel="transfer"><i class="fas fa-cloud"></i><?php echo i18n("transfer"); ?></a>
			</li>
			<li>
				<a data-panel="config"><i class="fas fa-user-cog"></i><?php echo i18n("configure"); ?></a>
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
} else {
	switch ($action) {
		case 'clone': //Checked
			include('templates/minor/clone.php');
			break;
	}
}