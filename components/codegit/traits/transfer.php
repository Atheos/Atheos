<?php


trait Transfer {


	public function push($path, $remote, $branch) {
		if (!is_dir($path)) return $this->returnMessage("error", "Wrong path!");
		if (!$this->checkExecutableFile()) {
			return $this->returnMessage("error", "Failed to change permissions of shell program");
		}
		if (!$this->checkShellProgramExists()) {
			return $this->returnMessage("error", "Please install shell program!");
		}

		$program = $this->getShellProgram();
		$command = $program . ' -s "' . $path . '" -c "git push ' . $remote . ' ' . $branch . '"';

		if (isset($_POST['username'])) {
			$command = $command . ' -u "' . $_POST['username'] . '"';
		}
		if (isset($_POST['password'])) {
			$command = $command . ' -p "' . $_POST['password'] . '"';
		}
		if (isset($_POST['passphrase'])) {
			$command = $command . ' -k "' . $_POST['passphrase'] . '"';
		}
		$result = $this->executeCommand($command);
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

		if (isset($_POST['username'])) {
			$command = $command . ' -u "' . $_POST['username'] . '"';
		}
		if (isset($_POST['password'])) {
			$command = $command . ' -p "' . $_POST['password'] . '"';
		}
		if (isset($_POST['passphrase'])) {
			$command = $command . ' -k "' . $_POST['passphrase'] . '"';
		}
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
		if (isset($_POST['username'])) {
			$command = $command . ' -u "' . $_POST['username'] . '"';
		}
		if (isset($_POST['password'])) {
			$command = $command . ' -p "' . $_POST['password'] . '"';
		}
		if (isset($_POST['passphrase'])) {
			$command = $command . ' -k "' . $_POST['passphrase'] . '"';
		}
		$result = $this->executeCommand($command);
		return $this->parseShellResult($result, "Repository fetched!", "Failed to fetch repo!");
	}

}