# ORB9 WordPress theme

Custom classic WordPress theme converted from the existing ORB9 HTML5 storefront. The visual markup, styling, navigation, responsive behavior, animations, images, and JavaScript are preserved as closely as possible. WooCommerce supplies the product system and Store API data.

## Structure

```text
orb9/
├── style.css
├── functions.php
├── header.php
├── footer.php
├── front-page.php
├── index.php
├── woocommerce.php
├── woocommerce/
│   └── archive-product.php
└── assets/
    ├── css/orb9.css
    ├── js/orb9.js
    └── images/
```

## Install

Upload the `orb9.zip` package through **Appearance → Themes → Add New → Upload Theme**, then activate **ORB9**. Install and activate WooCommerce. The theme uses the same-origin WooCommerce Store API, so it contains no Hostinger credentials, passwords, API keys, configuration files, or `.env` files.

For server deployment, the theme directory belongs at:

`public_html/wp-content/themes/orb9`
