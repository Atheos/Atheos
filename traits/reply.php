<?php

//////////////////////////////////////////////////////////////////////////////80
// Reply trait
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/license.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

trait Reply {

	//////////////////////////////////////////////////////////////////////////80
	// Format JSON Responses
	//////////////////////////////////////////////////////////////////////////80
	public static function sendJSON($status, $text = false) {
		if (preg_match('/^[SEWN][0-9]{3}[0-9a-z]{1}$/', $status)) {
			$reply = Common::parseStatusCodes($status, $text);
		} elseif (is_array($text)) {
			$reply = $text;
			$reply["status"] = $status ? $status : "error";
		} else {
			$reply = array(
				"text" => $text ? $text : "no data",
				"status" => $status ? $status : "error"
			);
		}

		/// Debug /////////////////////////////////////////////////
		if (count(Common::$debugStack) > 0) {
			$reply["debug"] = Common::$debugStack;
		}

		// Return ////////////////////////////////////////////////
		echo json_encode($reply);
	}

	//////////////////////////////////////////////////////////////////////////80
	// Parse Status Codes
	//////////////////////////////////////////////////////////////////////////80
	public static function parseStatusCodes($code, $text = false) {
		$codes = array(
			"S2000" => "Success.",

			"E401i" => "Invalid Action.",
			"E401m" => "Missing Action.",

			"E402i" => "Invalid Path.",
			"E402m" => "Missing Path.",

			"E403g" => "Invalid Parameter.",
			"E403i" => "Invalid Parameter:",
			"E403m" => "Missing Parameter.",

			"E404g" => "No Content.",

			"E430u" => "User does not have access.",
			"E430c" => "Client does not have access.",
			"E430a" => "Atheos does not have access.",

			"W490g" => "Conflict.",
			"W490s" => "Conflict:",

			"E5000" => "Internal Error.",
			"E5001" => "Internal Error:",
			"E5002" => "Failed to save content.",

		);

		$reply = is_array($text) ? $text : array();

		if (in_array($code, $codes)) {
			$reply["text"] = $codes[$code];
		}

		if ($text && !is_array($text)) {
			$reply["text"] .= " $text";
		}

		switch ($code[0]) {
			case "S":
				$reply["status"] = "success";
				break;
			case "E":
				$reply["status"] = "error";
				break;
			case "W":
				$reply["status"] = "warning";
				break;
			case "N":
				$reply["status"] = "notice";
				break;
			default:
				$reply["status"] = "error";
				break;
		}
		return $reply;
	}

}