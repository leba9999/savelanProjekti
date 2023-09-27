<?php 
/*
Plugin Name: Inno Save LAN Tracker
description: Plugin for tracking visiting users/clients in Save LAN wordpress website
Author: Hanna Kaimo, Leevi Koskinen, Janne Lähteenmäki, Elsa Rajala, Heini Rinne, Olli Ruuskanen
Version: 1.0
*/

function ist_setup_menu(){
    add_menu_page( 'Inno Save LAN Tracker', 'ClientTracker', 'manage_options', 'inno-savelan-tracker', 'ist_admin_page' );
}

function ist_admin_page(){
    echo "<h1>ClientTracker</h1>";
    echo "<p>ClientTracker is a plugin for tracking visiting users/clients in Save LAN wordpress website.</p>";
    echo "<p>In this page you can edit plugin settings.</p>";
}

function track_visitor() {
    $visitor_data = array(
        'ip' => $_SERVER['REMOTE_ADDR'],
        'user_agent' => $_SERVER['HTTP_USER_AGENT'],
        'timestamp' => current_time('timestamp'),
        'url' => $_SERVER['REQUEST_URI'],
        'referrer' => $_SERVER['HTTP_REFERER'],
        // Lisää tarvittaessa lisää tietoja
    );

    // Lähetä tiedot backend-palvelimelle HTTP POST -pyynnöllä
    $backend_url = 'http://localhost:3000/api/v1'; // Vaihda oikeaan URL-osoitteeseen
    $response = wp_safe_remote_post($backend_url, array(
        'body' => json_encode($visitor_data),
        'headers' => array('Content-Type' => 'application/json'),
    ));

    if (is_wp_error($response)) {
        // Virheenkäsittely, jos pyyntö epäonnistui
        error_log('Tietojen lähettäminen epäonnistui: ' . $response->get_error_message());
    } else {
        // Tietojen lähettäminen onnistui
        BugFu::log($visitor_data);
    }
}

add_action('wp_footer', 'track_visitor');
add_action('admin_menu', 'ist_setup_menu');


add_action('wp_footer', 'track_visitor');
add_action('admin_menu', 'ist_setup_menu');

?>