<?php


trait Transfer {


	public function push($repo, $remote, $branch) {
		if (!is_dir($repo)) {
			Common::sendJSON("error", "Invalid Repo Path."); die;
		}

		if (!$this->checkExecutableFile()) {
			Common::sendJSON("error", "Failed to change permissions of shell program."); die;
		}


		if (!$this->checkShellProgramExists()) {
			Common::sendJSON("error", "Please install shell program."); die;
		}

		$program = $this->getShellProgram();
		$command = $program . ' -s "' . $repo . '" -c "git push ' . $remote . ' ' . $branch . '"';

		$command = $this->checkUserInfo($command);
		$result = $this->executeCommand($command);

		Common::sendJSON("error", "Pushed.");
		return $this->parseShellResult($result, "Repository pushed!", "Failed to push repo!");
	}

	public function pull($path, $remote, $branch) {
		if (!is_dir($path)) return $this->returnMessage("error", "Wrong path!");
		if (!$this->checkExecutableFile()) {
			return $this->returnMessage("error", "Failed to change permissions of shell program");
		}
		if (!$this->checkShellProgramExists()) {
			return $this->returnMessage("error", "Please install shell program!");
		}

		$program = $this->getShellProgram();
		$command = $program . ' -s "' . $path . '" -c "git pull ' . $remote . ' ' . $branch . '"';

		$command = $this->checkUserInfo($command);
		$result = $this->executeCommand($command);
		return $this->parseShellResult($result, "Repository pulled!", "Failed to pull repo!");
	}

	public function fetch($path, $remote) {
		if (!is_dir($path)) return $this->returnMessage("error", "Wrong path!");
		if (!$this->checkExecutableFile()) {
			return $this->returnMessage("error", "Failed to change permissions of shell program");
		}
		if (!$this->checkShellProgramExists()) {
			return $this->returnMessage("error", "Please install shell program!");
		}

		$program = $this->getShellProgram();
		if ($remote == "0") {
			$command = $program . ' -s "' . $path . '" -c "git fetch"';
		} else {
			$command = $program . ' -s "' . $path . '" -c "git fetch ' . $remote . '"';
		}

		$command = $this->checkUserInfo($command);
		$result = $this->executeCommand($command);
		return $this->parseShellResult($result, "Repository fetched!", "Failed to fetch repo!");
	}

	public function checkUserInfo($command) {
		$username = Common::data("username");
		$password = Common::data("password");
		$passphrase = Common::data("passphrase");

		if ($username) {
			$command = $command . ' -u "' . $username . '"';
		}
		if ($password) {
			$command = $command . ' -p "' . $password . '"';
		}
		if ($passphrase) {
			$command = $command . ' -k "' . $passphrase . '"';
		}

		return $command;
	}

}