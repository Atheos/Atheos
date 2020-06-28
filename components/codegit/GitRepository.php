<?php
/**
* Default implementation of IGit interface
*
* @author  Jan Pecha, <janpecha@email.cz>
* @license New BSD License (BSD-3), see file license.md
* @https://github.com/czproject/git-php
*/

class GitRepository {
	/** @var  string */
	protected $repository;

	/** @var  string|NULL  @internal */
	protected $cwd;


	/**
	* @param  string
	* @throws GitException
	*/
	public function __construct($repository) {
		if (basename($repository) === '.git') {
			$repository = dirname($repository);
		}

		$this->repository = realpath($repository);

		if ($this->repository === FALSE) {
			throw new GitException("Repository '$repository' not found.");
		}
	}


	/**
	* @return string
	*/
	public function getRepositoryPath() {
		return $this->repository;
	}


	/**
	* Creates a tag.
	* `git tag <name>`
	* @param  string
	* @param  array|NULL
	* @throws GitException
	* @return self
	*/
	public function createTag($name, $options = NULL) {
		return $this->begin()
		->run('git tag', $options, $name)
		->end();
	}


	/**
	* Removes tag.
	* `git tag -d <name>`
	* @param  string
	* @throws GitException
	* @return self
	*/
	public function removeTag($name) {
		return $this->begin()
		->run('git tag', array(
			'-d' => $name,
		))
		->end();
	}


	/**
	* Renames tag.
	* `git tag <new> <old>`
	* `git tag -d <old>`
	* @param  string
	* @param  string
	* @throws GitException
	* @return self
	*/
	public function renameTag($oldName, $newName) {
		return $this->begin()
		// http://stackoverflow.com/a/1873932
		// create new as alias to old (`git tag NEW OLD`)
		->run('git tag', $newName, $oldName)
		// delete old (`git tag -d OLD`)
		->removeTag($oldName) // WARN! removeTag() calls end() method!!!
		->end();
	}


	/**
	* Returns list of tags in repo.
	* @return string[]|NULL  NULL => no tags
	* @throws GitException
	*/
	public function getTags() {
		return $this->extractFromCommand('git tag', 'trim');
	}


	/**
	* Merges branches.
	* `git merge <options> <name>`
	* @param  string
	* @param  array|NULL
	* @throws GitException
	* @return self
	*/
	public function merge($branch, $options = NULL) {
		return $this->begin()
		->run('git merge', $options, $branch)
		->end();
	}


	/**
	* Creates new branch.
	* `git branch <name>`
	* (optionaly) `git checkout <name>`
	* @param  string
	* @param  bool
	* @throws GitException
	* @return self
	*/
	public function createBranch($name, $checkout = FALSE) {
		$this->begin();

		// git branch $name
		$this->run('git branch', $name);

		if ($checkout) {
			$this->checkout($name);
		}

		return $this->end();
	}


	/**
	* Removes branch.
	* `git branch -d <name>`
	* @param  string
	* @throws GitException
	* @return self
	*/
	public function removeBranch($name) {
		return $this->begin()
		->run('git branch', array(
			'-d' => $name,
		))
		->end();
	}


	/**
	* Gets name of current branch
	* `git branch` + magic
	* @return string
	* @throws GitException
	*/
	public function getCurrentBranchName() {
		try
		{
			$branch = $this->extractFromCommand('git branch -a', function($value) {
				if (isset($value[0]) && $value[0] === '*') {
					return trim(substr($value, 1));
				}

				return FALSE;
			});

			if (is_array($branch)) {
				return $branch[0];
			}
		}
		catch(GitException $e) {}
		throw new GitException('Getting current branch name failed.');
	}


	/**
	* Returns list of all (local & remote) branches in repo.
	* @return string[]|NULL  NULL => no branches
	* @throws GitException
	*/
	public function getBranches() {
		return $this->extractFromCommand('git branch -a', function($value) {
			return trim(substr($value, 1));
		});
	}


	/**
	* Returns list of remote branches in repo.
	* @return string[]|NULL  NULL => no branches
	* @throws GitException
	*/
	public function getRemoteBranches() {
		return $this->extractFromCommand('git branch -r', function($value) {
			return trim(substr($value, 1));
		});
	}


	/**
	* Returns list of local branches in repo.
	* @return string[]|NULL  NULL => no branches
	* @throws GitException
	*/
	public function getLocalBranches() {
		return $this->extractFromCommand('git branch', function($value) {
			return trim(substr($value, 1));
		});
	}


	/**
	* Checkout branch.
	* `git checkout <branch>`
	* @param  string
	* @throws GitException
	* @return self
	*/
	public function checkout($name) {
		return $this->begin()
		->run('git checkout', $name)
		->end();
	}


