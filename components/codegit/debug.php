<?php

// require_once('IGit.php');
require_once('GitRepository.php');

// create repo object
$repo = new Cz\Git\GitRepository('../Atheos-Ignore');

echo json_encode($repo->getChanges());