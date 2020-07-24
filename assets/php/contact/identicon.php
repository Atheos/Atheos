<?php


// Source: http://writings.orangegnome.com/writes/creating-identicons/


function createIdenticon($string) {
	// Get string from query string
	$string = strtolower($string);

	// Convert string to MD5
	$hash = md5($string);
	// Get color from first 6 characters
	$color = substr($hash, 0, 6);

	// Create an array to store our boolean "pixel" values
	$pixels = array();

	// Make it a 5x5 multidimensional array
	for ($i = 0; $i < 5; $i++) {
		for ($j = 0; $j < 5; $j++) {
			$pixels[$i][$j] = hexdec(substr($hash, ($i * 5) + $j + 6, 1))%2 === 0;
		}
	}

	$pixels[4] = $pixels[0];
	$pixels[3] = $pixels[1];

	// Create image
	$image = imagecreatetruecolor(400, 400);
	// Allocate the primary color. The hex code we assigned earlier needs to be decoded to RGB
	$color = imagecolorallocate($image, hexdec(substr($color, 0, 2)), hexdec(substr($color, 2, 2)), hexdec(substr($color, 4, 2)));
	// And a background color
	$bg = imagecolorallocate($image, 238, 238, 238);

	// Color the pixels
	for ($k = 0; $k < count($pixels); $k++) {
		for ($l = 0; $l < count($pixels[$k]); $l++) {
			// Default pixel color is the background color
			$pixelColor = $bg;

			// If the value in the $pixels array is true, make the pixel color the primary color
			if ($pixels[$k][$l]) {
				$pixelColor = $color;
			}

			// Color the pixel. In a 400x400px image with a 5x5 grid of "pixels", each "pixel" is 80x80px
			imagefilledrectangle($image, $k * 80, $l * 80, ($k + 1) * 80, ($l + 1) * 80, $pixelColor);
		}
	}


	$border = 20;
	$width = imagesx($image);
	$height = imagesy($image);
	$img_adj_width = $width+(2*$border);
	$img_adj_height = $height+(2*$border);
	$newimage = imagecreatetruecolor($img_adj_width, $img_adj_height);

	$border_color = imagecolorallocate($newimage, 17, 17, 17);
	imagefilledrectangle($newimage, 0, 0, $img_adj_width, $img_adj_height, $border_color);

	imagecopyresized($newimage, $image, $border, $border, 0, 0,
		$width, $height, $width, $height);
	// imagepng($newimage, $add, 9);
	// chmod("$add", 0666);

	// Output the image
	// header('Content-type: image/png');
	ob_start();
	imagepng($newimage);
	$imagedata = "data:image/png;base64,".base64_encode(ob_get_clean());

	return $imagedata;
}

// Output the image
// imagepng($image);