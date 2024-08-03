<?php

$theme = (defined("THEME") && THEME) ? THEME : "blue";


switch ($theme) {
    //////////////////////////////////////////////////////////////////////////80
    // Red
    //////////////////////////////////////////////////////////////////////////80
    case "red": ?>
        <link rel="icon" type="image/png" sizes="32x32" href="favicons/red/favicon-32x32.png?v=2">
        <link rel="icon" type="image/png" sizes="16x16" href="favicons/red/favicon-16x16.png?v=2">
        <link rel="manifest" href="favicons/red/site.webmanifest">
        <link rel="mask-icon" href="favicons/red/safari-pinned-tab.svg?v=2" color="#5bbad5">
        <link rel="shortcut icon" href="favicons/red/favicon.ico?v=2">
        <meta name="msapplication-TileColor" content="#111111">
        <meta name="msapplication-config" content="favicons/red/browserconfig.xml">
        <meta name="theme-color" content="#ffffff">

        <?php break;

    //////////////////////////////////////////////////////////////////////////80
    // Green
    //////////////////////////////////////////////////////////////////////////80
    case "green": ?>
        <link rel="icon" type="image/png" sizes="32x32" href="favicons/green/favicon-32x32.png?v=2">
        <link rel="icon" type="image/png" sizes="16x16" href="favicons/green/favicon-16x16.png?v=2">
        <link rel="manifest" href="favicons/green/site.webmanifest">
        <link rel="mask-icon" href="favicons/green/safari-pinned-tab.svg?v=2" color="#5bbad5">
        <link rel="shortcut icon" href="favicons/green/favicon.ico?v=2">
        <meta name="msapplication-TileColor" content="#111111">
        <meta name="msapplication-config" content="favicons/green/browserconfig.xml">
        <meta name="theme-color" content="#ffffff">

        <?php break;

    //////////////////////////////////////////////////////////////////////////80
    // Blue, default favicon
    //////////////////////////////////////////////////////////////////////////80
    default: ?>
        <link rel="icon" type="image/png" sizes="32x32" href="favicons/blue/favicon-32x32.png?v=2">
        <link rel="icon" type="image/png" sizes="16x16" href="favicons/blue/favicon-16x16.png?v=2">
        <link rel="manifest" href="favicons/blue/site.webmanifest">
        <link rel="mask-icon" href="favicons/blue/safari-pinned-tab.svg?v=2" color="#5bbad5">
        <link rel="shortcut icon" href="favicons/blue/favicon.ico?v=2">
        <meta name="msapplication-TileColor" content="#111111">
        <meta name="msapplication-config" content="favicons/blue/browserconfig.xml">
        <meta name="theme-color" content="#ffffff">

        <?php break;

} ?>