<?php
/*
 * Copyright (c) Codiad & Andr3as, distributed
 * as-is and without warranty under the MIT License. 
 * See http://opensource.org/licenses/MIT for more information.
 * This information must remain intact.
 */
    error_reporting(0);

    require_once('../../common.php');
    checkSession();
    
    switch($_GET['action']) {
        
        case 'getExtensions':
			$path = 'extensions';
			if (isset($_GET['path'])) {
				$path .= '/' . $_GET['path'];
				//Catch upper path
				$path = str_replace("../", "", $path);
				if (!is_dir($path)) {
					echo '{"status":"error","message":"Invalid path!"}';
					break;
				}
			}
            $extensions = scandir($path);
            $buffer = array();
            foreach($extensions as $file) {
				if ($file != "." && $file != "..") {
					if (!is_dir($path . "/" . $file)) {
						array_push($buffer, $file);
					}
				}
            }
            echo '{"status":"success","extensions":' . json_encode($buffer) . '}';
            break;
        
        case 'getContent':
			if (isset($_GET['path'])) {
				$path = 'extensions/' . $_GET['path'];
				//Catch upper path
				$path = str_replace("..", "", $path);
				if (is_dir($path)) {
					echo '{"status":"error","message":"Invalid path!"}';
					break;
				}
				$content = file_get_contents($path);
				echo json_encode(array("status" => "success", "content" => $content));
			} else {
				echo '{"status":"error","message":"Missing path"}';
			}
			break;
		
        default:
            echo '{"status":"error","message":"No Type"}';
            break;
    }
    
    function getWorkspacePath($path) {
        if (strpos($path, "/") === 0) {
            //Unix absolute path
            return $path;
        }
        if (strpos($path, ":/") !== false) {
            //Windows absolute path
            return $path;
        }
        if (strpos($path, ":\\") !== false) {
            //Windows absolute path
            return $path;
        }
        return WORKSPACE . "/".$path;
    }
?>