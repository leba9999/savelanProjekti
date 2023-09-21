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
        // Add more data as needed
    );

    // Store the data in a database or write to a log file
    // You can use WordPress functions like wp_insert_post() or custom database tables.

    BugFu::log($visitor_data);
}

add_action('wp_footer', 'track_visitor');
add_action('admin_menu', 'ist_setup_menu');

?>