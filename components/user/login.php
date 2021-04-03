<canvas id="synthetic"></canvas>
<?php require_once("templates/logo.php"); ?>
<script src="components/user/init.js"></script>

<form id="login" method="post" autocomplete="off">
	<fieldset>
		<legend>Atheos <span>IDE</span></legend>
		<label for="username"><i class="fas fa-user"></i><?php echo i18n("username"); ?></label>
		<input id="username" type="text" name="username" autofocus="autofocus" autocomplete="current-username">

		<label for="password"><i class="fas fa-key"></i><?php echo i18n("password"); ?></label>
		<input id="password" type="password" name="password" autocomplete="current-password">
		<i for="password" class="fas fa-eye-slash merged-icon togglePassword"></i>

		<div id="login_options">
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