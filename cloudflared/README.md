# Example: mount tunnel credentials for persistent named tunnel
# Uncomment and edit the cloudflared service in docker-compose.yml to use this pattern:
#
# cloudflared:
#   image: cloudflare/cloudflared:latest
#   volumes:
#     - /opt/cloudflared:/home/nonroot/.cloudflared:ro
#   command: tunnel run <TUNNEL_NAME>
#   environment:
#     - TZ=UTC
#   depends_on:
#     - app
#
# Where /opt/cloudflared/<TUNNEL_NAME>.json contains the tunnel credentials you downloaded from Cloudflare.
