<canvas id="synthetic"></canvas>
<div id="logo">
	<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="40 147.5 320 387.5" width="320" height="335">
		<defs>
			<path id="backdrop" class="delay-0" d="M200.42 460.36L65.67 384.02V231.34L200.42 155l134.75 76.34v152.68l-134.75 76.34z" />
			<path id="leftWing" class="delay-3" d="M40 400V220l80 40v100l60 35v85L40 400z" />
			<path id="leftBar" class="delay-3" d="M120 360l-80 40" />
			<path id="rightWing" class="delay-3" d="M360 400V220l-80 40v100l-60 35v85l140-80z" />
			<path id="rightBar" class="delay-3" d="M280 360l80 40" />
			<path id="alpha" class="delay-2" d="M255 355l-55-115-55 115" />
			<path id="center" class="delay-3" d="M200 490l20-10v-85l60-35V260l-80-50-80 50v100l60 35v85l20 10z" />
			<clipPath id="i" class="delay-2">
				<use xlink:href="#alpha" />
			</clipPath>
		</defs>
		<use xlink:href="#backdrop" fill="var(--navy)" />
		<use xlink:href="#leftWing" fill-opacity="0" stroke="var(--blue)" stroke-width="15" />
		<use xlink:href="#leftBar" fill-opacity="0" stroke="var(--blue)" stroke-width="15" />
		<use xlink:href="#rightWing" fill-opacity="0" stroke="var(--blue)" stroke-width="15" />
		<use xlink:href="#rightBar" fill-opacity="0" stroke="var(--blue)" stroke-width="15" />
		<use xlink:href="#center" fill-opacity="0" stroke="var(--blue)" stroke-width="15" />
		<g clip-path="url(#i)">
			<use  xlink:href="#alpha" fill-opacity="0" stroke="var(--shade0)" stroke-width="30" />
		</g>
	</svg>
</div>

