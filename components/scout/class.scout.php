<?php

//////////////////////////////////////////////////////////////////////////////80
// Scout Class
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

class Scout {

	//////////////////////////////////////////////////////////////////////////80
	// METHODS
	//////////////////////////////////////////////////////////////////////////80

	// ----------------------------------||---------------------------------- //

	//////////////////////////////////////////////////////////////////////////80
	// Construct
	//////////////////////////////////////////////////////////////////////////80
	public function __construct() {
		if (!function_exists('shell_exec')) {
			Common::send(501, i18n("noShell"));
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Filter File Tree
	//////////////////////////////////////////////////////////////////////////80
	public function filter() {
		$path = POST("path");
		$path = Common::getWorkspacePath($path);
		$strategy = POST("strategy");
		$filter = POST("filter");


		chdir($path);
		$query = str_replace('"', '', $filter);
		$cmd = 'find -L ';

		switch ($strategy) {
			case 'substring':
				$cmd = "$cmd -iname ".escapeshellarg('*' . $query . '*');
				break;
			case 'regexp':
				$cmd = "$cmd -regex ".escapeshellarg($query);
				break;
			case 'left_prefix':
				default:
					$cmd = "$cmd -iname ".escapeshellarg($query . '*');
					break;
		}

		$cmd .= " -printf \"%h/%f %y\n\"";
		$output = Common::execute($cmd);
		// $output = array();

		$output = $output["text"];

		$output = explode("\n", $output);
		$results = array();

		foreach ($output as $i => $line) {
			$line = explode(" ", $line);
			$fname = trim($line[0]);
			if ($line[1] == 'f') {
				$ftype = 'file';
			} else {
				$ftype = 'directory';
			}
			if (strlen($fname) != 0) {
				$fname = substr($fname, 2);
				$f = array('path' => $fname, 'type' => $ftype);
				array_push($results, $f);
			}
		}

		if (count($results) > 0) {
			Common::send(200, $results);
		} else {
			Common::send(404, "No results found.");
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Probe: Deep file content search
	//////////////////////////////////////////////////////////////////////////80
	public function probe() {
		$type = POST("type");
		$path = POST("path");
		$path = Common::cleanPath($path);
		$query = POST("query");
		$filter = POST("filter");

		$path = $type ? WORKSPACE : Common::getWorkspacePath($path);
		$root = WORKSPACE;
	    $root = $this::normalizePath($root, '/');

		$results = array();

		$query = str_replace('"', '', $query);

		if (substr(php_uname(), 0, 7) == "Windows"){
    		$query = escapeshellarg($query);
    		$filter = str_replace(['\\(', '\\)'], '', $filter);
    		if ($filter === '') {
                $filters = ['*.*'];
    		} else {
    		    $filters = explode('\\|', $filter);
    		}
    		foreach ($filters as $filter) {
        		$searchPath = escapeshellarg($path . '/*.' . $filter);
    		    $cmd = "findstr /s /n /i $query $searchPath";
    		    
    		    $output = Common::execute($cmd);
    		    $output = $output["text"];
    		    
    		    $output = explode("\n", $output);
    		    foreach ($output as $line) {
    		        // e.g. C:\...path...\file.json:98:            where the text is found,
    		        list($foundDrive, $foundPath, $foundLineNo, $foundString) = explode(":", $line, 4);
    		        if ($foundPath) {
    		            $foundPath = str_replace('\\', '/', $foundPath);
    		            $file = str_replace($this::normalizePath($path, '/') . '/', '', $foundDrive . ':' . $foundPath);
    		            $foundString = htmlentities($foundString);
    		            if (strlen($foundString) > 500) {
    		                $foundString = substr($foundString, 0, 497) . '...';
    		            }
    		            $results[$file][] = [
    		                'line' => $foundLineNo,
    		                'path' => str_replace("$root/", '', $foundDrive . ':' . $foundPath),
    		                'string' => $foundString
    		            ];
    		        }
    		    }
    		}
		} else {
    		$searchPath = escapeshellarg($path);
    		$query = escapeshellarg($query);
    		$filter = escapeshellarg(".*$filter");
            $cmd = "find -L $searchPath -iregex $filter -type f | xargs grep -i -I -n -R -H $query";
            
            $output = Common::execute($cmd);
            $output = $output["text"];
            
            $output = explode("\n", $output);
            
            foreach ($output as $line) {
                $data = explode(":", $line);
                $result = array();
                if (count($data) > 2) {
                    $file = str_replace($path, '', $data[0]);
                    
                    $result['line'] = $data[1];
                    $result['path'] = str_replace("$root/", '', $data[0]);
                    $result['string'] = htmlentities(str_replace($data[0] . ":" . $data[1] . ':', '', $line));
                    if (strlen($result["string"]) > 500) {
                        $result["string"] = substr($result["string"], 0, 497) . '...';
                    }
                    $results[$file][] = $result;
                }
            }
		}
		
		if (count($results) > 0) {
			Common::send(200, $results);
		} else {
			Common::send(404, "No results found.");
		}

	}
	
	/**
	 * Canonicalizes the given path.
	 *
	 * During normalization, all slashes are replaced by forward slashes ("/").
	 * Furthermore, all "." and ".." segments are removed as far as possible.
	 * ".." segments at the beginning of relative paths are not removed.
	 *
	 * ```php
	 * echo Path::canonicalize("\webmozart\puli\..\css\style.css");
	 * // => /webmozart/css/style.css
	 *
	 * echo Path::canonicalize("../css/./style.css");
	 * // => ../css/style.css
	 * ```
	 *
	 * This method is able to deal with both UNIX and Windows paths.
	 * 
     * @link https://github.com/webmozart/path-util
     * 
	 * @param string $path
	 * @param string $dirSeparator
	 * @return string
	 */
	public static function normalizePath($path, $dirSeparator = '/')
	{
	    if ('' === $path || null === $path) {
	        return '';
	    }
	    
	    $path = str_replace('\\', '/', $path);
	    
	    list($root, $pathWithoutRoot) = self::splitPath($path);
	    
	    $parts = explode('/', $pathWithoutRoot);
	    $canonicalParts = array();
	    
	    // Collapse "." and "..", if possible
	    foreach ($parts as $part) {
	        if ('.' === $part || '' === $part) {
	            continue;
	        }
	        
	        // Collapse ".." with the previous part, if one exists
	        // Don't collapse ".." if the previous part is also ".."
	        if ('..' === $part && count($canonicalParts) > 0
	            && '..' !== $canonicalParts[count($canonicalParts) - 1]) {
	                array_pop($canonicalParts);
	                
	                continue;
	            }
	            
	            // Only add ".." prefixes for relative paths
	            if ('..' !== $part || '' === $root) {
	                $canonicalParts[] = $part;
	            }
	    }
	    
	    // Add the root directory again
	    $canonicalPath = $root.implode('/', $canonicalParts);
	    
	    if ($dirSeparator !== '/') {
	        $canonicalPath = str_replace('/', $dirSeparator, $canonicalPath);
	    }
	    
	    return $canonicalPath;
	}
	
	/**
     * Splits a part into its root directory and the remainder.
     *
     * If the path has no root directory, an empty root directory will be
     * returned.
     *
     * If the root directory is a Windows style partition, the resulting root
     * will always contain a trailing slash.
     *
     * list ($root, $path) = Path::split("C:/webmozart")
     * // => array("C:/", "webmozart")
     *
     * list ($root, $path) = Path::split("C:")
     * // => array("C:/", "")
     * 
     * @link https://github.com/webmozart/path-util
     * 
     * @param string $path The canonical path to split.
     * @return string[] An array with the root directory and the remaining
     *                  relative path.
     */
	private static function splitPath($path)
	{
	    if ('' === $path || null === $path) {
	        return array('', '');
	    }
	    
	    // Remember scheme as part of the root, if any
	    if (false !== ($pos = strpos($path, '://'))) {
	        $root = substr($path, 0, $pos + 3);
	        $path = substr($path, $pos + 3);
	    } else {
	        $root = '';
	    }
	    
	    $length = strlen($path);
	    
	    // Remove and remember root directory
	    if ('/' === $path[0]) {
	        $root .= '/';
	        $path = $length > 1 ? substr($path, 1) : '';
	    } elseif ($length > 1 && ctype_alpha($path[0]) && ':' === $path[1]) {
	        if (2 === $length) {
	            // Windows special case: "C:"
	            $root .= $path.'/';
	            $path = '';
	        } elseif ('/' === $path[2]) {
	            // Windows normal case: "C:/"..
	            $root .= substr($path, 0, 3);
	            $path = $length > 3 ? substr($path, 3) : '';
	        }
	    }
	    
	    return array($root, $path);
	}
}