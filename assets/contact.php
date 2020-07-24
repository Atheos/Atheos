<?php
// required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include("php/contact/identicon.php");

// get posted data
$data = $_POST;


$destinationEmail = "liam@siira.us";

$email = $data['email'];
$name = $data['name'];
$message = $data['message'];
$image = createIdenticon($email);

if (!preg_match("/([\w\-]+\@[\w\-]+\.[\w\-]+)/", $email)) {
	http_response_code(400);
	echo json_encode(
		array(
			"message" => "email invalid"
		)
	);
} else {
	include("php/contact/logo.php");
	include("php/contact/email.php");

	$headers = "From: " . $name . " <" . $destinationEmail . ">\r\n";

	$headers .= "Reply-To: " . $email . "\r\n";

	$headers .= "MIME-Version: 1.0\r\n";
	$headers .= "Content-Type: text/html; charset=UTF-8\r\n";

	$message = $emailcontent;

	// send
	if (mail($destinationEmail, 'Siira.us Contact Form', $message, $headers)) {
		http_response_code(200);
		echo json_encode(
			array(
				"message" => "email sent"
			)
		);
	} else {
		http_response_code(500);
		echo json_encode(
			array(
				"message" => "internal error"
			)
		);
	}

}