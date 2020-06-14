<?php
// include i18n class and initialize it
require_once 'class.i18n.php';
$i18n = new i18n('en');
// Parameters: language file path, cache dir, default language (all optional)

// init object: load language files, parse them if not cached, and so on.
$i18n->init();


function i18n($string, $args = false) {
	global $i18n;
	return $i18n->translate($string, $args);
}

?>

<!-- get applied language -->
<p>
	Applied Language: <?php echo $i18n->appliedLang(); ?>
</p>

<!-- Get some greetings -->
<p>
	A greeting: <?php echo i18n("changePassword", ucfirst("kyle")) ?>
</p>
<p>
	A non-existant: <?php echo i18n("name:"); ?>
</p>
<p>
	A variable: <?php echo i18n("p", "10"); ?>
</p>
<p>
	Something other: <?php echo i18n("category_somethingother"); ?>
</p>
<!-- normally sections in the ini are seperated with an underscore like here. -->