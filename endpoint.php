<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$URI = $_SERVER["REQUEST_URI"];

function SEND($data) {
	die(json_encode($data, JSON_PRETTY_PRINT));
}
function ERROR($text) {
	SEND(["status" => "error", "text" => $text]);
}

if (strpos($URI, "market")) {
	$json = json_decode(file_get_contents("data/market.json"), true);
	SEND($json);

} elseif (strpos($URI, "requestKey")) {
	$ipv4 = $_SERVER["REMOTE_ADDR"];
	if (file_exists("data/keys/$ipv4")) {
		http_response_code(429);
		ERROR("You requested a key too recently.");
	}
	http_response_code(200);
	$uuid = uniqid();
	file_put_contents("data/keys/$ipv4", "");
	file_put_contents("data/analytics/$uuid.json", "{}");
	SEND(["status" => "success", "key" => $uuid]);

} elseif (strpos($URI, "analytics")) {
	// http_response_code(202);
	// ERROR("API Endpoint under construction.");

	if ($_SERVER["REQUEST_METHOD"] !== "POST") {
		http_response_code(400);
		ERROR("Invalid reqest method");
	}

	$data = $_POST;

	// if ($uuid && !file_exists("data/analytics/$uuid.json")) {
	// http_response_code(401);
	// ERROR("Invalid Key / UUID.");
	// }

	$fields = [
		"uuid" => "/^[a-z0-9]{13}$/",
		"version" => "/^v[0-9]\.[0-9]\.[0-9]/",
		"first_heard" => "/^\d{4}\/\d{2}\/\d{2}$/",
		"last_heard" => "/^\d{4}\/\d{2}\/\d{2}$/",
		"php_version" => "/^[0-9]{1,4}\.[0-9]{1,4}\.[0-9]{1,4}/",
		"server_os" => false,
		"client_os" => false,
		"timezone" => false,
		"language" => "/^[a-z][a-z]$/",
		"plugins" => false
	];

	$values = [];
	foreach ($fields as $key => $test) {

		$val = isset($data[$key]) ? $data[$key] : false;
		$val = $val ? htmlspecialchars(strip_tags($val)) : false;

		if ($test && !preg_match($test, $val)) {
			$val = "INVALID";
		} elseif ($key === "timezone") {
			try {
				new DateTimeZone($val);
			}catch(Exception $e) {
				$val = "INVALID";
			}
		}

		if (in_array($key, ["plugins", "client_os"])) {
			$val = substr($val, 0, 200);
		} else {
			$val = substr($val, 0, 20);
		}

		$values[$key] = $val;
	}

	$uuid = isset($values["uuid"]) ? $values["uuid"] : false;

	if (!$uuid) {
		http_response_code(400);
		ERROR("Missing UUID");
	}

	http_response_code(200);
	$data = json_encode($values, JSON_PRETTY_PRINT);
	file_put_contents("data/analytics/$uuid.json", $data);

	SEND(["status" => "success", "text" => "Data recieved"]);
} else {
	http_response_code(404);
	ERROR("How did you get here?");
}