<?php
/** Orbi9 theme setup and asset loading. */
function Orbi9_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('woocommerce');
    register_nav_menus(array('primary' => __('Primary Menu', 'Orbi9')));
}
add_action('after_setup_theme', 'Orbi9_setup');

function Orbi9_assets() {
    wp_enqueue_style('Orbi9-fonts', 'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800&family=Libre+Baskerville:wght@400;700&family=Oswald:wght@400;500&display=swap', array(), null);
    wp_enqueue_style('Orbi9-style', get_stylesheet_uri(), array('Orbi9-fonts'), '1.0.0');
    wp_enqueue_style('Orbi9-design', get_template_directory_uri() . '/assets/css/Orbi9.css', array('Orbi9-style'), '1.0.0');
    wp_enqueue_script('Orbi9-app', get_template_directory_uri() . '/assets/js/Orbi9.js', array(), '1.0.0', true);
    wp_localize_script('Orbi9-app', 'Orbi9Settings', array(
        'productsUrl' => esc_url_raw(rest_url('wc/store/v1/products')),
        'siteUrl' => esc_url_raw(home_url('/')),
    ));
}
add_action('wp_enqueue_scripts', 'Orbi9_assets');

function Orbi9_fallback_menu() {
    echo '<nav aria-label="Primary navigation"><a href="' . esc_url(home_url('/')) . '">Home</a></nav>';
}
