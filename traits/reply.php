<?php

//////////////////////////////////////////////////////////////////////////////80
// Reply trait
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

trait Reply {

	//////////////////////////////////////////////////////////////////////////80
	// Format and send JSON responses
	// $status should only be: "success" || "error" || "warning" || "notice"
	//////////////////////////////////////////////////////////////////////////80
	public static function send($status, $data = array()) {
		http_response_code(200);
		header("X-Frame-Options: SAMEORIGIN");
		header('X-Content-Type-Options: nosniff');

		if (!is_array($data)) {
			$data = array("text" => $data);
		}

		// Debug
		if (!empty(Common::$debugStack)) $data["debug"] = Common::$debugStack;

		$data["status"] = $status;

		// Return
		exit(json_encode($data));
	}
}