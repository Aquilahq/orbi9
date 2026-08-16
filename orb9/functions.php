<?php
/** ORB9 theme setup and asset loading. */
function orb9_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('woocommerce');
    register_nav_menus(array('primary' => __('Primary Menu', 'orb9')));
}
add_action('after_setup_theme', 'orb9_setup');

function orb9_assets() {
    wp_enqueue_style('orb9-fonts', 'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800&family=Libre+Baskerville:wght@400;700&family=Oswald:wght@400;500&display=swap', array(), null);
    wp_enqueue_style('orb9-style', get_stylesheet_uri(), array('orb9-fonts'), '1.0.0');
    wp_enqueue_style('orb9-design', get_template_directory_uri() . '/assets/css/orb9.css', array('orb9-style'), '1.0.0');
    wp_enqueue_script('orb9-app', get_template_directory_uri() . '/assets/js/orb9.js', array(), '1.0.0', true);
    wp_localize_script('orb9-app', 'orb9Settings', array(
        'productsUrl' => esc_url_raw(rest_url('wc/store/v1/products')),
        'siteUrl' => esc_url_raw(home_url('/')),
    ));
}
add_action('wp_enqueue_scripts', 'orb9_assets');

function orb9_fallback_menu() {
    echo '<nav aria-label="Primary navigation"><a href="' . esc_url(home_url('/')) . '">Home</a></nav>';
}
