<?php


trait Execute {

	private function execute($cmd) {
		$cmd = escapeshellcmd($cmd);
		//Allow #
		$cmd = str_replace("\#", "#", $cmd);
		$cmd = str_replace("\(", "(", $cmd);
		$cmd = str_replace("\)", ")", $cmd);

		$result = array();

		exec($cmd . ' 2>&1', $result, $code);

		return array(
			"status" => $code === 0,
			"code" => $this->parseCommandCodes($code),
			"data" => array_filter($result)
		);
	}

	private function parseCommandCodes($code) {

		switch ($code) {
			case 0:
				return true;
				break;
			case 1:
				return false;
				break;
			default:
				return $code;
				break;
		}
	}

	private function executeCommand($cmd) {
		$cmd = escapeshellcmd($cmd);
		//Allow #
		$cmd = str_replace("\#", "#", $cmd);
		$cmd = str_replace("\(", "(", $cmd);
		$cmd = str_replace("\)", ")", $cmd);
		exec($cmd. ' 2>&1', $array, $result);

		$this->resultArray = array_filter($array);
		return $result;
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

	private function checkExecutableFile() {
		$program = $this->getShellProgram();
		if (shellProgram === "expect" || shellProgram === "empty") {
			if (!is_executable ($program) && !chmod($program, 0755)) {
				return false;
			}
		}
		return true;
	}

	private function checkShellProgramExists() {
		if (shellProgram === "expect") {
			if (`which expect`) {
				return true;
			}
		} else if (shellProgram === "empty") {
			if (`which empty`) {
				return true;
			}
		} else if (shellProgram === "python") {
			if (`which python`) {
				exec('python ./scripts/python.py --test', $output, $return_var);
				if ($return_var === 0) {
					return true;
				}
			}
		}
		return false;
	}

	private function getShellProgram() {
		if (shellProgram == "expect") {
			return "./scripts/expect.sh";
		} else if (shellProgram == "empty") {
			return "./scripts/empty.sh";
		} else if (shellProgram == "python") {
			return "python ./scripts/python.py";
		}
	}
}