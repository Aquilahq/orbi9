<?php
get_header();
if (function_exists('woocommerce_content')) {
    woocommerce_content();
} else {
    echo '<main class="frame"><p>WooCommerce is required for the shop.</p></main>';
}
get_footer();
