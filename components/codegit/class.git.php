<?php
/*
 * Copyright (c) Codiad & Andr3as, distributed
 * as-is and without warranty under the MIT License.
 * See http://opensource.org/licenses/MIT for more information.
 * This information must remain intact.
 */
/* Define authentication program */
define("shellProgram", "expect");
//define("shellProgram","empty"); //DO NOT USE, empty will be added in a future version
//define("shellProgram","python");

function getConfig() {
	return array();
}

include_once "traits/branches.php";
include_once "traits/commit.php";
include_once "traits/execute.php";
include_once "traits/history.php";
include_once "traits/initialize.php";
include_once "traits/remotes.php";
include_once "traits/settings.php";
include_once "traits/status.php";
include_once "traits/transfer.php";

class CodeGit {

	use Commit; // commit, add, showCommit
	use Branches; // getBranches, getCurrentBranch
	use Execute; // execute, parseCommandCodes
	use History; // loadLog, diff, blame
	use Initialize; // initRepo, initSubMod
	use Remotes; // getRemotes
	use Settings; // getSettings
	use Status; // status, loadChanges, parseChanges, fileStatus
	use Transfer; // push, pull, fetch

	public $resultArray;
	public $result;

	private $path;
	private $repo;

	public $repoURL;

	function __construct($path = '', $repo = false) {
		$this->path = $path;
		$this->repo = $repo ? $repo : $this->findRepo($path);

		if (!is_dir($this->repo)) {
			Common::sendJSON("error", i18n("path_missing")); die;
		}
		chdir($this->repo);
		$this->setGitSettings($this->repo);

		foreach (getConfig() as $name => $value) {
			$result = $this->executeCommand("git config " . $name . " " . $value);
		}
	}

	public function findRepo($path) {
		$path = $this->path;
		if (!is_dir($path)) {
			$path = pathinfo($path, PATHINFO_DIRNAME);
		}
		$repo = file_exists($path . "/.git");
		$iter = 0;
		while (!$repo && $iter < 10) {
			if ($repo) break;
			$path = pathinfo($path, PATHINFO_DIRNAME);
			$repo = file_exists($path . "/.git");
			$iter++;
		}
		if ($repo) {
			return $path;
		} else {
			return false;
		}
	}

	private function returnMessage($status, $msg) {
		return '{"status":"' . $status . '","message":"' . $msg . '"}';
	}

	private function parseShellResult($result, $success, $error) {
		if ($result === null) {
			return $error;
		}
		if ($result === 0) {
			return $this->returnMessage("success", $success);
		} else {
			if ($result === 64) {
				return $this->returnMessage("error", $this->result);
			} else if ($result == 3 || $result == 4) {
				return $this->returnMessage("login_required", "Login required!");
			} else if ($result == 7) {
				return $this->returnMessage("passphrase_required", "passphrase_required");
			} else {
				if (strpos($this->result, "fatal: ") !== false) {
					$error = substr($this->result, strpos($this->result, "fatal: ") + strlen("fatal: "));
				}
				return $this->returnMessage("error", $error);
			}
		}
	}

	// The new parsing status function
	private function parseChanges($array) {
		$added = array();
		$deleted = array();
		$modified = array();
		$renamed = array();
		$untracked = array();

		foreach ($array as $line) {
			$tag = substr($line, 0, 2);

			if (strpos($tag, "A") !== false) {
				//Added
				$line = trim(substr($line, 2));
				array_push($added, $line);
			} else if (strpos($tag, "D") !== false) {
				//Deleted
				$line = trim(substr($line, 2));

				array_push($deleted, $line);
			} else if (strpos($tag, "R") !== false) {
				//Renamed
				$rPos = strpos($line, "->") + 2;
				$line = trim(substr($line, $rpos));
				array_push($renamed, $line);
			} else if (strpos($tag, "M") !== false || strpos($tag, "U") !== false) {
				//Modified
				$line = trim(substr($line, 2));
				array_push($modified, $line);
			} else if (strpos($tag, "??") !== false) {
				//Untracked
				$line = trim(substr($line, 3));
				array_push($untracked, $line);
			}
		}

		//Delete double entries
		// $buffer = array();
		// foreach ($added as $file) {
		// 	if (!in_array($file, $modified)) {
		// 		array_push($buffer, $file);
		// 	}
		// }
		// $added = $buffer;

		return array(
			"added" => $added,
			"deleted" => $deleted,
			"modified" => $modified,
			"renamed" => $renamed,
			"untracked" => $untracked
		);
	}
}
?>