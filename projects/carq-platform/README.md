# CarQ Platform

Source-fidelity React + Node.js migration of CarQ v2.0.1, extended for the CarQ on-demand vehicle-wash and Sri Lankan franchise model.

This deployment source intentionally excludes runtime `.env` files and credentials. Production secrets remain on the server.

## Deployment payload

- `deploy/carq-platform-current.tar.xz` — sanitized application source used by the production server.
- `deploy/carq-argon-assets-min.tar.xz` — original CarQ Argon/Nucleo/Font Awesome assets required for UI fidelity.

The production server pulls the `carq-platform-deploy` branch over HTTPS and builds the Docker stack locally.
