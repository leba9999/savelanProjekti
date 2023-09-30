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
    ?>
    <div class="wrap">
        <h2>Save LAN Tracker Settings</h2>
        <p>Save LAN Tracker is a plugin for tracking visiting clients in Save LAN wordpress website.</p>
        <p>In this page you can edit plugin settings.</p>
        <form method="post" action="options.php">
            <?php
            settings_fields('inno-savelan-tracker');
            ?>
            <table class="form-table">
                <tr valign="top">
                    <th scope="row">Backend IP Address or Domain:</th>
                    <td>
                        <input type="text" name="tracker_plugin_ip_domain" value="<?php echo esc_attr(get_option('tracker_plugin_ip_domain', "localhost:3000")); ?>" />
                    </td>
                </tr>
                <tr valign="top">
                    <th scope="row">Data Format:</th>
                    <td>
                        <label>
                            <input type="radio" name="tracker_plugin_data_format" value="json" <?php checked('json', get_option('tracker_plugin_data_format', 'json'), true); ?> /> JSON
                        </label>
                        <br /> 
                        <?php /* 
                        <label>
                            <input type="radio" name="tracker_plugin_data_format" value="xml" <?php checked('xml', get_option('tracker_plugin_data_format')); ?> /> XML
                        </label> */
                        ?>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
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