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
        'url' => $_SERVER['REQUEST_URI'],
        'referrer' => $_SERVER['HTTP_REFERER'],
        // Lisää tarvittaessa lisää tietoja
    );
    $backend_url = get_option('tracker_plugin_ip_domain', "http://localhost:3000/api/v1"); // Get the backend url from the admin settings page
    /*
    // Leevi - Data format testing. There was idea of creating different data formats for the data sent to the backend.
    // XML format worked as well as json format. So we decided to use json format because it was familiar for all of us.
    // This code is commented out because it is not used in the final version of the plugin.
    // This code is left here for future use if needed.

    $data_format = get_option('tracker_plugin_data_format', "json"); // Get the selected data format (JSON or XML)

    BugFu::log($backend_url);
    // Check the selected data format and construct the request accordingly
    if ($data_format === 'xml') {
        // Construct XML data
        $xml = new SimpleXMLElement('<visitor_data/>');
        array_walk_recursive($visitor_data, array ($xml, 'addChild'));
        $request_body = $xml->asXML();
        $content_type = 'application/xml';
    } else {
        $request_body = json_encode($visitor_data);
        $content_type = 'application/json';
    }
    $test = wp_remote_get($backend_url);
    BugFu::log($test);
    */
    $request_body = json_encode($visitor_data);
    $content_type = 'application/json';

    $response = wp_remote_post($backend_url, array(
        'body' => $request_body,
        'headers' => array('Content-Type' => $content_type),
    ));

    if (is_wp_error($response)) {
        // Error handling if the request fails
        error_log('Failed to send data: ' . $response->get_error_message());
    } else {
        // Data sent successfully
    }
}

add_action('wp_footer', 'track_visitor'); // Adds the tracking function to the footer of the website
add_action('admin_menu', 'setup_menu'); // Adds the admin settings page to the admin menu
?>