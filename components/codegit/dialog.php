<?php
// Copyright (c) Codiad & Andr3as, distributed
// as-is and without warranty under the MIT License.
// See http://opensource.org/licenses/MIT for more information.
// This information must remain intact.

require_once('../../common.php');


switch (Common::get('action')) {
	case 'branches':
		include('templates/minor/branch.html');
		break;
	case 'clone':
		include('templates/minor/clone.html');
		break;
	case 'login':
		include('templates/minor/login.html');
		break;
	case 'newBranch':
		include('templates/minor/newBranch.html');
		break;
	case 'newRemote':
		include('templates/minor/newRemote.html');
		break;
	case 'passphrase':
		include('templates/minor/passphrase.html');
		break;
	case 'renameBranch':
		include('templates/minor/renameBranch.html');
		break;
	case 'renameRemote':
		include('templates/minor/renameRemote.html');
		break;
	case 'checkoutRemote':
		include('templates/minor/checkoutRemote.html');
		break;
	case 'settings':
		include('templates/minor/settings.html');
		break;
	case 'showCommit':
		include('templates/minor/showCommit.html');
		break;
	case 'submodule':
		include('templates/minor/submodule.html');
		break;
	case 'userConfig':
		include('templates/minor/userConfig.html');
		break;
	default:
		include('templates/codegit.php');
		break;
}
?>