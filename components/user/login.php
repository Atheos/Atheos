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
		<a id="github_link" href="https://www.github.com/Atheos/Atheos" target="_blank" rel="noreferrer noopener"><?php echo VERSION ?></a>

	</fieldset>
</form>
<div id="toast_container" class="bottom-right"></div>

<script src="components/user/init.js"></script>