	/**
	* Removes file(s).
	* `git rm <file>`
	* @param  string|string[]
	* @throws GitException
	* @return self
	*/
	public function removeFile($file) {
		if (!is_array($file)) {
			$file = func_get_args();
		}

		$this->begin();

		foreach ($file as $item) {
			$this->run('git rm', $item, '-r');
		}

		return $this->end();
	}


	/**
	* Adds file(s).
	* `git add <file>`
	* @param  string|string[]
	* @throws GitException
	* @return self
	*/
	public function addFile($file) {
		if (!is_array($file)) {
			$file = func_get_args();
		}

		$this->begin();

		foreach ($file as $item) {
			// make sure the given item exists
			// this can be a file or an directory, git supports both
			$path = self::isAbsolute($item) ? $item : ($this->getRepositoryPath() . DIRECTORY_SEPARATOR . $item);

			if (!file_exists($path)) {
				throw new GitException("The path at '$item' does not represent a valid file.");
			}

			$this->run('git add', $item);
		}

		return $this->end();
	}


	/**
	* Adds all created, modified & removed files.
	* `git add --all`
	* @throws GitException
	* @return self
	*/
	public function addAllChanges() {
		return $this->begin()
		->run('git add --all')
		->end();
	}


	/**
	* Renames file(s).
	* `git mv <file>`
	* @param  string|string[]  from: array('from' => 'to', ...) || (from, to)
	* @param  string|NULL
	* @throws GitException
	* @return self
	*/
	public function renameFile($file, $to = NULL) {
		if (!is_array($file)) // rename(file, to);
		{
			$file = array(
				$file => $to,
			);
		}

		$this->begin();

		foreach ($file as $from => $to) {
			$this->run('git mv', $from, $to);
		}

		return $this->end();
	}


	/**
	* Commits changes
	* `git commit <params> -m <message>`
	* @param  string
	* @param  string[]  param => value
	* @throws GitException
	* @return self
	*/
	public function commit($message, $params = NULL) {
		if (!is_array($params)) {
			$params = array();
		}

		return $this->begin()
		->run("git commit", $params, array(
			'-m' => $message,
		))
		->end();
	}


	/**
	* Returns last commit ID on current branch
	* `git log --pretty=format:"%H" -n 1`
	* @return string|NULL
	* @throws GitException
	*/
	public function getLastCommitId() {
		$this->begin();
		$lastLine = exec('git log --pretty=format:"%H" -n 1 2>&1');
		$this->end();
		if (preg_match('/^[0-9a-f]{40}$/i', $lastLine)) {
			return $lastLine;
		}
		return NULL;
	}


	/**
	* Exists changes?
	* `git status` + magic
	* @return bool
	* @throws GitException
	*/
	public function hasChanges() {
		// Make sure the `git status` gets a refreshed look at the working tree.
		$this->begin()
		->run('git update-index -q --refresh')
		->end();

		$output = $this->extractFromCommand('git status --porcelain');
		return !empty($output);
	}


	/**
	* @deprecated
	* @throws GitException
	*/
	public function isChanges() {
		return $this->hasChanges();
	}


	/**
	* Pull changes from a remote
	* @param  string|NULL
	* @param  array|NULL
	* @return self
	* @throws GitException
	*/
	public function pull($remote = NULL, array $params = NULL) {
		if (!is_array($params)) {
			$params = array();
		}

		return $this->begin()
		->run("git pull$remote", $params)
		->end();
	}


	/**
	* Push changes to a remote
	* @param  string|NULL
	* @param  array|NULL
	* @return self
	* @throws GitException
	*/
	public function push($remote = NULL, array $params = NULL) {
		if (!is_array($params)) {
			$params = array();
		}

		return $this->begin()
		->run("git push$remote", $params)
		->end();
	}


	/**
	* Run fetch command to get latest branches
	* @param  string|NULL
	* @param  array|NULL
	* @return self
	* @throws GitException
	*/
	public function fetch($remote = NULL, array $params = NULL) {
		if (!is_array($params)) {
			$params = array();
		}

		return $this->begin()
		->run("git fetch$remote", $params)
		->end();
	}


	/**
	* Adds new remote repository
	* @param  string
	* @param  string
	* @param  array|NULL
	* @return self
	* @throws GitException
	*/
	public function addRemote($name, $url, array $params = NULL) {
		return $this->begin()
		->run('git remote add', $params, $name, $url)
		->end();
	}


	/**
	* Renames remote repository
	* @param  string
	* @param  string
	* @return self
	* @throws GitException
	*/
	public function renameRemote($oldName, $newName) {
		return $this->begin()
		->run('git remote rename', $oldName, $newName)
		->end();
	}


