<?php

$theme = (defined("THEME") && THEME) ? THEME : "blue";
$baseUrl = (defined("BASE_URL") && BASE_URL) ? BASE_URL : "";

if (strpos($theme, "red") !== false) {
    //////////////////////////////////////////////////////////////////////////80
    // Red
    //////////////////////////////////////////////////////////////////////////80
    ?>
    <link rel="icon" type="image/png" sizes="32x32" href="<?php echo $baseUrl; ?>/favicons/red/favicon-32x32.png?v=2">
    <link rel="icon" type="image/png" sizes="16x16" href="<?php echo $baseUrl; ?>/favicons/red/favicon-16x16.png?v=2">
    <link rel="manifest" href="<?php echo $baseUrl; ?>/favicons/red/site.webmanifest">
    <link rel="mask-icon" href="<?php echo $baseUrl; ?>/favicons/red/safari-pinned-tab.svg?v=2" color="#5bbad5">
    <link rel="shortcut icon" href="<?php echo $baseUrl; ?>/favicons/red/favicon.ico?v=2">
    <meta name="msapplication-TileColor" content="#111111">
    <meta name="msapplication-config" content="<?php echo $baseUrl; ?>/favicons/red/browserconfig.xml">
    <meta name="theme-color" content="#ffffff">

    <?php
} elseif (strpos($theme, "green") !== false) {
    //////////////////////////////////////////////////////////////////////////80
    // Green
    //////////////////////////////////////////////////////////////////////////80
    ?>
    <link rel="icon" type="image/png" sizes="32x32" href="<?php echo $baseUrl; ?>/favicons/green/favicon-32x32.png?v=2">
    <link rel="icon" type="image/png" sizes="16x16" href="<?php echo $baseUrl; ?>/favicons/green/favicon-16x16.png?v=2">
    <link rel="manifest" href="<?php echo $baseUrl; ?>/favicons/green/site.webmanifest">
    <link rel="mask-icon" href="<?php echo $baseUrl; ?>/favicons/green/safari-pinned-tab.svg?v=2" color="#5bbad5">
    <link rel="shortcut icon" href="<?php echo $baseUrl; ?>/favicons/green/favicon.ico?v=2">
    <meta name="msapplication-TileColor" content="#111111">
    <meta name="msapplication-config" content="<?php echo $baseUrl; ?>/favicons/green/browserconfig.xml">
    <meta name="theme-color" content="#ffffff">

    <?php
// } elseif (strpos($theme, "blue") !== false) {
} else {
    //////////////////////////////////////////////////////////////////////////80
    // Blue, default favicon
    //////////////////////////////////////////////////////////////////////////80
    ?>
    <link rel="icon" type="image/png" sizes="32x32" href="<?php echo $baseUrl; ?>/favicons/blue/favicon-32x32.png?v=2">
    <link rel="icon" type="image/png" sizes="16x16" href="<?php echo $baseUrl; ?>/favicons/blue/favicon-16x16.png?v=2">
    <link rel="manifest" href="<?php echo $baseUrl; ?>/favicons/blue/site.webmanifest">
    <link rel="mask-icon" href="<?php echo $baseUrl; ?>/favicons/blue/safari-pinned-tab.svg?v=2" color="#5bbad5">
    <link rel="shortcut icon" href="<?php echo $baseUrl; ?>/favicons/blue/favicon.ico?v=2">
    <meta name="msapplication-TileColor" content="#111111">
    <meta name="msapplication-config" content="<?php echo $baseUrl; ?>/favicons/blue/browserconfig.xml">
    <meta name="theme-color" content="#ffffff">
    <?php
}
