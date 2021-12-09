<?php

//////////////////////////////////////////////////////////////////////////////80
// i18n Class
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

class i18n {

	//////////////////////////////////////////////////////////////////////////80
	// PROPERTIES
	//////////////////////////////////////////////////////////////////////////80

	protected $cache = array();
	protected $fallbackLang = 'en';
	protected $forcedLang = NULL;

	protected $langCodes = array(
		"en" => "english",
		"fr" => "français",
		"it" => "italiano",
		"ru" => "русский",
		"de" => "deutsch",
		"es" => "español",
		"pt" => "português",
		"ro" => "romanian",
		"hu" => "magyar",
		"sv" => "swedish",
		"cn" => "简体中文",
		"pl" => "polish",
		"cz" => "česky",
		"sk" => "slovak",
		"sr" => "српски",
		"bg" => "Български",
		"tr" => "Türkçe",
		"ja" => "日本語",
		"nl" => "Nederlands"
	);


	//////////////////////////////////////////////////////////////////////////80
	// The following properties are only available after calling init().
	//////////////////////////////////////////////////////////////////////////80

	/**
	* User languages
	* These are the languages the user uses, in order:
	* 1. Forced language
	* 2. Language in $_SESSION['lang']
	* 3. Fallback language
	*/
	protected $userLangs = array();
	protected $appliedLang = NULL;


	//////////////////////////////////////////////////////////////////////////80
	// METHODS
	//////////////////////////////////////////////////////////////////////////80

	// ----------------------------------||---------------------------------- //

