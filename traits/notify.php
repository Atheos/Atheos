<?php

//////////////////////////////////////////////////////////////////////////////80
// Notify trait
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/docs/LICENSE.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

trait Notify {

    //////////////////////////////////////////////////////////////////////////80
    // Send notications or alerts to user configured endpoints
    //////////////////////////////////////////////////////////////////////////80
    public static function sendNotification($body, $subject) {
        if (!defined("NOTIFY_URL")) return false;
        if (!defined("NOTIFY_FORM")) return false;
        if (!defined("NOTIFY_PAYLOAD")) return false;

        $subject = "Atheos: " . $subject;

        try {
            $payload = json_decode(str_replace(
                ["{subject}", "{body}"],
                [$subject, $body],
                json_encode(NOTIFY_PAYLOAD)
            ), true);

            $ch = curl_init(NOTIFY_URL);
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => NOTIFY_FORM ?? false ? $payload : json_encode($payload),
                CURLOPT_HTTPHEADER => NOTIFY_FORM ?? false ? [] : ["Content-Type: application/json"],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 5,
            ]);
            curl_exec($ch);
            $ok = curl_errno($ch) === 0;
            curl_close($ch);
            return $ok;
        } catch (Exception $e) {
            return $e;
        }
    }
}