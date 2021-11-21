<?php


trait Execute {

	private function execute($cmd) {
		$cmd = escapeshellcmd($cmd);
		//Allow #
		$cmd = str_replace("\#", "#", $cmd);
		$cmd = str_replace("\(", "(", $cmd);
		$cmd = str_replace("\)", ")", $cmd);

		$result = Common::execute($cmd . ' 2>&1');
		$code = $result["code"];
		
		if ($code === 0) {
			return explode("\n", $result["text"]);
		} else {
			return false;
		}
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