	/**
	* Removes remote repository
	* @param  string
	* @return self
	* @throws GitException
	*/
	public function removeRemote($name) {
		return $this->begin()
		->run('git remote remove', $name)
		->end();
	}


	/**
	* Changes remote repository URL
	* @param  string
	* @param  string
	* @param  array|NULL
	* @return self
	* @throws GitException
	*/
	public function setRemoteUrl($name, $url, array $params = NULL) {
		return $this->begin()
		->run('git remote set-url', $params, $name, $url)
		->end();
	}


	/**
	* @param  string|string[]
	* @return string[]  returns output
	* @throws GitException
	*/
	public function execute($cmd) {
		if (!is_array($cmd)) {
			$cmd = array($cmd);
		}

		array_unshift($cmd, 'git');
		$cmd = self::processCommand($cmd);

		$this->begin();
		exec($cmd . ' 2>&1', $output, $ret);
		$this->end();

		if ($ret !== 0) {
			throw new GitException("Command '$cmd' failed (exit-code $ret).", $ret);
		}

		return $output;
	}


	/**
	* @return self
	*/
	protected function begin() {
		if ($this->cwd === NULL) // TODO: good idea??
		{
			$this->cwd = getcwd();
			chdir($this->repository);
		}

		return $this;
	}


	/**
	* @return self
	*/
	protected function end() {
		if (is_string($this->cwd)) {
			chdir($this->cwd);
		}

		$this->cwd = NULL;
		return $this;
	}


	/**
	* @param  string
	* @param  callback|NULL
	* @return string[]|NULL
	* @throws GitException
	*/
	protected function extractFromCommand($cmd, $filter = NULL) {
		$output = array();
		$exitCode = NULL;

		$this->begin();
		exec("$cmd", $output, $exitCode);
		$this->end();

		if ($exitCode !== 0 || !is_array($output)) {
			throw new GitException("Command$cmd failed.");
		}

		if ($filter !== NULL) {
			$newArray = array();

			foreach ($output as $line) {
				$value = $filter($line);

				if ($value === FALSE) {
					continue;
				}

				$newArray[] = $value;
			}

			$output = $newArray;
		}

		if (!isset($output[0])) // empty array
		{
			return NULL;
		}

		return $output;
	}


	/**
	* Runs command.
	* @param  string|array
	* @return self
	* @throws GitException
	*/
	protected function run($cmd/*, $options = NULL*/) {
		$args = func_get_args();
		$cmd = self::processCommand($args);
		exec($cmd . ' 2>&1', $output, $ret);

		if ($ret !== 0) {
			throw new GitException("Command '$cmd' failed (exit-code $ret).", $ret);
		}

		return $this;
	}


	protected static function processCommand(array $args) {
		$cmd = array();

		$programName = array_shift($args);

		foreach ($args as $arg) {
			if (is_array($arg)) {
				foreach ($arg as $key => $value) {
					$_c = '';

					if (is_string($key)) {
						$_c = "$key ";
					}

					$cmd[] = $_c . escapeshellarg($value);
				}
			} elseif (is_scalar($arg) && !is_bool($arg)) {
				$cmd[] = escapeshellarg($arg);
			}
		}

		return "$programName " . implode(' ', $cmd);
	}


	/**
	* Init repo in directory
	* @param  string
	* @param  array|NULL
	* @return self
	* @throws GitException
	*/
	public static function init($directory, array $params = NULL) {
		if (is_dir("$directory/.git")) {
			throw new GitException("Repo already exists in$directory.");
		}

		if (!is_dir($directory) && !@mkdir($directory, 0777, TRUE)) // intentionally @; not atomic; from Nette FW
		{
			throw new GitException("Unable to create directory '$directory'.");
		}

		$cwd = getcwd();
		chdir($directory);
		exec(self::processCommand(array(
			'git init',
			$params,
			$directory,
		)), $output, $returnCode);

		if ($returnCode !== 0) {
			throw new GitException("Git init failed (directory$directory).");
		}

		$repo = getcwd();
		chdir($cwd);

		return new static($repo);
	}


