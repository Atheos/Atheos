<canvas id="synthetic"></canvas>
<?php require_once("templates/logo.php"); ?>
<script src="components/install/init.js"></script>
<?php

//////////////////////////////////////////////////////////////////////////////80
// Common
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

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

$path = str_replace("/index.php", "", $_SERVER['SCRIPT_FILENAME']);

$workspace = is_writable($path . "/workspace");
$data = is_writable($path . "/data");
$plugins = is_writable($path . "/plugins");
$workspace = is_writable($path . "/workspace");

$conf = $path . '/config.php';

$config = is_writable(file_exists($conf) ? $conf : $path);

$register = ini_get('register_globals') === 1;
$newrelic = ini_get('newrelic.enabled') === 1;

$deps = array(
	"ZIP" => extension_loaded("zip"),
	"OpenSSL" => extension_loaded("openssl"),
	"MBString" => extension_loaded("mbstring")
);
$missingDep = false;
foreach ($deps as $dep => $v) {
	$missingDep = $v ? $missingDep : true;
}

if ($missingDep || !$config || !$workspace || !$plugins || !$data || $register || $newrelic) {
	$passed = "<span class=\"success\">" . i18n("passed") . "</span>";
	$failed = "<span class=\"error\">" . i18n("failed") . "</span>";

	?>
	<div id="installer" class="errors">

		<h1><?php echo i18n("installationError"); ?></h1>

		<label><?php echo i18n("dependencies"); ?></label>
		<div class="install_issues">
			<?php
			foreach ($deps as $dep => $val) {
				$type = $val ? "success" : "error";
				echo("<p><i class=\"$type fas fa-circle\"></i>$dep</p>");
			}
			?>
		</div>

		<label><?php echo i18n("existsAndWriteable"); ?></label>
		<div class="install_issues">
			<p>
				<?php echo $config ? $passed : $error; ?>: [SYSTEM]/config.php
			</p>
			<p>
				<?php echo $workspace ? $passed : $error; ?>: [SYSTEM]/workspace
			</p>
			<p>
				<?php echo $plugins ? $passed : $error; ?>: [SYSTEM]/plugins
			</p>
			<p>
				<?php echo $data ? $passed : $error; ?>: [SYSTEM]/data
			</p>
		</div>

		<label><?php echo i18n("envVariablesSet"); ?></label>
		<div class="install_issues">
			<p style="color:<?php echo($register ? "red" : "green"); ?>">
				register_globals: Off
			</p>
			<p style="color:<?php echo($newrelic ? "red" : "green"); ?>">
				newrelic.enabled: Off
			</p>
		</div>
		<button id="retest"><?php echo i18n("retest"); ?></button>
	</div>
	<?php
} else {
	?>
	<div id="installer">
		<form id="install">
			<h1><?php echo i18n("initialSetup"); ?></h1>

			<label><?php echo i18n("username_new"); ?></label>
			<input type="text" name="username" autofocus="autofocus">

			<div style="float:left; width: 48%; margin-right: 4%;">
				<label for="password"><?php echo i18n("password"); ?></label>
				<input type="password" id="password" name="password">
				<i for="password" class="fas fa-eye-slash merged-icon togglePassword"></i>
			</div>

			<div style="float:left; width: 48%;">
				<label for="validate"><?php echo i18n("password_confirm"); ?></label>
				<input type="password" id="validate" name="validate">
				<i for="validate" class="fas fa-eye-slash merged-icon togglePassword"></i>
			</div>

			<div style="clear:both;"></div>

			<label><?php echo i18n("project_name"); ?></label>
			<input type="text" name="projectName">
			<label><?php echo i18n("folderNameOrAbsolutePath"); ?></label>
			<input type="text" name="projectPath">

			<label><?php echo i18n("domain"); ?></label>
			<input type="text" name="domain">

			<label><?php echo i18n("settings"); ?></label>
			<table>
				<tr>
					<td><?php echo i18n("developmentMode"); ?></td>
					<td>
						<toggle>
							<input id="development_true" value="true" name="development" type="radio" checked />
							<label for="development_true"><?php echo i18n("enabled"); ?></label>
							<input id="development_false" value="false" name="development" type="radio" />
							<label for="development_false"><?php echo i18n("disabled"); ?></label>
						</toggle>
					</td>
				</tr>
				<tr>
					<td><?php echo i18n("analytics_enabled"); ?></td>
					<td>
						<toggle>
							<input id="analytics_true" value="true" name="analytics" type="radio" checked />
							<label for="analytics_true"><?php echo i18n("enabled"); ?></label>
							<input id="analytics_false" value="false" name="analytics" type="radio" />
							<label for="analytics_false"><?php echo i18n("disabled"); ?></label>
						</toggle>
					</td>
				</tr>
				<tr>
					<td><?php echo i18n("timezone"); ?></td>
					<td>
						<select name="timezone">
							<?php
							$timezones = '';
							foreach ($location as $key => $city) {
								$timezones .= '<option value="' . $key . '">' . $city . '</option>';
							}
							echo($timezones);
							?>
						</select>
					</td>
				</tr>
			</table>

			<button><?php echo i18n("install"); ?></button>
		</form>
	</div>
	<?php
}
?>