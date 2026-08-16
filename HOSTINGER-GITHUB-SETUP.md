# Orbi9: GitHub → Hostinger WordPress

The repository is prepared to upload only `Orbi9/` into the existing WordPress installation. It does not replace WordPress, the database, uploads, or plugins.

## 1. Add GitHub Actions secrets

In the GitHub repository, open **Settings → Secrets and variables → Actions → New repository secret** and add:

- `HOSTINGER_SSH_HOST` — SSH hostname shown in Hostinger hPanel
- `HOSTINGER_SSH_USER` — SSH username shown in hPanel
- `HOSTINGER_SSH_PORT` — SSH port shown in hPanel, commonly `65002`
- `HOSTINGER_SSH_PRIVATE_KEY` — the private key matching the public key installed in Hostinger
- `HOSTINGER_SSH_KNOWN_HOSTS` — the verified output of `ssh-keyscan -p PORT HOST`; this prevents GitHub Actions from trusting an unexpected SSH server
- `HOSTINGER_WP_ROOT` — the absolute WordPress root shown by Hostinger/File Manager, for example `/home/u123456789/domains/orbi9.com/public_html`

Never commit the private key or put it in chat.

## 2. DNS

`orbi9.com` is registered at GoDaddy, but its current authoritative nameservers are Cloudflare (`indie.ns.cloudflare.com` and `sri.ns.cloudflare.com`). Therefore DNS changes must be made in **Cloudflare**, not GoDaddy, unless the nameservers are deliberately moved.

In Cloudflare, point the root domain and `www` to the Hostinger IP shown in hPanel. Do not guess the IP. Keep the current records until the Hostinger destination and SSL are verified.

## 3. Deployment workflow

`.github/workflows/deploy-hostinger.yml` is prepared as a **manual** GitHub Actions deployment. It validates the theme, verifies that `HOSTINGER_WP_ROOT` is a real WordPress root, connects over SSH, and uploads only `Orbi9/` to `$HOSTINGER_WP_ROOT/wp-content/themes/Orbi9/`. It does not delete remote files and does not touch the database, uploads, plugins, or `wp-config.php`.

After adding the secrets, verify the Hostinger path and activate **Orbi9** under **Appearance → Themes**. Run it from GitHub → Actions → Deploy Orbi9 theme to Hostinger → Run workflow. Automatic deployment on every push is intentionally not enabled until the first manual deployment is verified.

For a local SSH connection, use the same host, user, port, key, and document-root values. Do not put the private key, `wp-config.php`, the database, or `wp-content/uploads/` into this Git repository. The live database and uploads require their own backup/sync policy.

## 4. Local preview and package

The local WordPress preview is available at:

`http://localhost:4000`

The Orbi9 theme is active in that local WordPress installation. The installable package is `Orbi9.zip` in the repository root.