	/**
	* Clones GIT repository from $url into $directory
	* @param  string
	* @param  string|NULL
	* @param  array|NULL
	* @return self
	* @throws GitException
	*/
	public static function cloneRepository($url, $directory = NULL, array $params = NULL) {
		if ($directory !== NULL && is_dir("$directory/.git")) {
			throw new GitException("Repo already exists in$directory.");
		}

		$cwd = getcwd();

		if ($directory === NULL) {
			$directory = self::extractRepositoryNameFromUrl($url);
			$directory = "$cwd/$directory";
		} elseif (!self::isAbsolute($directory)) {
			$directory = "$cwd/$directory";
		}

		if ($params === NULL) {
			$params = '-q';
		}

		$descriptorspec = array(
			0 => array('pipe', 'r'), // stdin
			1 => array('pipe', 'w'), // stdout
			2 => array('pipe', 'w'), // stderr
		);

		$pipes = [];
		$command = self::processCommand(array(
			'git clone',
			$params,
			$url,
			$directory
		));
		$process = proc_open($command, $descriptorspec, $pipes);

		if (!$process) {
			throw new GitException("Git clone failed (directory$directory).");
		}

		// Reset output and error
		$stdout = '';
		$stderr = '';

		while (TRUE) {
			// Read standard output
			$output = fgets($pipes[1], 1024);

			if ($output) {
				$stdout .= $output;
			}

			// Read error output
			$output_err = fgets($pipes[2], 1024);

			if ($output_err) {
				$stderr .= $output_err;
			}

			// We are done
			if ((feof($pipes[1]) OR $output === FALSE) AND (feof($pipes[2]) OR $output_err === FALSE)) {
				break;
			}
		}

		$returnCode = proc_close($process);

		if ($returnCode !== 0) {
			throw new GitException("Git clone failed (directory$directory)." . ($stderr !== '' ? ("\n$stderr") : ''));
		}

		return new static($directory);
	}


	/**
	* @param  string
	* @param  array|NULL
	* @return bool
	*/
	public static function isRemoteUrlReadable($url, array $refs = NULL) {
		$env = '';

		if (DIRECTORY_SEPARATOR === '\\') {
			// Windows
			$env = 'set GIT_TERMINAL_PROMPT=0 &&';

		} else {
			$env = 'GIT_TERMINAL_PROMPT=0';
		}

		exec(self::processCommand(array(
			$env . ' git ls-remote',
			'--heads',
			'--quiet',
			'--exit-code',
			$url,
			$refs,
		)) . ' 2>&1', $output, $returnCode);

		return $returnCode === 0;
	}


	/**
	* @param  string  /path/to/repo.git | host.xz:foo/.git | ...
	* @return string  repo | foo | ...
	*/
	public static function extractRepositoryNameFromUrl($url) {
		// /path/to/repo.git => repo
		// host.xz:foo/.git => foo
		$directory = rtrim($url, '/');
		if (substr($directory, -5) === '/.git') {
			$directory = substr($directory, 0, -5);
		}

		$directory = basename($directory, '.git');

		if (($pos = strrpos($directory, ':')) !== FALSE) {
			$directory = substr($directory, $pos + 1);
		}

		return $directory;
	}


	/**
	* Is path absolute?
	* Method from Nette\Utils\FileSystem
	* @link   https://github.com/nette/nette/blob/master/Nette/Utils/FileSystem.php
	* @return bool
	*/
	public static function isAbsolute($path) {
		return (bool) preg_match('#[/\\\\]|[a-zA-Z]:[/\\\\]|[a-z][a-z0-9+.-]*://#Ai', $path);
	}


	/**
	* Returns commit message from specific commit
	* `git log -1 --format={%s|%B} )--pretty=format:'%H' -n 1`
	* @param  string  commit ID
	* @param  bool    use %s instead of %B if TRUE
	* @return string
	* @throws GitException
	*/
	public function getCommitMessage($commit, $oneline = FALSE) {
		$this->begin();
		exec('git log -1 --format=' . ($oneline ? '%s' : '%B') . ' ' . $commit . ' 2>&1', $message);
		$this->end();
		return implode(PHP_EOL, $message);
	}


	/**
	* Returns array of commit metadata from specific commit
	* `git show --raw <sha1>`
	* @param  string  commit ID
	* @return array
	* @throws GitException
	*/
	public function getCommitData($commit) {
		$message = $this->getCommitMessage($commit);
		$subject = $this->getCommitMessage($commit, TRUE);

		$this->begin();
		exec('git show --raw ' . $commit . ' 2>&1', $output);
		$this->end();
		$data = array(
			'commit' => $commit,
			'subject' => $subject,
			'message' => $message,
			'author' => NULL,
			'committer' => NULL,
			'date' => NULL,
		);

		// git show is a porcelain command and output format may changes
		// in future git release or custom config.
		foreach ($output as $index => $info) {
			if (preg_match('`Author: *(.*)`', $info, $author)) {
				$data['author'] = trim($author[1]);
				unset($output[$index]);
			}

			if (preg_match('`Commit: *(.*)`', $info, $committer)) {
				$data['committer'] = trim($committer[1]);
				unset($output[$index]);
			}

			if (preg_match('`Date: *(.*)`', $info, $date)) {
				$data['date'] = trim($date[1]);
				unset($output[$index]);
			}
		}

		return $data;
	}

}