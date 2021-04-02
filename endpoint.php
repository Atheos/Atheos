<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$URI = "$_SERVER[REQUEST_URI]";

function SEND($data) {
	die(json_encode($data, JSON_PRETTY_PRINT));
}
function ERROR($text) {
	SEND(["status" => "error", "text" => $text]);

}

if (strpos($URI, "market")) {
	$json = json_decode(file_get_contents("data/market.json"), true);
	SEND($json);

} else {
	http_response_code(202);
	ERROR("API Endpoint under construction.");


	if ($_SERVER["REQUEST_METHOD"] !== "POST") ERROR("Invalid reqest method");

	$data = $_POST;
	$values = [];

	$fields = [
		"uuid" => "/^[a-z0-9]{13}$/",
		"version" => "/^v[0-9]\.[0-9]\.[0-9]/",
		"creation" => "/^\d{4}-\d{2}-\d{2}$/",
		"lastseen" => "/^\d{4}-\d{2}-\d{2}$/",
		"php_version" => "/^[0-9]{1,4}\.[0-9]{1,4}\.[0-9]{1,4}/",
		"server_os" => false,
		"client_os" => false,
		"location" => false,
		"language" => "/^[A-Z][A-Z]$/",
		"authorized" => false,
		"plugins" => false
	];


	foreach ($fields as $field => $test) {

		$val = isset($data[$field]) ? $data[$field] : false;
		$val = $val ? htmlspecialchars(strip_tags($val)) : false;

		if ($test && !preg_match($test, $val)) {}

		$val = substr($val, 0, $field === "plugins" ? 200 : 20);
		$values[$field] = $val;

	}

	$uuid = isset($values["uuid"]) ? $values["uuid"] : false;

	if ($uuid && !file_exists("data/analytics/$uuid.json")) {
		http_response_code(201);

		$data = json_encode($values, JSON_PRETTY_PRINT);
		file_put_contents("data/analytics/$uuid.json", $data);
	} else {
		http_response_code(200);
	}


	SEND(array(
		"status" => "success",
		"text" => "Data recieved",
	));
}