<?php


trait Execute {

	private function execute($cmd) {
		$cmd = escapeshellcmd($cmd);
		//Allow #
		$cmd = str_replace("\#", "#", $cmd);
		$cmd = str_replace("\(", "(", $cmd);
		$cmd = str_replace("\)", ")", $cmd);

		$array = array();

		exec($cmd . ' 2>&1', $array, $result);

		return array(
			"code" => $this->parseCommandCodes($result),
			"data" => array_filter($array)
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
		$this->getResultString();
		return $result;
	}


	private function getResultString() {
		$this->result = implode("<br>", $this->resultArray);
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