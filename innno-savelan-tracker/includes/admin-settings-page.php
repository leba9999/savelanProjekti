<?php
/* Admin settings page
 * Description: This file initializes the admin settings page for the plugin
 */
function setup_menu(){
    add_menu_page(
        'Inno Save LAN Tracker settings', 
        'SaveLANTracker', 
        'manage_options', 
        'inno-savelan-tracker', 
        'initialize_admin_page' );
}

// Create the options page
function initialize_admin_page() {
    if (isset($_POST['send_test_data'])) {
        // Handle the button click action here
        send_test_data();
    }
    ?>
    <div class="wrap">
        <h2>Save LAN Tracker</h2>
        <p>Save LAN Tracker is a plugin for tracking visiting clients in Save LAN wordpress website.</p>
        <h3>Settings</h3>
        <p>In this page you can edit plugin settings.</p>
        <form method="post" action="options.php">
            <?php
            settings_fields('inno-savelan-tracker');
            ?>
            <table class="form-table">
                <tr valign="top">
                    <th scope="row">Backend url:</th>
                    <td>
                        <input type="text" name="tracker_plugin_ip_domain" value="<?php echo esc_attr(get_option('tracker_plugin_ip_domain', "http://localhost:3000/api/v1")); ?>" />
                    </td>
                </tr>
                        <?php /* 
                <tr valign="top">
                    <th scope="row">Data Format:</th>
                    <td>
                        <label>
                            <input type="radio" name="tracker_plugin_data_format" value="json" <?php checked('json', get_option('tracker_plugin_data_format', 'json'), true); ?> /> JSON
                        </label>
                        <br /> 
                        <label>
                            <input type="radio" name="tracker_plugin_data_format" value="xml" <?php checked('xml', get_option('tracker_plugin_data_format')); ?> /> XML
                        </label> 
                    </td>
                </tr>*/
                ?>
            </table>
            <input type="submit" name="save_settings" class="button-primary" value="Save Settings">
        </form>
        <h3>Test backend connection</h3>
        <p>Send test data to the backend. Remember to save before testing!</p>
        <form method="post">
            <input type="submit" name="send_test_data" class="button-secondary"value="Test">
        </form>
    </div>
    <?php
}

function send_test_data() {
    $backend_url = get_option('tracker_plugin_ip_domain');
    $data_format = get_option('tracker_plugin_data_format');

    $test_data = array(
        'ip' => '192.168.1.100',
        'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:60.0) Gecko/20100101 Firefox/60.0',
        'timestamp' => 1696363195,
        'url' => 'http://localhost:3000/',
        'referrer' => 'http://localhost:3000/api/v1',
    );

    $response = wp_remote_post($backend_url, array(
        'body' => json_encode($test_data),
        'headers' => array('Content-Type' => 'application/json'),
    ));

    if (is_wp_error($response)) {
        echo '<div class="error"><p>Fail! Server did not respond: ' . $response->get_error_message() . '</p></div>';
        error_log('Failed to send test data: ' . $response->get_error_message());
    } 
    else if ($response['response']['code'] != 200){
        echo '<div class="error"><p>Fail! Server responded with error: ' . $response['body'] . '</p></div>';
    } 
    else {
        // Test data sent successfully
        // You can add a success message or perform additional actions here
        echo '<div class="updated"><p>Test data sent successfully!</p></div>';
    }
}

function tracker_plugin_initialize_settings() {
    // Register the settings section
    add_settings_section(
        'inno-savelan-tracker-section', // Unique ID for the section
        'My Plugin Settings', // Section title
        'my_plugin_section_callback', // Callback function to display content
        'inno-savelan-tracker' // Page where the section should be displayed
    );

    // Register the IP Address/Domain field
    add_settings_field(
        'tracker_plugin_ip_domain', // Unique ID for the field
        'IP Address or Domain', // Field title
        'tracker_plugin_ip_domain_callback', // Callback function to display the field
        'inno-savelan-tracker', // Page where the field should be displayed
        'inno-savelan-tracker-section' // Section to which the field belongs
    );

    // Register the Data Format field (e.g., radio buttons)
    add_settings_field(
        'tracker_plugin_data_format', // Unique ID for the field
        'Data Format', // Field title
        'tracker_plugin_data_format_callback', // Callback function to display the field
        'inno-savelan-tracker', // Page where the field should be displayed
        'inno-savelan-tracker-section' // Section to which the field belongs
    );

    // Register your settings
    register_setting('inno-savelan-tracker', 'tracker_plugin_ip_domain');
    register_setting('inno-savelan-tracker', 'tracker_plugin_data_format');
}
add_action('admin_init', 'tracker_plugin_initialize_settings');
?>