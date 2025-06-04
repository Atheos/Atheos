<?php


trait Status {

    public function repoStatus() {
        $result = Common::safe_execute("git status --branch --porcelain");

        if ($result["code"] !== 0) {
            if (is_array($result["output"])) {
                $result["output"] = $result["output"][0];
            }
            Common::send(200, $result);
        }

        $output = $this->parseChanges($result["output"]);
        $status = "Unknown";

        if (!empty($output["added"]) ||
            !empty($output["deleted"]) ||
            !empty($output["modified"]) ||
            !empty($output["renamed"])) {
            $status = 'Uncommitted';
        } else if (!empty($output["untracked"])) {
            $status = 'Untracked';
        } else {
            $status = 'Committed';
        }

        Common::send(200, $status);
    }

    public function fileStatus($path) {
        if (!file_exists($path)) {
            Common::send(417, i18n("path_missing"));
        }

        $dirname = dirname($path);
        $filename = basename($path);

        if (!is_dir($dirname)) {
            Common::send(418, i18n("path_invalid"));
        }

        chdir($dirname);

        $result = Common::safe_execute("git diff --numstat -- ?", $filename);

        if ($result["code"] !== 0) {
            Common::send(200, $result);
        }

        $output = $result["output"];
        if (count($output) > 0 && $output[0] !== "") {
            $stats = explode("\t", $output[0]);
            $additions = $stats[0] ? $stats[0] : 0;
            $deletions = $stats[1] ? $stats[1] : 0;

        } else {
            $result = Common::safe_execute("git status --branch --porcelain");

            if ($result["code"] === 0 && !empty($result["output"])) {

                $status = $this->parseChanges($result["output"]);

                if (in_array($filename, $status['untracked'])) {
                    $file = file_get_contents($filename);
                    $file = explode("\n", $file);
                    $additions = count($file);
                    $deletions = 0;
                }
            }

            $additions = 0;
            $deletions = 0;
        }
        $reply = array(
            "branch" => $this->getCurrentBranch(),
            "insertions" => $additions,
            "deletions" => $deletions
        );
        Common::send(200, $reply);
    }

    public function branchStatus($repo) {
        $result = Common::safe_execute("git status --branch --porcelain");
        if ($result["code"] !== 0) return false;
        $output = $result["output"];

        preg_match('/(?<=\[).+?(?=\])/', $output[0], $status);

        if (!is_array($status) || empty($status)) {
            return i18n("git_status_current");
        }


        $int = (int)preg_replace("/(ahead|behind)/", "", $status[0]);
        $count = $int === 1 ? "single" : "plural";

        if (strpos($status[0], "ahead") !== false) {
            $status = i18n("git_status_ahead_$count", $int);
        } elseif (strpos($status[0], "behind") !== false) {
            $status = i18n("git_status_behind_$count", $int);
        }

        return $status;

    }

    public function loadChanges($repo) {
        $result = Common::safe_execute("git status --branch --porcelain");
        if ($result["code"] === 0) {
            $result = $this->parseChanges($result["output"]);
        } else {
            $result = i18n("codegit_error_statusFail");
        }
        return $result;
    }
}