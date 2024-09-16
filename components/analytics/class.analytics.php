<?php

//////////////////////////////////////////////////////////////////////////////80
// Analytics Class
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

class Analytics {

    //////////////////////////////////////////////////////////////////////////80
    // PROPERTIES
    //////////////////////////////////////////////////////////////////////////80

    private $home = "https://www.atheos.io/analytics";
    private $db = null;

    //////////////////////////////////////////////////////////////////////////80
    // METHODS
    //////////////////////////////////////////////////////////////////////////80

    // ----------------------------------||---------------------------------- //

    //////////////////////////////////////////////////////////////////////////80
    // Construct
    //////////////////////////////////////////////////////////////////////////80
    public function __construct() {
        ini_set("user_agent", "Atheos");
        $this->db = Common::getKeyStore("analytics");
    }

    //////////////////////////////////////////////////////////////////////////80
    // Set Initial Version
    //////////////////////////////////////////////////////////////////////////80
    public function init() {
        $data = $this->db->select("*");

        if (empty($data)) {
            $data = array();
        }
        $data = $this->refresh($data);
        $this->db->update($data, null, true);

        if ($data["enabled"] === true && Common::checkAccess("configure")) {
            $data["last_heard"] = date("Y/m/d");
            $data["rVersion"] = Common::version();

            $reply = array(
                "home" => defined("DATAPOINT") ? DATAPOINT : $this->home,
                "data" => $data
            );

            $status = 200;
        } elseif ($data["enabled"] === "UNKNOWN" && Common::checkAccess("configure")) {
            $reply = "Analytic settings require action.";
            $status = 103;
        } else {
            $reply = "Not authorized.";
            $status = 403;
        }

        Common::send($status, $reply);
    }

    //////////////////////////////////////////////////////////////////////////80
    // Refresh analytics cache
    //////////////////////////////////////////////////////////////////////////80
    public function refresh($data = array()) {
        global $plugins;

        if (!isset($data["enabled"])) $data["enabled"] = "UNKNOWN";
        if (!isset($data["uuid"])) $data["uuid"] = uniqid();

        if (!isset($data["iVersion"])) $data["iVersion"] = Common::version();
        if (!isset($data["rVersion"])) $data["rVersion"] = Common::version();
        if (!isset($data["first_heard"])) $data["first_heard"] = date("Y/m/d");
        if (!isset($data["uuid"])) $data["uuid"] = uniqid();

        $data["last_heard"] = date("Y/m/d");
        $data["php_version"] = phpversion();
        $data["server_os"] = SERVER("SERVER_SOFTWARE");

        $browser = Common::getBrowser();

        if (!isset($data["client_os"])) {
            $data["client_os"] = [$browser];
        } elseif (!is_array($data["client_os"])) {
            $data["client_os"] = [$browser];
        } elseif (!in_array($browser, $data["client_os"])) {
            $data["client_os"][] = $browser;
        }

        $data["timezone"] = TIMEZONE;
        $data["language"] = LANGUAGE;

        $data["plugins"] = $plugins;

        return $data;
    }

    //////////////////////////////////////////////////////////////////////////80
    // Update a specific value in the analytics
    //////////////////////////////////////////////////////////////////////////80
    public function update($key, $val) {
        DEBUG($key);
        DEBUG($val);
        
        $status = $this->db->update($key, $val) ? 200 : 507;
        $text = $status === 200 ? "Updated $key in analytics cache." : "Unable to update analytics cache.";
        Common::send($status, $text);
    }

    //////////////////////////////////////////////////////////////////////////80
    // Save session duration
    //////////////////////////////////////////////////////////////////////////80
    public function saveDuration($duration) {
        $usage = $this->db->select("totalUsage");
        $sessions = $this->db->select("sessions");

        if (empty($usage)) $usage = "PT0S";
        if (empty($sessions)) $sessions = 0;

        $usage = new DateInterval($usage);

        $totalSeconds = $usage->s + ($usage->i * 60) + ($usage->h * 3600) + ($usage->d * 86400);
        $totalSeconds = $totalSeconds + $duration;

        $duration = Duration::stringify($totalSeconds);
        debug($duration);
        $this->db->update("totalUsage", $duration, true);
        $this->db->update("sessions", $sessions + 1, true);
        Common::send(200);
    }
}


class Duration {

    // Source-ish: https://github.com/nicolas-van/simple-duration
    // This was the worst thing I've ever made, completely unnecessary

    // Overall, I was frustrated that you can't add DateIntervals together, nor
    // can you have them print out easily in a format that they can consume.
    // Creating this took an insane number of hours due to the absolutely
    // miserable way of storing everything as dates, with timezones somehow
    // breaking things in between.

    const s = 1;
    const i = self::s * 60;
    const h = self::i * 60;
    const d = self::h * 24;
    const m = self::d * 30.437;
    const y = self::m * 12;

    public static function stringify ($nbr) {

        $timeunits = [
            ["unit" => 'Y',
                "amount" => self::y],
            ["unit" => 'M',
                "amount" => self::m],
            ["unit" => 'D',
                "amount" => self::d],
            ["unit" => 'T',
                "amount" => 1],
            ["unit" => 'H',
                "amount" => self::h],
            ["unit" => 'M',
                "amount" => self::i],
            ["unit" => 'S',
                "amount" => self::s],
        ];

        $str = "";
        $nbr = abs($nbr);

        foreach ($timeunits as $el) {
            if ($el["unit"] === "T") {
                $str .= "T";
                continue;
            }

            $tmp = floor($nbr / $el["amount"]);
            $nbr -= $tmp * $el["amount"];

            if ($tmp > 0) {
                $str .= $tmp . $el["unit"];
            }

        }
        return strlen($str) > 0 ? "P" . trim($str) : "PT0S";
    }
}