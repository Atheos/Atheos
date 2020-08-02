<?php


trait Execute {

	private function execute($cmd) {
		$cmd = escapeshellcmd($cmd);
		//Allow #
		$cmd = str_replace("\#", "#", $cmd);
		$cmd = str_replace("\(", "(", $cmd);
		$cmd = str_replace("\)", ")", $cmd);

		$result = array();

		exec($cmd . ' 2>&1', $result, $code);

		return array(
			"status" => $code === 0,
			"code" => $this->parseCommandCodes($code),
			"data" => array_filter($result)
		);
	}

	private function parseCommandCodes($code) {

		// $codes = array(
		// 	0 => true,
		// 	1 => false,
		// 	3 => "login_required",
		// 	4 => "login_required",
		// 	7 => "password_required",
		// 	64 => "error",
		// );
		
		// if(in_array($code, $codes)) {
		// 	return $codes[$code];
		// } else {
		// 	return false;
		// }

		switch ($code) {
			// Success
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
}