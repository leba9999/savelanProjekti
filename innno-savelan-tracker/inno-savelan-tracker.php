<?php 
/*
Plugin Name: Inno Save LAN Tracker
description: Plugin for tracking visiting clients in Save LAN wordpress website
Author: Hanna Kaimo, Leevi Koskinen, Janne Lähteenmäki, Elsa Rajala, Heini Rinne, Olli Ruuskanen
Version: 1.0.0
*/

/* 
Securing direct access to plugin PHP files.
If file is not accessed through wordpress absolute path, we will kill the php.
*/
if( !defined('ABSPATH')){
    die("Error: 404 Not Found");
}

include_once('includes/admin-settings-page.php');

function track_visitor() {

    $visitor_data = array(
        'ip' => $_SERVER['REMOTE_ADDR'],
        'user_agent' => $_SERVER['HTTP_USER_AGENT'],
        'timestamp' => date('Y-m-d H:i:s', current_time('timestamp')),
        'referrer' => $_SERVER['HTTP_REFERER'],
        'url' => get_permalink(), // Get the current page's URL
        // Include additional data as needed
    );

    $backend_url = get_option('tracker_plugin_ip_domain', 'http://localhost:3000/api/v1'); // Get the backend URL from the admin settings page
    $request_body = json_encode($visitor_data);
    $content_type = 'application/json';
	
	set_transient('visitor_data', $visitor_data, 60); // Adjust the timeout as needed
    wp_schedule_single_event(time(), 'send_tracking_data_event');
}
// Function to actually send tracking data to the backend
function send_tracking_data() {
    $visitor_data = get_transient('visitor_data'); // Retrieve the data stored in transient

    if ($visitor_data) {
        $backend_url = get_option('tracker_plugin_ip_domain', 'http://localhost:3000/api/v1');
        $request_body = json_encode($visitor_data);
        $content_type = 'application/json';

        // Send data to the backend using wp_remote_post
        wp_remote_post($backend_url, array(
            'body' => $request_body,
            'headers' => array('Content-Type' => $content_type),
        ));

        // Data has been sent, remove the transient
        delete_transient('visitor_data');
    }
}

// Hook the send_tracking_data function to the scheduled event
add_action('send_tracking_data_event', 'send_tracking_data');
add_action('wp_footer', 'track_visitor'); // Adds the tracking function to the footer of the website
add_action('admin_menu', 'setup_menu'); // Adds the admin settings page to the admin menu
?>