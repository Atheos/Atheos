<?php

//////////////////////////////////////////////////////////////////////////////80
// Exchange trait
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

trait Exchange {

	//////////////////////////////////////////////////////////////////////////80
	// Format and send JSON responses
	// 100 <-> 149: Notices
	//							103: Action required	104: Notice/no content
	// 150 <-> 199: Warning
	// 151: In Use
	//
	// 200 <-> 299: Successes
	// 200: Success
	// 201: Created				202: Accepted			204: No Content
	//
	// 400 <-> 499: Client errors
	// 400: Bad Request
	// 401: Client Unauthorized	403: User Forbidden		404: Not Found
	// 409: Conflict/Duplicate
	// 415: Missing Action		416: Invalid action
	// 417: Missing Data		418: Invalid Data		419: Outdated Data
	// 422: Non-Compliant		423: Locked				451: Security Violation
	//
	// 500 <-> 599: Server errors
	// 500: Internal Error
	// 501: Not Implemented		503: Maintenance        
	// 506: Unable to write file507: Unable to write DB
	//////////////////////////////////////////////////////////////////////////80
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
	
	//////////////////////////////////////////////////////////////////////////80
	// Read Post/Get/Server/Session Data
	//////////////////////////////////////////////////////////////////////////80
	public static function data($type = false, $key = false, $val = null) {
		if (!$type || !$key) return $val;

		if (!empty($val) && $type === "SESSION") {
			$_SESSION[$key] = $val;
		}

		if ($type === "SERVER" && array_key_exists($key, $_SERVER)) {
			$val = $_SERVER[$key];
		} elseif ($type === "SESSION" && array_key_exists($key, $_SESSION)) {
			$val = $_SESSION[$key];
		} elseif ($type === "POST") {
			if (array_key_exists($key, $_POST)) {
				$val = $_POST[$key];
			} else {
				// Special clause for the sendBeacon from analytics
				$request = json_decode(file_get_contents("php://input"), true);
				if (!empty($request) && array_key_exists($key, $request)) {
					$val = $request[$key];
				}
			}
		}
		return $val;
	}
}