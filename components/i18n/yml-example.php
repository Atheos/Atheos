<?php
	// Load dependencies
	require __DIR__ . '/vendor/autoload.php';

	// Include the i18n class. In a separate project this step is not needed since
	// it will be loaded by the auto loader above
	require_once 'i18n.class.php';

	// Initialize the i18n class
	$i18n = new i18n('lang/lang_{LANGUAGE}.yml', 'langcache/', 'en');
	// Parameters: language file path, cache dir, default language (all optional)

	// init object: load language files, parse them if not cached, and so on.
	$i18n->init();
?>

<!-- get applied language -->
<p>Applied Language: <?php echo $i18n->getAppliedLang(); ?> </p>

<!-- get the cache path -->
<p>Cache path: <?php echo $i18n->getCachePath(); ?></p>

<!-- Get some greetings -->
<p>A greeting: <?php echo L::greeting; ?></p>
<p>Something other: <?php echo L::category_somethingother; ?></p><!-- normally sections in the ini are seperated with an underscore like here. -->
