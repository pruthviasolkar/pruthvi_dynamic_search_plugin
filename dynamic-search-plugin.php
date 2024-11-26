<?php
/**
 * Plugin Name: Dynamic Search Plugin
 * Description: Adds real-time search functionality using Ajax.
 * Version: 1.0
 * Author: Pruthvi Asolkar
 */

if (!defined('ABSPATH')) exit; // Exit if accessed directly

// Enqueue scripts and styles
function dsp_enqueue_scripts() {
    wp_enqueue_style('dsp-styles', plugin_dir_url(__FILE__) . 'css/styles.css');
    wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
    
    wp_enqueue_script('dsp-script', plugin_dir_url(__FILE__) . 'js/main.js', array(), null, true);
    wp_localize_script('dsp-script', 'dspAjax', array(
        'ajax_url' => admin_url('admin-ajax.php'),
        'security' => wp_create_nonce('dsp_nonce') // Correct placement
    ));
}
add_action('wp_enqueue_scripts', 'dsp_enqueue_scripts');

// Register the shortcode
function dsp_render_search_interface() {
    ob_start(); ?>
    <div id="dsp-search-container">
        <!-- Search bar with icon beside the input field -->
        <div class="searchbar">
            <input type="text" id="dsp-search-input" placeholder="Search blog posts..." />
            <div class="icon">
                <!-- Example of an icon, replace 'your-icon.png' with the actual icon URL or use an icon font -->
                <i class="fas fa-search"></i>
            </div>
        </div>
        
        <!-- Results container -->
        <div id="dsp-results" style="display: none;"></div> <!-- Initially hidden -->
    </div>
    <?php return ob_get_clean();
}
add_shortcode('dsp_search', 'dsp_render_search_interface');

// Handle the Ajax request
function dsp_search_ajax_handler() {
    check_ajax_referer('dsp_nonce', 'security');

    $search_term = sanitize_text_field($_POST['query']);
    $paged = isset($_POST['paged']) ? intval($_POST['paged']) : 1;

    $query_args = array(
        's' => $search_term,
        'posts_per_page' => 5,
        'paged' => $paged,
        'post_status' => 'publish',
    );

    $query = new WP_Query($query_args);

    $results = array();
    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            $results[] = array(
                'title' => get_the_title(),
                'excerpt' => get_the_excerpt(),
                'link' => get_permalink(),
            );
        }
    }

    wp_send_json(array(
        'results' => $results,
        'has_more' => $paged < $query->max_num_pages,
    ));

    wp_die();
}
add_action('wp_ajax_dsp_search', 'dsp_search_ajax_handler');
add_action('wp_ajax_nopriv_dsp_search', 'dsp_search_ajax_handler');
