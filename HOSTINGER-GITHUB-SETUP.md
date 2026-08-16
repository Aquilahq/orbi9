# ORBI9: GitHub → Hostinger WordPress

The repository is prepared to upload only `wordpress-theme/orbi9/` into the existing WordPress installation. It does not replace WordPress, the database, uploads, or plugins.

## 1. Add GitHub Actions secrets

In the GitHub repository, open **Settings → Secrets and variables → Actions → New repository secret** and add:

- `HOSTINGER_SSH_HOST` — SSH hostname shown in Hostinger hPanel
- `HOSTINGER_SSH_USER` — SSH username shown in hPanel
- `HOSTINGER_SSH_PORT` — SSH port shown in hPanel, commonly `65002`
- `HOSTINGER_SSH_PRIVATE_KEY` — the private key matching the public key installed in Hostinger
- `HOSTINGER_WP_ROOT` — the absolute WordPress root shown by Hostinger/File Manager, for example `/home/u123456789/domains/orbi9.com/public_html`

Never commit the private key or put it in chat.

## 2. DNS

`orbi9.com` is registered at GoDaddy, but its current authoritative nameservers are Cloudflare (`indie.ns.cloudflare.com` and `sri.ns.cloudflare.com`). Therefore DNS changes must be made in **Cloudflare**, not GoDaddy, unless the nameservers are deliberately moved.

In Cloudflare, point the root domain and `www` to the Hostinger IP shown in hPanel. Do not guess the IP. Keep the current records until the Hostinger destination and SSL are verified.

## 3. Current status

The repository currently validates and packages the theme only. It does **not** deploy to Hostinger yet, by design.

After the Hostinger connection is approved, add a separate deployment workflow or Hostinger Git deployment targeting only `public_html/wp-content/themes/orb9`. Then activate **ORB9** under **Appearance → Themes**.

## 4. Local package

The same installable package is available at:

`http://localhost:3005/orbi9-wordpress-theme.zip`
