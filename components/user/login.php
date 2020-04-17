<div id="logo">
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1920" width="320" height="400" version="1.1">
		<path class="delay-0" style="fill:#111111" d="M80 480L960 0l880 480v960l-880 480-880-480z" />
		<path class="delay-1" style="fill:#0074d9" d="M560 217.68L80 480v360L0 880v160l80 40v360l480 260v-80l-400-220v-360l-80-40v-80l80-40V520l266.84-146.76L560 300zm800 2.32v80l400 220v360l80 40v80l-80 40v360l-400 220v80c162.74-81.368 318.86-175.56 480-260v-360l80-60V900l-80-60V480z" />
		<path class="delay-2" style="fill:#0074d9" d="M240 420v1080h80V420zm1360 0v1080h80V420z" />
		<path class="delay-3" style="fill:#0074d9" d="M960 180L480 440v1040l240 120V560l240-140 240 140v1040l240-120V440zm0 80l400 220v960l-80 40V520L960 340 640 520v960l-80-40V480z" />
		<path class="delay-3" style="fill:#0074d9" d="M960 980L520 740v80l440 240 440-220v-80z" />
	</svg>
</div>

<form id="login" method="post">
	<fieldset>
		<legend>Atheos <span>IDE</span></legend>
		<label><i class="fas fa-user"></i> <?php i18n("Username"); ?></label>
		<input type="text" name="username" autofocus="autofocus" autocomplete="username">

		<label><i class="fas fa-key"></i> <?php i18n("Password"); ?></label>
		<input type="password" name="password" autocomplete="current-password">
		<!--<span class="icon-eye in-field-icon-right" id="display_password">-->

		<div id="login_options">
			<label><i class="fas fa-images"></i> <?php i18n("Theme"); ?></label>
			<select name="theme" id="theme">
				<?php foreach ($themes as $theme) {
					if (file_exists(THEMES."/" . $theme . "/theme.json")) {
						$data = file_get_contents(THEMES."/" . $theme . "/theme.json");
						$data = json_decode($data, true);
						
						$option = "<option value=\"$theme\"";
						$option .= ($theme === THEME) ? " selected>" : ">";
						$option .= $data["name"] !== "" ? $data["name"] : ucfirst($theme);
						
						$option .= "</option>" . PHP_EOL;
						
						echo $option;
					}
				} ?>
			</select>
			<label><i class="fas fa-language"></i> <?php i18n("Language"); ?></label>
			<select name="language" id="language">
				<?php
				include 'languages/code.php';
				foreach (glob("languages/*.php") as $filename):
				$lang_code = str_replace(array("languages/", ".php"), "", $filename);
				if (!isset($languages[$lang_code])) {
					continue;
				}
				$lang_disp = ucfirst(strtolower($languages[$lang_code])); ?>
				<option value="<?php echo $lang_code; ?>" <?php if ($lang_code == "en") {
					echo "selected";
				} ?>><?php echo $lang_disp; ?></option>
				<?php endforeach; ?>
			</select>
		</div>

		<button><?php i18n("Login"); ?></button>

		<a id="show_login_options"><?php i18n("More"); ?></a>
	</fieldset>
</form>
<script src="components/user/init.js"></script>