	//////////////////////////////////////////////////////////////////////////80
	// Construct
	//////////////////////////////////////////////////////////////////////////80
	public function __construct($fallbackLang = NULL, $forcedLang = NULL) {
		// Apply settings
		if ($fallbackLang !== NULL) {
			$this->fallbackLang = $fallbackLang;
		}
		if ($forcedLang !== NULL) {
			$this->forcedLang = $forcedLang;
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Init
	//////////////////////////////////////////////////////////////////////////80
	public function init() {
		$this->userLangs = $this->getUserLangs();


		// search for language file
		$this->appliedLang = NULL;

		foreach ($this->userLangs as $priority => $langcode) {
			if (file_exists($this->getLangFileName($langcode))) {
				$this->appliedLang = $langcode;
				break;
			}
		}

		// search for cache file
		$cacheFilePath = DATA . '/cache/i18n_' . $this->appliedLang . '.cache.php';

		// whether we need to create a new cache file
		$outdated = false;
		if (!file_exists($cacheFilePath)) {
			$outdated = true;
		} else {
			$mCache = filemtime($cacheFilePath);
			$mPlang = filemtime($this->getLangFileName($this->appliedLang));
			$mFlang = filemtime($this->getLangFileName($this->fallbackLang));

			if ($mCache < $mPlang) {
				// the language config was updated
				$outdated = true;
			} elseif ($mCache < $mFlang) {
				// the fallback language config was updated
				$outdated = true;
			}

		}

		if ($outdated) {
			$appliedData = $this->load($this->appliedLang);
			if ($this->appliedLang !== $this->fallbackLang) {
				$fallbackData = $this->load($this->fallbackLang);
				$appliedData = $this->merge($fallbackData, $appliedData);
			}

			$compiled = "<?php\n"
			. "return array(\n"
			. $this->compile($appliedData)
			. ");\n"
			. "?>";

			if (!is_dir(DATA . '/cache/')) {
				mkdir(DATA . '/cache/', 0755, true);
			}
			if (file_put_contents($cacheFilePath, $compiled) === FALSE) {
				throw new Exception("Could not create langauge cache");
			}
			chmod($cacheFilePath, 0755);

		}

		$this->cache = require_once $cacheFilePath;
	}

	//////////////////////////////////////////////////////////////////////////80
	// Translate
	//////////////////////////////////////////////////////////////////////////80
	public function translate($string, $args = NULL) {
		if (!empty($args) && !is_array($args)) {
			$args = array($args);
		}
		if (array_key_exists($string, $this->cache)) {
			$result = $this->cache[$string];
		} else {
			$result = $string;

			$time = date("Y-m-d H:i:s");
			$trace = debug_backtrace(null, 5);

			$line = $trace[1]['line'];
			$file = $trace[1]['file'];

			$string = "Missing {\"$string\"} for {$this->appliedLang}";
			$string = str_pad($string, 40, ".", STR_PAD_RIGHT);

			$text = "@$time: $string < Ln:$line in $file";

			Common::log($text, "lang");

		}
		$result = str_replace("\\", "", $result);
		return $args ? vsprintf($result, $args) : $result;
	}

	//////////////////////////////////////////////////////////////////////////80
	// Get user langauges by priorty: Forced, Session, Fallback
	//////////////////////////////////////////////////////////////////////////80
	public function getUserLangs() {
		$userLangs = array();

		// Highest priority: forced language
		if ($this->forcedLang !== NULL) $userLangs[] = $this->forcedLang;

		// 2nd highest priority: SESSION parameter 'lang'
		if (SESSION("lang")) $userLangs[] = SESSION("lang");

		// 3rd highest priority: HTTP_ACCEPT_LANGUAGE
		$languge = SERVER("HTTP_ACCEPT_LANGUAGE");
		if ($languge) {
			foreach (explode(',', $languge) as $part) {
				$userLangs[] = strtolower(substr($part, 0, 2));
			}
		}

		// Lowest priority: fallback
		$userLangs[] = $this->fallbackLang;

		// remove duplicate elements
		$userLangs = array_unique($userLangs);

		return $userLangs;
	}

	public function getCache() {
		return $this->cache;
	}

	//////////////////////////////////////////////////////////////////////////80
	// Return filename for language data file
	//////////////////////////////////////////////////////////////////////////80
	protected function getLangFileName($code) {
		return str_replace('{LANGUAGE}', $code, BASE_PATH . "/languages/{LANGUAGE}.json");
	}

	//////////////////////////////////////////////////////////////////////////80
	// Load language file code
	//////////////////////////////////////////////////////////////////////////80
	protected function load($code) {
		$filename = $this->getLangFileName($code);
		return json_decode(file_get_contents($filename), true);
	}

	public function codes() {
		return $this->langCodes;
	}

	protected function cleanLang($array) {
		function recurse($alpha) {
			foreach ($alpha as $key => $value) {

				// create new key in $alpha, if it is empty or not an array
				if (!isset($alpha[$key]) || (isset($alpha[$key]) && !is_array($alpha[$key]))) {
					$alpha[$key] = array();
				}

				// overwrite the value in the base array
				if (is_array($value)) {
					$value = recurse($alpha[$key], $value);
				} else {
					$value = false;
				}
				$alpha[$key] = $value;
			}
			return $alpha;
		}

		$array = recurse($array);
		return $array;
	}

	protected function merge($array, $array1) {
		// https://stackoverflow.com/questions/2874035/php-array-replace-recursive-alternative
		function recurse($alpha, $bravo) {
			foreach ($bravo as $key => $value) {
				if ($value === false) {
					continue;
				}

				// create new key in $alpha, if it is empty or not an array
				if (!isset($alpha[$key]) || (isset($alpha[$key]) && !is_array($alpha[$key]))) {
					$alpha[$key] = array();
				}

				// overwrite the value in the base array
				if (is_array($value)) {
					$value = recurse($alpha[$key], $value);
				}
				$alpha[$key] = $value;
			}
			return $alpha;
		}

		if (!is_array($array) || !is_array($array1)) {
			return $array;
		}
		$array = recurse($array, $array1);
		return $array;
	}

	/**
	* Recursively compile an associative array to PHP code.
	*/
	protected function compile($config, $prefix = '') {
		$code = "";
		foreach ($config as $key => $value) {
			if (is_array($value)) {
				$code .= $this->compile($value, $prefix . $key . "_");
			} elseif (preg_match('/^[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*$/', $key) || $key === "") {
				$key = rtrim($prefix . $key, "_");
				$code .= "\t\"$key\" => \"" . str_replace('\'', '\\\'', $value) . "\",\n";
			}
		}
		return $code;
	}
}