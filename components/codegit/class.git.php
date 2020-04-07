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
include_once "traits/remotes.php";
include_once "traits/settings.php";
include_once "traits/status.php";
include_once "traits/transfer.php";


class CodeGit {

	use Commit; // commit, add, showCommit
	use Branches; // getBranches, getCurrentBranch
	use Execute; // execute, parseCommandCodes
	use History; // loadLog, diff, blame
	use Remotes; // getRemotes
	use Settings; // getSettings
	use Status; // status, loadChanges, parseChanges, fileStatus
	use Transfer; // push, pull, fetch

	public $resultArray;
	public $result;

	private $path;
	private $repo;

	public $repoURL;

	function __construct($path = '', $repo = '') {
		$this->path = $path;
		if ($repo) {
			$this->repo = $repo;
		} else {
			$this->repo = $this->findRepo($path);
		}

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

	private function setGitSettings($path) {
		$settings = $this->getSettings($path);

		$username = $settings['username'];
		if (isset($settings['local_username'])) {
			$username = $settings['local_username'];
		}

		$email = $settings['email'];
		if (isset($settings['local_email'])) {
			$email = $settings['local_email'];
		}

		if (!empty($username)) {
			$result = $this->executeCommand('git config user.name "' . $username . '"');
			if ($result !== 0) {
				return false;
			}
		}
		if (!empty($email)) {
			$result = $this->executeCommand('git config user.email ' . $email);
			if ($result !== 0) {
				return false;
			}
		}
		return true;
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

	private function parseGitStatus() {
		$branch = "";
		$added = array();
		$deleted = array();
		$modified = array();
		$renamed = array();
		$untracked = array();

		foreach ($this->resultArray as $line) {
			$tag = substr($line, 0, 2);
			//Branch
			if (strpos($tag, "##") !== false) {
				$initialCommit = strpos($line, "Initial commit on");
				if ($initialCommit !== false) {
					$branch = substr($line, 21);
				} else {
					$sPos = strpos($line, " ", 3);
					$dPos = strpos($line, "...", 3);
					if (($sPos !== false) && ($dPos === false)) {
						$branch = substr($line, 2, $sPos-2);
					} else if ($dPos !== false) {
						$branch = substr($line, 2, $dPos-2);
					} else {
						$branch = substr($line, 2);
					}
				}
			}

			if (strpos($tag, "A") !== false) {
				//Added
				array_push($added, substr($line, 2));
			} else if (strpos($tag, "D") !== false) {
				//Deleted
				array_push($deleted, substr($line, 2));
			} else if (strpos($tag, "R") !== false) {
				//Renamed
				$rPos = strpos($line, "->") + 2;
				array_push($renamed, substr($line, $rPos));
			} else if (strpos($tag, "M") !== false || strpos($tag, "U") !== false) {
				//Modified
				array_push($modified, substr($line, 2));
			} else if (strpos($tag, "??") !== false) {
				//Untracked
				array_push($untracked, substr($line, 3));
			}
		}
		//Remove whitespace
		$branch = trim($branch);
		foreach ($added as $index => $file) {
			$added[$index] = trim($file);
		}
		foreach ($deleted as $index => $file) {
			$deleted[$index] = trim($file);
		}
		foreach ($modified as $index => $file) {
			$modified[$index] = trim($file);
		}
		foreach ($renamed as $index => $file) {
			$renamed[$index] = trim($file);
		}
		foreach ($untracked as $index => $file) {
			$untracked[$index] = trim($file);
		}
		//Delete douple entries
		$buffer = array();
		foreach ($added as $file) {
			if (!in_array($file, $modified)) {
				array_push($buffer, $file);
			}
		}
		$added = $buffer;

		return array("branch" => $branch, "added" => $added, "deleted" => $deleted,
			"modified" => $modified, "renamed" => $renamed, "untracked" => $untracked);
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

	public function getWorkspacePath($path) {
		//Security check
		if (!Common::checkPath($path)) {
			die('{"status":"error","message":"Invalid path, "path":"' . $path . '"}');
		}
		if (strpos($path, "/") === 0) {
			//Unix absolute path
			return $path;
		}
		if (strpos($path, ":/") !== false) {
			//Windows absolute path
			return $path;
		}
		if (strpos($path, ":\\") !== false) {
			//Windows absolute path
			return $path;
		}
		return WORKSPACE."/".$path;
	}
}
?>