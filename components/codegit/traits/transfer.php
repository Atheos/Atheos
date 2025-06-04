<?php

trait Transfer {
    public function transfer($type, $remote, $branch) {
        if (!in_array($type, ["push", "pull", "fetch"], true)) {
            Common::send(418, i18n("git_error_invalidTransferType"));
        }


        $result = Common::safe_execute("git $type -- ? ?", $remote, $branch);
        if ($result["code"] === 0) {
            Common::send(200, $result["output"]);
        } else {
            Common::send(500, i18n("git_$type\_failed") . "\n\n" . implode("/n", $result["output"]));
        }
    }
}