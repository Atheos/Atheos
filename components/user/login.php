<canvas id="synthetic"></canvas>
<div id="logo">
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1920" width="320" height="400" version="1.1">
		<path class="delay-0" style="fill:var(--black)" d="M80 480L960 0l880 480v960l-880 480-880-480z" />
		<path class="delay-1" style="fill:var(--blue)" d="M560 217.68L80 480v360L0 880v160l80 40v360l480 260v-80l-400-220v-360l-80-40v-80l80-40V520l266.84-146.76L560 300zm800 2.32v80l400 220v360l80 40v80l-80 40v360l-400 220v80c162.74-81.368 318.86-175.56 480-260v-360l80-60V900l-80-60V480z" />
		<path class="delay-2" style="fill:var(--blue)" d="M240 420v1080h80V420zm1360 0v1080h80V420z" />
		<path class="delay-3" style="fill:var(--blue)" d="M960 180L480 440v1040l240 120V560l240-140 240 140v1040l240-120V440zm0 80l400 220v960l-80 40V520L960 340 640 520v960l-80-40V480z" />
		<path class="delay-3" style="fill:var(--blue)" d="M960 980L520 740v80l440 240 440-220v-80z" />
	</svg>
</div>

<form id="login" method="post" autocomplete="off">
	<fieldset>
		<legend>Atheos <span>IDE</span></legend>
		<label for="username"><i class="fas fa-user"></i><?php echo i18n("username"); ?></label>
		<input id="username" type="text" name="username" autofocus="autofocus" autocomplete="current-username">

		<label for="password"><i class="fas fa-key"></i><?php echo i18n("password"); ?></label>
		<input id="password" type="password" name="password" autocomplete="current-password">
		<i for="password" class="fas fa-eye-slash merged-icon togglePassword"></i>

		<div id="login_options">
			<label for"theme"><i class="fas fa-images"></i> <?php echo i18n("theme"); ?></label>
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
			<label for="language"><i class="fas fa-language"></i> <?php echo i18n("language"); ?></label>
			<select name="language" id="language">
				<?php
				$languages = $i18n->codes();
				foreach ($languages as $code => $lang) {

					$lang = ucfirst(strtolower($lang));
					
					$option = "<option value=\"$code\"";
					if ($code === "en") $option .= "selected";
					$option .= ">$lang</option>";
					
					echo $option;
				} ?>
			</select>
		</div>

		<input id="remember" type="checkbox" name="remember" class="large">
		<label for="remember"><?php echo i18n("rememberMe"); ?></label>

		<button><?php echo i18n("login"); ?></button>
		<button id="show_login_options"><?php echo i18n("more"); ?></button>
		<button id="hide_login_options" style="display:none;"><?php echo i18n("less"); ?></button>

	</fieldset>
</form>
<div id="toast_container" class="bottom-right"></div>

<script src="components/i18n/init.js"></script>
<script src="components/user/init.js"></script>