<div id="installer">
	<?php

	/*
    *  Copyright (c) Codiad & Kent Safranski (codiad.com), distributed
    *  as-is and without warranty under the MIT License. See
    *  [root]/license.txt for more. This information must remain intact.
    */

	$path = rtrim(str_replace("index.php", "", $_SERVER['SCRIPT_FILENAME']), "/");

	$workspace = is_writable($path . "/workspace");
	$data = is_writable($path . "/data");
	$plugins = is_writable($path . "/plugins");
	$themes = is_writable($path . "/themes");
	$workspace = is_writable($path . "/workspace");

	$conf = $path . '/config.php';

	$config = is_writable(file_exists($conf) ? $conf : $path);

	if (ini_get('register_globals') == 1) {
		$register = true;
	} else {
		$register = false;
	}

	if (ini_get('newrelic.enabled') == 1) {
		$newrelic = true;
	} else {
		$newrelic = false;
	}

	$query = $_SERVER['QUERY_STRING'];

	$autocomplete = array(
		'username' => '',
		'password' => '',
		'confirm' => '',
		'projectName' => '',
		'projectPath' => '',
		'timezone' => '',
	);

	if (!empty($query)) {
		$params = explode('&', $query);
		foreach ($params as $param) {
			$param = explode('=', $param);
			if (array_key_exists($param[0], $autocomplete)) {
				$autocomplete[$param[0]] = urldecode($param[1]);
			}
		}
	}

	if (!$workspace || !$data || !$config || $register || $newrelic) {
		$passed = "<font style=\"color:green\">" . i18n("passed") . "</font>";
		$failed = "<font style=\"color:red\">" . i18n("failed") . "</font>";


		?>
		<h1><?php echo i18n("installationError"); ?></h1>
		<p>
			<?php echo i18n("existsAndWriteable"); ?>
		</p>
		<div class="install_issues">
			<p>
				[SYSTEM]/config.php -
				<?php echo $config ? $passed : $error; ?>
			</p>
			<p>
				[SYSTEM]/workspace -
				<?php echo $workspace ? $passed : $error; ?>
			</p>
			<p>
				[SYSTEM]/plugins -
				<?php echo $plugins ? $passed : $error; ?>
			</p>
			<p>
				[SYSTEM]/themes -
				<?php echo $themes ? $passed : $error; ?>
			</p>
			<p>
				[SYSTEM]/data -
				<?php echo $data ? $passed : $error; ?>
			</p>
		</div>
		<?php if ($register || $newrelic) {
			?>
			<p>
				<?php echo i18n("envVariablesSet"); ?>
			</p>
			<div class="install_issues">
				<?php
				if ($register) {
					echo '<p>register_globals: Off</p>';
				}
				if ($newrelic) {
					echo '<p>newrelic.enabled: Off</p>';
				}
				?>
			</div>
			<?php
		} ?>
		<button onclick="window.location.reload();"<?php echo i18n("retest"); ?></button>
		<?php
	} else {
		?>
		<form id="install">
			<h1><?php echo i18n("initialSetup"); ?></h1>

			<label><?php echo i18n("dependencies"); ?></label>
			<div id="dependencies">
				<?php
				foreach (array("ZIP", "OpenSSL", "MBString") as $dep) {
					if (extension_loaded(strtolower($dep))) {
						?>
						<div class="success">
							<span class="icon-check"></span> <?= $dep ?>
						</div>
						<?php
					} else {
						?>
						<div class="error">
							<span class="icon-cancel"></span> <?= $dep ?>
						</div>
						<?php
					}
				}
				?>
			</div>

			<input type="hidden" name="path" value="<?php echo($path); ?>">

			<label><?php echo i18n("username_new"); ?></label>
			<input type="text" name="username" autofocus="autofocus" value="<?php echo($autocomplete['username']); ?>">

			<div style="float:left; width: 48%; margin-right: 4%;">

				<label><?php echo i18n("password"); ?></label>
				<input type="password" name="password" value="<?php echo($autocomplete['password']); ?>">

			</div>

			<div style="float:left; width: 48%;">

				<label><?php echo i18n("Confirm Password"); ?></label>
				<input type="password" name="confirm" value="<?php echo($autocomplete['confirm']); ?>">

			</div>

			<div style="clear:both;"></div>

			<hr>

			<label><?php echo i18n("New Project Name"); ?></label>
			<input type="text" name="projectName" value="<?php echo($autocomplete['projectName']); ?>">
			<label><?php echo i18n("Folder Name or Absolute Path"); ?></label>
			<input type="text" name="projectPath" value="<?php echo($autocomplete['projectPath']); ?>">
			<hr>
			<?php
			$location = array(
				"Pacific/Midway" => "(GMT-11:00) Midway Island, Samoa",
				"America/Adak" => "(GMT-10:00) Hawaii-Aleutian",
				"Etc/GMT+10" => "(GMT-10:00) Hawaii",
				"Pacific/Marquesas" => "(GMT-09:30) Marquesas Islands",
				"Pacific/Gambier" => "(GMT-09:00) Gambier Islands",
				"America/Anchorage" => "(GMT-09:00) Alaska",
				"America/Ensenada" => "(GMT-08:00) Tijuana, Baja California",
				"Etc/GMT+8" => "(GMT-08:00) Pitcairn Islands",
				"America/Los_Angeles" => "(GMT-08:00) Pacific Time (US & Canada)",
				"America/Denver" => "(GMT-07:00) Mountain Time (US & Canada)",
				"America/Chihuahua" => "(GMT-07:00) Chihuahua, La Paz, Mazatlan",
				"America/Dawson_Creek" => "(GMT-07:00) Arizona",
				"America/Belize" => "(GMT-06:00) Saskatchewan, Central America",
				"America/Cancun" => "(GMT-06:00) Guadalajara, Mexico City, Monterrey",
				"Chile/EasterIsland" => "(GMT-06:00) Easter Island",
				"America/Chicago" => "(GMT-06:00) Central Time (US & Canada)",
				"America/New_York" => "(GMT-05:00) Eastern Time (US & Canada)",
				"America/Havana" => "(GMT-05:00) Cuba",
				"America/Bogota" => "(GMT-05:00) Bogota, Lima, Quito, Rio Branco",
				"America/Caracas" => "(GMT-04:30) Caracas",
				"America/Santiago" => "(GMT-04:00) Santiago",
				"America/La_Paz" => "(GMT-04:00) La Paz",
				"Atlantic/Stanley" => "(GMT-04:00) Faukland Islands",
				"America/Campo_Grande" => "(GMT-04:00) Brazil",
				"America/Goose_Bay" => "(GMT-04:00) Atlantic Time (Goose Bay)",
				"America/Glace_Bay" => "(GMT-04:00) Atlantic Time (Canada)",
				"America/St_Johns" => "(GMT-03:30) Newfoundland",
				"America/Araguaina" => "(GMT-03:00) UTC-3",
				"America/Montevideo" => "(GMT-03:00) Montevideo",
				"America/Miquelon" => "(GMT-03:00) Miquelon, St. Pierre",
				"America/Godthab" => "(GMT-03:00) Greenland",
				"America/Argentina/Buenos_Aires" => "(GMT-03:00) Buenos Aires",
				"America/Sao_Paulo" => "(GMT-03:00) Brasilia",
				"America/Noronha" => "(GMT-02:00) Mid-Atlantic",
				"Atlantic/Cape_Verde" => "(GMT-01:00) Cape Verde Is.",
				"Atlantic/Azores" => "(GMT-01:00) Azores",
				"Europe/Belfast" => "(GMT) Greenwich Mean Time : Belfast",
				"Europe/Dublin" => "(GMT) Greenwich Mean Time : Dublin",
				"Europe/Lisbon" => "(GMT) Greenwich Mean Time : Lisbon",
				"Europe/London" => "(GMT) Greenwich Mean Time : London",
				"Africa/Abidjan" => "(GMT) Monrovia, Reykjavik",
				"Europe/Amsterdam" => "(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna",
				"Europe/Belgrade" => "(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague",
				"Europe/Brussels" => "(GMT+01:00) Brussels, Copenhagen, Madrid, Paris",
				"Africa/Algiers" => "(GMT+01:00) West Central Africa",
				"Africa/Windhoek" => "(GMT+01:00) Windhoek",
				"Asia/Beirut" => "(GMT+02:00) Beirut",
				"Africa/Cairo" => "(GMT+02:00) Cairo",
				"Asia/Gaza" => "(GMT+02:00) Gaza",
				"Africa/Blantyre" => "(GMT+02:00) Harare, Pretoria",
				"Asia/Jerusalem" => "(GMT+02:00) Jerusalem",
				"Europe/Minsk" => "(GMT+02:00) Minsk",
				"Asia/Damascus" => "(GMT+02:00) Syria",
				"Europe/Moscow" => "(GMT+03:00) Moscow, St. Petersburg, Volgograd",
				"Africa/Addis_Ababa" => "(GMT+03:00) Nairobi",
				"Asia/Tehran" => "(GMT+03:30) Tehran",
				"Asia/Dubai" => "(GMT+04:00) Abu Dhabi, Muscat",
				"Asia/Yerevan" => "(GMT+04:00) Yerevan",
				"Asia/Kabul" => "(GMT+04:30) Kabul",
				"Asia/Yekaterinburg" => "(GMT+05:00) Ekaterinburg",
				"Asia/Tashkent" => "(GMT+05:00) Tashkent",
				"Asia/Kolkata" => "(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi",
				"Asia/Katmandu" => "(GMT+05:45) Kathmandu",
				"Asia/Dhaka" => "(GMT+06:00) Astana, Dhaka",
				"Asia/Novosibirsk" => "(GMT+06:00) Novosibirsk",
				"Asia/Rangoon" => "(GMT+06:30) Yangon (Rangoon)",
				"Asia/Bangkok" => "(GMT+07:00) Bangkok, Hanoi, Jakarta",
				"Asia/Krasnoyarsk" => "(GMT+07:00) Krasnoyarsk",
				"Asia/Hong_Kong" => "(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi",
				"Asia/Irkutsk" => "(GMT+08:00) Irkutsk, Ulaan Bataar",
				"Australia/Perth" => "(GMT+08:00) Perth",
				"Australia/Eucla" => "(GMT+08:45) Eucla",
				"Asia/Tokyo" => "(GMT+09:00) Osaka, Sapporo, Tokyo",
				"Asia/Seoul" => "(GMT+09:00) Seoul",
				"Asia/Yakutsk" => "(GMT+09:00) Yakutsk",
				"Australia/Adelaide" => "(GMT+09:30) Adelaide",
				"Australia/Darwin" => "(GMT+09:30) Darwin",
				"Australia/Brisbane" => "(GMT+10:00) Brisbane",
				"Australia/Hobart" => "(GMT+10:00) Hobart",
				"Asia/Vladivostok" => "(GMT+10:00) Vladivostok",
				"Australia/Lord_Howe" => "(GMT+10:30) Lord Howe Island",
				"Etc/GMT-11" => "(GMT+11:00) Solomon Is., New Caledonia",
				"Asia/Magadan" => "(GMT+11:00) Magadan",
				"Pacific/Norfolk" => "(GMT+11:30) Norfolk Island",
				"Asia/Anadyr" => "(GMT+12:00) Anadyr, Kamchatka",
				"Pacific/Auckland" => "(GMT+12:00) Auckland, Wellington",
				"Etc/GMT-12" => "(GMT+12:00) Fiji, Kamchatka, Marshall Is.",
				"Pacific/Chatham" => "(GMT+12:45) Chatham Islands",
				"Pacific/Tongatapu" => "(GMT+13:00) Nuku'alofa",
				"Pacific/Kiritimati" => "(GMT+14:00) Kiritimati",
			);
			?>

			<label><?php echo i18n("timezone"); ?></label>
			<select name="timezone">
				<?php
				$timezones = '';
				foreach ($location as $key => $city) {
					if ($autocomplete['timezone'] == $key) {
						$timezones .= '<option selected="selected" value="' . $key . '">' . $city . '</option>';
					} else {
						$timezones .= '<option value="' . $key . '">' . $city . '</option>';
					}
				}
				echo($timezones);
				?>
			</select>

			<button><?php echo i18n("install"); ?></button>
		</form>
		<?php
	}
	?>

</div>
<script src="components/install/init.js"></script>